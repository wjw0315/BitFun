/**
 * Session task status utilities
 * Provides functions to determine if a session is actively processing tasks.
 */

import { stateMachineManager } from '../state-machine';
import { SessionExecutionState } from '../state-machine/types';

/**
 * Task status for a session.
 * - 'running': The session is currently processing (model thinking, tool executing, etc.)
 * - 'completed': The session has an active turn that completed successfully
 * - 'idle': The session is not processing any task
 */
export type SessionTaskStatus = 'running' | 'completed' | 'idle';

/**
 * Get the task status for a session.
 *
 * This function checks the state machine to determine if the session is actively processing.
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

  switch (currentState) {
    case SessionExecutionState.PROCESSING:
      return 'running';

    case SessionExecutionState.ERROR:
      return 'idle';

    case SessionExecutionState.IDLE:
    default:
      return 'idle';
  }
}

/**
 * Check if a session is currently running (processing).
 * This is a convenience wrapper for getSessionTaskStatus.
 */
export function isSessionRunning(sessionId: string): boolean {
  return getSessionTaskStatus(sessionId) === 'running';
}