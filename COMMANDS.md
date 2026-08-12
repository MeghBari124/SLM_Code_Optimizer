# AlgoForge Command Reference

Quick reference for all commands you'll need.

---

## Initial Setup

### Install Everything
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install

# Return to root
cd ..
```

### Configure Environment
```bash
# Copy template
copy .env.example .env

# Edit with your settings (use notepad or VS Code)
notepad .env
```

---

## Development

### Start Servers

**Option 1: Separate Terminals (Recommended)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option 2: Docker Compose (Phase 2+)**
```bash
docker-compose up
```

### Stop Servers
- Press `Ctrl+C` in each terminal
- Or for Docker: `docker-compose down`

---

## Testing

### Test Backend Health
```bash
curl http://localhost:3001/api/v1/health
```

### Test Frontend
Open browser: http://localhost:5173

### Run Unit Tests

Frontend:
```bash
cd frontend
npm test
```

Backend:
```bash
cd backend
npm test
```

---

## Building

### Frontend Production Build
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend Production Build
```bash
cd backend
npm run build
# Output: backend/dist/
```

### Preview Production Build
```bash
# Frontend
cd frontend
npm run preview

# Backend
cd backend
npm start
```

---

## Code Quality

### Run Linters

Frontend:
```bash
cd frontend
npm run lint
```

Backend:
```bash
cd backend
npm run lint
```

### Type Checking

Frontend:
```bash
cd frontend
npm run type-check
```

Backend:
```bash
cd backend
npm run type-check
```

### Fix Linting Issues
```bash
# Frontend
cd frontend
npm run lint -- --fix

# Backend
cd backend
npm run lint -- --fix
```

---

## Git Commands

### Initial Commit
```bash
git add .
git commit -m "feat: initial project scaffolding (Phase 1 complete)"
git push origin main
```

### Feature Branch
```bash
# Create and switch to new branch
git checkout -b feat/x402-integration

# Make changes, then commit
git add .
git commit -m "feat(x402): implement payment middleware"

# Push branch
git push origin feat/x402-integration
```

### Conventional Commits
```bash
git commit -m "feat(scope): description"     # New feature
git commit -m "fix(scope): description"      # Bug fix
git commit -m "docs(scope): description"     # Documentation
git commit -m "refactor(scope): description" # Code refactoring
git commit -m "test(scope): description"     # Tests
git commit -m "chore(scope): description"    # Maintenance
```

---

## Troubleshooting

### Kill Port Processes

Backend (port 3001):
```bash
npx kill-port 3001
```

Frontend (port 5173):
```bash
npx kill-port 5173
```

### Clean Install

Frontend:
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

Backend:
```bash
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Clear Build Artifacts

Frontend:
```bash
cd frontend
rmdir /s /q dist
```

Backend:
```bash
cd backend
rmdir /s /q dist
```

### Reset Everything
```bash
# Clean all node_modules and builds
rmdir /s /q frontend\node_modules
rmdir /s /q backend\node_modules
rmdir /s /q frontend\dist
rmdir /s /q backend\dist
del frontend\package-lock.json
del backend\package-lock.json

# Reinstall
cd frontend
npm install
cd ..\backend
npm install
cd ..
```

---

## Database (Phase 3+)

### Start PostgreSQL (Docker)
```bash
docker-compose up postgres
```

### Connect to Database
```bash
docker exec -it algoforge-db psql -U algoforge -d algoforge
```

### Run Migrations (Phase 3+)
```bash
cd backend
npm run migrate
```

---

## x402 / Algorand (Phase 2+)

### Get TestNet Tokens
- ALGO Faucet: https://dispenser.testnet.algorand.network
- USDC Faucet: [TBD - check Algorand docs]

### Check Transaction
```bash
# Replace TXID with your transaction ID
curl https://testnet-api.algonode.cloud/v2/transactions/TXID
```

### Test x402 Endpoint
```bash
# Should return 402 Payment Required
curl -X POST http://localhost:3001/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "test"}'
```

---

## Useful npm Scripts

### Frontend
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm test             # Run tests
```

### Backend
```bash
npm run dev          # Start dev server (port 3001) with watch
npm run build        # Compile TypeScript
npm start            # Run compiled JavaScript
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm test             # Run tests
npm run test:coverage # Run tests with coverage
```

---

## Docker Commands

### Build Images
```bash
docker-compose build
```

### Start All Services
```bash
docker-compose up
```

### Start in Background
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Clean Everything
```bash
docker-compose down -v --rmi all
```

---

## VS Code

### Recommended Extensions
- ESLint
- Prettier
- TypeScript + JavaScript
- Tailwind CSS IntelliSense
- GitLens
- Docker

### Open Workspace
```bash
code .
```

### Restart TypeScript Server
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

---

## File Navigation

### Project Root
```bash
cd c:\Users\MEGH\Desktop\SLM_Code_Optimizer
```

### Frontend
```bash
cd c:\Users\MEGH\Desktop\SLM_Code_Optimizer\frontend
```

### Backend
```bash
cd c:\Users\MEGH\Desktop\SLM_Code_Optimizer\backend
```

---

## Quick Checks

### Is Frontend Running?
```bash
curl http://localhost:5173
```

### Is Backend Running?
```bash
curl http://localhost:3001/api/v1/health
```

### What's My Node Version?
```bash
node --version
# Should be 18.0.0 or higher
```

### What's My npm Version?
```bash
npm --version
```

---

## Emergency Commands

### Kill All Node Processes (Windows)
```bash
taskkill /F /IM node.exe
```

### Find Process on Port
```bash
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

### Kill Process by PID
```bash
taskkill /PID <PID> /F
```

---

## Common Workflows

### Starting Work for the Day
```bash
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
cd frontend && npm install
cd ../backend && npm install
cd ..

# 3. Start servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

### Before Committing
```bash
# 1. Run linters
cd frontend && npm run lint
cd ../backend && npm run lint

# 2. Run type check
cd frontend && npm run type-check
cd ../backend && npm run type-check

# 3. Run tests
cd frontend && npm test
cd ../backend && npm test

# 4. If all pass, commit
cd ..
git add .
git commit -m "feat: your message"
git push
```

---

## Phase 2 Setup (Next)

### Install x402 Packages
```bash
cd backend
npm install @x402/core @x402/avm @x402/hono
```

### Configure x402
```bash
# Edit .env file
notepad .env

# Add:
X402_PAY_TO_ADDRESS=your_algorand_wallet_address
X402_ASSET=USDC_TESTNET_ASA_ID
```

### Test x402
```bash
# Start backend
cd backend
npm run dev

# In another terminal
curl -X POST http://localhost:3001/api/v1/analyze
# Should return 402 Payment Required
```

---

**Bookmark this file for quick reference!**
