import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json"

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);

  const [value, setValue] = useState('');
  const onChange = (event) => {
    setValue(event.target.value);
  }

  const contractAddress = "0x3e71f97e4894547f0Cdc69E882A6835BE7e21bB1"
  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try { 
      const { ethereum } = window;

      if (ethereum) {

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);


        // Read action from the smart contract
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        // Execute the actual wave action here
        const waveTxn = await wavePortalContract.wave(value || 'waveInput', { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

 const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        
        // call the getAllWaves method from Smart Contract
        const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

       // store data in react state
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  };

useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey, I'm Madhav!
        </div>

        <div className="bio">
          madhavvats.eth
        </div>

        <div className="bio">
          I study Computer Science & Economics @ the University of Chicago, and I grew up in the Bay Area. I love exploring the outdoors, reading sci-fi/fantasy, and chatting about philosophy over coffee :)
        </div>

        <div className="bio">
          Send me a message with your wave & you might win some ETH! Make sure you're running the Rinkeby Test Network.
        </div>

        <input value={value} onChange={onChange} style={{ width: "50%", marginTop: "16px", marginLeft: "25%", marginRight: "25%"}}/>

        <button className="waveButton" onClick={wave}>
          WAVE AT ME
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            CONNECT WALLET
          </button>
        )}

        <a href="https://rinkeby.etherscan.io/address/0x3e71f97e4894547f0Cdc69E882A6835BE7e21bB1" target="_blank">ETHERSCAN</a>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "rgb(170, 170, 170)", marginTop: "16px", padding: "8px", fontfamily: "Roboto", lineheight: "1.5em" }}>
              <div class="bold_text"> MESSAGE: {wave.message} </div>
              <div> ETH ADDRESS: {wave.address}</div>
              <div> TIME: {wave.timestamp.toString()}</div>
            </div>)
        })}


      </div>
    </div>
  );
}

export default App