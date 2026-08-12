# AI/SLM Integration Layer

Integrates Small Language Models for code explanation and recommendation generation.

## Design Principle

**AI does NOT invent findings. Static analysis provides evidence; AI explains it.**

## Modules

### client/
- Groq API client
- Together AI client
- Ollama client (fallback)
- Model selection logic

### prompts/
- System prompts
- Template construction
- Context formatting

### schemas/
- Response schemas
- Validation logic
- Type definitions

### reasoning/
- Finding explanation
- Recommendation generation
- Priority scoring

### verifier/
- Recommendation validation
- Metric verification
- Confidence scoring

## Status

⏳ Phase 5 implementation
