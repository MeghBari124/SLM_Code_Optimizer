# Contributing to AlgoForge

Thank you for your interest in contributing to AlgoForge!

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- PostgreSQL (optional for MVP)
- Algorand wallet for testing (Pera/Defly)

### Getting Started

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/algoforge.git
cd algoforge
```

2. **Set up environment variables**
```bash
copy .env.example .env
# Edit .env with your configuration
```

3. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Project Structure

- `frontend/` - React application
- `backend/` - Node.js API server
- `shared/` - Shared types and schemas
- `docs/` - Documentation
- `scripts/` - Utility scripts
- `test-fixtures/` - Sample contracts

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add comments for complex logic

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes

Examples:
```
feat(analysis): add opcode cost calculator
fix(x402): handle payment timeout correctly
docs(api): update endpoint documentation
```


### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation
- `refactor/what-refactored` - Refactoring

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests
4. Update documentation if needed
5. Ensure all tests pass
6. Submit PR with clear description

### Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run integration tests
npm run test:integration
```

### Code Review Checklist

- [ ] Code follows project style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log() in production code
- [ ] No hard-coded secrets
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] Security considerations addressed

## Development Phases

We're following a phased approach. Check PROJECT_RULES.md for current phase.

**Current Phase**: Phase 1 - Project Scaffolding

**Don't work ahead of the current phase** - we want each phase stable before moving forward.

## What to Contribute

### High Priority
- x402 integration testing
- Static analysis rules for TEAL
- PyTeal parser improvements
- Test fixtures (sample contracts)
- Documentation improvements

### Medium Priority
- UI/UX improvements
- Additional analysis features
- Performance optimizations
- Error message clarity

### Low Priority (Future)
- GitHub integration
- Advanced AI features
- Plugin system
- Multi-chain support

## Bug Reports

When filing a bug report, include:

1. **Description**: What happened vs what you expected
2. **Steps to reproduce**: Detailed steps
3. **Environment**: OS, Node version, browser
4. **Logs**: Relevant error messages
5. **Screenshots**: If applicable

## Feature Requests

When requesting a feature:

1. **Problem**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Alternatives**: Other approaches considered?
4. **Impact**: Who benefits from this?

## Questions?

- Check [documentation](./docs/)
- Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- Read [PROJECT_RULES.md](./PROJECT_RULES.md)
- Open a discussion (not an issue)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
