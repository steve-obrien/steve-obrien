import { voidTags } from './editorModel.js';

const rawTextTags = new Set(['script', 'style']);

export function foldingRangesForTemplateSource(value) {
	const source = String(value || '');
	const lineStarts = lineStartOffsets(source);
	const ranges = [];
	const stack = [];
	let index = 0;

	while (index < source.length) {
		if (source.startsWith('<!--', index)) {
			const commentEnd = source.indexOf('-->', index + 4);
			const end = commentEnd >= 0 ? commentEnd + 3 : source.length;
			addRange(ranges, lineAtOffset(index, lineStarts), lineAtOffset(end, lineStarts));
			index = end;
			continue;
		}

		if (source[index] !== '<' || !isTagStart(source, index)) {
			index += 1;
			continue;
		}

		if (source[index + 1] === '!' || source[index + 1] === '?') {
			const end = readTagEnd(source, index);
			index = end >= 0 ? end + 1 : index + 1;
			continue;
		}

		const isClosing = source[index + 1] === '/';
		const nameOffset = index + (isClosing ? 2 : 1);
		const tag = readTagName(source, nameOffset);
		if (!tag) {
			index += 1;
			continue;
		}

		const tagEnd = readTagEnd(source, index);
		if (tagEnd < 0) break;

		if (isClosing) {
			const openIndex = findOpenTagIndex(stack, tag);
			if (openIndex >= 0) {
				const [open] = stack.splice(openIndex, 1);
				addRange(ranges, open.line, lineAtOffset(tagEnd, lineStarts));
			}
			index = tagEnd + 1;
			continue;
		}

		const tagLine = lineAtOffset(index, lineStarts);
		const tagEndLine = lineAtOffset(tagEnd, lineStarts);
		const selfClosing = isSelfClosingTag(source, index, tagEnd, tag);
		if (selfClosing) {
			addRange(ranges, tagLine, tagEndLine);
			index = tagEnd + 1;
			continue;
		}

		if (rawTextTags.has(tag.toLowerCase())) {
			const rawClose = findRawTextClose(source, tag, tagEnd + 1);
			if (rawClose) {
				addRange(ranges, tagLine, lineAtOffset(rawClose.end, lineStarts));
				index = rawClose.end + 1;
				continue;
			}
		}

		stack.push({ tag, line: tagLine });
		index = tagEnd + 1;
	}

	return ranges
		.filter((range) => range.end > range.start)
		.sort((a, b) => a.start - b.start || b.end - a.end);
}

function lineStartOffsets(value) {
	const starts = [0];
	for (let index = 0; index < value.length; index += 1) {
		if (value[index] === '\n') starts.push(index + 1);
	}
	return starts;
}

function lineAtOffset(offset, lineStarts) {
	let low = 0;
	let high = lineStarts.length - 1;
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		if (lineStarts[mid] <= offset) low = mid + 1;
		else high = mid - 1;
	}
	return Math.max(high + 1, 1);
}

function isTagStart(value, index) {
	const next = value[index + 1] || '';
	if (next === '/' && /[A-Za-z]/.test(value[index + 2] || '')) return true;
	return /[A-Za-z!?]/.test(next);
}

function readTagName(value, offset) {
	const match = /^[A-Za-z][\w:-]*/.exec(value.slice(offset));
	return match ? match[0] : '';
}

function readTagEnd(value, start) {
	let quote = '';
	for (let index = start + 1; index < value.length; index += 1) {
		const character = value[index];
		const previous = value[index - 1];
		if (quote) {
			if (character === quote && previous !== '\\') quote = '';
			continue;
		}
		if (character === '"' || character === '\'' || character === '`') {
			quote = character;
			continue;
		}
		if (character === '>') return index;
	}
	return -1;
}

function isSelfClosingTag(value, start, end, tag) {
	if (voidTags.has(tag.toLowerCase())) return true;
	for (let index = end - 1; index > start; index -= 1) {
		if (/\s/.test(value[index])) continue;
		return value[index] === '/';
	}
	return false;
}

function findRawTextClose(value, tag, start) {
	const pattern = new RegExp(`</${escapeRegExp(tag)}\\b`, 'ig');
	pattern.lastIndex = start;
	const match = pattern.exec(value);
	if (!match) return null;
	const end = readTagEnd(value, match.index);
	return end >= 0 ? { start: match.index, end } : null;
}

function findOpenTagIndex(stack, tag) {
	for (let index = stack.length - 1; index >= 0; index -= 1) {
		if (tagsMatch(stack[index].tag, tag)) return index;
	}
	return -1;
}

function tagsMatch(left, right) {
	return left === right || left.toLowerCase() === right.toLowerCase();
}

function addRange(ranges, start, end) {
	if (end > start) ranges.push({ start, end });
}

function escapeRegExp(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
