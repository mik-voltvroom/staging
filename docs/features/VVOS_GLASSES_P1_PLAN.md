# VVOS Glasses P1 implementation plan

## Goal
Extend P0 with centralized AI orchestration, structured natural-language understanding, human-confirmed vision suggestions, inspection summaries and transparent purchase intelligence.

## Sequence
1. Introduce `VVOSAIService` and provider-neutral contracts. No component may call an AI provider directly.
2. Add deterministic fallback implementations for NLU/summary so critical inspection data remains available when AI is unavailable.
3. Add image-analysis suggestion model. Vision results remain `suggested` until explicitly confirmed by a user.
4. Add inspection summary service and endpoint.
5. Add Purchase Intelligence domain model, assumptions and endpoint. Every amount must expose its underlying assumptions.
6. Extend review UI with AI suggestions and purchase advice.
7. Add tests for AI failure, low-confidence vision, human confirmation and purchase-advice math.

## Non-goals for this step
- Native Meta SDK integration
- OCR production provider
- real-time HUD
- automatic background recording
- production AI provider credentials

## Safety principles
- No AI result becomes a final vehicle finding without human confirmation.
- Purchase advice is decision support, not an autonomous purchase action.
- Financial assumptions remain visible and editable.
- Provider failures must degrade gracefully to deterministic VVOS behavior.
