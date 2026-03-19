/**
 * SkillMatcher tool display component
 * Shows multiple skill candidates for user selection
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sparkles, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ToolCardProps } from '../types/flow-chat';
import { toolAPI } from '@/infrastructure/api/service-api/ToolAPI';
import { createLogger } from '@/shared/utils/logger';
import { Button } from '@/component-library';
import './SkillMatcherDisplay.scss';

const log = createLogger('SkillMatcherDisplay');

interface SkillCandidate {
  skill_name: string;
  description: string;
  confidence: number;
  match_type: string;
}

export const SkillMatcherDisplay: React.FC<ToolCardProps> = ({
  toolItem
}) => {
  const { t } = useTranslation('flow-chat');
  const { status, toolCall, toolResult } = toolItem;

  // Parse match results
  const matchData = useMemo(() => {
    if (!toolResult?.result) return null;
    const result = typeof toolResult.result === 'string'
      ? JSON.parse(toolResult.result)
      : toolResult.result;
    return result;
  }, [toolResult?.result]);

  const matches: SkillCandidate[] = useMemo(() => {
    return matchData?.matches || [];
  }, [matchData]);

  const input = matchData?.input || toolCall?.input?.input || '';
  const hasMultipleCandidates = matches.length > 1;
  const bestMatch = matchData?.best_match;
  const isNoMatch = !matchData?.matched;

  // Selection state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset selection when new results arrive
  useEffect(() => {
    setSelectedIndex(null);
    setIsSubmitted(false);
  }, [matchData]);

  // Keyboard shortcuts (1-5 for quick selection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === 'completed' || isSubmitted || isSubmitting) return;
      if (!hasMultipleCandidates) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= Math.min(5, matches.length)) {
        e.preventDefault();
        handleSelect(num - 1);
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      // Enter to confirm
      if (e.key === 'Enter' && selectedIndex !== null) {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, isSubmitted, isSubmitting, hasMultipleCandidates, selectedIndex, matches.length]);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selectedIndex === null || isSubmitting || isSubmitted) return;

    const selected = matches[selectedIndex];
    if (!selected) return;

    setIsSubmitting(true);
    try {
      // Call SkillMatcher with auto_execute
      await toolAPI.executeTool({
        toolName: 'SkillMatcher',
        input: {
          input: input,
          auto_execute: true,
          selected_skill: selected.skill_name
        },
        id: toolItem.id
      } as any);
      setIsSubmitted(true);
    } catch (error) {
      log.error('Failed to execute skill', { error, selectedSkill: selected.skill_name });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIndex, matches, input, isSubmitting, isSubmitted, toolItem.id]);

  const handleCancel = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;

    try {
      // Notify backend to continue with normal conversation
      await toolAPI.executeTool({
        toolName: 'SkillMatcher',
        input: {
          input: input,
          cancel: true
        },
        id: toolItem.id
      } as any);
      setIsSubmitted(true);
    } catch (error) {
      log.error('Failed to cancel skill matching', { error });
    }
  }, [input, isSubmitting, isSubmitted, toolItem.id]);

  // Render confidence score with color
  const renderConfidence = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let colorClass = 'confidence-low';
    if (percentage >= 80) colorClass = 'confidence-high';
    else if (percentage >= 50) colorClass = 'confidence-medium';

    return (
      <span className={`confidence-badge ${colorClass}`}>
        {percentage}%
      </span>
    );
  };

  // Render match type badge
  const renderMatchType = (matchType: string) => {
    const typeLabels: Record<string, string> = {
      'Keyword': t('toolCards.skillMatcher.matchTypeKeyword'),
      'Trigger': t('toolCards.skillMatcher.matchTypeTrigger'),
      'Description': t('toolCards.skillMatcher.matchTypeDescription')
    };
    return (
      <span className="match-type-badge">
        {typeLabels[matchType] || matchType}
      </span>
    );
  };

  // No match scenario
  if (isNoMatch) {
    return (
      <div className="skill-matcher-display no-match">
        <div className="match-header">
          <Sparkles size={16} className="icon-sparkles" />
          <span className="title">{t('toolCards.skillMatcher.title')}</span>
        </div>
        <div className="no-match-content">
          <p className="no-match-message">{t('toolCards.skillMatcher.noMatch')}</p>
          <p className="no-match-hint">{t('toolCards.skillMatcher.noMatchHint')}</p>
        </div>
      </div>
    );
  }

  // Completed state (after selection)
  if (status === 'completed' || isSubmitted) {
    return (
      <div className="skill-matcher-display completed">
        <div className="match-header">
          <Sparkles size={16} className="icon-sparkles" />
          <span className="title">{t('toolCards.skillMatcher.title')}</span>
          <span className="status-completed">{t('toolCards.skillMatcher.completed')}</span>
        </div>
        {selectedIndex !== null && (
          <div className="selected-result">
            <Check size={16} className="icon-check" />
            <span>{t('toolCards.skillMatcher.selected')}: </span>
            <span className="selected-skill-name">{matches[selectedIndex]?.skill_name}</span>
          </div>
        )}
      </div>
    );
  }

  // Loading state
  if (status === 'running' || status === 'streaming') {
    return (
      <div className="skill-matcher-display loading">
        <div className="match-header">
          <Sparkles size={16} className="icon-sparkles" />
          <span className="title">{t('toolCards.skillMatcher.title')}</span>
        </div>
        <div className="loading-content">
          <Loader2 size={20} className="animate-spin" />
          <span>{t('toolCards.skillMatcher.analyzing')}</span>
        </div>
      </div>
    );
  }

  // Multiple candidates - show selection UI
  if (hasMultipleCandidates) {
    return (
      <div className="skill-matcher-display multi-candidate">
        <div className="match-header">
          <Sparkles size={16} className="icon-sparkles" />
          <span className="title">{t('toolCards.skillMatcher.title')}</span>
          <span className="candidate-count">
            {t('toolCards.skillMatcher.candidates', { count: matches.length })}
          </span>
        </div>

        <div className="input-preview">
          <span className="input-label">{t('toolCards.skillMatcher.yourInput')}:</span>
          <span className="input-text">"{input}"</span>
        </div>

        <div className="candidates-list">
          {matches.slice(0, 5).map((candidate, index) => (
            <div
              key={candidate.skill_name}
              className={`candidate-item ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSelect(index)}
            >
              <div className="candidate-key">
                <span className="key-number">{index + 1}</span>
              </div>
              <div className="candidate-info">
                <div className="candidate-name">
                  {candidate.skill_name}
                  {candidate.skill_name === bestMatch && (
                    <span className="best-badge">{t('toolCards.skillMatcher.bestMatch')}</span>
                  )}
                </div>
                <div className="candidate-description">{candidate.description}</div>
                <div className="candidate-meta">
                  {renderMatchType(candidate.match_type)}
                  {renderConfidence(candidate.confidence)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <Button
            variant="secondary"
            size="small"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X size={14} />
            <span>{t('toolCards.skillMatcher.cancel')}</span>
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleConfirm}
            disabled={selectedIndex === null || isSubmitting}
            isLoading={isSubmitting}
          >
            <ArrowRight size={14} />
            <span>{t('toolCards.skillMatcher.execute')}</span>
          </Button>
        </div>

        <div className="keyboard-hints">
          <span className="hint">{t('toolCards.skillMatcher.keyboardHint')}</span>
        </div>
      </div>
    );
  }

  // Single candidate - show quick confirm
  return (
    <div className="skill-matcher-display single-candidate">
      <div className="match-header">
        <Sparkles size={16} className="icon-sparkles" />
        <span className="title">{t('toolCards.skillMatcher.title')}</span>
      </div>

      <div className="single-candidate-content">
        <div className="candidate-item selected">
          <div className="candidate-info">
            <div className="candidate-name">
              {matches[0]?.skill_name}
            </div>
            <div className="candidate-description">{matches[0]?.description}</div>
            <div className="candidate-meta">
              {renderMatchType(matches[0]?.match_type)}
              {renderConfidence(matches[0]?.confidence)}
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <Button
          variant="secondary"
          size="small"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <X size={14} />
          <span>{t('toolCards.skillMatcher.continueConversation')}</span>
        </Button>
        <Button
          variant="primary"
          size="small"
          onClick={handleConfirm}
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          <Sparkles size={14} />
          <span>{t('toolCards.skillMatcher.execute')}</span>
        </Button>
      </div>
    </div>
  );
};
