/**
 * Documentation routes. Serves doc tree and markdown content from the filesystem.
 * No auth required — docs are publicly accessible.
 * @module domains/docs/routes
 */

import { Hono } from "hono";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import pino from "pino";

const logger = pino({ level: "info" }).child({ module: "docsRoutes" });

const SUPPORTED_LANGS = new Set(["en", "zh"]);

export interface DocsRoutesConfig {
  /** Absolute path to the docs/site directory */
  docsBasePath: string;
}

export function createDocsRoutes(config: DocsRoutesConfig): Hono {
  const { docsBasePath } = config;
  const app = new Hono();

  /**
   * GET /docs/tree?lang=en — Return the menu structure for a language.
   */
  app.get("/docs/tree", async (c) => {
    const lang = c.req.query("lang") ?? "en";
    if (!SUPPORTED_LANGS.has(lang)) {
      return c.json(
        { data: null, error: { code: "INVALID_LANG", message: `Unsupported language: ${lang}` } },
        400,
      );
    }

    const menuPath = join(docsBasePath, lang, "menuStructure.json");
    try {
      const content = await readFile(menuPath, "utf-8");
      const menu = JSON.parse(content);
      logger.debug({ lang }, "Docs tree loaded");
      return c.json({ data: menu, error: null });
    } catch (err) {
      logger.error({ err, lang, menuPath }, "Failed to read menu structure");
      return c.json(
        { data: null, error: { code: "MENU_NOT_FOUND", message: "Menu structure not found" } },
        404,
      );
    }
  });

  /**
   * GET /docs/content/:lang/:slug — Return raw markdown content for a doc.
   * The slug is the doc ID (e.g. "what-is-ornn"), resolved to a .md file via menuStructure.
   */
  app.get("/docs/content/:lang/:slug", async (c) => {
    const lang = c.req.param("lang");
    const slug = c.req.param("slug");

    if (!SUPPORTED_LANGS.has(lang)) {
      return c.json(
        { data: null, error: { code: "INVALID_LANG", message: `Unsupported language: ${lang}` } },
        400,
      );
    }

    // Prevent path traversal
    if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
      return c.json(
        { data: null, error: { code: "INVALID_SLUG", message: "Invalid document slug" } },
        400,
      );
    }

    // Load menu to resolve slug → file
    const menuPath = join(docsBasePath, lang, "menuStructure.json");
    let fileName: string | null = null;
    try {
      const menuContent = await readFile(menuPath, "utf-8");
      const menu = JSON.parse(menuContent);
      for (const section of menu.sections) {
        for (const child of section.children) {
          if (child.id === slug) {
            fileName = child.file;
            break;
          }
        }
        if (fileName) break;
      }
    } catch {
      return c.json(
        { data: null, error: { code: "MENU_NOT_FOUND", message: "Menu structure not found" } },
        404,
      );
    }

    if (!fileName) {
      return c.json(
        { data: null, error: { code: "DOC_NOT_FOUND", message: `Document '${slug}' not found` } },
        404,
      );
    }

    // Resolve and validate file path stays within docs directory
    const filePath = resolve(docsBasePath, lang, fileName);
    if (!filePath.startsWith(resolve(docsBasePath))) {
      return c.json(
        { data: null, error: { code: "INVALID_PATH", message: "Invalid document path" } },
        400,
      );
    }

    try {
      const content = await readFile(filePath, "utf-8");
      logger.debug({ lang, slug, fileName }, "Doc content loaded");
      return c.json({ data: { slug, lang, content }, error: null });
    } catch {
      logger.warn({ lang, slug, filePath }, "Doc file not found");
      return c.json(
        { data: null, error: { code: "DOC_NOT_FOUND", message: `Document '${slug}' not found` } },
        404,
      );
    }
  });

  return app;
}
