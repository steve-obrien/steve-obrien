import { baseParse, NodeTypes } from '@vue/compiler-dom';
import { parse as parseSfc } from '@vue/compiler-sfc';

export const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
export const replacedPreviewTags = new Set(['audio', 'canvas', 'embed', 'iframe', 'img', 'object', 'picture', 'svg', 'video']);

const nativeTags = new Set([
	'a',
	'abbr',
	'address',
	'article',
	'aside',
	'audio',
	'b',
	'blockquote',
	'br',
	'button',
	'canvas',
	'caption',
	'cite',
	'code',
	'col',
	'colgroup',
	'data',
	'dd',
	'del',
	'details',
	'dfn',
	'div',
	'dl',
	'dt',
	'em',
	'fieldset',
	'figcaption',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hr',
	'i',
	'iframe',
	'img',
	'input',
	'ins',
	'kbd',
	'label',
	'legend',
	'li',
	'main',
	'mark',
	'meter',
	'nav',
	'ol',
	'optgroup',
	'option',
	'output',
	'p',
	'picture',
	'pre',
	'progress',
	'q',
	'rp',
	'rt',
	'ruby',
	's',
	'samp',
	'select',
	'section',
	'slot',
	'small',
	'source',
	'span',
	'strong',
	'sub',
	'summary',
	'sup',
	'svg',
	'animate',
	'circle',
	'clipPath',
	'defs',
	'ellipse',
	'feBlend',
	'feColorMatrix',
	'feComposite',
	'feDropShadow',
	'feFlood',
	'feGaussianBlur',
	'feMerge',
	'feMergeNode',
	'feOffset',
	'filter',
	'foreignObject',
	'g',
	'line',
	'linearGradient',
	'marker',
	'mask',
	'path',
	'pattern',
	'polygon',
	'polyline',
	'radialGradient',
	'rect',
	'stop',
	'symbol',
	'text',
	'textPath',
	'tspan',
	'use',
	'view',
	'table',
	'tbody',
	'td',
	'template',
	'textarea',
	'tfoot',
	'th',
	'thead',
	'time',
	'tr',
	'u',
	'ul',
	'var',
	'video',
	'wbr',
]);

export function stampEditorNode(node, allocateId) {
	return {
		...node,
		id: node.id || allocateId(),
		props: { ...(node.props || {}) },
		sourceLine: node.sourceLine || null,
		sourceEndLine: node.sourceEndLine || null,
		children: (node.children || []).map((child) => stampEditorNode(child, allocateId)),
	};
}

export function buildSource(root, component) {
	const rows = [];
	const lineMap = {};
	const scriptDataEntries = scriptDataEntriesForComponent(component);
	const hasProps = Boolean(component?.props?.length);

	push('<template>');
	(root?.children || []).forEach((child) => emitNode(child, 1));
	push('</template>');

	if (hasProps || scriptDataEntries.length) {
		push('');
		push('<script setup>');
		scriptDataEntries.forEach(emitScriptDataEntry);
		if (scriptDataEntries.length && hasProps) push('');
		if (hasProps) {
			push('const props = defineProps({');
			component.props.forEach(emitComponentProp);
			push('});');
		}
		push('</' + 'script>');
	}

	function push(text, id = null, indent = 0) {
		rows.push({
			line: rows.length + 1,
			text: `${'\t'.repeat(indent)}${text}`,
			id,
		});
		if (id && !lineMap[id]) lineMap[id] = rows.length;
	}

	function emitComponentProp(prop) {
		if (!prop?.name) return;
		if (!hasPropDefault(prop)) {
			push(`${propKeySource(prop.name)}: ${propTypeSource(prop)},`, null, 1);
			return;
		}

		push(`${propKeySource(prop.name)}: {`, null, 1);
		push(`type: ${propTypeSource(prop)},`, null, 2);
		push(`default: ${propDefaultSource(prop)},`, null, 2);
		push('},', null, 1);
	}

	function emitScriptDataEntry([name, value]) {
		const literal = dataLiteralSource(value);
		const literalLines = literal.split('\n');
		if (literalLines.length === 1) {
			push(`const ${name} = ${literalLines[0]};`);
			return;
		}

		push(`const ${name} = ${literalLines[0]}`);
		literalLines.slice(1, -1).forEach((line) => push(line));
		push(`${literalLines.at(-1)};`);
	}

	function emitNode(node, depth) {
		if (node.type === 'literal') {
			push(encodeText(node.text || ''), node.id, depth);
			return;
		}
		if (node.type === 'headline') {
			push(`<h1${attrsForNode(node)}>${inlineSource(node)}</h1>`, node.id, depth);
			return;
		}
		if (node.type === 'text') {
			push(`<p${attrsForNode(node)}>${inlineSource(node)}</p>`, node.id, depth);
			return;
		}
		if (node.type === 'paragraph') {
			push(`<p${attrsForNode(node)}>${inlineSource(node)}</p>`, node.id, depth);
			return;
		}
		if (node.type === 'element') {
			emitElement(node, node.tag || 'section', depth);
			return;
		}
		if (node.type === 'component') {
			emitElement(node, node.tag, depth);
		}
	}

	function emitElement(node, tag, depth) {
		const props = attrsForNode(node);
		const inline = inlineSource(node);
		if (!node.children?.length && inline) {
			push(`<${tag}${props}>${inline}</${tag}>`, node.id, depth);
			return;
		}
		if (!node.children?.length && voidTags.has(tag)) {
			push(`<${tag}${props}>`, node.id, depth);
			return;
		}
		if (!node.children?.length) {
			push(`<${tag}${props} />`, node.id, depth);
			return;
		}
		push(`<${tag}${props}>`, node.id, depth);
		node.children.forEach((child) => emitNode(child, depth + 1));
		push(`</${tag}>`, node.id, depth);
	}

	return { rows, lineMap };
}

