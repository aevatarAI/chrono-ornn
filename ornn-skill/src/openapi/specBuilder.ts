/**
 * OpenAPI 3.1 spec builder. Generates web and agent specs from Zod schemas.
 * @module openapi/specBuilder
 */

import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodTypeAny } from "zod";
import * as S from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type JsonSchema = Record<string, unknown>;
type PathItem = Record<string, unknown>;
type OpenApiSpec = Record<string, unknown>;

function toSchema(zodSchema: ZodTypeAny): JsonSchema {
  const result = zodToJsonSchema(zodSchema, { target: "openApi3", $refStrategy: "none" }) as JsonSchema;
  // Remove top-level $schema key (not valid in OpenAPI component schemas)
  delete result.$schema;
  return result;
}

function jsonResponse(schema: ZodTypeAny, description = "Successful response"): Record<string, unknown> {
  return {
    "200": {
      description,
      content: { "application/json": { schema: toSchema(schema) } },
    },
  };
}

function sseResponse(description: string): Record<string, unknown> {
  return {
    "200": {
      description,
      content: { "text/event-stream": { schema: { type: "string" } } },
    },
  };
}

function errorResponses(...codes: number[]): Record<string, unknown> {
  const errorSchema = toSchema(S.apiErrorSchema);
  const envelope = {
    type: "object",
    properties: {
      data: { type: "null" },
      error: errorSchema,
    },
  };
  const map: Record<string, unknown> = {};
  const descriptions: Record<number, string> = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    413: "Payload too large",
    500: "Internal server error",
  };
  for (const code of codes) {
    map[String(code)] = {
      description: descriptions[code] ?? `Error ${code}`,
      content: { "application/json": { schema: envelope } },
    };
  }
  return map;
}

function bearerAuth(): Record<string, unknown>[] {
  return [{ BearerAuth: [] }];
}

function queryParams(schema: ZodTypeAny): unknown[] {
  const jsonSchema = toSchema(schema) as { properties?: Record<string, JsonSchema>; required?: string[] };
  if (!jsonSchema.properties) return [];
  const required = new Set(jsonSchema.required ?? []);
  return Object.entries(jsonSchema.properties).map(([name, prop]) => ({
    name,
    in: "query",
    required: required.has(name),
    schema: prop,
    description: (prop as Record<string, unknown>).description ?? undefined,
  }));
}

function pathParam(name: string, description: string): Record<string, unknown> {
  return { name, in: "path", required: true, schema: { type: "string" }, description };
}

// ---------------------------------------------------------------------------
// Shared path definitions
// ---------------------------------------------------------------------------

function skillUploadPath(prefix: string): PathItem {
  return {
    post: {
      summary: "Upload a skill package",
      operationId: "uploadSkill",
      tags: ["Skills"],
      security: bearerAuth(),
      parameters: [{ name: "skip_validation", in: "query", required: false, schema: { type: "boolean" } }],
      requestBody: {
        required: true,
        content: { "application/zip": { schema: { type: "string", format: "binary" } } },
      },
      responses: { ...jsonResponse(S.skillDetailApiResponse, "Skill created"), ...errorResponses(400, 401, 413) },
    },
  };
}

function skillReadPath(prefix: string): PathItem {
  return {
    get: {
      summary: "Get skill by GUID or name",
      operationId: "getSkill",
      tags: ["Skills"],
      security: bearerAuth(),
      parameters: [pathParam("idOrName", "Skill GUID or name")],
      responses: { ...jsonResponse(S.skillDetailApiResponse), ...errorResponses(401, 404) },
    },
  };
}

function skillJsonPath(prefix: string): PathItem {
  return {
    get: {
      summary: "Get skill package as JSON with all file contents",
      operationId: "getSkillJson",
      tags: ["Skills"],
      security: bearerAuth(),
      parameters: [pathParam("idOrName", "Skill GUID or name")],
      responses: { ...jsonResponse(S.skillJsonApiResponse), ...errorResponses(401, 404) },
    },
  };
}

function skillUpdatePath(prefix: string): PathItem {
  return {
    put: {
      summary: "Update a skill (ZIP, metadata, or privacy flag)",
      operationId: "updateSkill",
      tags: ["Skills"],
      security: bearerAuth(),
      parameters: [
        pathParam("id", "Skill GUID"),
        { name: "skip_validation", in: "query", required: false, schema: { type: "boolean" } },
      ],
      requestBody: {
        content: {
          "application/zip": { schema: { type: "string", format: "binary" } },
          "application/json": { schema: toSchema(S.updateSkillJsonBodySchema) },
        },
      },
      responses: { ...jsonResponse(S.skillDetailApiResponse), ...errorResponses(400, 401, 403, 404, 413) },
    },
  };
}

