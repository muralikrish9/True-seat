# Build and Deploy to Solana Devnet

## Current Status
- ✅ Anchor CLI installed (v0.32.1)
- ✅ Cargo installed (v1.85.1)
- ⚠️ Solana CLI needs to be installed

## Step-by-Step Instructions

### Step 1: Install Solana CLI

Open a terminal and run:

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Then add to your PATH (add to `~/.zshrc`):

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Reload your shell:
```bash
source ~/.zshrc
```

Verify:
```bash
solana --version
```

**Expected output:** `solana-cli 1.x.x`

### Step 2: Build the Anchor Program

```bash
cd event-tickets
anchor build
```

**What this does:**
- Compiles your Rust program
- Generates `target/idl/event_tickets.json` (needed by frontend)
- Creates deployment keypair

**Expected output:**
```
Building...
Compiling event_tickets v0.1.0
...
Generating IDL...
```

### Step 3: Set Up Devnet Wallet

```bash
# Set Solana to devnet
solana config set --url devnet

# Create wallet (if you don't have one)
solana-keygen new

# Get test SOL
solana airdrop 2

# Check balance
solana balance
```

### Step 4: Deploy to Devnet

```bash
# From event-tickets directory
anchor deploy --provider.cluster devnet
```

**Copy the Program ID from the output!** It will look like:
```
Program Id: HVmjHksqd3kExMoLnucW5NG4NX47vyoELXmBCGr7sHbY
```

### Step 5: Update Frontend Config

Create/update `.env.local` in the **root** directory:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<PASTE_PROGRAM_ID_HERE>
```

### Step 6: Restart Frontend

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Quick Script (Alternative)

I've created a script that automates everything:

```bash
bash QUICK_DEPLOY.sh
```

This script will:
1. Check/install Solana CLI
2. Build the program
3. Set up devnet
4. Get airdrop
5. Deploy
6. Show next steps

## Troubleshooting

### "no such command: build-sbf"
**Solution:** Solana CLI not in PATH. Add it:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### "Insufficient funds"
**Solution:** Get more devnet SOL:
```bash
solana airdrop 2
```

### "Program account does not exist"
**Solution:** Make sure deployment succeeded. Check:
```bash
solana program show <PROGRAM_ID>
```

### IDL not found in frontend
**Solution:** Make sure `anchor build` completed successfully:
```bash
ls event-tickets/target/idl/event_tickets.json
```

## Verify Deployment

1. **Check on Solana Explorer:**
   ```
   https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
   ```

2. **Check program info:**
   ```bash
   solana program show <PROGRAM_ID>
   ```

3. **Test in frontend:**
   - Connect Phantom wallet (set to devnet)
   - Try creating an event
   - Check browser console for errors

## Program Details

- **Program ID:** `HVmjHksqd3kExMoLnucW5NG4NX47vyoELXmBCGr7sHbY`
- **Location:** `event-tickets/programs/event-tickets/src/lib.rs`
- **Functions:**
  - `create_event` - Create a new event
  - `buy_ticket` - Purchase tickets
  - `toggle_event_active` - Enable/disable events

## Cost

- **Devnet:** Free (test SOL)
- **Mainnet:** ~2-3 SOL (real money)

## Next Steps After Deployment

1. ✅ Program deployed
2. ✅ `.env.local` updated
3. ✅ Frontend restarted
4. ⏭️ Connect Phantom wallet (devnet)
5. ⏭️ Test creating events
6. ⏭️ Test buying tickets

