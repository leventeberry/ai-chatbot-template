package services

import (
	"encoding/json"
	"errors"
	"strings"

	"chatbot_api/logger"
)

type GuardrailAction string

const (
	GuardrailAllow     GuardrailAction = "allow"
	GuardrailSoftBlock GuardrailAction = "soft_block"
	GuardrailHardBlock GuardrailAction = "hard_block"
)

type GuardrailDecision struct {
	Action        GuardrailAction
	Reason        string
	SafeResponse  string
	MatchedPhrase string
}

const hardBlockResponse = "I'm sorry, but I can't help with that request."
const softBlockResponse = "I can't help with that directly, but I can share general info or help with something else."

var hardBlockPhrases = []string{
	"suicide",
	"self-harm",
	"self harm",
	"kill myself",
	"harm myself",
	"child sexual",
	"rape",
	"porn",
	"terrorist",
	"bomb",
	"build a bomb",
	"make a bomb",
	"how to hack",
	"steal",
	"credit card fraud",
	"ssn",
	"genocide",
	"racial supremacy",
}

var softBlockPhrases = []string{
	"medical advice",
	"diagnose",
	"prescribe",
	"legal advice",
	"lawsuit",
	"investment advice",
	"financial advice",
}

func EvaluateChatGuardrails(input string) GuardrailDecision {
	normalized := strings.ToLower(strings.TrimSpace(input))
	if normalized == "" {
		return GuardrailDecision{Action: GuardrailAllow}
	}

	if matched := containsPhrase(normalized, hardBlockPhrases); matched != "" {
		return GuardrailDecision{
			Action:        GuardrailHardBlock,
			Reason:        "disallowed_content",
			SafeResponse:  hardBlockResponse,
			MatchedPhrase: matched,
		}
	}

	if matched := containsPhrase(normalized, softBlockPhrases); matched != "" {
		return GuardrailDecision{
			Action:        GuardrailSoftBlock,
			Reason:        "regulated_content",
			SafeResponse:  softBlockResponse,
			MatchedPhrase: matched,
		}
	}

	return GuardrailDecision{Action: GuardrailAllow}
}

func LogGuardrailDecision(decision GuardrailDecision, context string) {
	if decision.Action == GuardrailAllow {
		return
	}
	logger.Log.Warn().
		Str("guardrail_action", string(decision.Action)).
		Str("guardrail_reason", decision.Reason).
		Str("guardrail_match", decision.MatchedPhrase).
		Str("guardrail_context", context).
		Msg("Guardrail triggered")
}

func ValidateWidgetConfigGuardrails(raw string) error {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	var config widgetPromptConfig
	if err := json.Unmarshal([]byte(raw), &config); err != nil {
		return errors.New("invalid widget config")
	}

	if decision := EvaluateChatGuardrails(config.SystemPrompt); decision.Action != GuardrailAllow {
		LogGuardrailDecision(decision, "widget_system_prompt")
		return errors.New("system prompt contains disallowed content")
	}
	if decision := EvaluateChatGuardrails(config.Documentation); decision.Action != GuardrailAllow {
		LogGuardrailDecision(decision, "widget_documentation")
		return errors.New("documentation contains disallowed content")
	}
	return nil
}

func containsPhrase(value string, phrases []string) string {
	for _, phrase := range phrases {
		if phrase == "" {
			continue
		}
		if strings.Contains(value, phrase) {
			return phrase
		}
	}
	return ""
}
