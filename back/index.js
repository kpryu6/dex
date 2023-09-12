// 토큰의 address를 받아서 가격을 얻기 위한 backend
const express = require("express");
const Moralis = require("moralis").default;
const app = express();
// 외부에서 서버로 요청 보낼 수 있도록 함
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

// Swap.js의 req에 대한 res
app.get("/tokenPrice", async (req, res) => {
  // 클라이언트에서 서버로 데이터 전달할 때 query 사용
  const { query } = req;

  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne,
  });

  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo,
  });

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
    console.log(`Listening for API Calls`);
  });
});
