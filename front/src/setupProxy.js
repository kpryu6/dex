const { createProxyMiddleware } = require("http-proxy-middleware");
// .env에서 환경변수 로드
require("dotenv").config();

module.exports = function (app) {
  // "/swap" 경로 이하에 대해 프록시 서버 사용
  app.use(
    "/swap",
    createProxyMiddleware({
      target: "https://api.1inch.dev",
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        // API key를 요청 헤더에 추가
        proxyReq.setHeader(
          "Authorization",
          `Bearer ${process.env.REACT_APP_1INCH_KEY}`
        );
      },
    })
  );
};

/* 
// 이렇게 쓰면 "/swap" 경로에 대해서만 프록시 서버 사용 only (http://localhost:3000/swap/)
createProxyMiddleware("/swap",{
target: "https://api.1inch.dev",
*/