export function parseSource(value, { componentName = 'Component', stamp } = {}) {
	const stampNode = stamp || ((node) => stampEditorNode(node, defaultAllocateId));
	const extracted = extractTemplateSource(value);
	const template = extracted.template;
	if (!template.trim()) throw new Error('Expected a Vue template.');

	const templateStartLine = extracted.startLine;
	const ast = baseParse(template, {
		comments: false,
		decodeEntities,
		isVoidTag: (tag) => voidTags.has(tag),
	});
	const tree = stampNode({
		type: 'root',
		label: componentName,
		sourceLine: templateStartLine,
		sourceEndLine: templateStartLine + ast.loc.end.line - 1,
		children: ast.children.map((node) => nodeFromAst(node, templateStartLine, stampNode)).filter(Boolean),
	});
	const props = parseProps(value);

	return {
		tree,
		props,
		scriptData: {
			...propDefaultsForScriptData(props),
			...parseScriptSetupData(value),
		},
	};
}

export function extractTemplateSource(value) {
	const source = String(value || '');
	const parsed = parseSfc(source, { filename: 'TemplateEditor.vue' });
	if (parsed.descriptor.template) {
		return {
			template: parsed.descriptor.template.content,
			startLine: parsed.descriptor.template.loc.start.line,
			hasTemplateBlock: true,
		};
	}

	const leadingTemplate = /^\s*<template\b[^>]*>/i.exec(source);
	if (!leadingTemplate) return { template: source, startLine: 1, hasTemplateBlock: false };
	const first = {
		0: leadingTemplate[0],
		index: leadingTemplate.index + leadingTemplate[0].search(/<template\b/i),
	};

	const tagPattern = /<\/?template\b[^>]*>/gi;
	tagPattern.lastIndex = first.index;
	let depth = 0;
	let contentStart = first.index + first[0].length;

	for (let match = tagPattern.exec(source); match; match = tagPattern.exec(source)) {
		const tag = match[0];
		const closing = /^<\//.test(tag);
		const selfClosing = /\/>$/.test(tag);
		if (!closing && !selfClosing) {
			depth += 1;
			if (depth === 1) contentStart = match.index + tag.length;
			continue;
		}
		if (!closing) continue;
		depth -= 1;
		if (depth === 0) {
			return {
				template: source.slice(contentStart, match.index),
				startLine: lineNumberAt(source, contentStart),
				hasTemplateBlock: true,
			};
		}
	}

	return { template: source, startLine: 1, hasTemplateBlock: false };
}

function lineNumberAt(value, offset) {
	return value.slice(0, offset).split('\n').length;
}

export function parseProps(value) {
	const source = definePropsObjectSource(value);
	if (!source) return [];
	return splitTopLevelObjectEntries(source)
		.map(propFromDefinePropsEntry)
		.filter(Boolean);
}

