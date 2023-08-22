const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/tokenPrices", async (req, res) => {
  const { query } = req;
  // 프론트 tokenList.json에 있는 address(컨트랙트 주소) req
  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne,
  });
  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo,
  });

  //console.log(responseOne.raw);
  //console.log(responseTwo.raw);

  const usdPrices = {
    tokenOne: responseOne.raw.usdPrice,
    tokenTwo: responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice,
  };

  return res.status(200).json(usdPrices);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log("API CALLS");
  });
});
