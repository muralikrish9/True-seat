#!/bin/bash
# Deploy minimal program using Solana CLI
export PATH="$HOME/.local/share/solana/install/releases/1.18.16/solana-release/bin:$PATH"

PROGRAM_KEYPAIR="event-tickets/target/deploy/event_tickets-keypair.json"
PROGRAM_ID=$(solana-keygen pubkey "$PROGRAM_KEYPAIR")

echo "Program ID: $PROGRAM_ID"
echo "Attempting to deploy..."

# For now, we'll need a compiled .so file
# Since build is failing, let's update the program ID in the frontend
# and document that the program needs to be built/deployed separately

echo "Program keypair ready at: $PROGRAM_KEYPAIR"
echo "Program ID: $PROGRAM_ID"
