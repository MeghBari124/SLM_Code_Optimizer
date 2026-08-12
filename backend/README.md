# AlgoForge Backend

Node.js + Hono API server with x402 micropayment integration for Algorand smart-contract analysis.

## Features

- **x402 Payment Middleware**: Algorand-native micropayments
- **Repository Ingestion**: Parse TEAL/PyTeal codebases
- **Static Analysis**: Deterministic code analysis
- **AI Integration**: SLM-powered optimization recommendations
- **Verification Engine**: Validate recommendations
- **Report Generation**: Machine-readable + human-friendly reports
- **Blockchain Proof**: On-chain report anchoring

## Tech Stack

- Node.js 18+
- TypeScript
- Hono (web framework)
- x402 AVM packages
- PostgreSQL
- Pino (logging)
- Zod (validation)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Setup

Copy `.env.example` from the root and configure:

```bash
copy ..\.env.example .env
```

Required variables:
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `X402_FACILITATOR_URL` - GoPlausible facilitator
- `X402_PAY_TO_ADDRESS` - Your Algorand wallet
- `AI_API_KEY` - Groq or Together AI key

### Development

```bash
npm run dev
```

Server will start at `http://localhost:3001`

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm test
```

## Project Structure

```
src/
├── server/           # HTTP server setup
├── routes/           # API route handlers
├── x402/             # Payment middleware
├── repository/       # Code ingestion
├── analysis/         # Static analysis engine
├── ai/               # SLM integration
├── reports/          # Report generation
├── blockchain/       # Algorand integration
├── database/         # Data persistence
├── common/           # Shared utilities
└── types/            # TypeScript definitions
```

## API Endpoints

### Health

```
GET /api/v1/health
Response: 200 OK
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "..."
}
```

### Analyze (x402 Protected)

```
POST /api/v1/analyze
Content-Type: multipart/form-data
Payment: Required ($0.02 USDC)

Request Body:
- files: File[] (TEAL/PyTeal)
- options: { language: "teal" | "pyteal" }

Response: 200 OK
{
  "success": true,
  "data": {
    "analysisId": "...",
    "findings": [...],
    "recommendations": [...],
    "scores": {...},
    "payment": {...},
    "proof": {...}
  }
}

Response: 402 Payment Required
{
  "accepts": [{
    "scheme": "exact",
    "network": "algorand:testnet-v1.0",
    "asset": "...",
    "payTo": "...",
    "price": "$0.02"
  }]
}
```

## x402 Flow

1. Client requests `/api/v1/analyze`
2. Middleware checks for payment
3. No payment? Return 402 with challenge
4. Client wallet signs payment
5. Client retries with payment signature
6. Middleware verifies with facilitator
7. Facilitator settles on Algorand
8. Analysis runs
9. Report returned with transaction proof

## Development Phases

**Phase 1**: ✓ Project scaffolding
**Phase 2**: x402 integration (current)
**Phase 3**: Repository ingestion
**Phase 4**: Static analysis
**Phase 5**: SLM integration
**Phase 6**: Verification engine
**Phase 7**: Report generation
**Phase 8**: Frontend integration
**Phase 9**: Repository intelligence
**Phase 10**: Advanced features

## Security

- Never commit `.env` file
- All secrets in environment variables
- Input validation on all endpoints
- Rate limiting enabled
- CORS properly configured
- SQL injection prevention
- No code execution on uploaded files

See [SECURITY.md](../SECURITY.md) for full guidelines.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.
