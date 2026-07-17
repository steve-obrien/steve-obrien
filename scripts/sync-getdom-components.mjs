import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(projectRoot, 'getdom.components.json');
const lockPath = path.join(projectRoot, 'getdom.components.lock.json');

/**
 * Parse command-line flags and optional component names.
 *
 * @param {string[]} argumentsList Raw command-line arguments.
 * @returns {{ check: boolean, force: boolean, componentNames: string[] }} Parsed options.
 */
function parseArguments(argumentsList) {
	const options = {
		check: false,
		force: false,
		componentNames: [],
	};

	for (const argument of argumentsList) {
		if (argument === '--check') {
			options.check = true;
			continue;
		}
		if (argument === '--force') {
			options.force = true;
			continue;
		}
		if (argument.startsWith('--')) {
			throw new Error(`Unknown option: ${argument}`);
		}
		options.componentNames.push(argument);
	}

	if (options.check && options.force) {
		throw new Error('--force cannot be combined with --check.');
	}

	return options;
}

/**
 * Read and parse a required JSON file.
 *
 * @param {string} filePath Absolute path to the JSON file.
 * @returns {Promise<Record<string, unknown>>} Parsed JSON object.
 */
async function readJson(filePath) {
	return JSON.parse(await readFile(filePath, 'utf8'));
}

/**
 * Read and parse a JSON file when it exists.
 *
 * @param {string} filePath Absolute path to the JSON file.
 * @param {Record<string, unknown>} fallback Value returned when the file is missing.
 * @returns {Promise<Record<string, unknown>>} Parsed JSON object or the fallback.
 */
async function readOptionalJson(filePath, fallback) {
	try {
		return await readJson(filePath);
	} catch (error) {
		if (error.code === 'ENOENT') return fallback;
		throw error;
	}
}

/**
 * Read a UTF-8 file when it exists.
 *
 * @param {string} filePath Absolute path to the file.
 * @returns {Promise<string | null>} File contents, or null when missing.
 */
