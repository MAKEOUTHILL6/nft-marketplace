const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMarketplace Unit Tests", () => {
          let nftMarketplace, deployer, player, basicNft;
          const PRICE = ethers.utils.parseEther("0.1");
          const UPDATE_PRICE = ethers.utils.parseEther("0.2");
          const TOKEN_ID = 0;

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              //   player = (await getNamedAccounts()).player;

              const accounts = await ethers.getSigners();
              player = accounts[1];
              await deployments.fixture(["all"]);
              nftMarketplace = await ethers.getContract("NftMarketplace");
              basicNft = await ethers.getContract("BasicNft");
              await basicNft.mintNft();
              await basicNft.approve(nftMarketplace.address, TOKEN_ID);
          });

          it("lists and can be bought", async () => {
              await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
              const playerConnected = await nftMarketplace.connect(player);
              await playerConnected.buyItem(basicNft.address, TOKEN_ID, {
                  value: PRICE,
              });
              const newOwner = await basicNft.ownerOf(TOKEN_ID);
              const deployerProceeds = await nftMarketplace.getProceeds(
                  deployer
              );
              assert(newOwner.toString() == player.address);
              assert(deployerProceeds.toString() == PRICE.toString());
          });

          it("cancels a listing", async () => {
              await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
              await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
              const currentListing = await nftMarketplace.getListing(
                  basicNft.address,
                  TOKEN_ID
              );
              assert(
                  currentListing.seller ==
                      "0x0000000000000000000000000000000000000000"
              );
          });

          it("updates a listing", async () => {
              const listedItem = await nftMarketplace.listItem(
                  basicNft.address,
                  TOKEN_ID,
                  PRICE
              );

              await nftMarketplace.updateListing(
                  basicNft.address,
                  TOKEN_ID,
                  UPDATE_PRICE
              );
              const currentListing = await nftMarketplace.getListing(
                  basicNft.address,
                  TOKEN_ID
              );
              assert(currentListing.price.toString() == UPDATE_PRICE);
          });

          it("withdraws proceeds", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await nftMarketplace.connect(player.address);
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {value: PRICE});
            const currentBalance = await nftMarketplace.getProceeds(deployer);
            assert(currentBalance.toString() == PRICE.toString());
          })
      });
