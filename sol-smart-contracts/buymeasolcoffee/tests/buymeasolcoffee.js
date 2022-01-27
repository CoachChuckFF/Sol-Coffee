// This file is from Farza's Buildspace Solana course - not my own
// https://app.buildspace.so/

const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;

const buyerKP = require('./coffee-buyer.json');

const secretArray = Object.values(buyerKP._keypair.secretKey);
const secret = new Uint8Array(secretArray);
const coffeeBuyer = anchor.web3.Keypair.fromSecretKey(secret);

const main = async() => {
  console.log("🚀 Starting test...")

  const barista = anchor.Provider.env();
  barista; //for now the barista will buy their own coffee
  anchor.setProvider(barista);

  const program = anchor.workspace.Buymeasolcoffee;
  const coffeeJar = anchor.web3.Keypair.generate();

  console.log("☕ Brewing Coffee...")
  let foundingTx = await program.rpc.startCoffeeJar({
    accounts: {
      coffeeJar: coffeeJar.publicKey,                //Web  keypair
      barista: barista.wallet.publicKey,             //User keypair
      systemProgram: SystemProgram.programId,
    },
    signers: [coffeeJar], //even though the barista is the payer, the coffeejar needs to sign this
  });

  console.log("💲 Buying 0.1 Coffee...");
  let buyingTx = await program.rpc.buyCoffee(
    numToRust(solTolamports(0.1)),
    {
      accounts: {
        coffeeJar: coffeeJar.publicKey,
        from: coffeeBuyer.publicKey,
        to: barista.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [coffeeBuyer]
    }
  );

  console.log("🧮 Tabulating Info...");
  let coffeeJarAccount = await program.account.coffeeJar.fetch(coffeeJar.publicKey);
  
  console.log("\n---- 📝 Coffee Jar Info -----");
  console.log(`--- Founding TX   : [${foundingTx}]`);
  console.log(`--- Buying TX     : [${buyingTx}]`);
  console.log(`--- Barista Key   : [${coffeeJarAccount.barista}]`);
  console.log(`--- Buyer Key     : [${coffeeBuyer.publicKey}]`);
  console.log(`--- Coffee Count  : [${coffeeJarAccount.coffeeCount}]`);
  console.log(`--- Sol Total     : [${lamportsToSol(coffeeJarAccount.lamportCount)}]`);
  console.log("-----------------------------\n");

  console.log("... to the moon! 🌑")
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Helpers
const LAMPORT_COST = 0.000000001
const numFromRust = (num) => 
{
  return num.toNumber();
}
const numToRust = (num) => 
{
  return new anchor.BN(Math.round(num));
}

const solTolamports = (sol) => {
  return Math.round(sol / LAMPORT_COST);
}

const lamportsToSol = (lamports) => {
  return lamports * LAMPORT_COST;
}

runMain();