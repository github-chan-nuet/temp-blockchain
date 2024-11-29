const { Contract, JsonRpcProvider, ethers} = require('ethers');

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
    name: "TSwizzlev2",
    symbol: "TSWv2",
    decimals: 18,
    address: "0x857f8798037120cd117a0aF9cf17B193B6d0c89A",
    contract: new ethers.Contract("0x857f8798037120cd117a0aF9cf17B193B6d0c89A", ERC20_ABI, provider),
};

const anjaCoin = {
    name: "AnjaCoin",
    symbol: "KING",
    decimals: 18,
    address: "0x7d1c011Ca250abfA2D01056cAe50052656e73263",
    contract: new ethers.Contract("0x7d1c011Ca250abfA2D01056cAe50052656e73263", ERC20_ABI, provider),
}

const wallet = new ethers.Wallet(WALLET_SECRET);
const swapRouterContract = new ethers.Contract(swapRouterAddress, SwapRouterABI, provider);

async function getPoolAddress(firstCoinAddress, secondCoinAddress) {
    const factoryAddress = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'

    const factoryContract = new Contract(
        factoryAddress,
        UniswapV3Factory,
        provider
    )

    const poolAddress = await factoryContract.getPool(firstCoinAddress, secondCoinAddress, 100) // 100 = 0.01%
    console.log('poolAddress', poolAddress)
    return poolAddress
}

async function swap(inToken, amountIn){
    amountIn = BigInt(amountIn);
    if (inToken === "taylor") {
        await executeSwap(taylorCoin, anjaCoin, amountIn);
    } else {
        await executeSwap(anjaCoin, taylorCoin, amountIn);
    }
}

async function executeSwap(inToken, outToken, amountIn) {
    // const amountIn = (10n**18n) * 10n;
    // const poolAddress = await getPoolAddress(address0, address1);
    // const poolAddress = "0xbb2f92B093d5Ba9Cca2d41f81C1b5F03C5eF6B82";
    //
    // const poolContract = new ethers.Contract(
    //     poolAddress,
    //     IUniswapV3PoolABI,
    //     provider
    // )

    const connectedWallet = wallet.connect(provider)
    const approvalAmount = (amountIn * 100n).toString(10);

    const approvalResponse = await inToken.contract.connect(connectedWallet).approve(
        swapRouterAddress,
        approvalAmount
    );
    const approvalReceipt = await approvalResponse.wait();
    console.log(approvalReceipt);

    const params = {
        tokenIn: inToken.address,
        tokenOut: outToken.address,
        fee: 100n,
        recipient: WALLET_ADDRESS,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }

    const exactInputResponse = await swapRouterContract.connect(connectedWallet).exactInputSingle(params,
        { gasLimit: BigInt(10000000n)});
    console.log(exactInputResponse);
    const receipt = await exactInputResponse.wait();
    console.log(receipt);
}

module.exports = {
    swap
};
