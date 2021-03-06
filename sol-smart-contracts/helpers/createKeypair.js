// This file is from Farza's Buildspace Solana course - not my own
// https://app.buildspace.so/
// Shoutout to Nader Dabit for helping w/ this!
// https://twitter.com/dabit3

// I added in the raw :)

const fs = require('fs')
const anchor = require("@project-serum/anchor")

const account = anchor.web3.Keypair.generate()
//keypair for JS
fs.writeFileSync('./keypair.json', JSON.stringify(account))
//raw for solana
fs.writeFileSync('./keypair_raw.json', `[${account.secretKey.toString()}]`);