import React, { useState, useEffect } from "react";
import { Input, Modal } from "antd";
import { ArrowDownOutlined, DownOutlined } from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransaction } from "wagmi";

function Swap(props) {
  const { address, isConnected } = props;
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  // backend에 요청 후 저장할 price
  const [prices, setPrices] = useState(null);
  // transaction 세부 정보
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  // transaction
  const { data, sendTransaction } = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    },
  });

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    // input 존재 && api로 받은 price 존재
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2));
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  // 1번 토큰 클릭하면 changeToken 1로 설정
  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  // token 선택
  function modifyToken(i) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    }
    // 토큰 선택 시 창 닫기
    setIsOpen(false);
  }

  async function fetchPrices(one, two) {
    const res = await axios.get(`http://localhost:3001/tokenPrices`, {
      params: { addressOne: one, addressTwo: two },
    });

    // console.log(res.data);
    setPrices(res.data);
  }

  // tx 보내고 있는지 확인
  // 1inch Network로 지갑에 있는 토큰을 교환하도록 승인받기
  // 1inch Approve API Swagger(https://portal.1inch.dev/documentation/swap/swagger)
  async function fetchDexSwap() {
    const allowance = await axios.get(
      `https://api.1inch.dev/swap/v5.2/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`
    );

    // 허용이 되지 않았다면
    if (allowance.data.allowance === "0") {
      // tx Data get
      const approve = await axios.get(
        `https://api.1inch.dev/swap/v5.2/1/approve/transaction?tokenAddress=${tokenOne.address}`
      );
      setTxDetails(approve.data);
      console.log("not approve");
      return;
    }
    console.log("make swap");
  }

  // API 요청에 따른 결과 변경으로 useEffect로 tokenOne, tokenTwo 설정
  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);

  useEffect(() => {
    if (txDetails.to && isConnected) {
      sendTransaction();
    }
  }, [txDetails]);

  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
        </div>
        <div className="inputs">
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>

          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />

          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>

          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
          <Input
            placeholder="0"
            value={tokenTwoAmount}
            onChange={changeAmount}
            disabled={true}
          />
        </div>
        <div
          className="swapButton"
          disabled={!tokenOneAmount || !isConnected}
          onClick={fetchDexSwap}
        >
          Swap
        </div>
      </div>
    </>
  );
}
export default Swap;