function skillDeletePath(prefix: string): PathItem {
  return {
    delete: {
      summary: "Delete a skill",
      operationId: "deleteSkill",
      tags: ["Skills"],
      security: bearerAuth(),
      parameters: [pathParam("id", "Skill GUID")],
      responses: { ...jsonResponse(S.successResponseSchema), ...errorResponses(401, 403, 404) },
    },
  };
}

function skillSearchPath(prefix: string): PathItem {
  return {
    get: {
      summary: "Search skills (keyword or semantic)",
      operationId: "searchSkills",
      tags: ["Search"],
      security: bearerAuth(),
      parameters: queryParams(S.searchQuerySchema),
      responses: { ...jsonResponse(S.skillSearchApiResponse), ...errorResponses(400, 401) },
    },
  };
}

function skillGeneratePath(prefix: string): PathItem {
  return {
    post: {
      summary: "Generate a skill via AI (SSE stream)",
      operationId: "generateSkill",
      tags: ["Generation"],
      security: bearerAuth(),
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: toSchema(S.generateJsonBodySchema) },
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                package: { type: "string", format: "binary" },
              },
              required: ["prompt"],
            },
          },
        },
      },
      responses: { ...sseResponse("SSE stream of generation events"), ...errorResponses(400, 401) },
    },
  };
}

// ---------------------------------------------------------------------------
// Web-only path definitions
// ---------------------------------------------------------------------------

function formatRulesPath(): PathItem {
  return {
    get: {
      summary: "Get skill format specification rules",
      operationId: "getFormatRules",
      tags: ["Format"],
      responses: jsonResponse(S.formatRulesResponseSchema),
    },
  };
}

function formatValidatePath(): PathItem {
  return {
    post: {
      summary: "Validate a ZIP package against format rules",
      operationId: "validateFormat",
      tags: ["Format"],
      security: bearerAuth(),
      requestBody: {
        required: true,
        content: { "application/zip": { schema: { type: "string", format: "binary" } } },
      },
      responses: { ...jsonResponse(S.formatValidationResponseSchema), ...errorResponses(400, 401) },
    },
  };
}

function playgroundChatPath(): PathItem {
  return {
    post: {
      summary: "Multi-turn playground chat (SSE stream)",
      operationId: "playgroundChat",
      tags: ["Playground"],
      security: bearerAuth(),
      requestBody: {
        required: true,
        content: { "application/json": { schema: toSchema(S.chatRequestBodySchema) } },
      },
      responses: { ...sseResponse("SSE stream of chat events"), ...errorResponses(400, 401) },
    },
  };
}

function categoriesListCreatePath(): PathItem {
  return {
    get: {
      summary: "List all skill categories",
      operationId: "listCategories",
      tags: ["Admin"],
      security: bearerAuth(),
      responses: { ...jsonResponse(S.categorySchema.array()), ...errorResponses(401) },
    },
    post: {
      summary: "Create a category",
      operationId: "createCategory",
      tags: ["Admin"],
      security: bearerAuth(),
      requestBody: {
        required: true,
        content: { "application/json": { schema: toSchema(S.createCategoryBodySchema) } },
      },
      responses: { ...jsonResponse(S.categorySchema, "Category created"), ...errorResponses(400, 401) },
    },
  };
}

function categoryUpdateDeletePath(): PathItem {
  return {
    put: {
      summary: "Update a category",
      operationId: "updateCategory",
      tags: ["Admin"],
      security: bearerAuth(),
      parameters: [pathParam("id", "Category ID")],
      requestBody: {
        required: true,
        content: { "application/json": { schema: toSchema(S.updateCategoryBodySchema) } },
      },
      responses: { ...jsonResponse(S.categorySchema), ...errorResponses(400, 401, 404) },
    },
    delete: {
      summary: "Delete a category",
      operationId: "deleteCategory",
      tags: ["Admin"],
      security: bearerAuth(),
      parameters: [pathParam("id", "Category ID")],
      responses: { ...jsonResponse(S.successResponseSchema), ...errorResponses(401, 404) },
    },
  };
}

