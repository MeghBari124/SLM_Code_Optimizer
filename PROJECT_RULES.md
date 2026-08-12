# AlgoForge Project Rules

## Core Principles

### 1. Security First
- **NEVER** commit private keys, API keys, or secrets
- **NEVER** hard-code sensitive configuration
- **ALWAYS** use environment variables for secrets
- **ALWAYS** validate and sanitize user inputs
- **NEVER** execute untrusted code without sandboxing
- **ALWAYS** treat repository uploads as untrusted

### 2. x402 Integration
- **DO NOT** reinvent the x402 protocol
- **USE** the provided x402 packages and facilitator
- **PRESERVE** the 402 → Sign → Retry → Settle flow
- **NEVER** expose payment secrets to frontend
- **ALWAYS** verify payments server-side
- **DOCUMENT** any deviation from reference implementation

### 3. AI/SLM Usage
- **DO NOT** send raw code directly to LLM without structure
- **ALWAYS** provide deterministic analysis first
- **VALIDATE** AI recommendations when possible
- **DISTINGUISH** between verified and unverified claims
- **NEVER** fabricate metrics or savings numbers
- **USE** small language models (1-8B parameters) as specified

### 4. Code Organization
- **SEPARATE** frontend and backend clearly
- **ISOLATE** x402 logic in dedicated module
- **ISOLATE** analysis engine from payment logic
- **AVOID** business logic in route handlers
- **USE** services for reusable logic
- **KEEP** files focused and modular (< 300 lines)


### 5. TypeScript Standards
- **USE** strict mode
- **AVOID** `any` type - use `unknown` if necessary
- **DEFINE** interfaces for all data structures
- **USE** Zod or similar for runtime validation
- **EXPORT** types from dedicated files
- **DOCUMENT** complex types with JSDoc

### 6. API Design
- **USE** versioned routes (`/api/v1/...`)
- **RETURN** consistent response structure
- **HANDLE** errors gracefully with proper status codes
- **VALIDATE** request payloads
- **DOCUMENT** all endpoints
- **RATE LIMIT** public endpoints

### 7. Testing Strategy
- **TEST** x402 flow before implementing analysis
- **WRITE** unit tests for core logic
- **WRITE** integration tests for APIs
- **TEST** payment verification separately
- **USE** fixtures for test data
- **MOCK** external services in tests

### 8. Git Workflow
- **WRITE** clear commit messages
- **CREATE** feature branches
- **REVIEW** code before merging
- **DO NOT** commit node_modules/
- **DO NOT** commit .env files
- **DO NOT** commit build artifacts

### 9. Dependencies
- **MINIMIZE** external dependencies
- **AUDIT** security vulnerabilities regularly
- **PIN** versions in package.json
- **DOCUMENT** why each dependency is needed
- **AVOID** duplicate functionality

### 10. Documentation
- **UPDATE** ARCHITECTURE.md for structural changes
- **UPDATE** API docs when endpoints change
- **COMMENT** complex algorithms
- **EXPLAIN** non-obvious decisions
- **MAINTAIN** up-to-date README


## Development Phases

**DO NOT skip phases. Each phase must be functional before moving to the next.**

### Phase 1: Project Scaffolding ✓
- Directory structure
- Configuration files
- Documentation
- Basic entry points

### Phase 2: x402 Integration
- Implement x402 middleware
- Create test endpoint
- Verify 402 → payment → success flow
- Test with Algorand wallet

### Phase 3: Repository Ingestion
- File upload handling
- ZIP extraction
- TEAL/PyTeal file detection
- Basic parsing

### Phase 4: Static Analysis
- Opcode cost table
- Pattern detection
- Deterministic findings
- Metrics calculation

### Phase 5: SLM Integration
- AI client setup
- Prompt engineering
- Structured reasoning
- Response parsing

### Phase 6: Optimization + Verification
- Recommendation generation
- Verification logic
- Before/after comparison
- Confidence scoring

### Phase 7: Report Generation
- JSON report structure
- Hash calculation
- Transaction proof
- Export formats

### Phase 8: Frontend Dashboard
- Wallet connection
- Upload UI
- Payment flow
- Results visualization

### Phase 9: Repository Intelligence
- Dependency graph
- Function relationships
- Cross-file analysis
- Architecture understanding

### Phase 10: Advanced Features
- CI/CD integration
- Agent API
- Advanced analytics
- Performance optimization

## File Naming Conventions

- **Components**: PascalCase (e.g., `AnalysisResults.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Services**: camelCase with `.service` (e.g., `analysis.service.ts`)
- **Routes**: camelCase with `.routes` (e.g., `analysis.routes.ts`)
- **Types**: PascalCase (e.g., `AnalysisTypes.ts`)
- **Constants**: SCREAMING_SNAKE_CASE in files named `constants.ts`

## Error Handling

- **USE** custom error classes
- **LOG** errors with context
- **RETURN** appropriate HTTP status codes
- **SANITIZE** error messages for clients
- **NEVER** expose stack traces in production

## Performance

- **AVOID** blocking operations
- **USE** streaming for large files
- **IMPLEMENT** timeouts
- **CACHE** expensive computations
- **MONITOR** memory usage

## Accessibility

- **USE** semantic HTML
- **PROVIDE** ARIA labels
- **ENSURE** keyboard navigation
- **TEST** with screen readers
- **MAINTAIN** color contrast ratios
