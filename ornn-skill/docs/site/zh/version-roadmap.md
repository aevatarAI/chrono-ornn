# 版本路线图

```mermaid
graph TD
    START((" ")) --> V1

    V1["🔨 v0.1.0-alpha"]
    V1 --> F1["NyxID 认证与用户管理"]
    V1 --> F2["三种技能创建模式"]
    V1 --> F3["沙箱试验场"]
    V1 --> F4["关键词与语义搜索"]
    V1 --> F5["管理系统"]
    V1 --> F6["多语言与主题切换"]
    V1 --> F7["Agent API（NyxID MCP）"]

    F1 & F2 & F3 & F4 & F5 & F6 & F7 --> BRIDGE0((" "))

    BRIDGE0 --> V1B["🔧 v0.1.3"]
    V1B --> F8["Ornn 核心技能"]
    V1B --> F9["多平台 Agent 支持"]
    V1B --> F10["提示词安装"]

    F8 & F9 & F10 --> BRIDGE1((" "))

    BRIDGE1 --> V2["⭐ v0.2.0"]
    V2 --> G1["技能审计与信任"]
    V2 --> G2["社区评分与评论"]
    V2 --> G3["使用分析仪表盘"]

    G1 & G2 & G3 --> BRIDGE2((" "))

    BRIDGE2 --> V3["⚡ v0.3.0"]
    V3 --> H1["Go 运行时支持"]
    V3 --> H2["Rust 运行时支持"]

    H1 & H2 --> BRIDGE3((" "))

    BRIDGE3 --> V4["🚀 v1.0.0"]
    V4 --> I1["Skill-Only API"]
    V4 --> I2["弃用 MCP 依赖"]
    V4 --> I3["Agent SDK 直接集成"]
```

---

<!-- RELEASES -->

---

## 计划版本

### v0.2.0 — 技能审计与社区

- **技能审计** — 对已发布技能进行自动安全性和质量审查，确保通过审核后才出现在公开搜索中
- **评分与评论** — 对技能评分和评论，帮助他人发现高质量技能
- **使用分析** — 追踪使用情况，展示热门和趋势技能

### v0.3.0 — 沙箱运行时增强

- **Go** — 支持基于 Go 的技能脚本
- **Rust** — 支持基于 Rust 的技能脚本

### v1.0.0 — Skill-Only API（未来规划）

- **Skill-Only API** — 专为技能操作构建的独立 REST/WebSocket API，消除 MCP 传输层限制
- **弃用 MCP 依赖** — MCP 作为可选项保留，Skill-Only API 成为主要集成路径
- **Agent SDK 直接集成** — 轻量级 TypeScript 和 Python SDK，原生技能集成
