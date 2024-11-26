// yt: https://www.youtube.com/watch?v=vXu5GeLP6A8
// github: https://gist.github.com/BlockmanCodes/1ed5e4b3cd597f02e539049c3473f7b3


// const { ethers} = require('ethers');
import { Contract, JsonRpcProvider, ethers  } from 'ethers';
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const { abi: UniswapV3Factory } = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json')
const { abi: SwapRouterABI} = require('./SwapRouterAbi.json');
const { getPoolImmutables, getPoolState } = require('./helper');


const ERC20ABI = require('./abi.json');

require('dotenv').config()
const INFURA_URL_TESTNET = process.env.INFURA_URL_TESTNET
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const WALLET_SECRET = process.env.WALLET_SECRET

const provider = new JsonRpcProvider(INFURA_URL_TESTNET)

async function getPoolAddress(address0, address1) {
    const factoryAddress = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'

    const factoryContract = new Contract(
        factoryAddress,
        UniswapV3Factory,
        provider
    )

    const poolAddress = await factoryContract.getPool(address0, address1, 100) // 100 = 0.1%
    console.log('poolAddress', poolAddress)
    return poolAddress
}


// const test = new ethers.providers.AlchemyProvider()

const swapRouterAddress = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E'

const name0 = "TSwizzle"
const symbol0 = "TSW"
const decimals0 = 18
const address0 = '0x6ba018638402a84d128e90d9d511f4cd692a5c24'

const name1 = 'AnjaCoin'
const symbol1 = 'KING'
const decimals1 = 18
const address1 = '0x7d1c011Ca250abfA2D01056cAe50052656e73263'

async function main() {
    // const poolAddress = await getPoolAddress(address0, address1);
    const poolAddress = "0xbb2f92B093d5Ba9Cca2d41f81C1b5F03C5eF6B82";

    const poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
    )

    const immutables = await getPoolImmutables(poolContract)
    const state = await getPoolState(poolContract)

    const wallet = new ethers.Wallet(WALLET_SECRET)
    const connectedWallet = wallet.connect(provider)

    const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
    )

    // 0.001
    // const inputAmount = 0.001
    // // .001 => 1 000 000 000 000 000
    // const amountIn = ethers.utils.parseUnits(
    //     inputAmount.toString(),
    //     decimals0
    // )

    const amountIn = BigInt("100000000000000000000");

    const approvalAmount = (amountIn * 100n).toString(10);
    const tokenContract0 = new ethers.Contract(
        address0,
        ERC20ABI,
        provider
    );
    const ether = new ethers.Contract(
        '0xc778417e063141139fce010982780140aa0cd5ab',
        ERC20ABI,
        provider
    );



    const approvalResponse = await tokenContract0.connect(connectedWallet).approve(
        swapRouterAddress,
        approvalAmount
    );
    console.log("approval:");
    console.log(approvalResponse);
    const approvalReceit = await approvalResponse.wait();
    console.log("approvalReceit:");
    console.log(approvalReceit);

    const params = {
        tokenIn: immutables.token0,
        tokenOut: immutables.token1,
        fee: immutables.fee,
        recipient: WALLET_ADDRESS,
        // deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }

    const transaction = await swapRouterContract.connect(connectedWallet).exactInputSingle(params,
        { gasLimit: BigInt("1000000")});
    console.log(transaction);
    const receipt = await transaction.wait();
    console.log(receipt);
}

main();