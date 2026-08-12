# AlgoForge Architecture

## System Overview

AlgoForge is a modular monolith with clear domain boundaries, designed for Algorand x402 hackathon compliance while maintaining production-quality standards.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐       │
│  │ Web UI     │  │ AI Agent   │  │ CI/CD        │       │
│  │ (React)    │  │ (API)      │  │ (Pipeline)   │       │
│  └──────┬─────┘  └──────┬─────┘  └──────┬───────┘       │
└─────────┼────────────────┼────────────────┼──────────────┘
          │                │                │
          └────────────────┴────────────────┘
                          │
                   HTTPS + x402
                          │
┌─────────────────────────▼───────────────────────────────┐
│              Application Layer (Backend)                │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │          x402 Payment Middleware               │    │
│  │  (402 Challenge → Verify → Settle)             │    │
│  └────────────────────┬───────────────────────────┘    │
│                       │                                 │
│  ┌────────────────────▼───────────────────────────┐    │
│  │            API Routes Layer                    │    │
│  │  /health  /analyze  /optimize  /security       │    │
│  └────┬───────────┬────────────┬──────────────────┘    │
│       │           │            │                        │
│  ┌────▼───────────▼────────────▼──────────────────┐    │
│  │          Service Orchestration                 │    │
│  └────┬────────┬─────────┬──────────┬────────────┘    │
│       │        │         │          │                   │
│  ┌────▼──┐ ┌──▼────┐ ┌──▼─────┐ ┌──▼─────────┐        │
│  │Repo   │ │Static │ │  AI    │ │  Report    │        │
│  │Engine │ │Analyzer│ │Service │ │ Generator  │        │
│  └───────┘ └────────┘ └────────┘ └────────────┘        │
│                                                          │
└──────────────────┬───────────────────┬──────────────────┘
                   │                   │
          ┌────────▼────────┐ ┌────────▼────────┐
          │   PostgreSQL    │ │    Algorand     │
          │  (Persistence)  │ │   (Payments)    │
          └─────────────────┘ └─────────────────┘
```


## Core Components

### 1. Frontend (React + Vite)

**Purpose**: User interface for developers and visualization layer

**Responsibilities**:
- Wallet connection (Pera/Defly/Lute via Algorand Wallet SDK)
- Repository/file upload
- x402 payment UI flow
- Analysis progress tracking
- Results visualization
- Report download

**Key Technologies**:
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Monaco Editor for code display
- @algorandfoundation/algokit-utils for wallet integration

**Structure**:
```
frontend/src/
├── app/              # App configuration, routes, providers
├── components/       # Reusable UI components
├── pages/            # Page-level components
├── features/         # Feature-specific logic
├── hooks/            # Custom React hooks
├── services/         # API clients
├── store/            # State management
└── types/            # TypeScript definitions
```

### 2. Backend (Node.js + Hono)

**Purpose**: Core application logic and API server

**Responsibilities**:
- HTTP API endpoints
- x402 payment verification
- Repository ingestion and parsing
- Static code analysis
- AI/SLM orchestration
- Report generation
- Blockchain proof handling
- Data persistence

**Key Technologies**:
- Node.js 18+
- Hono (lightweight web framework)
- TypeScript
- PostgreSQL with pg driver
- x402 packages (@x402/core, @x402/avm, @x402/hono)

**Structure**:
```
backend/src/
├── server/           # HTTP server setup
├── routes/           # API route definitions
├── x402/             # Payment middleware
├── repository/       # Code ingestion & parsing
├── analysis/         # Static analysis engine
├── ai/               # SLM integration
├── reports/          # Report generation
├── blockchain/       # Algorand integration
├── database/         # Data layer
├── common/           # Shared utilities
└── types/            # TypeScript definitions
```


### 3. x402 Payment Layer

**Purpose**: Micropayment infrastructure using Algorand x402 protocol

**Flow**:
```
1. Client requests protected resource
   ↓
2. x402 middleware intercepts request
   ↓
3. No payment? Return 402 with payment challenge
   ↓
4. Client wallet signs payment transaction
   ↓