function definePropsObjectSource(value) {
	const parsed = parseSfc(String(value || ''), { filename: 'TemplateEditor.vue' });
	const content = parsed.descriptor.scriptSetup?.content || String(value || '');
	const match = /\bdefineProps\b/.exec(content);
	if (!match) return '';
	const paren = content.indexOf('(', match.index + match[0].length);
	if (paren < 0) return '';
	const objectStart = skipWhitespace(content, paren + 1);
	if (content[objectStart] !== '{') return '';
	const objectEnd = readLiteralExpressionEnd(content, objectStart);
	if (objectEnd <= objectStart) return '';
	return content.slice(objectStart + 1, objectEnd - 1);
}

function propFromDefinePropsEntry(entry) {
	const source = entry.trim();
	if (!source || source.startsWith('...')) return null;
	const colon = topLevelColonIndex(source);
	if (colon < 0) return null;

	const name = propNameFromSource(source.slice(0, colon));
	if (!name) return null;

	const definition = source.slice(colon + 1).trim();
	if (!definition) return { name, type: 'String' };
	if (definition.startsWith('{')) return propFromOptionsObject(name, definition);
	return {
		name,
		type: normalizePropType(definition),
	};
}

function propFromOptionsObject(name, definition) {
	const end = readLiteralExpressionEnd(definition, 0);
	const body = end > 0 ? definition.slice(1, end - 1) : definition.replace(/^\{|\}$/g, '');
	const options = Object.fromEntries(splitTopLevelObjectEntries(body)
		.map((entry) => {
			const colon = topLevelColonIndex(entry);
			if (colon < 0) return null;
			const key = propNameFromSource(entry.slice(0, colon));
			return key ? [key, entry.slice(colon + 1).trim()] : null;
		})
		.filter(Boolean));
	const prop = {
		name,
		type: normalizePropType(options.type || 'String'),
	};
	const propDefault = previewDefaultFromSource(options.default);
	if (propDefault.matched) {
		prop.default = propDefault.value;
		prop.defaultSource = options.default.trim();
	}
	return prop;
}

function propDefaultsForScriptData(props) {
	const data = {};
	for (const prop of props || []) {
		if (hasPropDefault(prop)) data[prop.name] = prop.default;
	}
	return data;
}

function splitTopLevelObjectEntries(source) {
	const entries = [];
	let start = 0;
	const stack = [];
	let quote = '';
	let comment = '';

	for (let index = 0; index < source.length; index += 1) {
		const char = source[index];
		const next = source[index + 1];
		const previous = source[index - 1];

		if (comment === 'line') {
			if (char === '\n') comment = '';
			continue;
		}
		if (comment === 'block') {
			if (char === '*' && next === '/') {
				comment = '';
				index += 1;
			}
			continue;
		}
		if (quote) {
			if (char === quote && previous !== '\\') quote = '';
			continue;
		}
		if (char === '/' && next === '/') {
			comment = 'line';
			index += 1;
			continue;
		}
		if (char === '/' && next === '*') {
			comment = 'block';
			index += 1;
			continue;
		}
		if (char === '\'' || char === '"' || char === '`') {
			quote = char;
			continue;
		}
		if (char === '{' || char === '[' || char === '(') {
			stack.push(char);
			continue;
		}
		if (char === '}' || char === ']' || char === ')') {
			if (matchesBracket(stack.at(-1), char)) stack.pop();
			continue;
		}
		if (char === ',' && !stack.length) {
			entries.push(source.slice(start, index));
			start = index + 1;
		}
	}

	entries.push(source.slice(start));
	return entries.map((entry) => entry.trim()).filter(Boolean);
}

function topLevelColonIndex(source) {
	const stack = [];
	let quote = '';
	for (let index = 0; index < source.length; index += 1) {
		const char = source[index];
		const previous = source[index - 1];
		if (quote) {
			if (char === quote && previous !== '\\') quote = '';
			continue;
		}
		if (char === '\'' || char === '"' || char === '`') {
			quote = char;
			continue;
		}
		if (char === '{' || char === '[' || char === '(') {
			stack.push(char);
			continue;
		}
		if (char === '}' || char === ']' || char === ')') {
			if (matchesBracket(stack.at(-1), char)) stack.pop();
			continue;
		}
		if (char === ':' && !stack.length) return index;
	}
	return -1;
}