function tagsListCreatePath(): PathItem {
  return {
    get: {
      summary: "List tags",
      operationId: "listTags",
      tags: ["Admin"],
      security: bearerAuth(),
      parameters: [{ name: "type", in: "query", required: false, schema: { type: "string", enum: ["predefined", "custom"] } }],
      responses: { ...jsonResponse(S.tagSchema.array()), ...errorResponses(401) },
    },
    post: {
      summary: "Create a custom tag",
      operationId: "createTag",
      tags: ["Admin"],
      security: bearerAuth(),
      requestBody: {
        required: true,
        content: { "application/json": { schema: toSchema(S.createTagBodySchema) } },
      },
      responses: { ...jsonResponse(S.tagSchema, "Tag created"), ...errorResponses(400, 401) },
    },
  };
}

function tagDeletePath(): PathItem {
  return {
    delete: {
      summary: "Delete a tag",
      operationId: "deleteTag",
      tags: ["Admin"],
      security: bearerAuth(),
      parameters: [pathParam("id", "Tag ID")],
      responses: { ...jsonResponse(S.successResponseSchema), ...errorResponses(401, 404) },
    },
  };
}

// ---------------------------------------------------------------------------
// Spec builders
// ---------------------------------------------------------------------------

function baseSpec(title: string, description: string): OpenApiSpec {
  return {
    openapi: "3.1.0",
    info: { title, version: "2.0.0", description },
    servers: [{ url: "http://localhost:3802" }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "NyxID JWT access token",
        },
      },
    },
  };
}

export function buildAgentSpec(): OpenApiSpec {
  const prefix = "/api/agent";
  return {
    ...baseSpec(
      "ornn-skill Agent API",
      "Agent-facing endpoints for AI agents and MCP tools. Supports skill upload, search, retrieval, and generation.",
    ),
    tags: [
      { name: "Skills", description: "Skill upload and retrieval" },
      { name: "Search", description: "Keyword and semantic skill search" },
      { name: "Generation", description: "AI-powered skill generation" },
    ],
    paths: {
      [`${prefix}/skills`]: skillUploadPath(prefix),
      [`${prefix}/skills/{idOrName}`]: skillReadPath(prefix),
      [`${prefix}/skills/{idOrName}/json`]: skillJsonPath(prefix),
      [`${prefix}/skill-search`]: skillSearchPath(prefix),
      [`${prefix}/skills/generate`]: skillGeneratePath(prefix),
    },
  };
}

export function buildWebSpec(): OpenApiSpec {
  const prefix = "/api/web";
  return {
    ...baseSpec(
      "ornn-skill Web API",
      "Frontend-facing endpoints for the ornn web UI. Full skill CRUD, search, generation, playground, and admin.",
    ),
    tags: [
      { name: "Skills", description: "Skill CRUD operations" },
      { name: "Search", description: "Keyword and semantic skill search" },
      { name: "Generation", description: "AI-powered skill generation" },
      { name: "Format", description: "Skill format rules and validation" },
      { name: "Playground", description: "Credential management and chat" },
      { name: "Admin", description: "Category and tag management" },
    ],
    paths: {
      // Skills CRUD
      [`${prefix}/skills`]: skillUploadPath(prefix),
      [`${prefix}/skills/{idOrName}`]: skillReadPath(prefix),
      [`${prefix}/skills/{idOrName}/json`]: skillJsonPath(prefix),
      [`${prefix}/skills/{id}`]: {
        ...skillUpdatePath(prefix),
        ...skillDeletePath(prefix),
      },
      // Search
      [`${prefix}/skill-search`]: skillSearchPath(prefix),
      // Generation
      [`${prefix}/skills/generate`]: skillGeneratePath(prefix),
      // Format
      [`${prefix}/skill-format/rules`]: formatRulesPath(),
      [`${prefix}/skill-format/validate`]: formatValidatePath(),
      // Playground
      [`${prefix}/playground/chat`]: playgroundChatPath(),
      // Admin
      [`${prefix}/admin/categories`]: categoriesListCreatePath(),
      [`${prefix}/admin/categories/{id}`]: categoryUpdateDeletePath(),
      [`${prefix}/admin/tags`]: tagsListCreatePath(),
      [`${prefix}/admin/tags/{id}`]: tagDeletePath(),
    },
  };
}
