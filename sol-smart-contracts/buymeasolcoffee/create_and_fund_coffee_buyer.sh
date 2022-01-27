#! /bin/bash
cd tests/
node createCoffeeBuyer.js
solana config set --keypair ./coffee-buyer-raw.json
solana airdrop 2
solana config set --keypair ~/.config/solana/id.json