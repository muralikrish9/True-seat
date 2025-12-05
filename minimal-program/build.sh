#!/bin/bash
export PATH="$HOME/.local/share/solana/install/releases/1.18.16/solana-release/bin:$PATH"
cd src
# Try to compile directly with rustc using platform SDK
echo "Attempting direct compilation..."
