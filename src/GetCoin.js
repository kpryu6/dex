import React, { useState, useEffect } from "react";

function GetCoin() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
        {
          headers: {
            "X-CMC_PRO_API_KEY": process.env.REACT_APP_COIN_API_KEY,
          },
        }
      );

      const data = await response.json();
      setCoins(data.data);
    };
    fetchData();
  }, []);

  return (
    <div>
      {coins.map((coin) => (
        <div>
          <h1>{coin.name}</h1>
          <p>{coin.symbol}</p>
          <p>{coin.quote.USD.price}</p>
        </div>
      ))}
    </div>
  );
}
export default GetCoin;
