# EventTickets Smart Contract

This project contains the EventTickets ERC721 contract for the Block-a-Tic event ticketing platform.

## Setup

1. Install dependencies:
```shell
npm install
```

2. Create a `.env` file in this directory (copy from `.env.example`):
```shell
cp .env.example .env
```

3. Fill in your environment variables:
   - `PRIVATE_KEY`: Your deployer account private key (without 0x prefix)
   - `BASE_SEPOLIA_RPC_URL`: Base Sepolia RPC endpoint (default: https://sepolia.base.org)

### Getting Your Private Key

#### Option 1: Use MetaMask (Recommended for beginners)

1. **Install MetaMask** (if you don't have it):
   - Chrome: https://chrome.google.com/webstore/detail/metamask
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/

2. **Create or Import an Account**:
   - Open MetaMask extension
   - If new: Click "Create a new wallet" and follow the setup
   - If existing: Use your existing account (or create a new one for testing)

3. **Export Your Private Key**:
   - Click the account icon (circle) in MetaMask
   - Click the three dots menu next to your account
   - Select "Account details"
   - Click "Show private key"
   - Enter your MetaMask password
   - **Copy the private key** (it will look like: `0x1234567890abcdef...`)
   - **Remove the `0x` prefix** when adding to `.env` file

4. **Add Base Sepolia Network to MetaMask**:
   - Open MetaMask → Settings → Networks → Add Network
   - Network Name: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.basescan.org`

5. **Get Base Sepolia Testnet ETH**:
   - Visit a Base Sepolia faucet:
     - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet (if available)
     - https://faucet.quicknode.com/base/sepolia
     - Or search "Base Sepolia faucet" for current options
   - Connect your MetaMask wallet
   - Request testnet ETH (you'll need some for gas fees)

#### Option 2: Generate a New Wallet (More Secure)

You can generate a new wallet specifically for deployment:

```bash
# Using Node.js (in contracts directory)
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"
```

**⚠️ SECURITY WARNING:**
- **NEVER** share your private key with anyone
- **NEVER** commit your `.env` file to git (it's already in `.gitignore`)
- **NEVER** use a wallet with real funds for testing
- Consider using a dedicated test wallet with minimal funds

### Getting an RPC URL (Optional)

The default public RPC (`https://sepolia.base.org`) should work fine. For better reliability, you can get a free RPC URL from:

- **Alchemy**: https://www.alchemy.com/ (free tier available)
- **Infura**: https://www.infura.io/ (free tier available)
- **QuickNode**: https://www.quicknode.com/ (free tier available)

After signing up, create a new project/app and select "Base Sepolia" network. Copy the HTTP URL and use it as `BASE_SEPOLIA_RPC_URL`.

## Deployment

### Deploy to Base Sepolia

```shell
npm run deploy:base-sepolia
```

After deployment, copy the contract address and add it to your root `.env` file as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

### Deploy to Local Network

First, start a local Hardhat node:
```shell
npx hardhat node
```

Then in another terminal:
```shell
npm run deploy:local
```

## Testing

```shell
npx hardhat test
REPORT_GAS=true npx hardhat test
```

## Other Commands

```shell
npx hardhat help
npx hardhat compile
```
