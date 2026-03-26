# Version Roadmap

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

    F1 & F2 & F3 & F4 & F5 & F6 & F7 --> BRIDGE0((" "))

    BRIDGE0 --> V1B["🔧 v0.1.3"]
    V1B --> F8["Ornn Core Skills"]
    V1B --> F9["Multi-Platform Agent Support"]
    V1B --> F10["Prompt-Based Installation"]

    F8 & F9 & F10 --> BRIDGE1((" "))

    BRIDGE1 --> V2["⭐ v0.2.0"]
    V2 --> G1["Skill Audit & Trust"]
    V2 --> G2["Community Ratings & Reviews"]
    V2 --> G3["Usage Analytics Dashboard"]

    G1 & G2 & G3 --> BRIDGE2((" "))

    BRIDGE2 --> V3["⚡ v0.3.0"]
    V3 --> H1["Go Runtime Support"]
    V3 --> H2["Rust Runtime Support"]

    H1 & H2 --> BRIDGE3((" "))

    BRIDGE3 --> V4["🚀 v1.0.0"]
    V4 --> I1["Skill-Only API"]
    V4 --> I2["Deprecate MCP Dependency"]
    V4 --> I3["Direct Agent SDK Integration"]
```

---

<!-- RELEASES -->

---

## Planned Versions

### v0.2.0 — Skill Audit & Community

- **Skill Audit** — Automated safety and quality review for published skills before they appear in public search
- **Ratings & Reviews** — Rate and review skills to help others find high-quality capabilities
- **Usage Analytics** — Track usage patterns to surface popular and trending skills

### v0.3.0 — Sandbox Runtime Enhancement

- **Go** — Support for Go-based skill scripts
- **Rust** — Support for Rust-based skill scripts

### v1.0.0 — Skill-Only API (Future)

- **Skill-Only API** — Standalone REST/WebSocket API purpose-built for skill operations, eliminating MCP transport limitations
- **Deprecate MCP Dependency** — MCP remains optional; the Skill-Only API becomes the primary integration path
- **Direct Agent SDK** — Lightweight TypeScript and Python SDKs for native skill integration
