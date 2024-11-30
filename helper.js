exports.getPoolImmutables = async (poolContract) => {
    console.log("getPoolImmutables");
    console.log(poolContract);
    const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee()
    ])

    const immutables = {
        token0: token0,
        token1: token1,
        fee: fee
    }
    return immutables
}

exports.getPoolState = async (poolContract) => {
    console.log("getPoolState");
    console.log(poolContract);
    const [slot0, liquidity] = await Promise.all([
        poolContract.slot0(),
        poolContract.liquidity(),
    ])

    const state = {
        sqrtPriceX96: slot0[0],
        liquidity: liquidity,
    }

    return state
}

// https://blog.uniswap.org/uniswap-v3-math-primer
exports.getPrice = async (sqrtPriceX96, token0, token1) => {
    sqrtPriceX96 = sqrtPriceX96.toString()
    let decimal0 = token0.decimals;
    let decimal1 = token1.decimals;

    const buyOneOfToken0 = (((sqrtPriceX96 / 2**96)**2) / (10**decimal1 / 10**decimal0)).toFixed(decimal1);

    const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(decimal0);
    console.log(`price of ${token0.name} in value of ${token1.name}: ${buyOneOfToken0}`);
    console.log(`price of ${token1.name} in value of ${token0.name}: ${buyOneOfToken1}`);
    const result = {
        token0InValueOfToken1: buyOneOfToken0,
        token1InValueOfToken0: buyOneOfToken1,
    }
    return result;
}