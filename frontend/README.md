# AlgoForge Frontend

React + TypeScript + Vite frontend for AlgoForge smart-contract analysis platform.

## Features

- **Wallet Integration**: Pera, Defly, Lute wallet support
- **x402 Payment UI**: Seamless micropayment flow
- **Code Editor**: Monaco-based TEAL/PyTeal editor
- **Analysis Dashboard**: Real-time analysis progress and results
- **Report Visualization**: Interactive analysis reports

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Algorand Wallet SDK
- TanStack Query
- Zustand (state management)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npm run type-check
```

## Project Structure

```
src/
├── app/              # App configuration and routing
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components
│   ├── layout/      # Layout components
│   ├── payment/     # Payment flow components
│   ├── repository/  # Repository upload components
│   ├── analysis/    # Analysis display components
│   └── reports/     # Report components
├── pages/           # Page components
├── features/        # Feature-specific logic
├── hooks/           # Custom React hooks
├── services/        # API clients
├── store/           # State management
├── types/           # TypeScript definitions
├── utils/           # Utility functions
└── styles/          # Global styles
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=AlgoForge
```

## API Integration

The frontend communicates with the backend API at `/api/v1/*`. API client is in `src/services/api/`.

## Wallet Integration

Supports Algorand wallets via:
- Pera Wallet
- Defly Wallet
- Lute Wallet

Wallet logic is in `src/features/wallet/`.

## x402 Payment Flow

1. User initiates analysis
2. Backend returns 402 Payment Required
3. Frontend displays payment modal
4. User connects wallet and signs transaction
5. Frontend retries request with payment proof
6. Backend verifies and returns analysis

## State Management

Using Zustand for global state:
- Wallet connection state
- Analysis progress
- User preferences

## Styling

Using Tailwind CSS with custom theme. See `tailwind.config.js`.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.
