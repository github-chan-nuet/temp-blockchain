const express = require("express");
const {swap} = require("./uniswapTrader.js");


const app = express();
// const port = process.env.SWAPPER_HTTP_PORT;
const port = 3333;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/swap', async (req, res) => {
    const {inToken, amountIn} = req.body;
    console.log(inToken, amountIn);
    try {
        await swap(inToken, amountIn);
        res.status(200).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error
        });
    }
});

app.listen(port, () => {
    console.log(`Swapper listening on port ${port}`)
});
