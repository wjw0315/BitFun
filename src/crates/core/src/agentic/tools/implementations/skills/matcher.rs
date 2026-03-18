//! Intent Matcher Module
//!
//! Provides keyword and trigger pattern matching for skill intent recognition

use super::types::SkillInfo;
use serde::{Deserialize, Serialize};

/// Match result for intent matching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchResult {
    /// Matched skill
    pub skill: SkillInfo,
    /// Confidence score (0.0 - 1.0)
    pub confidence: f32,
    /// Match type
    pub match_type: MatchType,
}

/// Type of match
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MatchType {
    /// Exact keyword match
    Keyword,
    /// Trigger pattern match
    Trigger,
    /// Description similarity
    Description,
}

/// Intent matcher configuration
#[derive(Debug, Clone)]
pub struct MatcherConfig {
    /// Minimum confidence threshold (0.0 - 1.0)
    pub threshold: f32,
    /// Maximum results to return
    pub max_results: usize,
}

impl Default for MatcherConfig {
    fn default() -> Self {
        Self {
            threshold: 0.3,
            max_results: 5,
        }
    }
}

/// Intent matcher for skills
pub struct IntentMatcher {
    config: MatcherConfig,
}

impl IntentMatcher {
    pub fn new(config: MatcherConfig) -> Self {
        Self { config }
    }

    pub fn with_default() -> Self {
        Self::new(MatcherConfig::default())
    }

    /// Match user input against available skills
    pub fn match_input(&self, input: &str, skills: &[SkillInfo]) -> Vec<MatchResult> {
        let input_lower = input.to_lowercase();
        let input_words: Vec<&str> = input_lower.split_whitespace().collect();

        let mut results: Vec<MatchResult> = skills
            .iter()
            .filter_map(|skill| self.calculate_match(&input_words, skill))
            .filter(|r| r.confidence >= self.config.threshold)
            .collect();

        // Sort by confidence descending
        results.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());

        // Limit results
        results.truncate(self.config.max_results);
        results
    }

    /// Calculate match score for a skill
    fn calculate_match(&self, input_words: &[&str], skill: &SkillInfo) -> Option<MatchResult> {
        let mut best_confidence = 0.0f32;
        let mut best_match_type = MatchType::Description;

        // 1. Check keyword matches (highest priority)
        for keyword in &skill.keywords {
            let kw_lower = keyword.to_lowercase();
            if input_words.iter().any(|&w| kw_lower.contains(w) || w.contains(&kw_lower)) {
                best_confidence = best_confidence.max(0.8);
                best_match_type = MatchType::Keyword;
            }
        }

        // 2. Check trigger pattern matches
        for pattern in &skill.trigger_patterns {
            let pat_lower = pattern.to_lowercase();
            if input_words.iter().any(|&w| pat_lower.contains(w) || w.contains(&pat_lower)) {
                best_confidence = best_confidence.max(0.9);
                best_match_type = MatchType::Trigger;
            }
        }

        // 3. Check description similarity (lower priority)
        if best_confidence == 0.0 {
            let desc_words: Vec<&str> = skill.description.to_lowercase().split_whitespace().collect();
            let overlap = input_words
                .iter()
                .filter(|w| desc_words.contains(w))
                .count();
            if !overlap.is_empty() {
                let similarity = overlap as f32 / input_words.len().max(1) as f32;
                best_confidence = similarity * 0.5; // Lower weight for description
                best_match_type = MatchType::Description;
            }
        }

        if best_confidence > 0.0 {
            Some(MatchResult {
                skill: skill.clone(),
                confidence: best_confidence,
                match_type: best_match_type,
            })
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_skill(name: &str, keywords: Vec<&str>, triggers: Vec<&str>) -> SkillInfo {
        SkillInfo {
            name: name.to_string(),
            description: format!("{} skill", name),
            path: format!("/skills/{}", name),
            level: super::SkillLocation::User,
            enabled: true,
            keywords: keywords.into_iter().map(|s| s.to_string()).collect(),
            trigger_patterns: triggers.into_iter().map(|s| s.to_string()).collect(),
        }
    }

    #[test]
    fn test_keyword_match() {
        let matcher = IntentMatcher::with_default();
        let skills = vec![create_test_skill("python-patterns", vec!["python", "排序"], vec!)];

        let results = matcher.match_input("python 排序", &skills);
        assert!(!results.is_empty());
        assert_eq!(results[0].skill.name, "python-patterns");
    }

    #[test]
    fn test_trigger_match() {
        let matcher = IntentMatcher::with_default();
        let skills = vec![create_test_skill("pdf", vec![], vec!["pdf", "文档"])];

        let results = matcher.match_input("创建一个pdf文档", &skills);
        assert!(!results.is_empty());
        assert_eq!(results[0].match_type, MatchType::Trigger);
    }

    #[test]
    fn test_no_match() {
        let matcher = IntentMatcher::with_default();
        let skills = vec![create_test_skill("python-patterns", vec!["python"], vec!)];

        let results = matcher.match_input("完全不相关的输入", &skills);
        assert!(results.is_empty());
    }
}
