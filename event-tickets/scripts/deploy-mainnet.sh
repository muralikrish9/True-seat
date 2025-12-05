#!/bin/bash

# Deploy to Solana Mainnet
echo "Deploying to Solana Mainnet..."

# Set cluster to mainnet
solana config set --url mainnet-beta

# Build the program
echo "Building program..."
anchor build

# Deploy
echo "Deploying program..."
anchor deploy --provider.cluster mainnet-beta

echo "Deployment complete!"
echo "Program ID: $(solana address -k target/deploy/event_tickets-keypair.json)"

