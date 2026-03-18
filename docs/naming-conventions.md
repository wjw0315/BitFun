# 文档命名规范

> 版本: 1.0.0 | 日期: 2026-02-27 | 适用于: AIOS 项目

---

## 1. 核心原则

| 原则 | 说明 |
| --- | --- |
| **一致性** | 同类型文档使用统一命名模式 |
| **可读性** | 文件名清晰表达内容，无需打开即可理解 |
| **排序友好** | 使用数字前缀确保文件按逻辑顺序排列 |
| **无空格** | 使用连字符 `-` 替代空格，避免 URL 编码问题 |
| **小写优先** | 文件名全部小写，减少大小写敏感问题 |

---

## 2. 目录结构

```
docs/
├── prd/               # prd 
├── epics/             # epic
├── specs/             # 规格文档 (SPEC)
├── stories/           # Story 用户故事
├── architecture/      # 架构设计文档
├── research/          # 调研文档
├── api/               # API 文档
└── guides/            # 用户/开发指南

```

---

## 3. 命名规范

### 3.1 PRD 文档 (`docs/prd/`)

**格式**: `{short-description}-prd.md`

| 组件 | 说明 | 示例 |
| --- | --- | --- |
| `short-description` | 简短描述（中文） | `优惠券使用` |

**示例**:
- ✅ `优惠券使用-prd.md`

---


### 3.1 epic 文档 (`docs/epics/`)

**格式**: `{epic-id}-{short-description}-epic.md`

| 组件 | 说明 | 示例 |
| --- | --- | --- |
| `epic-id` | Epic 编号 | `1`, `2` |
| `short-description` | 简短描述（中文） | `优惠券使用` |

**示例**:
- ✅ `1-优惠券使用-epic.md`

---

### 3.2 规格文档 (`docs/specs/`)

**格式**: `{epic-id}-{short-description}-{type}.md`

| 类型后缀 | 说明 | 示例 |
| --- | --- | --- |
| `-spec` | 通用规格文档 | `1.2-spec.md` |
| `short-description` | 简短描述（中文） | `优惠券使用` |

**示例**:
- ✅ `1-1-优惠券使用-spec.md`

---

### 3.1 Story 文档 (`docs/stories/`)

**格式**: `{epic-id}-{story-id}-{short-description}-story.md`

| 组件 | 说明 | 示例 |
| --- | --- | --- |
| `epic-id` | Epic 编号 | `1`, `2` |
| `story-id` | Story 编号 | `1`, `2`, `3` |
| `short-description` | 简短描述（中文） | `优惠券使用` |

**示例**:
- ✅ `1-1-优惠券使用-story.md`

---


### 3.3 架构设计文档 (`docs/architecture/`)

**格式**: `{epic-id}-{story-id}-{short-description}-{type}.md`

| 组件 | 说明 | 示例 |
| --- | --- | --- |
| `epic-id` | Epic 编号 | `1`, `2` |
| `story-id` | Story 编号 | `1`, `2`, `3` |
| `short-description` | 简短描述（中文） | `优惠券使用` |

| 类型后缀 | 说明 | 示例 |
| --- | --- | --- |
| `-design` | 详细设计文档 | `1-1-design.md` |
| `-tech-design` | 技术设计文档 | `1-1-tech-design.md` |
| `-db-design` | 数据库设计 | `1-1-db-design.md` |

**示例**:
- ✅ `1-1-优惠券使用-design.md`

---

### 3.4 调研文档 (`docs/research/`)

**格式**: `{epic-id}-{story-id}-{short-description}-research.json`

| 组件 | 说明 | 示例 |
| --- | --- | --- |
| `epic-id` | Epic 编号 | `1`, `2` |
| `story-id` | Story 编号 | `1`, `2`, `3` |
| `short-description` | 简短描述（中文） | `优惠券使用` |

**示例**:
- ✅ `1-1-优惠券使用-research.json`


---

## 7. 规范演进

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| 1.0.0 | 2026-02-27 | 初始版本 |

---

*由 @architect (Aria) 制定*
