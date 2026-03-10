# Ornn Releases

## v0.1.0-alpha — First Alpha (Current)

The first public alpha release of the Ornn skill platform. This release delivers the core user-facing features for skill authoring, discovery, testing, and management.

### Core Features

1. **Authentication & User Management** — Full integration with NyxID for OAuth login, JWT-based authorization, and role-based access control.

2. **Three Skill Creation Modes**
   - **Guided** — Step-by-step wizard for structured skill authoring
   - **Free** — Upload a pre-built skill package (ZIP)
   - **Generative** — Describe what you need and let AI generate the skill

3. **Skill Read, Update & Sandbox Playground** — View and update skill packages. Interactive sandbox playground for testing any skill with an AI agent that executes skills via context injection, with chrono-sandbox integration for script execution.

4. **Two Search Modes**
   - **Keyword search** — Traditional text-based search
   - **Semantic search** — Find skills by meaning, powered by vector embeddings

5. **Admin System** — Administrator dashboard for user activity monitoring and platform-wide skill management.

6. **Multi-language Support** — Full English and Chinese localization.

7. **Theme** — Dark mode and light mode.

8. **Agent-facing Services** — API endpoints for AI agents to search, fetch, upload, and author skills programmatically.

> For technical implementation details, refer to the **Technical Reference** section.
