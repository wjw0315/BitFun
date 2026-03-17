# Epic 1: 会话状态展示功能

## Epic 目标

为会话列表增加状态指示器，通过不同颜色的圆点直观展示会话的处理状态，提升用户对会话进度的感知。

## 需求背景

在 AI 编程助手的会话管理中，用户需要清晰地了解每个会话的当前状态：
- 当前是否正在处理任务
- 是否需要人工确认
- 是否遇到错误
- 是否已完成

通过可视化的状态指示器，用户可以快速定位需要关注的会话。

## 功能需求

### 1.1 状态类型定义

| 状态 | 显示效果 | 触发条件 |
|------|----------|----------|
| 空闲 (idle) | 不显示状态 | 会话未处理任何任务 |
| 处理中 (running) | 黄色圆点 + 旋转动画 | 会话正在执行（模型思考、工具调用等） |
| 等待确认 (confirming) | 紫色圆点 + 闪动效果 | 工具执行需要用户确认 |
| 完成 (completed) | 绿色圆点（静态） | 会话已成功完成 |
| 错误 (error) | 红色圆点（静态） | 会话执行遇到错误 |

### 1.2 状态检测逻辑

- **处理中状态**: 检测状态机的 `PROCESSING` 状态
- **等待确认状态**: 检测 `pendingToolConfirmations` 集合非空
- **完成状态**: 检测会话的 `lastFinishedAt` 时间戳存在
- **错误状态**: 检测状态机的 `ERROR` 状态

### 1.3 用户交互

- 用户点击查看已完成状态的会话时，自动清除完成标记
- 状态指示器恢复到空闲（无显示）
- 实现方式：清除 `lastFinishedAt` 字段

## 技术实现

### 2.1 文件修改清单

| 文件路径 | 修改内容 |
|----------|----------|
| `src/web-ui/src/flow_chat/utils/sessionTaskStatus.ts` | 扩展状态类型，新增 `confirming`/`completed`/`error` 状态 |
| `src/web-ui/src/flow_chat/store/FlowChatStore.ts` | 新增 `clearSessionCompleted()` 方法 |
| `src/web-ui/src/app/components/NavPanel/sections/sessions/SessionsSection.tsx` | 更新 UI 组件和点击处理逻辑 |
| `src/web-ui/src/app/components/NavPanel/sections/sessions/SessionsSection.scss` | 添加状态圆点样式和动画 |

### 2.2 状态类型定义

```typescript
export type SessionTaskStatus = 'idle' | 'running' | 'confirming' | 'completed' | 'error';
```

### 2.3 新增函数

- `getCompleteSessionStatus(sessionId)`: 综合任务状态和完成状态返回完整状态
- `isSessionCompleted(sessionId)`: 检查会话是否标记为完成
- `clearSessionCompleted(sessionId)`: 清除会话的完成标记

## 验收标准

- [ ] 空闲状态不显示任何状态指示器
- [ ] 处理中显示黄色圆点带旋转动画
- [ ] 等待确认显示紫色圆点带闪动效果
- [ ] 完成显示绿色静态圆点
- [ ] 错误显示红色静态圆点
- [ ] 用户点击查看已完成会话后，状态自动恢复为空闲
- [ ] 类型检查通过
- [ ] UI 样式符合现有设计规范

## 风险与兼容性

- 纯前端修改，不影响后端 API
- 状态变化基于现有状态机逻辑，无额外副作用
- 样式使用 CSS 动画，支持 `prefers-reduced-motion`

## 相关文档

- [SessionsSection.tsx](../../src/web-ui/src/app/components/NavPanel/sections/sessions/SessionsSection.tsx)
- [sessionTaskStatus.ts](../../src/web-ui/src/flow_chat/utils/sessionTaskStatus.ts)
- [FlowChatStore.ts](../../src/web-ui/src/flow_chat/store/FlowChatStore.ts)