function propNameFromSource(source) {
	const name = source.trim().replace(/^['"`]|['"`]$/g, '');
	return /^[A-Za-z_$][\w$-]*$/.test(name) ? name : '';
}

function normalizePropType(source) {
	const text = String(source || '').trim().replace(/^['"`]|['"`]$/g, '');
	const match = text.match(/\b(String|Number|Boolean|Array|Object|Date|Function)\b/);
	return match?.[1] || text || 'String';
}

function hasPropDefault(prop) {
	return prop && Object.prototype.hasOwnProperty.call(prop, 'default');
}

function propKeySource(name) {
	return /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
}

function propTypeSource(prop) {
	return normalizePropType(prop?.type || prop?.typeSource || 'String');
}

function propDefaultSource(prop) {
	if (prop?.defaultSource) return prop.defaultSource;
	const source = literalSourceForValue(prop?.default);
	if ((prop?.type === 'Array' || prop?.type === 'Object') && !/^\s*(?:function\b|\(?[^=]*\)?\s*=>)/.test(source)) {
		return `() => ${source}`;
	}
	return source;
}

function previewDefaultFromSource(source) {
	if (!source) return { matched: false, value: null };
	return safeJsLiteralValue(defaultExpressionForEvaluation(source));
}

function defaultExpressionForEvaluation(source) {
	const trimmed = String(source || '').trim();
	const arrow = trimmed.match(/^(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*([\s\S]+)$/);
	if (arrow) return defaultExpressionFromFunctionBody(arrow[1]);
	const fn = trimmed.match(/^function\b[\s\S]*?\{\s*return\s+([\s\S]*?)\s*;?\s*\}$/);
	if (fn) return fn[1].trim();
	return trimmed;
}

function defaultExpressionFromFunctionBody(body) {
	const trimmed = body.trim();
	const returned = trimmed.match(/^\{\s*return\s+([\s\S]*?)\s*;?\s*\}$/);
	return returned ? returned[1].trim() : trimmed;
}

function literalSourceForValue(value) {
	if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`;
	if (value === undefined) return 'undefined';
	return JSON.stringify(value);
}

function scriptDataEntriesForComponent(component) {
	const propNames = new Set((component?.props || []).map((prop) => prop.name).filter(Boolean));
	return Object.entries(component?.scriptData || {})
		.filter(([name, value]) => isSafeScopeAlias(name) && !propNames.has(name) && value !== undefined)
		.filter(([, value]) => dataLiteralSource(value) !== 'undefined');
}

function dataLiteralSource(value) {
	const source = JSON.stringify(value, null, '\t');
	if (source === undefined) return 'undefined';
	return source.replace(/<\/script/gi, '<\\/script');
}

export function parseScriptSetupData(value) {
	const parsed = parseSfc(String(value || ''), { filename: 'TemplateEditor.vue' });
	const content = parsed.descriptor.scriptSetup?.content || '';
	const data = {};
	const declarationPattern = /\bconst\s+([A-Za-z_$][\w$]*)\s*=/g;

	for (let match = declarationPattern.exec(content); match; match = declarationPattern.exec(content)) {
		const name = match[1];
		const start = skipWhitespace(content, declarationPattern.lastIndex);
		if (!isLiteralStart(content[start])) continue;
		const end = readLiteralExpressionEnd(content, start);
		if (end <= start) continue;

		const literal = content.slice(start, end).trim();
		const evaluated = safeJsLiteralValue(literal);
		if (evaluated.matched) data[name] = evaluated.value;
		declarationPattern.lastIndex = end;
	}

	return data;
}

export function parseRepeatSource(source) {
	const normalized = source.trim();
	const match = normalized.match(/^(?:\(([^)]+)\)|(\[[^\]]+\])|(\{[^}]+\})|([A-Za-z_$][\w$]*))\s+(?:in|of)\s+(.+)$/);
	if (!match) return { source: normalized, item: 'item', index: '', list: normalized };

	const aliasSource = match[1] || match[2] || match[3] || match[4] || 'item';
	const destructure = match[2] ? 'array' : match[3] ? 'object' : '';
	const aliases = aliasSource
		.replace(/^\[|\]$/g, '')
		.replace(/^\{|\}$/g, '')
		.split(',')
		.map((part) => part.trim())
		.map((part) => part.split(':').at(-1).trim())
		.filter(Boolean);
	const repeat = {
		source: normalized,
		item: aliases[0] || 'item',
		index: destructure ? '' : aliases[1] || '',
		list: match[5].trim(),
	};
	if (destructure) {
		repeat.aliases = aliases;
		repeat.destructure = destructure;
	}
	return repeat;
}

export function scopeForRepeatItem(repeat, item, index, scope = {}) {
	const nextScope = { ...scope };
	if (repeat?.destructure === 'array') {
		(repeat.aliases || []).forEach((alias, aliasIndex) => {
			if (isSafeScopeAlias(alias)) nextScope[alias] = item?.[aliasIndex];
		});
		return nextScope;
	}
	if (repeat?.destructure === 'object') {
		(repeat.aliases || []).forEach((alias) => {
			if (isSafeScopeAlias(alias)) nextScope[alias] = item?.[alias];
		});
		return nextScope;
	}

	if (isSafeScopeAlias(repeat?.item)) nextScope[repeat.item] = item;
	if (isSafeScopeAlias(repeat?.index)) nextScope[repeat.index] = index;
	return nextScope;
}

function isSafeScopeAlias(value) {
	return /^[A-Za-z_$][\w$]*$/.test(String(value || ''));
}

export function evaluatePreviewExpression(expression, scope = {}) {
	const path = String(expression || '').trim();
	if (!path) return { matched: false, value: null };

	const literal = literalExpressionValue(path);
	if (literal.matched) return literal;

	const scopedPath = scopedPathValue(scope, path);
	if (scopedPath.matched) return scopedPath;

	return safeScopedExpressionValue(path, scope);
}

function skipWhitespace(value, index) {
	let next = index;
	while (/\s/.test(value[next] || '')) next += 1;
	return next;
}

function isLiteralStart(value) {
	return value === '{'
		|| value === '['
		|| value === '\''
		|| value === '"'
		|| value === '-'
		|| /\d/.test(value || '')
		|| value === 't'
		|| value === 'f'
		|| value === 'n';
}

function readLiteralExpressionEnd(value, start) {
	const first = value[start];
	if (first === '\'' || first === '"') return readStringEnd(value, start);
	if (first !== '{' && first !== '[') return readPrimitiveEnd(value, start);

	const stack = [];
	let quote = '';
	for (let index = start; index < value.length; index += 1) {
		const char = value[index];
		const previous = value[index - 1];
		if (quote) {
			if (char === quote && previous !== '\\') quote = '';
			continue;
		}
		if (char === '\'' || char === '"') {
			quote = char;
			continue;
		}
		if (char === '{' || char === '[' || char === '(') {
			stack.push(char);
			continue;
		}
		if (char === '}' || char === ']' || char === ')') {
			const opener = stack.pop();
			if (!matchesBracket(opener, char)) return start;
			if (!stack.length) return index + 1;
		}
	}
	return start;
}

function readStringEnd(value, start) {
	const quote = value[start];
	for (let index = start + 1; index < value.length; index += 1) {
		if (value[index] === quote && value[index - 1] !== '\\') return index + 1;
	}
	return start;
}

function readPrimitiveEnd(value, start) {
	const match = /^[^\n;,]+/.exec(value.slice(start));
	return match ? start + match[0].length : start;
}

function matchesBracket(opener, closer) {
	return (opener === '{' && closer === '}')
		|| (opener === '[' && closer === ']')
		|| (opener === '(' && closer === ')');
}

function safeJsLiteralValue(expression) {
	if (!isSafeJsLiteralExpression(expression)) return { matched: false, value: null };
	try {
		return {
			matched: true,
			value: Function(`"use strict";return (${expression});`)(),
		};
	} catch {
		return { matched: false, value: null };
	}
}

function safeScopedExpressionValue(expression, scope) {
	if (!isSafeJsLiteralExpression(expression)) return { matched: false, value: null };
	const names = Object.keys(scope).filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
	const values = names.map((name) => scope[name]);
	try {
		return {
			matched: true,
			value: Function(...names, `"use strict";return (${expression});`)(...values),
		};
	} catch {
		return { matched: false, value: null };
	}
}

function isSafeJsLiteralExpression(expression) {
	const withoutStrings = expression.replace(/(['"])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, '""');
	if (/[;=]/.test(withoutStrings)) return false;
	if (/[A-Za-z_$][\w$]*\s*\(/.test(withoutStrings)) return false;
	if (/(?:\bfunction\b|=>|\bnew\b|\bthis\b|\bwindow\b|\bdocument\b|\bglobalThis\b|\bimport\b|\brequire\b|\bconstructor\b|__proto__|\bprototype\b)/.test(withoutStrings)) return false;
	return /^[\s\w$.,:{}[\]()'"%+\-/*?!<>|&]*$/.test(withoutStrings);
}

export function literalExpressionValue(path) {
	if (path === 'true') return { matched: true, value: true };
	if (path === 'false') return { matched: true, value: false };
	if (path === 'null') return { matched: true, value: null };
	if (/^-?\d+(?:\.\d+)?$/.test(path)) return { matched: true, value: Number(path) };
	if (/^[{["']/.test(path)) {
		try {
			return { matched: true, value: JSON.parse(path.replace(/^'|'$/g, '"')) };
		} catch {
			return { matched: false, value: null };
		}
	}
	return { matched: false, value: null };
}

function scopedPathValue(scope, path) {
	if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(path)) return { matched: false, value: null };
	const [rootKey, ...keys] = path.split('.');
	if (!Object.prototype.hasOwnProperty.call(scope, rootKey)) return { matched: false, value: null };
	return {
		matched: true,
		value: keys.reduce((value, key) => value?.[key], scope[rootKey]),
	};
}

export function isNativeTag(tag) {
	return nativeTags.has(tag);
}

export function encodeText(value) {
	return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function encodeAttribute(value) {
	return encodeText(value).replace(/"/g, '&quot;');
}

function nodeFromAst(astNode, templateStartLine, stamp) {
	if (astNode.type === NodeTypes.TEXT) {
		const text = astNode.content.trim();
		if (!text) return null;
		return stamp({ type: 'literal', label: 'Text', text, sourceLine: sourceLineFor(astNode, templateStartLine), sourceEndLine: sourceEndLineFor(astNode, templateStartLine), children: [] });
	}
	if (astNode.type === NodeTypes.INTERPOLATION) {
		return stamp({ type: 'text', label: 'Binding', binding: astNode.content.content.trim(), sourceLine: sourceLineFor(astNode, templateStartLine), sourceEndLine: sourceEndLineFor(astNode, templateStartLine), children: [] });
	}
	if (astNode.type !== NodeTypes.ELEMENT) return null;

	const sourceLine = sourceLineFor(astNode, templateStartLine);
	const sourceEndLine = sourceEndLineFor(astNode, templateStartLine);
	const attrs = propsFromAst(astNode);
	const repeat = repeatFromAst(astNode);
	const firstText = textContentFromChildren(astNode.children);
	const firstBinding = bindingFromChildren(astNode.children);
	const inline = inlinePartsFromChildren(astNode.children);
	const children = inlineOnlyChildren(astNode.children)
		? []
		: astNode.children.map((child) => nodeFromAst(child, templateStartLine, stamp)).filter(Boolean);

	if (astNode.tag === 'h1' && inlineOnlyChildren(astNode.children)) return stamp({ type: 'headline', label: 'Heading', binding: firstBinding, inline, text: firstText, props: attrs, sourceLine, sourceEndLine, children: [] });
	if (astNode.tag === 'p' && inlineOnlyChildren(astNode.children)) return stamp({ type: firstBinding ? 'text' : 'paragraph', label: firstBinding ? 'Text' : 'Paragraph', binding: firstBinding, inline, text: firstText, props: attrs, sourceLine, sourceEndLine, children: [] });
	if (isNativeTag(astNode.tag)) return stamp({ type: 'element', tag: astNode.tag, label: astNode.tag, props: attrs, repeat, binding: firstBinding, inline, text: firstText, sourceLine, sourceEndLine, children });
	return stamp({ type: 'component', tag: astNode.tag, label: astNode.tag, props: attrs, repeat, binding: firstBinding, inline, text: firstText, sourceLine, sourceEndLine, children });
}

function propsFromAst(astNode) {
	const out = {};
	const hasEditorMarker = astNode.props.some((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === 'data-template-node');
	for (const prop of astNode.props) {
		if (prop.type === NodeTypes.ATTRIBUTE) {
			if (prop.name === 'data-template-node') continue;
			if (hasEditorMarker && prop.name === 'draggable') continue;
			const value = prop.value?.content || '';
			out[prop.name] = hasEditorMarker && prop.name === 'class'
				? cleanPastedEditorClasses(value)
				: value;
		}
		if (prop.type === NodeTypes.DIRECTIVE) {
			const directive = directiveAttributeFromAst(prop);
			if (directive) out[directive.name] = directive.value;
		}
	}
	return out;
}

function directiveAttributeFromAst(prop) {
	if (prop.name === 'for') return null;
	const arg = prop.arg?.content;
	const exp = prop.exp?.content || '';

	if (prop.name === 'bind' && arg) return { name: `:${arg}`, value: exp };
	if (prop.name === 'on' && arg) return { name: `@${arg}`, value: exp };
	if (prop.name === 'model') return { name: arg ? `v-model:${arg}` : 'v-model', value: exp };
	if (!arg) return { name: `v-${prop.name}`, value: exp };
	return { name: `v-${prop.name}:${arg}`, value: exp };
}

function cleanPastedEditorClasses(value) {
	const editorClasses = new Set([
		'relative',
		'transition',
		'outline-none',
		'hover:ring-2',
		'hover:ring-ring/60',
		'ring-2',
		'ring-ring',
		'ring-offset-2',
		'ring-offset-background',
		'template-drop-after',
	]);
	return value
		.split(/\s+/)
		.filter((token) => token && !editorClasses.has(token))
		.join(' ');
}

function attrsForNode(node) {
	const props = node.props || {};
	const repeat = node.repeat?.source ? ` v-for="${encodeAttribute(node.repeat.source)}"` : '';
	const attrs = Object.entries(props)
		.map(([key, value]) => attrSource(key, value))
		.filter(Boolean)
		.join('');
	return `${repeat}${attrs}`;
}

function attrSource(key, value) {
	if (value == null) return '';
	if (key.startsWith('v-slot') && value === '') return ` ${key}`;
	if (value === '') return '';
	return ` ${key}="${encodeAttribute(value)}"`;
}

function bindingExpression(node) {
	return node.binding ? node.binding : JSON.stringify(node.text || node.label);
}

function inlineSource(node) {
	if (node.inline?.length) {
		return node.inline.map((part) => part.type === 'binding'
			? `{{ ${part.value} }}`
			: encodeText(part.value))
			.join('')
			.trim();
	}
	if (node.binding) return `{{ ${bindingExpression(node)} }}`;
	return encodeText(node.text || '');
}

function repeatFromAst(astNode) {
	const directive = astNode.props.find((prop) => prop.type === NodeTypes.DIRECTIVE && prop.name === 'for');
	if (!directive?.exp?.content) return null;
	return parseRepeatSource(directive.exp.content);
}

function sourceLineFor(astNode, templateStartLine) {
	return templateStartLine + astNode.loc.start.line - 1;
}

function sourceEndLineFor(astNode, templateStartLine) {
	return templateStartLine + astNode.loc.end.line - 1;
}

function decodeEntities(value) {
	if (typeof document === 'undefined') {
		return value
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&amp;/g, '&');
	}
	const textarea = document.createElement('textarea');
	textarea.innerHTML = value;
	return textarea.value;
}

function textContentFromChildren(children) {
	return children.filter((child) => child.type === NodeTypes.TEXT).map((child) => child.content).join('').trim();
}

function bindingFromChildren(children) {
	return children.find((child) => child.type === NodeTypes.INTERPOLATION)?.content.content.trim() || null;
}

function inlinePartsFromChildren(children) {
	const parts = children
		.map((child) => {
			if (child.type === NodeTypes.TEXT) {
				const value = child.content.replace(/\s+/g, ' ');
				return value.trim() ? { type: 'text', value } : null;
			}
			if (child.type === NodeTypes.INTERPOLATION) {
				return { type: 'binding', value: child.content.content.trim() };
			}
			return null;
		})
		.filter(Boolean);
	return parts.length ? parts : null;
}

function inlineOnlyChildren(children) {
	return children.every((child) => {
		if (child.type === NodeTypes.TEXT) return true;
		return child.type === NodeTypes.INTERPOLATION;
	});
}

function defaultAllocateId() {
	return `template-node-${Math.random().toString(36).slice(2)}`;
}
