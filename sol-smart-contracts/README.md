# Solana Contracts
This all comes from [Buildspace's Solana Tutorial](https://app.buildspace.so/)
If you haven't done that course... What are you doing?!? go do that first!

## Refernces you should know about
[Buildspace's Solana Tutorial](https://app.buildspace.so/)

[Solana Docs](https://docs.solana.com/)

[Rust By Example](https://doc.rust-lang.org/rust-by-example/flow_control/if_else.html)
[Solana Rust Docs](https://docs.rs/solana-program/1.6.4/solana_program/index.html)

[Anchor Docs](https://project-serum.github.io/anchor/)
[Anchor Rust Docs](https://docs.rs/anchor-lang/latest/anchor_lang/)
[Anchor Examples](https://github.com/project-serum/anchor/tree/master/tests)
[Anchor Discord](https://discord.gg/8HwmBtt2ss)

## Spinning up a Solana smart contract
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
**Look at helpers/BasicAnchor.toml for an example**
All examples uses devnet, not localnet

`[programs.localnet]` > `[programs.devnet]`

`cluster = "localnet"` > `cluster = "devnet"`

If you are using another wallet to sign things with
optional: `wallet = path/to/your/wallet` > `wallet = new/dev/wallet`

If you copy and pasted from helpers/BasicAnchor.toml, be sure to change your wallet path

If you are using regular node.js insdead of mocha... (Reccomended)
`test = "yarn run mocha -t 1000000 tests/"` > `test = "node tests/yourprojectname.js"`

Create a program keypair
`anchor build`
`solana address -k target/deploy/myepicproject-keypair.json`


Copy this keypair's address to 2 places:
-In lib.rs 
`declare_id!("newkeypairfromabove");`
-In Anchor.toml
`myepicproject = "newkeypairfromabove"`
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

Gets your current solana address
`solana address`

Gets the solana address
`solana address -k keypair.json`

Airdrops you solana!
`solana airdrop 2`

Sets network to Devnet
`solana config set --url https://api.devnet.solana.com`

Sets network to Mainnet (Careful!)
`solana config set --url https://api.mainnet-beta.solana.com`

# Other useful functions
### Keygen Script
copy the file helpers/createKeypair.js to your project folder and run:
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
If you get an error like this `TypeError: src.toArrayLike is not a function at BNLayout.encode` - this means you didn't use a BN!

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

## Account clarification
I found some things out about this:
```
#[derive(Accounts)]
pub struct StartStuffOff<'info> {
  #[account(init, payer = user, space = 9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program <'info, System>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub gif_link: String,
    pub user_address: Pubkey,
}

#[account]
pub struct BaseAccount {
    pub total_gifs: u64,
	// Attach a Vector of type ItemStruct to the account.
    pub gif_list: Vec<ItemStruct>,
}
```

In StartStuffOff we see `#[account(init, payer = user, space = 9000)]`
this is the thing that lets us create an account!

When we create an account we are really allocating 'space' for an account of type YourStructHere. Space is not free, so we need a payer as well. We define who pays by the 'payer = user' portion, which is the 'pub user: Signer<'info>' just below it. 

Space: here we use 9000, but this is only because our account has a struct BaseAccount, which has a u64 (8 Bytes) and an array (Vec) of type ItemStruct, which has a String (varable length) and Pubkey (40 Bytes)

So this would prbably be better as 'space = 8 + 8992'. 8 bytes for the total_gifs and 8992 bytes saved for the variable-length Vec.