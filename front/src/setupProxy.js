const { createProxyMiddleware } = require("http-proxy-middleware");
// .env에서 환경변수 로드
require("dotenv").config();

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/swap", {
      target: "https://api.1inch.dev",
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        // API key를 요청 헤더에 추가
        proxyReq.setHeader(
          "Authorization",
          `Bearer ${process.env.REACT_APP_1INCH_KEY}`
        );
      },
    })
  );
};
