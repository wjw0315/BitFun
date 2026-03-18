# PRD: 对话窗口 Skills 指令识别系统

## 1. 项目概述

**项目名称:** CLAUDE.skills 指令识别系统

**项目类型:** AIOS 功能增强

**核心功能:** 在AIOS对话窗口中，自动识别用户输入是否指向 `.claude/skills` 目录下的技能文件，并将匹配到的技能作为可执行指令响应。

**目标用户:** AIOS高级用户，希望通过自然对话快速调用各种技能

---

## 2. 背景与动机

### 2.1 当前问题

1. **技能调用繁琐**: 用户需要记忆并手动输入 `/skill` 命令
2. **发现困难**: 用户不知道系统有哪些可用技能
3. **体验不连贯**: 对话中断，需要切换到特定命令模式

### 2.2 期望体验

用户输入自然语言描述 → 系统识别技能 → 自动执行 → 返回结果

**示例:**
- 用户: "帮我用Python写个排序算法" → 触发 `python-patterns` skill
- 用户: "解释一下Rust的所有权" → 触发 `rust-learner` skill
- 用户: "创建一个REST API文档" → 触发 `api-design` skill

---

## 3. 功能需求

### 3.1 核心功能

| 功能编号 | 功能名称 | 优先级 | 描述 |
|---------|---------|--------|------|
| FR-01 | Skills目录扫描 | P0 | 扫描 `.claude/skills` 目录，解析所有技能文件元数据 |
| FR-02 | 输入意图识别 | P0 | 基于自然语言匹配用户输入与可用技能 |
| FR-03 | 技能自动执行 | P0 | 识别后自动调用对应Skill工具执行 |
| FR-04 | 多技能候选 | P1 | 当匹配度相近时，展示多个候选技能供选择 |
| FR-05 | 模糊匹配降级 | P1 | 无精确匹配时，使用语义相似度排序 |
| FR-06 | Skills目录创建 | P2 | 自动初始化 `.claude/skills` 目录结构 |

### 3.2 数据需求

| 数据编号 | 数据名称 | 来源 | 描述 |
|---------|---------|------|------|
| DR-01 | Skills元数据 | 扫描技能文件 | name, description, keywords, trigger_patterns |
| DR-02 | 用户输入 | 对话窗口 | 原始用户消息文本 |
| DR-03 | 匹配结果 | 识别引擎 | skill_id, confidence_score, reasoning |

### 3.3 边界情况处理

| 场景 | 处理方式 |
|------|---------|
| 无匹配技能 | 降级为普通对话处理 |
| 多技能高匹配 | 提示用户选择或默认最高匹配 |
| Skills目录不存在 | 提示用户初始化或自动创建 |
| 技能执行失败 | 捕获错误，返回友好提示 |

---

## 4. 非功能需求

### 4.1 性能

- **响应时间**: 意图识别延迟 < 100ms
- **扫描缓存**: Skills目录扫描结果缓存5分钟

### 4.2 可用性

- **发现性**: 用户输入 "?" 时展示可用技能列表
- **显式调用**: 支持 `/skill name` 显式调用作为回退

### 4.3 扩展性

- **插件式**: 新增技能只需在skills目录添加文件
- **多目录支持**: 支持 `.claude/skills` 和项目级 `skills/` 目录

---

## 5. 技术方案

### 5.1 架构设计

```
用户输入
    ↓
意图识别器 (IntentRecognizer)
    ↓
┌─────────────┴─────────────┐
↓                             ↓
[匹配到技能]              [未匹配]
    ↓                             ↓
Skill执行器                普通对话处理
(SkillExecutor)
```

### 5.2 核心模块

| 模块 | 职责 | 输入 | 输出 |
|-----|------|------|------|
| SkillsScanner | 扫描并解析skills目录 | 目录路径 | SkillsMetadata[] |
| IntentMatcher | 匹配用户输入与技能 | userInput, skills | MatchResult[] |
| SkillExecutor | 执行匹配的技能 | skillId, context | ExecutionResult |
| FallbackHandler | 未匹配时的处理 | userInput | ChatResponse |

### 5.3 技能文件格式

```yaml
# skills/template.md 示例
name: python-patterns
description: Python编码模式和最佳实践
keywords:
  - python
  - 排序
  - 列表
  - 装饰器
trigger_patterns:
  - "python"
  - "排序"
  - "最佳实践"
category: patterns
```

---

## 6. 验收标准

### 6.1 功能验收

- [ ] FR-01: 扫描 `.claude/skills` 目录返回正确元数据
- [ ] FR-02: 输入 "python 排序" 正确匹配 python-patterns
- [ ] FR-03: 匹配成功后自动执行技能
- [ ] FR-04: 多候选时展示选择提示
- [ ] FR-05: 无匹配时正常进入对话流程

### 6.2 体验验收

- [ ] 用户感知延迟 < 500ms
- [ ] 技能发现操作便捷 (输入 ?)
- [ ] 错误提示友好

---

## 7. 里程碑

| 阶段 | 任务 | 预计故事点 |
|------|------|-----------|
| Phase 1 | SkillsScanner + 元数据解析 | 3 |
| Phase 2 | IntentMatcher 基础匹配 | 5 |
| Phase 3 | SkillExecutor 集成 | 3 |
| Phase 4 | Fallback + 多候选UI | 2 |

---

## 8. 风险与依赖

### 8.1 风险

- **识别准确性**: 自然语言匹配可能误判 → 需持续优化匹配算法
- **Skills目录为空**: 初期可能无可用技能 → 需预置基础技能集

### 8.2 依赖

- Skill工具 (Skill tool)
- 文件系统访问
- Claude Code对话API

---

*PRD创建: Morgan, 2026-03-18*
