# AlgoForge Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- Code editor (VS Code recommended)

## Initial Setup (5 minutes)

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy the environment template
copy .env.example .env

# Edit .env file with your settings
# For Phase 1, defaults are fine
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend will start at: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will start at: http://localhost:5173

### 4. Verify Setup

**Test Backend:**
```bash
curl http://localhost:3001/api/v1/health
```

Should return:
```json
{
  "status": "ok",
  "version": "1.0.0",
  ...
}
```

**Test Frontend:**
Open browser to http://localhost:5173

Should see the AlgoForge landing page.

## Project Structure Overview

```
├── frontend/          # React UI (port 5173)
├── backend/           # Node.js API (port 3001)
├── shared/            # Shared code
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── test-fixtures/     # Sample contracts
```

## Development Workflow

### Making Changes

1. **Frontend changes** - Hot reload active, changes appear immediately
2. **Backend changes** - tsx watch mode, server restarts automatically
3. **Type changes** - Update both frontend and backend types

### Adding New Features

1. Check current phase in [BUILD_STATUS.md](./BUILD_STATUS.md)
2. Read [PROJECT_RULES.md](./PROJECT_RULES.md)
3. Create feature branch
4. Implement following phase order
5. Test locally
6. Commit with conventional commits

### Running Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## Common Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
npm run type-check   # Check TypeScript
```

### Backend
```bash
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm start            # Run production build
npm run lint         # Run linter
npm test             # Run tests
```

## Next Steps (Phase 2)

1. **Study x402 reference**
   - Clone: https://github.com/marotipatre/x402-Project
   - Read their endpoints.config.ts
   - Understand the payment flow

2. **Install x402 packages**
   ```bash
   cd backend
   npm install @x402/core @x402/avm @x402/hono
   ```

3. **Get Algorand TestNet wallet**
   - Install Pera Wallet extension
   - Create wallet
   - Get TestNet ALGO from faucet
   - Get TestNet USDC from faucet

4. **Configure payment**
   - Add your wallet address to .env
   - Set X402_PAY_TO_ADDRESS

5. **Implement x402 middleware**
   - Start in `backend/src/x402/`
   - Follow reference implementation
   - Test with curl + manual signing first

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### TypeScript errors
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Module resolution errors
- Check tsconfig.json paths
- Ensure imports use correct aliases
- Restart TypeScript server in VS Code

## Resources

- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [PROJECT_RULES.md](./PROJECT_RULES.md) - Development rules
- [SECURITY.md](./SECURITY.md) - Security guidelines
- [BUILD_STATUS.md](./BUILD_STATUS.md) - Current status

## Support

- Check documentation in `/docs`
- Review test fixtures in `/test-fixtures`
- Read inline comments and README files

## Team

**MergeInfinity**
- Dhruv Save
- Megh Bari  
- Kaivalya Sonawane

---

**Current Phase**: Phase 1 Complete ✅  
**Next Phase**: Phase 2 - x402 Integration
