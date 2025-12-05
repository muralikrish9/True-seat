# True Seat 🎫

A decentralized event ticketing platform built on Solana blockchain with a sleek Netflix-inspired UI.

## 🌟 Features

- **Blockchain-Powered**: Built on Solana for fast, secure, and transparent ticketing
- **Event Creation**: Create and manage events with customizable ticket prices and quantities
- **Wallet Integration**: Seamless Phantom wallet integration for transactions
- **NFT Tickets**: Event tickets as NFTs (future feature)
- **Real-time Updates**: Live event and ticket availability tracking
- **Modern UI**: Netflix-style red theme with smooth animations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Solana Web3.js** - Blockchain interaction
- **Wallet Adapter** - Multi-wallet support

### Blockchain
- **Solana** - High-performance blockchain
- **Anchor Framework** - Solana program development
- **Rust** - Smart contract language

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Phantom wallet (or other Solana wallet)
- Solana CLI (for program deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/muralikrish9/True-seat.git
cd True-seat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
cp .env.example .env.local
```

Add your configuration:
```env
NEXT_PUBLIC_PROGRAM_ID=J6KqCUoCbR48LMqgLGGy5JCwRUQ8UN4pdco1ypjb6tDc
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Solana Program Deployment

### Deploy to Devnet via Solana Playground (Recommended)

1. Go to [Solana Playground](https://beta.solpg.io)
2. Create a new Anchor project
3. Copy the program code from `event-tickets/programs/event-tickets/src/lib.rs`
4. Build and deploy to devnet
5. Copy the program ID and update `.env.local`

### Deploy Locally

```bash
cd event-tickets
anchor build
anchor deploy --provider.cluster devnet
```

## 🎨 Design System

### Color Palette
- **Primary Red**: `#e50914` (Netflix red)
- **Dark Red**: `#b8070f` (hover states)
- **Light Pink**: `#ffe5e7` (backgrounds)
- **White**: `#ffffff`
- **Black**: `#000000`

### Typography
- **Font**: Netflix Sans Variable, -apple-system, system-ui

## 📁 Project Structure

```
True-seat/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── events/       # Events listing
│   │   ├── owned/        # User's tickets
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── Navigation.tsx
│   │   ├── CreateEventModal.tsx
│   │   └── BuyTicketsModal.tsx
│   └── lib/              # Utilities
│       ├── solana.ts     # Solana interactions
│       └── contract.ts   # Smart contract utils
├── event-tickets/        # Solana program
│   └── programs/
│       └── event-tickets/
│           └── src/
│               └── lib.rs  # Rust program
└── public/               # Static assets
```

## 🔑 Key Features Explained

### PDA (Program Derived Address) Seeds
Events are stored using deterministic PDAs derived from:
- Event prefix: `"event"`
- Creator's public key
- Unique event ID (string-based)

This ensures unique, reproducible addresses for each event.

### Event Creation
Users can create events with:
- Name and description
- Location and category
- Date and time
- Ticket price (in SOL)
- Max ticket quantity

### Ticket Purchase
- Direct SOL transfers from buyer to event creator
- On-chain ticket tracking
- Instant confirmation

## 🧪 Testing

```bash
# Run tests
npm test

# Run Solana program tests
cd event-tickets
anchor test
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Program (Mainnet)
```bash
cd event-tickets
anchor deploy --provider.cluster mainnet
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- **GitHub**: [https://github.com/muralikrish9/True-seat](https://github.com/muralikrish9/True-seat)
- **Demo**: Coming soon!
- **Documentation**: See `/docs` folder

## 👥 Team

Built with ❤️ by the True Seat team

## 🙏 Acknowledgments

- Solana Foundation
- Anchor Framework
- Next.js Team
- Open source community

---

**Note**: This project is in active development. Features and documentation are continuously updated.
