// run.js: used for debugging smart contract functionality

const main = async () => {
    const [owner, user] = await hre.ethers.getSigners();
    const waveStorage = new Map();
    
    // compiles contract & generates necessary files to run contract under artifacts directory
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");

    // Hardhat creates local Ethereum network for each deployment
    // fund the wallet with 0.1 ETH
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
      });

    // wait for contract deployment & gives us address of deployed contract
    await waveContract.deployed();
    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract deployed by:", owner.address);

    // call our wave function
    let waveCount;
    waveCount = await waveContract.getTotalWaves();
    console.log(waveCount.toNumber());

    let contractBalance = await hre.ethers.provider.getBalance(
        waveContract.address
      );
      console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
      );

    /*

    // change the state variable
    let waveTxn = await waveContract.wave("A message!");
    await waveTxn.wait();

    // read the new value of the variable
    waveCount = await waveContract.getTotalWaves();
    waveStorage.set(owner.address, waveCount);
    console.log(waveStorage.get(owner.address));

    // simulating other users hitting our functions
    waveTxn = await waveContract.connect(user).wave();
    await waveTxn.wait();

    waveCount = await waveContract.getTotalWaves();
    waveStorage.set(owner.address, waveCount);
    console.log(waveStorage.get(owner.address));

    */

    let waveTxn = await waveContract.wave("A message!");
    await waveTxn.wait(); // Wait for the transaction to be mined

    const waveTxn2 = await waveContract.wave("This is wave #2");
    await waveTxn2.wait();

    const waveTxn3 = await waveContract.wave("This is wave #3");
    await waveTxn3.wait();

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);

    /*
    const [_, randomPerson] = await hre.ethers.getSigners();
    waveTxn = await waveContract.connect(randomPerson).wave("Another message!");
    await waveTxn.wait(); // Wait for the transaction to be mined
    */


};

const runMain = async () => {
    try{
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();