5. Client retries request with payment signature
   ↓
6. Backend verifies signature with GoPlausible facilitator
   ↓
7. Facilitator settles on Algorand
   ↓
8. Backend serves protected resource
   ↓
9. Response includes transaction proof
```

**Configuration**:
- Facilitator URL: `https://facilitator.goplausible.xyz`
- Network: Algorand TestNet (CAIP-2: `algorand:testnet-v1.0`)
- Asset: USDC TestNet ASA
- Default price: $0.02 per analysis

**Key Files**:
- `backend/src/x402/middleware.ts` - x402 HTTP middleware
- `backend/src/x402/facilitator.ts` - Facilitator client
- `backend/src/x402/resources.ts` - Protected resource config
- `backend/src/x402/payments.ts` - Payment verification

### 4. Repository Intelligence Engine

**Purpose**: Extract structure and context from smart-contract repositories

**Pipeline**:
```
ZIP/Files Upload
    ↓
Extract & Validate
    ↓
Detect TEAL/PyTeal files
    ↓
Parse to AST
    ↓
Build dependency graph
    ↓
Identify contracts, functions, storage
    ↓
Create structured representation
```

**Capabilities**:
- File system traversal
- TEAL/PyTeal detection
- AST parsing
- Import/dependency resolution
- Function extraction
- Storage operation detection
- Contract relationship mapping


### 5. Static Analysis Engine

**Purpose**: Deterministic code analysis (source of truth for findings)

**Analysis Types**:

**a) Opcode Cost Analysis**
- Build opcode cost table from Algorand documentation
- Identify expensive operations in hot paths
- Calculate execution cost estimates
- Flag cost-heavy loops

**b) Optimization Pattern Detection**
- Redundant operations (repeated `app_global_get` in loops)
- Unnecessary type conversions (`itob`/`btoi` churn)
- Scratch slot inefficiency
- Dead code detection
- Loop-invariant operations

**c) Security Checks**
- Missing `GroupSize` validation
- Missing `RekeyTo` checks
- Unchecked delete/update paths
- Dangerous opcode usage

**d) Cost Efficiency**
- Box vs global state usage
- Inner transaction fees
- TEAL version targeting
- OpCode budget management

**Output**: Structured findings with:
- Rule ID
- Severity (CRITICAL, HIGH, MEDIUM, LOW, INFO)
- Location (file, line)
- Description
- Estimated impact
- Suggested fix

### 6. AI/SLM Layer

**Purpose**: Explain findings, prioritize, and generate human-readable recommendations

**Critical Design Principle**: 
AI does NOT invent findings. Static analysis provides evidence; AI explains it.

**Workflow**:
```
Static Findings (JSON)
    ↓
Prompt Construction
    ↓
SLM Inference (Groq/Together/Ollama)
    ↓
Structured Response (JSON)
    ↓
Parse & Validate
    ↓
Human-readable Report
```

**Model Selection**:
- Primary: Llama 3.1 8B (Groq) - fast inference
- Fallback: Qwen2.5-Coder 3B (Ollama) - local, offline-capable
- Temperature: 0.2 (deterministic)
- Max tokens: 4096

**Prompt Structure**:
1. System: Role definition (smart-contract optimization expert)
2. Context: Code structure + static findings
3. Task: Explain, prioritize, suggest improvements
4. Constraints: No hallucination, evidence-based only


### 7. Verification Engine

**Purpose**: Validate AI recommendations with measurable evidence

**Verification Levels**:
- `VERIFIED` - Measured improvement confirmed
- `PARTIALLY_VERIFIED` - Some metrics improved, others unmeasured
- `UNVERIFIED` - Cannot measure, estimated only
- `FAILED` - Recommendation did not improve metrics

**Verification Methods**:
1. **Opcode Count**: Compare before/after instruction count
2. **Cost Estimate**: Calculate execution cost delta
3. **Syntax Check**: Verify optimized code compiles
4. **PyTeal Optimization**: Use PyTeal's OptimizeOptions for baseline

