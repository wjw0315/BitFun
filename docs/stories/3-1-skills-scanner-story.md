# Story 3.1: SkillsScanner 模块开发

## 基本信息

| 属性 | 值 |
|------|-----|
| **Story ID** | 3.1 |
| **Epic** | epic-3 |
| **状态** | draft |
| **故事点** | 3 |
| **负责人** | @dev (Dex) |

---

## 概述

开发 SkillsScanner 模块，实现对 `.claude/skills` 目录的扫描功能。

---

## 验收标准

- [ ] 扫描 `.claude/skills` 目录返回正确元数据
- [ ] 支持递归扫描子目录
- [ ] 缓存扫描结果5分钟

---

## 详细描述

SkillsScanner 需要实现以下功能：
1. 扫描指定目录下的所有 `.md` 技能文件
2. 解析文件头部 YAML frontmatter 获取元数据
3. 返回技能列表（name, description, keywords）
4. 实现缓存机制

---

## 技术要求

- 语言: TypeScript/JavaScript
- 缓存: 内存缓存或文件缓存

---

## 依赖

- 无

---

## 风险

- 目录不存在时需友好处理

---

*Created by @sm (River), 2026-03-18*
