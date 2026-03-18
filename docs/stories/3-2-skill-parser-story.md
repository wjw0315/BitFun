# Story 3.2: 技能文件格式定义与解析器

## 基本信息

| 属性 | 值 |
|------|-----|
| **Story ID** | 3.2 |
| **Epic** | epic-3 |
| **状态** | done |
| **故事点** | 2 |
| **负责人** | @dev (Dex) |

---

## 概述

定义技能文件的标准格式，并开发解析器解析技能元数据。

---

## 验收标准

- [x] 定义技能文件格式规范（YAML frontmatter）
- [x] 解析器能正确提取 name, description, keywords
- [x] 支持 trigger_patterns 字段

---

## 详细描述

### 技能文件格式

```yaml
---
name: python-patterns
description: Python编码模式和最佳实践
keywords:
  - python
  - 排序
  - 装饰器
trigger_patterns:
  - "python"
  - "排序"
category: patterns
---
```

### 解析器功能

1. 读取 `.md` 文件
2. 解析 YAML frontmatter
3. 提取元数据字段
4. 验证必填字段

---

## 技术要求

- 语言: Rust
- 依赖: serde_yaml (已存在)

## 实现文件

- `src/crates/core/src/agentic/tools/implementations/skills/types.rs` - SkillData, SkillInfo 结构体扩展
- `src/crates/core/src/agentic/tools/implementations/skills/registry.rs` - 解析逻辑更新

---

## 依赖

- 3.1 (SkillsScanner)

---

*Created by @sm (River), 2026-03-18*