async function readOptionalFile(filePath) {
	try {
		return await readFile(filePath, 'utf8');
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

/**
 * Calculate a stable SHA-256 digest for generated file contents.
 *
 * @param {string} content File contents.
 * @returns {string} Hex-encoded digest.
 */
function hashContent(content) {
	return createHash('sha256').update(content).digest('hex');
}

/**
 * Resolve a configured relative path while preventing directory traversal.
 *
 * @param {string} rootPath Absolute allowed root.
 * @param {string} relativePath Configured relative path.
 * @param {string} label Human-readable path label for errors.
 * @returns {string} Safe absolute path.
 */
function resolveWithin(rootPath, relativePath, label) {
	const absolutePath = path.resolve(rootPath, relativePath);
	const allowedPrefix = `${path.resolve(rootPath)}${path.sep}`;
	if (!absolutePath.startsWith(allowedPrefix)) {
		throw new Error(`${label} escapes its configured root: ${relativePath}`);
	}
	return absolutePath;
}

/**
 * Run a Git command against the GetDom source repository.
 *
 * @param {string} repositoryPath Absolute repository path.
 * @param {string[]} argumentsList Git arguments after `git -C <repository>`.
 * @returns {string} Trimmed standard output.
 */
function runGit(repositoryPath, argumentsList) {
	return execFileSync('git', ['-C', repositoryPath, ...argumentsList], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	}).trim();
}

/**
 * Normalize common GitHub remote URL forms for safe repository comparison.
 *
 * @param {string} repositoryUrl Git remote URL.
 * @returns {string} Comparable HTTPS-style repository identifier.
 */
function normaliseRepositoryUrl(repositoryUrl) {
	return String(repositoryUrl)
		.trim()
		.replace(/^git@github\.com:/i, 'https://github.com/')
		.replace(/^ssh:\/\/git@github\.com\//i, 'https://github.com/')
		.replace(/\.git$/i, '')
		.replace(/\/$/, '')
		.toLowerCase();
}

/**
 * Ensure the source checkout points at the configured GetDom repository.
 *
 * @param {string} actualRepository Actual origin remote URL.
 * @param {string} expectedRepository Configured origin remote URL.
 * @returns {void}
 */
function assertExpectedRepository(actualRepository, expectedRepository) {
	if (normaliseRepositoryUrl(actualRepository) === normaliseRepositoryUrl(expectedRepository)) return;

	throw new Error([
		'The configured GetDom checkout points at an unexpected Git origin.',
		`Expected: ${expectedRepository}`,
		`Actual: ${actualRepository}`,
	].join('\n'));
}

/**
 * Extract the configured section from a source file.
 *
 * @param {string} content Complete source file contents.
 * @param {{ start: string, end: string }} extraction Section markers.
 * @param {string} sourcePath Source path used in diagnostics.
 * @returns {string} Extracted section with one trailing newline.
 */
function extractSection(content, extraction, sourcePath) {
	const startIndex = content.indexOf(extraction.start);
	if (startIndex === -1) {
		throw new Error(`Start marker not found in ${sourcePath}: ${extraction.start}`);
	}

	const endIndex = content.indexOf(extraction.end, startIndex + extraction.start.length);
	if (endIndex === -1) {
		throw new Error(`End marker not found in ${sourcePath}: ${extraction.end}`);
	}

	return `${content.slice(startIndex, endIndex).trimEnd()}\n`;
}

/**
 * Build the vendored output for one configured source file.
 *
 * @param {string} sourceRoot Absolute GetDom checkout path.
 * @param {{ source: string, target: string, extract?: { start: string, end: string } }} fileConfig File mapping.
 * @returns {Promise<string>} Output to write into the consuming repository.
 */
async function buildOutput(sourceRoot, fileConfig) {
	const sourcePath = resolveWithin(sourceRoot, fileConfig.source, 'Source path');
	const content = await readFile(sourcePath, 'utf8');
	return fileConfig.extract
		? extractSection(content, fileConfig.extract, fileConfig.source)
		: content;
}

/**
 * Find the previous lock entry for one vendored target.
 *
 * @param {Record<string, unknown>} lock Existing lock data.
 * @param {string} componentName Configured component name.
 * @param {string} targetPath Configured target path.
 * @returns {{ source: string, target: string, sha256: string } | null} Matching lock entry.
 */
function findLockedFile(lock, componentName, targetPath) {
	const files = lock.components?.[componentName]?.files;
	if (!Array.isArray(files)) return null;
	return files.find((file) => file.target === targetPath) || null;
}

/**
 * Assert that selected upstream source files have no uncommitted changes.
 *
 * @param {string} sourceRoot Absolute GetDom checkout path.
 * @param {string[]} sourcePaths Repository-relative source paths.
 * @returns {void}
 */
function assertCleanSources(sourceRoot, sourcePaths) {
	const uniquePaths = [...new Set(sourcePaths)];
	const dirtyOutput = runGit(sourceRoot, ['status', '--porcelain', '--', ...uniquePaths]);
	if (!dirtyOutput) return;

	throw new Error([
		'Selected GetDom source files contain uncommitted changes.',
		'Commit or restore those files before syncing:',
		dirtyOutput,
	].join('\n'));
}

/**
 * Validate configured component names and return their definitions.
 *
 * @param {Record<string, unknown>} config Vendor configuration.
 * @param {string[]} requestedNames Optional requested component names.
 * @returns {Array<[string, { files: Array<Record<string, unknown>> }]}> Selected component entries.
 */
function selectComponents(config, requestedNames) {
	const availableEntries = Object.entries(config.components || {});
	if (requestedNames.length === 0) return availableEntries;

	const selectedEntries = [];
	for (const componentName of requestedNames) {
		const componentConfig = config.components?.[componentName];
		if (!componentConfig) {
			throw new Error(`Unknown GetDom component: ${componentName}`);
		}
		selectedEntries.push([componentName, componentConfig]);
	}
	return selectedEntries;
}

/**
 * Write stable, tab-indented JSON with a final newline.
 *
 * @param {string} filePath Absolute output path.
 * @param {Record<string, unknown>} value Serializable value.
 * @returns {Promise<void>} Resolves after the file is written.
 */
async function writeJson(filePath, value) {
	await writeFile(filePath, `${JSON.stringify(value, null, '\t')}\n`, 'utf8');
}

/**
 * Synchronize configured GetDom component sources or check their status.
 *
 * @returns {Promise<void>} Resolves when all selected components are processed.
 */
async function main() {
	const options = parseArguments(process.argv.slice(2));
	const config = await readJson(configPath);
	const existingLock = await readOptionalJson(lockPath, {
		schemaVersion: 1,
		source: {},
		components: {},
	});
	const sourceRoot = path.resolve(
		process.env.GETDOM_STUDIO_DIR || path.join(projectRoot, config.source.defaultDirectory),
	);
	const selectedComponents = selectComponents(config, options.componentNames);
	const selectedSourcePaths = [];

	for (const [, componentConfig] of selectedComponents) {
		for (const fileConfig of componentConfig.files) {
			selectedSourcePaths.push(fileConfig.source);
		}
	}

	runGit(sourceRoot, ['rev-parse', '--is-inside-work-tree']);
	const repository = runGit(sourceRoot, ['remote', 'get-url', 'origin']);
	assertExpectedRepository(repository, config.source.repository);
	assertCleanSources(sourceRoot, selectedSourcePaths);

	const revision = runGit(sourceRoot, ['rev-parse', 'HEAD']);
	const nextLock = structuredClone(existingLock);
	nextLock.schemaVersion = 1;
	nextLock.source = { repository };
	nextLock.components ||= {};

	let changedFileCount = 0;
	let availableUpdateCount = 0;

	for (const [componentName, componentConfig] of selectedComponents) {
		const nextFiles = [];

		for (const fileConfig of componentConfig.files) {
			const targetPath = resolveWithin(projectRoot, fileConfig.target, 'Target path');
			const nextContent = await buildOutput(sourceRoot, fileConfig);
			const nextHash = hashContent(nextContent);
			const currentContent = await readOptionalFile(targetPath);
			const currentHash = currentContent === null ? null : hashContent(currentContent);
			const lockedFile = findLockedFile(existingLock, componentName, fileConfig.target);

			if (!options.force && lockedFile && currentHash !== lockedFile.sha256) {
				throw new Error([
					`Refusing to overwrite locally changed vendored file: ${fileConfig.target}`,
					'Restore it to the locked version or rerun with --force to discard the local changes.',
				].join('\n'));
			}

			if (!options.force && !lockedFile && currentHash !== null && currentHash !== nextHash) {
				throw new Error([
					`Refusing to adopt an existing untracked target: ${fileConfig.target}`,
					'Remove it or rerun with --force if GetDom should become its source of truth.',
				].join('\n'));
			}

			if (options.check) {
				if (!lockedFile || currentHash !== nextHash) {
					availableUpdateCount += 1;
					const reason = lockedFile ? 'Update available' : 'Missing lock entry';
					console.log(`${reason}: ${fileConfig.target}`);
				}
			} else if (currentHash !== nextHash) {
				await mkdir(path.dirname(targetPath), { recursive: true });
				await writeFile(targetPath, nextContent, 'utf8');
				changedFileCount += 1;
				console.log(`Synced: ${fileConfig.target}`);
			}

			nextFiles.push({
				source: fileConfig.source,
				target: fileConfig.target,
				sha256: nextHash,
			});
		}

		nextLock.components[componentName] = {
			revision,
			files: nextFiles,
		};
	}

	if (options.check) {
		if (availableUpdateCount > 0) {
			process.exitCode = 1;
			console.log(`Found ${availableUpdateCount} GetDom update(s). Run npm run getdom:sync.`);
			return;
		}
		console.log('Vendored GetDom components are current and unmodified.');
		return;
	}

	await writeJson(lockPath, nextLock);
	console.log(`GetDom sync complete at ${revision.slice(0, 12)}. ${changedFileCount} file(s) changed.`);
}

/**
 * Report an unrecoverable sync error and set a failing process status.
 *
 * @param {unknown} error Thrown error value.
 * @returns {void}
 */
function handleFatalError(error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
}

main().catch(handleFatalError);
