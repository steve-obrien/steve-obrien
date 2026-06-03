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

	push('<template>');
	(root?.children || []).forEach((child) => emitNode(child, 1));
	push('</template>');

	if (component?.props?.length) {
		push('');
		push('<script setup>');
		push('const props = defineProps({');
		component.props.forEach((prop) => push(`\t${prop.name}: ${prop.type || 'String'},`));
		push('});');
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

	return {
		tree,
		props: parseProps(value),
		scriptData: parseScriptSetupData(value),
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
	const match = value.match(/defineProps\(\{\s*([\s\S]*?)\s*\}\)/);
	if (!match) return [];
	return match[1]
		.split('\n')
		.map((line) => line.trim().replace(/,$/, ''))
		.filter(Boolean)
		.map((line) => {
			const [name, type] = line.split(':').map((part) => part.trim());
			return name ? { name, type: type || 'String' } : null;
		})
		.filter(Boolean);
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
	const match = normalized.match(/^(?:\(([^)]+)\)|([A-Za-z_$][\w$]*))\s+(?:in|of)\s+(.+)$/);
	if (!match) return { source: normalized, item: 'item', index: '', list: normalized };

	const aliases = (match[1] || match[2] || 'item').split(',').map((part) => part.trim());
	return {
		source: normalized,
		item: aliases[0] || 'item',
		index: aliases[1] || '',
		list: match[3].trim(),
	};
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
		.filter(([, value]) => value !== '' && value != null)
		.map(([key, value]) => ` ${key}="${encodeAttribute(value)}"`)
		.join('');
	return `${repeat}${attrs}`;
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
