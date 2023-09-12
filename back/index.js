// ��ū�� address�� �޾Ƽ� ������ ��� ���� backend
const express = require("express");
const Moralis = require("moralis").default;
const app = express();
// �ܺο��� ������ ��û ���� �� �ֵ��� ��
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

// Swap.js�� req�� ���� res
app.get("/tokenPrice", async (req, res) => {
  // Ŭ���̾�Ʈ���� ������ ������ ������ �� query ���
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
