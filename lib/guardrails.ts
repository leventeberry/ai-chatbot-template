export type GuardrailAction = "allow" | "soft_block" | "hard_block";

export type GuardrailDecision = {
  action: GuardrailAction;
  message: string;
  matchedPhrase?: string;
};

const hardBlockMessage = "I'm sorry, but I can't help with that request.";
const softBlockMessage =
  "I can't help with that directly, but I can share general info or help with something else.";

const hardBlockPhrases = [
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
];

const softBlockPhrases = [
  "medical advice",
  "diagnose",
  "prescribe",
  "legal advice",
  "lawsuit",
  "investment advice",
  "financial advice",
];

export function evaluateGuardrails(input: string): GuardrailDecision {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return { action: "allow", message: "" };
  }

  const hardMatch = findMatch(normalized, hardBlockPhrases);
  if (hardMatch) {
    return {
      action: "hard_block",
      message: hardBlockMessage,
      matchedPhrase: hardMatch,
    };
  }

  const softMatch = findMatch(normalized, softBlockPhrases);
  if (softMatch) {
    return {
      action: "soft_block",
      message: softBlockMessage,
      matchedPhrase: softMatch,
    };
  }

  return { action: "allow", message: "" };
}

function findMatch(value: string, phrases: string[]) {
  for (const phrase of phrases) {
    if (phrase && value.includes(phrase)) {
      return phrase;
    }
  }
  return undefined;
}
