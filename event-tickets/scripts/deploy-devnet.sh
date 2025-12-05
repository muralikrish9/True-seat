#!/bin/bash

# Deploy to Solana Devnet
echo "Deploying to Solana Devnet..."

# Set cluster to devnet
solana config set --url devnet

# Build the program
echo "Building program..."
anchor build

# Deploy
echo "Deploying program..."
anchor deploy --provider.cluster devnet

echo "Deployment complete!"
echo "Program ID: $(solana address -k target/deploy/event_tickets-keypair.json)"

