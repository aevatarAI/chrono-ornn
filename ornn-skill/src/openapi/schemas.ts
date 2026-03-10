/**
 * Zod schemas for OpenAPI spec generation.
 * Mirrors the request/response types used across all routes.
 * @module openapi/schemas
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

function apiResponse<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema.nullable(),
    error: apiErrorSchema.nullable(),
  });
}

export const successResponseSchema = apiResponse(z.object({ success: z.boolean() }));

// ---------------------------------------------------------------------------
// Skill Metadata
// ---------------------------------------------------------------------------

export const skillMetadataSchema = z.object({
  category: z.string().describe("Skill category: plain, tool-based, runtime-based, mixed"),
  outputType: z.enum(["text", "file"]).optional(),
  runtimes: z.array(z.object({
    runtime: z.string(),
    dependencies: z.array(z.object({ library: z.string(), version: z.string() })).optional(),
    envs: z.array(z.object({ var: z.string(), description: z.string() })).optional(),
  })).optional(),
  tools: z.array(z.object({
    tool: z.string(),
    type: z.string(),
    "mcp-servers": z.array(z.object({ mcp: z.string(), version: z.string() })).optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Skill CRUD
// ---------------------------------------------------------------------------

export const skillDetailResponseSchema = z.object({
  guid: z.string(),
  name: z.string(),
  description: z.string(),
  license: z.string().nullable(),
  compatibility: z.string().nullable(),
  metadata: z.record(z.unknown()),
  tags: z.array(z.string()),
  skillHash: z.string(),
  presignedPackageUrl: z.string(),
  isPrivate: z.boolean(),
  createdBy: z.string(),
  createdOn: z.string(),
  updatedOn: z.string(),
});

export const skillDetailApiResponse = apiResponse(skillDetailResponseSchema);

export const skillJsonResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  metadata: z.record(z.unknown()),
  files: z.record(z.string()).describe("Map of relative file path to file content"),
});

export const skillJsonApiResponse = apiResponse(skillJsonResponseSchema);

export const updateSkillJsonBodySchema = z.object({
  isPrivate: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Skill Search
// ---------------------------------------------------------------------------

export const searchQuerySchema = z.object({
  query: z.string().max(2000).optional().default("").describe("Search query text"),
  mode: z.enum(["keyword", "semantic"]).optional().default("keyword").describe("Search mode"),
  scope: z.enum(["public", "private", "mixed"]).optional().default("private").describe("Search scope"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(9),
  model: z.string().optional().describe("LLM model override for semantic search"),
});

export const skillSearchItemSchema = z.object({
  guid: z.string(),
  name: z.string(),
  description: z.string(),
  createdBy: z.string(),
  createdOn: z.string(),
  updatedOn: z.string(),
  isPrivate: z.boolean(),
  tags: z.array(z.string()),
});

export const skillSearchResponseSchema = z.object({
  searchMode: z.string(),
  searchScope: z.string(),
  total: z.number(),
  totalPages: z.number(),
  page: z.number(),
  pageSize: z.number(),
  items: z.array(skillSearchItemSchema),
});

export const skillSearchApiResponse = apiResponse(skillSearchResponseSchema);

// ---------------------------------------------------------------------------
// Skill Generation
// ---------------------------------------------------------------------------

export const generateJsonBodySchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional().describe("Multi-turn conversation messages"),
  prompt: z.string().optional().describe("Single-turn prompt"),
  model: z.string().optional().describe("LLM model override"),
});

export const generationStreamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("generation_start") }),
  z.object({ type: z.literal("token"), content: z.string() }),
  z.object({ type: z.literal("generation_complete"), raw: z.string() }),
  z.object({ type: z.literal("validation_error"), message: z.string(), retrying: z.boolean() }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

// ---------------------------------------------------------------------------
// Skill Format
// ---------------------------------------------------------------------------

export const formatRulesResponseSchema = apiResponse(z.object({ rules: z.string() }));

export const formatValidationResponseSchema = apiResponse(z.object({
  valid: z.boolean(),
  violations: z.array(z.object({ rule: z.string(), message: z.string() })).optional(),
}));

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

export const chatRequestBodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "tool", "system"]),
    content: z.string(),
    toolCalls: z.array(z.object({
      id: z.string(),
      name: z.string(),
      args: z.record(z.unknown()),
    })).optional(),
    toolCallId: z.string().optional(),
  })).min(1).max(100),
  skillId: z.string().optional(),
  envVars: z.record(z.string()).optional(),
});

export const playgroundChatEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text-delta"), delta: z.string() }),
  z.object({ type: z.literal("tool-call"), toolCall: z.object({ id: z.string(), name: z.string(), args: z.record(z.unknown()) }) }),
  z.object({ type: z.literal("tool-result"), toolCallId: z.string(), result: z.string() }),
  z.object({ type: z.literal("error"), message: z.string() }),
  z.object({ type: z.literal("finish"), finishReason: z.string() }),
]);

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createCategoryBodySchema = z.object({
  name: z.enum(["plain", "tool-based", "runtime-based", "mixed"]),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1).max(500),
  order: z.number().int().min(0).optional(),
});

export const updateCategoryBodySchema = z.object({
  description: z.string().min(1).max(500).optional(),
  order: z.number().int().min(0).optional(),
});

export const tagSchema = z.object({
  _id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const createTagBodySchema = z.object({
  name: z.string().min(1).max(30).regex(/^[a-z0-9-_]+$/),
});
