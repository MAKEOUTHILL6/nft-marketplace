const { network, ethers } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chaindId = network.config.chainId;

    // if there is no constructor leave it blank, else fill the params in the helper hardhat config
    const args = [];

    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log("Verifying...");
        await verify(nftMarketplace.address, args);
    }
    console.log(".................");
};

module.exports.tags = ["all", "nftmarketplace"];
