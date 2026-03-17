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
├── stories/           # Story 用户故事
├── specs/             # 规格文档 (SRS/PRD)
├── architecture/      # 架构设计文档
├── research/          # 调研文档
├── api/               # API 文档
└── guides/            # 用户/开发指南

.kiro/specs/           # Kiro 规格目录
└── story-{id}-{short-name}/
    ├── spec.json
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

---

## 3. 命名规范

### 3.1 Story 文档 (`docs/stories/`)

**格式**: `{epic-id}.{story-id}-{short-description}.md`

| 组件 | 说明 | 示例 |
| --- | --- | --- |
| `epic-id` | Epic 编号 | `1`, `2` |
| `story-id` | Story 编号 | `1`, `2`, `3` |
| `short-description` | 简短描述（英文或拼音） | `purchase`, `coupon`, `performance-calc` |

**示例**:
- ✅ `1.1-package-purchase.md`
- ✅ `1.2-coupon-usage.md`
- ✅ `1.3-performance-calculation.md`
- ❌ `1.1.套装套餐订单-purchase.md` (混合语言、多余点号)
- ❌ `1.1.database-design.md` (类型混淆)

---

### 3.2 规格文档 (`docs/specs/`)

**格式**: `{epic-id}.{story-id}-{type}.md`

| 类型后缀 | 说明 | 示例 |
| --- | --- | --- |
| `-srs` | Software Requirements Specification | `1.1-srs.md` |
| `-spec` | 通用规格文档 | `1.2-spec.md` |
| `-prd` | Product Requirements Document | `1.1-prd.md` |

**示例**:
- ✅ `1.1-srs.md`
- ✅ `1.2-spec.md`
- ❌ `story-1.1-spec.md` (多余的 story- 前缀)
- ❌ `1.2.开单优惠券使用-SRS.md` (中文、空格)

---

### 3.3 架构设计文档 (`docs/architecture/`)

**格式**: `story-{epic-id}.{story-id}-{type}.md`

| 类型后缀 | 说明 | 示例 |
| --- | --- | --- |
| `-design` | 详细设计文档 | `story-1.1-design.md` |
| `-tech-design` | 技术设计文档 | `story-1.1-tech-design.md` |
| `-db-design` | 数据库设计 | `story-1.1-db-design.md` |

**示例**:
- ✅ `story-1.1-design.md`
- ✅ `story-1.2-tech-design.md`
- ❌ `story-1.1-detailed-design.md` (detailed 多余)
- ❌ `story-1.2.开单优惠券使用-详细设计.md` (中文、空格)

---

### 3.4 调研文档 (`docs/research/`)

**格式**: `story-{epic-id}.{story-id}-research.json`

**示例**:
- ✅ `story-1.1-research.json`
- ❌ `story-1.1-research.md` (调研必须用 JSON)

---

### 3.5 数据库设计文档

**格式**: `story-{epic-id}.{story-id}-db-design.md`

**位置**: `docs/architecture/` (属于架构设计的一部分)

**示例**:
- ✅ `docs/architecture/story-1.1-db-design.md`
- ❌ `docs/stories/1.1.database-design.md` (位置错误)

---

### 3.6 Kiro 规格目录 (`.kiro/specs/`)

**格式**: `story-{id}-{short-name}/`

**内部文件**:
- `spec.json` - 规格元数据
- `requirements.md` - 需求文档
- `design.md` - 设计文档
- `tasks.md` - 任务列表

**示例**:
- ✅ `.kiro/specs/story-1-2-coupon/`

---

## 4. 完整示例

对于 Story 1.1 (套装套餐订单购买开单):

```
docs/
├── stories/
│   └── 1.1-package-purchase.md          # 用户故事
├── specs/
│   └── 1.1-srs.md                       # 软件需求规格
├── architecture/
│   ├── story-1.1-design.md              # 详细设计
│   └── story-1.1-db-design.md           # 数据库设计
└── research/
    └── story-1.1-research.json          # 调研结果

.kiro/specs/
└── story-1-1-package/
    ├── spec.json
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

---

## 5. 禁止的命名方式

| ❌ 禁止 | ✅ 正确 | 原因 |
| --- | --- | --- |
| `1.1.套装套餐订单.md` | `1.1-package-purchase.md` | 中文、点号过多 |
| `story-1.1-spec.md` | `1.1-spec.md` | 多余的 story- 前缀 |
| `1.1 database design.md` | `story-1.1-db-design.md` | 空格、位置错误 |
| `1.1_DATABASE.md` | `story-1.1-db-design.md` | 大写、下划线 |
| `1.1.database-design.md` | `story-1.1-db-design.md` | 点号、位置错误 |

---

## 6. 批量重命名脚本

```bash
#!/bin/bash
# rename-docs.sh - 标准化文档命名

# Story 文档
git mv "docs/stories/1.1.套装套餐订单-purchase.md" "docs/stories/1.1-package-purchase.md"
git mv "docs/stories/1.1.database-design.md" "docs/architecture/story-1.1-db-design.md"
git mv "docs/stories/1.2.开单优惠券使用.md" "docs/stories/1.2-coupon-usage.md"
git mv "docs/stories/1.3.开单消耗业绩提成计算.md" "docs/stories/1.3-performance-calculation.md"

# Spec 文档
git mv "docs/specs/story-1.1-spec.md" "docs/specs/1.1-srs.md"
git mv "docs/specs/1.2.开单优惠券使用-SRS.md" "docs/specs/1.2-srs.md"
git mv "docs/specs/1.3-开单消耗业绩提成计算-spec.md" "docs/specs/1.3-spec.md"

# Architecture 文档
git mv "docs/architecture/story-1.1-detailed-design.md" "docs/architecture/story-1.1-design.md"
git mv "docs/architecture/story-1.2.开单优惠券使用-详细设计.md" "docs/architecture/story-1.2-design.md"

echo "重命名完成，请检查 git status"
```

---

## 7. 规范演进

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| 1.0.0 | 2026-02-27 | 初始版本 |

---

*由 @architect (Aria) 制定*
