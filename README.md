# AlgoForge

**An x402-native autonomous smart-contract engineering platform for Algorand**

## Project Overview

AlgoForge is a specialized smart-contract analysis platform built for the Algorand x402 hackathon (PS0406 — SLM-Powered Code Optimizer). It provides pay-per-use code optimization intelligence through x402 micropayments.

### Core Capabilities

- **SLM-Powered Analysis**: Lightweight language models analyze TEAL/PyTeal smart contracts
- **x402 Micropayments**: Pay-per-analysis using Algorand x402 protocol
- **Repository Intelligence**: Understands entire codebases, not just isolated files
- **Deterministic + AI**: Static analysis provides evidence; AI explains and prioritizes
- **Verification**: Recommendations are validated when possible, not blindly trusted
- **Machine-Callable**: Designed for AI agents, CI/CD pipelines, and developers

### What Makes AlgoForge Different

Unlike generic AI code assistants, AlgoForge:
- Specializes in Algorand smart-contract optimization
- Uses x402 for autonomous agent payments
- Validates recommendations rather than hallucinating savings
- Provides transaction-linked proof of analysis
- Supports repository-level understanding

## Architecture


```
┌─────────────────────────────────────────────┐
│  Developer / AI Agent / CI Pipeline         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Frontend (React + Vite)                    │
│  - Wallet connection                        │
│  - Repository upload                        │
│  - x402 payment UI                          │
│  - Results visualization                    │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────┐
│  Backend API (Node.js + Hono)               │
│  ├─ x402 Middleware                         │
│  ├─ Repository Ingestion                    │
│  ├─ Static Analysis Engine                  │
│  ├─ SLM Reasoning Layer                     │
│  ├─ Verification Engine                     │
│  └─ Report Generator                        │
└──────┬──────────────────────┬───────────────┘
       │                      │
       ▼                      ▼
┌─────────────┐      ┌────────────────┐
│  PostgreSQL │      │  Algorand      │
│  (Reports)  │      │  (Payments)    │
└─────────────┘      └────────────────┘
```


## Project Structure

```
algoforge/
├── frontend/          # React + Vite UI
├── backend/           # Node.js + Hono API
├── shared/            # Shared types and schemas
├── docs/              # Documentation
├── scripts/           # Setup and utility scripts
└── test-fixtures/     # Sample TEAL/PyTeal contracts
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (optional for MVP)
- Algorand wallet (Pera/Defly) for testnet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SLM_Code_Optimizer
```

2. Copy environment variables:
```bash
copy .env.example .env
```

3. Configure environment variables (see `.env` file)

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

5. Install backend dependencies:
```bash
cd backend
npm install
```

### Development

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:3001`


## Core Workflow

1. **Upload** - Developer uploads TEAL/PyTeal code or repository
2. **Payment** - System returns 402, user pays via Algorand wallet
3. **Analysis** - Static analyzer identifies optimization opportunities
4. **Reasoning** - SLM explains findings and suggests improvements
5. **Verification** - System validates recommendations where possible
6. **Report** - Detailed analysis with transaction proof returned

## Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design and technical details
- [Project Rules](./PROJECT_RULES.md) - Development guidelines
- [Security](./SECURITY.md) - Security considerations
- [API Documentation](./docs/api/) - API endpoints and usage
- [x402 Integration](./docs/x402/) - Payment flow details

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Algorand Wallet SDK

### Backend
- Node.js 18+
- TypeScript
- Hono
- x402 AVM packages
- PostgreSQL

### x402 & Blockchain
- @x402/core
- @x402/avm
- @x402/hono
- GoPlausible Facilitator
- Algorand TestNet

## Team

**MergeInfinity**
- Dhruv Save
- Megh Bari
- Kaivalya Sonawane

## License

[License TBD]

## Acknowledgments

Built for the Algorand x402 Hackathon - PS0406: SLM-Powered Code Optimizer
