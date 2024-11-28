import { Contract, JsonRpcProvider, ethers  } from 'ethers';
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const { abi: UniswapV3Factory } = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json')
const { abi: SwapRouterABI} = require('./SwapRouterAbi.json');
const ERC20_ABI = require('./ERC20_ABI.json');

require('dotenv').config()
const INFURA_URL_TESTNET = process.env.INFURA_URL_TESTNET
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const WALLET_SECRET = process.env.WALLET_SECRET

const provider = new JsonRpcProvider(INFURA_URL_TESTNET)
const swapRouterAddress = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E'

const taylorCoin = {
    name: "TSwizzle",
    symbol: "TSW",
    decimals: 18,
    address: "0x6ba018638402a84d128e90d9d511f4cd692a5c24",
    contract: new ethers.Contract("0x6ba018638402a84d128e90d9d511f4cd692a5c24", ERC20_ABI, provider),
};

const anjaCoin = {
    name: "AnjaCoin",
    symbol: "KING",
    decimals: 18,
    address: "0x7d1c011Ca250abfA2D01056cAe50052656e73263",
    contract: new ethers.Contract("0x7d1c011Ca250abfA2D01056cAe50052656e73263", ERC20_ABI, provider),
}

async function getPoolAddress(firstCoinAddress, secondCoinAddress) {
    const factoryAddress = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'

    const factoryContract = new Contract(
        factoryAddress,
        UniswapV3Factory,
        provider
    )

    const poolAddress = await factoryContract.getPool(firstCoinAddress, secondCoinAddress, 100) // 100 = 0.1%
    console.log('poolAddress', poolAddress)
    return poolAddress
}

async function main() {
    // const poolAddress = await getPoolAddress(address0, address1);
    // const poolAddress = "0xbb2f92B093d5Ba9Cca2d41f81C1b5F03C5eF6B82";
    //
    // const poolContract = new ethers.Contract(
    //     poolAddress,
    //     IUniswapV3PoolABI,
    //     provider
    // )

    const wallet = new ethers.Wallet(WALLET_SECRET)
    const connectedWallet = wallet.connect(provider)

    const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
    )

    const amountIn = (10n**18n) * 10n;
    const approvalAmount = (amountIn * 100n).toString(10);


    const approvalResponse = await taylorCoin.contract.connect(connectedWallet).approve(
        swapRouterAddress,
        approvalAmount
    );
    console.log("approval:");
    console.log(approvalResponse);
    const approvalReceit = await approvalResponse.wait();
    console.log("approvalReceit:");
    console.log(approvalReceit);

    const params = {
        tokenIn: taylorCoin.address,
        tokenOut: anjaCoin.address,
        fee: 100n,
        recipient: WALLET_ADDRESS,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }

    const transaction = await swapRouterContract.connect(connectedWallet).exactInputSingle(params,
        { gasLimit: BigInt(1000000n)});
    console.log(transaction);
    const receipt = await transaction.wait();
    console.log(receipt);
}

main();