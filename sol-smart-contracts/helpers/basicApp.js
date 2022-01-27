// This file is mostly from Farza's Buildspace Solana course - not my own
//https://app.buildspace.so/

import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3, BN
} from '@project-serum/anchor';

import kp from './keypair.json' //You need to generate this
import idl from './idl.json'; //from anchor project

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;


// Create account once with a local keypair
// const secretArray = Object.values(kp._keypair.secretKey);
// const secret = new Uint8Array(secretArray);
// const baseAccount = web3.Keypair.fromSecretKey(secret);
// OR
// Create an account each time you refresh
const baseAccount = web3.Keypair.generate();

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
//TODO in product use "finalized"
const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = 'CoachChuckFF';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [contractCalls, setContractCalls] = useState(0)
  const [hasAccount, setHasAccount] = useState(false);

  // Helpers
  const numToRust = (num) => 
  {
    return new BN(Math.round(num));
  }

  const solTolamports = (sol) => {
    return Math.round(sol / 0.000000001);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  // Contracts
  const solContractCall = async (sol) => {
    if(sol){
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);

        // Call a contract here
        // They are called just like in tests/yourproject.js
        console.log("TODO add contract Call", error);


        setContractCalls(contractCalls + 1)
      } catch (error) {
        console.log("Error sending sol ", error);
      }
    }
  }

  const createSolAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      console.log("Created a new base account w/ address: ", baseAccount.publicKey.toString())
      await loadAccountInfo();

    } catch (error) {
      console.log("Cannot get base account: ", error);
    }
  }

  const loadAccountInfo = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account");
      setHasAccount(true);

    } catch (error) {
      console.log("Error getting account ", error);
      setHasAccount(false);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
  
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  
  useEffect(() => {
    if (walletAddress) {
      console.log('Loading Sol...');
      loadSolList();
    }
  }, [walletAddress]);

  const renderCreateAccount = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={createSolAccount}
    >
      One-Time Account Creation
    </button>
  );

  const renderContractCall = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={solContractCall}
    >
      Contract Calls: {contractCalls}
    </button>
  );

  const renderConnectedContainer = () => {
    if(hasAccount === null){
      return renderCreateAccount();
    } else {
      return renderContractCall();
    }

  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );


  return (
    <div className="App">
			{/* This was solely added for some styling fanciness */}
			<div className={'container'}>
        <div className="header-container">
          <p className="header">Solana Example</p>
          <p className="sub-text">
            N F T ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className='spacing'></div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Crafted By @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;