**Example**:
```typescript
{
  findingId: "F001",
  recommendation: "Remove redundant app_global_get in loop",
  verificationStatus: "VERIFIED",
  beforeMetrics: { opcodeCount: 42, estimatedCost: 150 },
  afterMetrics: { opcodeCount: 38, estimatedCost: 135 },
  improvement: { opcodes: -4, cost: -15, percentage: 10 }
}
```

### 8. Report Generator

**Purpose**: Create machine-readable and human-friendly analysis reports

**Report Structure**:
```typescript
{
  analysisId: string,
  timestamp: string,
  repository: {
    name: string,
    fileCount: number,
    tealFiles: string[],
    pytealFiles: string[]
  },
  summary: {
    overallScore: number,      // 0-100
    securityScore: number,
    optimizationScore: number,
    costScore: number
  },
  findings: Finding[],
  recommendations: Recommendation[],
  verifiedImprovements: VerifiedImprovement[],
  estimatedImprovements: EstimatedImprovement[],
  payment: {
    amount: string,
    asset: string,
    transactionId: string
  },
  proof: {
    reportHash: string,
    algorithm: "sha256",
    timestamp: string
  }
}
```

**Export Formats**:
- JSON (primary, for API consumers)
- Markdown (for documentation)
- PDF (for human review)


### 9. Blockchain Proof Layer

**Purpose**: Anchor analysis reports to Algorand for verifiable proof

**Implementation**:
- Calculate SHA-256 hash of final report JSON
- Store hash in transaction note field or box storage
- Link to payment transaction
- Return proof in API response

**Proof Object**:
```typescript
{
  reportHash: "abc123...",
  algorithm: "sha256",
  transactionId: "XYZ789...",
  network: "algorand:testnet-v1.0",
  timestamp: "2026-08-12T...",
  verificationUrl: "https://testnet.algoexplorer.io/tx/XYZ789"
}
```

### 10. Database Layer

**Purpose**: Persist analysis history, reports, and metadata

**Schema Overview**:

```sql
-- Users (future)
users (id, wallet_address, created_at)

-- Projects
projects (id, user_id, name, created_at)

-- Repositories
repositories (id, project_id, name, file_count, uploaded_at)

-- Analyses
analyses (
  id, repository_id, status, started_at, completed_at,
  overall_score, security_score, optimization_score, cost_score
)

-- Findings
findings (
  id, analysis_id, rule_id, severity, file, line,
  description, estimated_impact
)

-- Recommendations
recommendations (
  id, finding_id, description, suggested_code,
  verification_status, improvement_metrics
)

-- Reports
reports (
  id, analysis_id, report_json, report_hash,
  created_at
)

-- Payments
payments (
  id, analysis_id, amount, asset, transaction_id,
  status, created_at
)
```

**Notes**:
- Start with minimal schema
- Add tables as features are implemented
- Use migrations for schema changes


## Data Flow

### Complete Analysis Flow

```
1. CLIENT UPLOAD
   User uploads TEAL/PyTeal files or ZIP
   ↓
2. API REQUEST
   POST /api/v1/analyze
   Content-Type: multipart/form-data
   ↓
3. x402 MIDDLEWARE
   No payment? → Return 402 with payment challenge
   Has payment? → Verify with facilitator
   ↓
4. PAYMENT VERIFICATION
   Facilitator validates signature
   Settlement on Algorand
   ↓
5. REPOSITORY INGESTION
   Extract files
   Detect TEAL/PyTeal
   Parse to AST
   ↓
6. STATIC ANALYSIS
   Run opcode cost analysis
   Run pattern detection
   Run security checks
   Generate structured findings
   ↓
7. SLM REASONING
   Send findings + code to AI
   Get explanations and priorities
   Generate recommendations
   ↓
8. VERIFICATION
   Validate recommendations
   Calculate metrics
   Assign verification status
   ↓
9. REPORT GENERATION
   Build JSON report
   Calculate scores
   Hash report (SHA-256)
   ↓
10. BLOCKCHAIN PROOF
    Store hash on Algorand
    Link to payment transaction
    ↓
11. PERSIST
    Save to database
    ↓
12. RESPONSE
    Return JSON report
    Include transaction proof
    Include payment details
```


