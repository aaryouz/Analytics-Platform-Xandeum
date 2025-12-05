# Xandeum pNode Analytics Platform

**NASA-Quality Analytics Platform for Xandeum Provider Nodes**

A production-ready, real-time analytics platform for Xandeum pNodes, built with Next.js 15, TypeScript, and Solana Web3.js.

## 🚀 Features

- **Real-time pNode Discovery**: Queries all pNodes directly from Solana blockchain
- **Comprehensive Metrics**: Displays stake, commission, status, and performance data
- **Robust Architecture**: Circuit breaker pattern, retry logic, error handling
- **Responsive Design**: Works flawlessly on mobile, tablet, and desktop
- **NASA-Quality Code**: Extensive logging, monitoring, and error recovery

## 📋 Requirements

- Node.js 18+ (20+ recommended)
- npm or yarn

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Analytics-Platform-Xandeum.git
cd Analytics-Platform-Xandeum

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Blockchain**: Solana Web3.js
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + TanStack Query
- **Charts**: Recharts

### Project Structure

```
Analytics-Platform-Xandeum/
├── app/
│   ├── api/
│   │   └── pnodes/
│   │       ├── route.ts              # GET /api/pnodes - List all pNodes
│   │       └── [id]/route.ts         # GET /api/pnodes/:id - Get pNode details
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── lib/
│   ├── constants.ts                  # Program addresses and config
│   ├── types.ts                      # TypeScript interfaces
│   └── solana-client.ts              # Solana RPC client with retry logic
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── tsconfig.json                     # TypeScript configuration
```

## 🔧 Configuration

### Solana RPC Endpoint

The platform queries the Solana blockchain using `getProgramAccounts()`. Configure the RPC endpoint in `.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

**For production**, use a dedicated RPC provider:
- [Helius](https://helius.dev)
- [QuickNode](https://www.quicknode.com/)
- [Alchemy](https://www.alchemy.com/)

### pNode Program Address

The platform queries the Xandeum pNode program:
```
3hMZVwdgRHYSyqkdK3Y8MdZzNwLkjzXod1XrKcniXw56
```

## 📡 API Endpoints

### GET /api/pnodes

Retrieves all pNode accounts from Solana blockchain.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "publicKey": "ABC...XYZ",
      "registered": true,
      "stake": 1000000,
      "commission": 5,
      "status": "active"
    }
  ],
  "metadata": {
    "count": 10,
    "fetchedAt": "2025-12-04T...",
    "durationMs": 234
  }
}
```

### GET /api/pnodes/[id]

Retrieves a specific pNode by public key.

**Response:**
```json
{
  "ok": true,
  "data": {
    "publicKey": "ABC...XYZ",
    "stake": 1000000,
    "commission": 5,
    "status": "active"
  }
}
```

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔍 How It Works

1. **Blockchain Query**: Uses Solana's `getProgramAccounts()` RPC method to retrieve all accounts owned by the pNode program
2. **Data Parsing**: Deserializes account data into structured pNode objects
3. **Caching**: Implements intelligent caching (60s cache, 5min stale-while-revalidate)
4. **Error Handling**: Circuit breaker pattern prevents cascade failures
5. **Retry Logic**: Exponential backoff (1s, 2s, 4s) for failed requests

## 🛡️ NASA-Quality Features

✅ **Circuit Breaker Pattern**: Stops calling failing endpoints
✅ **Exponential Backoff Retry**: 3 attempts with increasing delays
✅ **Comprehensive Logging**: All operations logged for debugging
✅ **Type Safety**: Strict TypeScript throughout
✅ **Error Recovery**: Graceful degradation on failures
✅ **Health Checks**: `/api/pnodes` HEAD request for monitoring

## 📊 Performance

- **Lighthouse Score**: Target >90
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.5s
- **API Response Time**: <500ms (p95)

## 🤝 Contributing

This is a bounty submission project. For issues or suggestions:

1. Open an issue describing the problem
2. Submit a pull request with fixes

## 📄 License

MIT

## 🏆 Bounty Information

- **Competition**: [Xandeum pNodes Analytics Platform](https://earn.superteam.fun/listing/build-analytics-platform-for-xandeum-pnodes)
- **Prize Pool**: $5,000 USDC
- **Deadline**: December 26, 2025

## 🔗 Links

- [Xandeum GitHub](https://github.com/Xandeum)
- [Xandeum Documentation](https://docs.xandeum.network/)
- [Solana Documentation](https://docs.solana.com/)

---

**Built with ❤️ for the Xandeum pNodes Bounty**

*Humanity depends on NASA-quality code!*
