import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction } from "wagmi";

function Swap(props) {
  const { address, isConnected } = props;
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();
  // backend에 요청 후 저장할 price
  const [prices, setPrices] = useState(null);
  // transaction 세부 정보
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  // Slippage : 주문한 가격과 실제 체결된 가격사이의 차이
  // 가격이 큰 주문을 처리할 때 Slippage가 늘어날 가능성이 큼
  // 하지만 Slippage를 0으로 가깝게 설정할 수록(거래를 빨리 처리해야하니까) 가스비가 올라감
  // 가스비와 거래속도 사이에 적절한 균형을 맞출 필요가 있음.
  // 거래 규모에 따라 Slippage Tolerance의 차이가 커질수록 가스비 차이도 커짐
  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  // transaction
  // wagmi 계속 Update하니까 확인하기
  const { data, sendTransaction } = useSendTransaction({
    from: address,
    to: String(txDetails.to),
    data: String(txDetails.data),
    value: String(txDetails.value),
  });

  // https://wagmi.sh/react/hooks/useSendTransaction#return-value
  const { isLoading, isSuccess } = useSendTransaction({
    hash: data?.hash,
  });

  // input에 사용자가 value값 변경하면 실행
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
    const res = await axios.get(`http://localhost:3001/tokenPrice`, {
      params: { addressOne: one, addressTwo: two },
    });

    console.log(res.data);
    setPrices(res.data);
  }

  // tx 보내고 있는지 확인
  // 1inch Network로 지갑에 있는 토큰을 교환하도록 승인받기
  // 1inch Approve API Swagger(https://portal.1inch.dev/documentation/swap/swagger)
  // 1inch Aggregator : 주문에서 Slippage를 최소화하고, Swap gas비와 토큰 가격을 최적화함. 가능한 최고의 가격을 최단 시간내에 제공.
  async function fetchDexSwap() {
    const allowance = await axios.get(
      // 허용 여부 확인
      // 1inch 라우터가 사용할 수 있는 토큰 양 가져오기
      `/swap/v5.2/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`
    );
    console.log(allowance.data);

    // 허용이 되지 않았다면 1inch router가 토큰을 허용할 수 있도록 토큰에 대한 정보 부르기
    if (allowance.data.allowance === "0") {
      // tx Data get
      const approve = await axios.get(
        // 토큰 access를 위한 거래 세부정보 가져오기 & 토큰 무한으로 사용 허용
        // /allowance 를 여기서 정해주기
        `/swap/v5.2/1/approve/transaction?tokenAddress=${tokenOne.address}`
      );
      setTxDetails(approve.data);
      console.log(txDetails);
      console.log("not approve");
      return;
    }

    console.log("make swap");

    // "hello".padEnd(10, "0") => "hello00000" (10글자 만들기)
    // Error 429 (Too many request) 로 setTimeout으로 속도 줄여주기
    setTimeout(async () => {
      const tx = await axios.get(
        `/swap/v5.2/1/swap?src=${tokenOne.address}&dst=${
          tokenTwo.address
        }&amount=${tokenOneAmount.padEnd(
          tokenOne.decimals + tokenOneAmount.length,
          "0"
        )}&from=${address}&slippage=${slippage}`
      );

      /* Decimal 사용 이유
       * 이더리움 블록체인에는 토큰 거래에 wei라는 단위를 사용한다고 함.
       * 1ETH = 10^18(uint256) wei = 1e18 wei
       * decimals = 해당 토큰의 소수점 자리 수 유효허용치
       * decimal이 18인 경우 소수점 18자리 수까지 유효한 수량
       * 1USDC = 1e6 wei = 10^6(uint256) wei
       */

      // tokenTwo.decimal이 6이라면 1E${tokenTwo.decimals}는 10의 6제곱
      // Number은 숫자로 변환하겠다고 명시적으로 쓴거
      let decimals = Number(`1E${tokenTwo.decimals}`);
      // toAmount는 바꾸려고 하는 토큰의 양
      // toFixed(2) : 소수 둘째자리 까지만 표현
      setTokenTwoAmount((Number(tx.data.toAmount) / decimals).toFixed(2));
      console.log(decimals);
      console.log(tokenTwoAmount);
      console.log("ST : ", slippage);
      console.log(tx.data);
      setTxDetails(tx.data.tx);
    }, 1000);
  }

  // 컴포넌트가 처음 마운트될 때 한번 실행
  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);

  // sendTransaction 실행 조건
  // txDetails가 변경될 때마다 useEffect 실행
  useEffect(() => {
    if (txDetails.to && isConnected) {
      sendTransaction();
    }
  }, [txDetails]);

  // loading
  useEffect(() => {
    messageApi.destroy();

    if (isLoading) {
      messageApi.open({
        type: "loading",
        content: "Transaction is Pending...",
        duration: 0,
      });
    }
  }, [isLoading]);

  // success || failed
  useEffect(() => {
    messageApi.destroy();

    if (isSuccess) {
      messageApi.open({
        type: "success",
        content: "Transaction Successful",
        duration: 1.5,
      });
    } else if (txDetails.to) {
      messageApi.open({
        type: "error",
        content: "Transaction Failed",
        duration: 1.5,
      });
    }
  }, [isSuccess]);

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
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
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
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
            id="input"
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