## API Endpoints

### Phase 2 (MVP)

**Health Check**
```
GET /api/v1/health
Response: { status: "ok", version: "1.0.0" }
```

**Analyze (x402 Protected)**
```
POST /api/v1/analyze
Content-Type: multipart/form-data
Payment: Required ($0.02 USDC)

Request:
- files: File[] (TEAL/PyTeal)
- options: { language: "teal" | "pyteal" }

Response:
{
  success: true,
  data: {
    analysisId: string,
    findings: Finding[],
    recommendations: Recommendation[],
    scores: Scores,
    payment: PaymentInfo,
    proof: ProofInfo
  }
}
```

### Phase 3+ (Extended)

```
POST /api/v1/repository/analyze
POST /api/v1/optimize
POST /api/v1/security/scan
POST /api/v1/cost/analyze
POST /api/v1/reports/:id
GET /api/v1/analyses/:id
GET /api/v1/analyses (history)
```

## Security Considerations

### Input Validation
- Validate file types (only TEAL/PyTeal)
- Enforce max file size (50MB default)
- Enforce max file count (100 files per analysis)
- Sanitize file paths (prevent traversal)
- Validate ZIP structure

### Sandboxing
- Do NOT execute uploaded code on host
- Parse only, never eval()
- Use separate process for analysis if needed
- Timeout long-running analysis (2min default)

### Secret Management
- Use environment variables
- Never log secrets
- Rotate API keys regularly
- Use separate keys per environment

### Rate Limiting
- 100 requests per 15 minutes per IP
- Higher limits for authenticated users (future)

### CORS
- Restrict origins in production
- Allow credentials: false
- Whitelist specific methods

## Performance Considerations

### Caching Strategy
- Cache opcode cost tables (rarely change)
- Cache parsed ASTs for repeated files
- Cache AI responses for identical code (optional)

### Async Processing
- Analysis runs async for large repositories
- Use job queue for Phase 3+ (optional)
- WebSocket for progress updates (future)

### Resource Limits
- Max analysis time: 2 minutes
- Max upload size: 50MB
- Max memory per analysis: 512MB
- Graceful degradation on timeout

## Deployment Architecture

### Development
```
Local Machine
├── Frontend (Vite dev server) :5173
├── Backend (Node.js) :3001
└── PostgreSQL :5432
```

### Production (Future)
```
Cloud Provider (Vercel/Railway/Render)
├── Frontend (Static CDN)
├── Backend (Container)
├── PostgreSQL (Managed)
└── Redis (Optional, for queue)
```

## Technology Decisions

### Why Hono over Express?
- Lighter weight
- Better TypeScript support
- Edge runtime compatible
- Matches x402 reference implementation

### Why PostgreSQL over MongoDB?
- Structured data (analyses, findings, reports)
- ACID compliance for payment records
- Better for relational queries
- Industry standard

### Why Groq for AI?
- Sub-second inference (LPU architecture)
- Free tier available
- Good for demos
- Fallback to Ollama for offline capability

### Why Monaco Editor?
- Industry-standard code editor
- Syntax highlighting for multiple languages
- Diff view for before/after comparison
- Same engine as VS Code

## Monitoring & Logging

### Structured Logging
```typescript
{
  timestamp: ISO8601,
  level: "info" | "warn" | "error",
  message: string,
  context: {
    analysisId?: string,
    userId?: string,
    duration?: number,
    error?: Error
  }
}
```

### Metrics to Track
- Request count by endpoint
- x402 payment success rate
- Analysis duration
- AI inference time
- Error rates
- Active analyses

### Health Checks
- Database connectivity
- Facilitator availability
- AI service availability
- Disk space

## Future Enhancements

### Phase 4+
- GitHub integration (analyze from repo URL)
- Real-time collaboration
- CI/CD plugins
- IDE extensions
- Advanced caching
- Multi-language support
- Custom rule definitions
- Team workspaces
- Historical trend analysis
