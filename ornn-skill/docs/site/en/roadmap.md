# Ornn Roadmap

```mermaid
graph TD
    START((" ")) --> V1

    V1["🔨 v0.1.0-alpha"]
    V1 --> F1["NyxID Auth & User Management"]
    V1 --> F2["Three Skill Creation Modes"]
    V1 --> F3["Sandbox Playground"]
    V1 --> F4["Keyword & Semantic Search"]
    V1 --> F5["Admin System"]
    V1 --> F6["i18n & Theming"]
    V1 --> F7["Agent API via NyxID MCP"]

    F1 & F2 & F3 & F4 & F5 & F6 & F7 --> BRIDGE1((" "))

    BRIDGE1 --> V2["⭐ v0.2.0"]
    V2 --> G1["Community Ratings & Reviews"]
    V2 --> G2["Usage Analytics Dashboard"]
    V2 --> G3["Featured Skill Recommendations"]

    G1 & G2 & G3 --> BRIDGE2((" "))

    BRIDGE2 --> V3["⚡ v0.3.0"]
    V3 --> H1["Go Runtime Support"]
    V3 --> H2["Rust Runtime Support"]
```

---

## v0.1.0-alpha — Core Platform (Current)

The foundation release with all essential features:

- **NyxID Auth** — OAuth login, JWT verification, API key management
- **Three Creation Modes** — Guided, Free, and AI-Generative skill creation
- **Sandbox Playground** — Interactive skill testing with LLM context injection
- **Search** — Keyword and semantic search across the skill library
- **Admin System** — Category and tag management, activity logging
- **i18n & Theming** — English/Chinese with dark and light themes
- **Agent API** — Skill search, pull, upload, and build via NyxID MCP tools

## v0.2.0 — Skill Library Community

Enrich the skill library with community-driven features:

- **Ratings & Reviews** — Users can rate and review skills, helping others discover high-quality capabilities
- **Usage Analytics** — Track skill usage patterns to surface popular and trending skills
- **Featured Skills** — Curated recommendations to highlight the best skills on the platform

## v0.3.0 — Sandbox Runtime Enhancement

Expand the sandbox playground with additional language runtimes:

- **Go** — Support for Go-based skill scripts
- **Rust** — Support for Rust-based skill scripts
