# Intro
This all comes from [Buildspace's Solana Tutorial](https://app.buildspace.so/)
If you haven't done that course... What are you doing?!? go do that first!

# Spinning up a Solana smart contract
[Install Rust](https://doc.rust-lang.org/book/ch01-01-installation.html)

Verify
`rustup --version`
`rustc --version`
`cargo --version`

## Installing Solana
[Install Solana](https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool)

Verify
`solana --version`
`solana-test-validator`

## Installing Other Tools
`npm install -g mocha`

## Installing Anchor
[Anchor Discord](https://discord.gg/8HwmBtt2ss)

Install Anchor
`cargo install --git https://github.com/project-serum/anchor anchor-cli --locked`

Verify
`anchor --version`

Install NPM Packages
`npm install @project-serum/anchor @solana/web3.js`

CreateProject
**Naming Matters!**

Note: Rust is snake_case JS is camelCase

`anchor init myepicproject --javascript`
`cd myepicproject`

Test
`anchor test`

## INIT

Change up the Anchor.toml file
**Look at BasicAnchor.toml for an example**
All examples uses devnet, not localnet
`[programs.localnet]` > `[programs.devnet]`
`cluster = "localnet"` > `cluster = "devnet"`

If you are using another wallet to sign things with
optional: `wallet = path/to/your/wallet` > `wallet = new/dev/wallet`

If you are using regular node.js insdead of mocha... (Reccomended)
`test = "yarn run mocha -t 1000000 tests/"` > `test = "node tests/yourprojectname.js"`

Create a program keypair
`anchor build`
`solana address -k target/deploy/myepicproject-keypair.json`


Copy this keypair's address to 2 places:
-In lib.rs 
`declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");`
-In Anchor.toml
`myepicproject = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"`
Build again
`anchor build`

Test
`anchor test`

Deploy
`anchor deploy`

Move idl file to App
`target/idl/myepicproject.json`
to
`app/src/idl.json`
then in App.js
`import idl from './idl.json';`

From Farza : 
```
solana config set --url devnet

// Make sure you're on devnet.
solana config get

anchor build

// Get the new program id.
solana address -k target/deploy/myepicproject-keypair.json

// Update Anchor.toml and lib.rs w/ new program id.
// Make sure Anchor.toml is on devnet.

// Build again.
anchor build
```

# Solana Common Functions
Create keygen in home directory ("~/.config/solana/id.json")
`solana-keygen new`

Creates a local output key, useful for testing
`solana-keygen new --outfile wallet.json`

Sets active wallet (keypair)
`solana config set --keypair path/to/wallet.json`

Resets active wallet to your local one
`solana config set --keypair ~/.config/solana/id.json`

Airdrops you solana!
`solana airdrop 2`

Sets network to Devnet
`solana config set --url https://api.devnet.solana.com`

Sets network to Mainnet (Careful!)
`solana config set --url https://api.mainnet-beta.solana.com`

# Other useful functions
### Keygen Script
copy the file anchor-boilderplate/createKeypair.js to your project folder and run:
`node createKeypair.js`

if that doesn't work try running in your project folder:
`npm i @project-serum/anchor`

### Sol to Lamports
When sending sol to/from contracts, you define them in lamports
A lamport is 0.000000001 sol

A js function
```
const solTolamports = (sol) => {
  return new Math.round(sol / 0.000000001);
}	
```

If sending this to a smart contract remeber to wrap convert it into a BN
```
const numToRust = (num) => {
  return new anchor.BN(Math.round(num));
}
```

All together
```
numToRust(solTolamports(0.1))
```

# Things that took me a while to figure out
Maybe you have simular questions?!

## What is a BN
If you want to pass a number to rust from a js file, it has to be a BN

Create a BN in a node server file. When printed it gives a hex representation, call .toNumer() to fix that
```
const anchor = require('@project-serum/anchor');
anchor.BN(1);
```

Create a BN in a React App.js
```
import { BN } from '@project-serum/anchor';
BN(1);
```