/**
 * Session task status utilities
 * Provides functions to determine if a session is actively processing tasks.
 */

import { stateMachineManager } from '../state-machine';
import { SessionExecutionState } from '../state-machine/types';
import { flowChatStore } from '../store/FlowChatStore';

/**
 * Task status for a session.
 * - 'idle': The session is not processing any task (空闲)
 * - 'running': The session is currently processing (处理中 - 黄色圆点闪动)
 * - 'confirming': Waiting for user tool confirmation (需要人工确认 - 紫色圆点闪动)
 * - 'completed': The session has completed successfully (完成 - 绿色圆点)
 * - 'error': The session has an error (错误 - 红色圆点)
 */
export type SessionTaskStatus = 'idle' | 'running' | 'confirming' | 'completed' | 'error';

/**
 * Get the task status for a session.
 *
 * This function checks the state machine to determine the session status.
 *
 * @param sessionId - The session ID to check
 * @returns The task status of the session
 */
export function getSessionTaskStatus(sessionId: string): SessionTaskStatus {
  const machine = stateMachineManager.get(sessionId);
  if (!machine) {
    return 'idle';
  }

  const currentState = machine.getCurrentState();
  const context = machine.getContext();

  switch (currentState) {
    case SessionExecutionState.PROCESSING:
      // Check if there's a pending tool confirmation
      if (context.pendingToolConfirmations.size > 0) {
        return 'confirming';
      }
      return 'running';

    case SessionExecutionState.ERROR:
      return 'error';

    case SessionExecutionState.IDLE:
    default:
      return 'idle';
  }
}

/**
 * Check if a session has completed (has lastFinishedAt timestamp).
 * This is used to show the completed (green) status.
 *
 * @param sessionId - The session ID to check
 * @returns Whether the session has completed
 */
export function isSessionCompleted(sessionId: string): boolean {
  const state = flowChatStore.getState();
  const session = state.sessions.get(sessionId);
  return !!session?.lastFinishedAt;
}

/**
 * Get the complete session status including completion state.
 * This combines the task status with the session completion state.
 *
 * @param sessionId - The session ID to check
 * @returns The complete session status
 */
export function getCompleteSessionStatus(sessionId: string): SessionTaskStatus {
  const taskStatus = getSessionTaskStatus(sessionId);

  // If already in a non-idle state, return as-is
  if (taskStatus !== 'idle') {
    return taskStatus;
  }

  // Check if session has completed
  if (isSessionCompleted(sessionId)) {
    return 'completed';
  }

  return 'idle';
}

/**
 * Check if a session is currently running (processing).
 * This is a convenience wrapper for getSessionTaskStatus.
 */
export function isSessionRunning(sessionId: string): boolean {
  return getSessionTaskStatus(sessionId) === 'running';
}