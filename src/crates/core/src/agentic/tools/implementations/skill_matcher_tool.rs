//! Skill Matcher Tool
//!
//! Provides intent recognition and skill execution in one tool

use crate::agentic::tools::framework::{
    Tool, ToolRenderOptions, ToolResult, ToolUseContext, ValidationResult,
};
use crate::util::errors::{BitFunError, BitFunResult};
use async_trait::async_trait;
use log::debug;
use serde_json::{json, Value};

use super::skills::{get_skill_registry, IntentMatcher, MatchResult};

/// Skill Matcher Tool - combines intent matching with skill execution
pub struct SkillMatcherTool;

impl SkillMatcherTool {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Tool for SkillMatcherTool {
    fn name(&self) -> &str {
        "SkillMatcher"
    }

    async fn description(&self) -> BitFunResult<String> {
        Ok(
            r#"Match user input to skills and optionally execute the matched skill

This tool analyzes user input to determine if they want to use a specific skill.
It matches against skill keywords, trigger patterns, and descriptions.

Input format:
- input: The user's message to analyze
- auto_execute: Whether to automatically execute matched skill (default: false)

Returns match results with confidence scores."#.to_string(),
        )
    }

    async fn description_with_context(
        &self,
        _context: Option<&ToolUseContext>,
    ) -> BitFunResult<String> {
        self.description().await
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "input": {
                    "type": "string",
                    "description": "User input to match against skills"
                },
                "auto_execute": {
                    "type": "boolean",
                    "description": "Automatically execute matched skill (default: false)",
                    "default": false
                },
                "selected_skill": {
                    "type": "string",
                    "description": "Skill name to execute (when user selects from candidates)"
                },
                "cancel": {
                    "type": "boolean",
                    "description": "Cancel skill matching and continue with normal conversation",
                    "default": false
                }
            },
            "required": ["input"],
            "additionalProperties": false
        })
    }

    fn is_readonly(&self) -> bool {
        false
    }

    fn is_concurrency_safe(&self, _input: Option<&Value>) -> bool {
        true
    }

    fn needs_permissions(&self, _input: Option<&Value>) -> bool {
        false
    }

    async fn validate_input(
        &self,
        input: &Value,
        _context: Option<&ToolUseContext>,
    ) -> ValidationResult {
        if input
            .get("input")
            .and_then(|v| v.as_str())
            .map_or(true, |s| s.is_empty())
        {
            return ValidationResult {
                result: false,
                message: Some("input is required and cannot be empty".to_string()),
                error_code: Some(400),
                meta: None,
            };
        }

        ValidationResult {
            result: true,
            message: None,
            error_code: None,
            meta: None,
        }
    }

    fn render_tool_use_message(&self, input: &Value, _options: &ToolRenderOptions) -> String {
        if let Some(input_text) = input.get("input").and_then(|v| v.as_str()) {
            format!("Analyzing skill intent for: \"{}\"", input_text)
        } else {
            "Analyzing skill intent...".to_string()
        }
    }

    async fn call_impl(
        &self,
        input: &Value,
        context: &ToolUseContext,
    ) -> BitFunResult<Vec<ToolResult>> {
        let user_input = input
            .get("input")
            .and_then(|v| v.as_str())
            .ok_or_else(|| BitFunError::tool("input is required".to_string()))?;

        let auto_execute = input
            .get("auto_execute")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        // Handle user selected skill from UI
        let selected_skill = input
            .get("selected_skill")
            .and_then(|v| v.as_str());

        // Handle cancel request
        let cancel = input
            .get("cancel")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        // If cancel is true, return cancel response
        if cancel {
            return Ok(vec![ToolResult::Result {
                data: json!({
                    "cancelled": true,
                    "message": "Skill matching cancelled"
                }),
                result_for_assistant: Some("Skill matching cancelled. Continuing with normal conversation...".to_string()),
            }]);
        }

        // If user selected a skill, execute it directly
        if let Some(skill_name) = selected_skill {
            debug!("Executing user-selected skill: {}", skill_name);
            let registry = get_skill_registry();
            let skill_data = registry
                .find_and_load_skill_for_workspace(skill_name, context.workspace_root())
                .await?;

            return Ok(vec![ToolResult::Result {
                data: json!({
                    "matched": true,
                    "skill_name": skill_name,
                    "confidence": 1.0,
                    "match_type": "UserSelected",
                    "auto_executed": true,
                    "skill_content": skill_data.content
                }),
                result_for_assistant: Some(format!(
                    "Executing skill '{}' as selected by user.\n\n{}",
                    skill_name,
                    skill_data.content
                )),
            }]);
        }

        debug!("SkillMatcher matching input: {}", user_input);

        // Get all enabled skills
        let registry = get_skill_registry();
        let skills = registry
            .get_enabled_skills_for_workspace(context.workspace_root())
            .await;

        // Match input against skills
        let matcher = IntentMatcher::with_default();
        let matches = matcher.match_input(user_input, &skills);

        if matches.is_empty() {
            return Ok(vec![ToolResult::Result {
                data: json!({
                    "matched": false,
                    "message": "No matching skill found",
                    "input": user_input
                }),
                result_for_assistant: Some(
                    "No matching skill found for your input. You can continue with normal conversation or explicitly use /skill command.".to_string(),
                ),
            }]);
        }

        // Get best match
        let best_match = &matches[0];
        let skill_name = best_match.skill.name.clone();

        if auto_execute {
            // Execute the matched skill
            debug!("Auto-executing skill: {}", skill_name);
            let skill_data = registry
                .find_and_load_skill_for_workspace(&skill_name, context.workspace_root())
                .await?;

            return Ok(vec![ToolResult::Result {
                data: json!({
                    "matched": true,
                    "skill_name": skill_name,
                    "confidence": best_match.confidence,
                    "match_type": format!("{:?}", best_match.match_type),
                    "auto_executed": true,
                    "skill_content": skill_data.content
                }),
                result_for_assistant: Some(format!(
                    "Matched skill '{}' (confidence: {:.0}%) and auto-executed.\n\n{}",
                    skill_name,
                    best_match.confidence * 100.0,
                    skill_data.content
                )),
            }]);
        }

        // Return match results without executing
        let match_summary: Vec<Value> = matches
            .iter()
            .map(|m| {
                json!({
                    "skill_name": m.skill.name,
                    "description": m.skill.description,
                    "confidence": m.confidence,
                    "match_type": format!("{:?}", m.match_type)
                })
            })
            .collect();

        Ok(vec![ToolResult::Result {
            data: json!({
                "matched": true,
                "matches": match_summary,
                "best_match": skill_name,
                "confidence": best_match.confidence,
                "input": user_input
            }),
            result_for_assistant: Some(format!(
                "Found {} matching skill(s). Best match: '{}' (confidence: {:.0}%)\n\nUse auto_execute: true to execute, or continue conversation.",
                matches.len(),
                skill_name,
                best_match.confidence * 100.0
            )),
        }])
    }
}

impl Default for SkillMatcherTool {
    fn default() -> Self {
        Self::new()
    }
}
