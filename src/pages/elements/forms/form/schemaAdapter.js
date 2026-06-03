import { isJsonSchema, jsonSchemaAdapter, jsonSchemaToChildren } from './adapters/jsonSchema.js';
import { isZodLikeSchema, zodSchemaAdapter, zodSchemaToChildren } from './adapters/zod.js';

export {
	isJsonSchema,
	jsonSchemaAdapter,
	jsonSchemaToChildren,
	isZodLikeSchema,
	zodSchemaAdapter,
	zodSchemaToChildren,
};

export const builtInSchemaAdapters = [
	jsonSchemaAdapter,
	zodSchemaAdapter,
];

export function schemaToChildren(schema, options = {}, adapters = builtInSchemaAdapters) {
	if (!schema) return [];
	const adapter = adapters.find((candidate) => candidate?.matches?.(schema, options));
	return adapter?.toChildren?.(schema, options) || [];
}
