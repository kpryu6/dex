const { createProxyMiddleware } = require("http-proxy-middleware");
// .env���� ȯ�溯�� �ε�
require("dotenv").config();

module.exports = function (app) {
  // "/swap" ��� ���Ͽ� ���� ���Ͻ� ���� ���
  app.use(
    "/swap",
    createProxyMiddleware({
      target: "https://api.1inch.dev",
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        // API key�� ��û ����� �߰�
        proxyReq.setHeader(
          "Authorization",
          `Bearer ${process.env.REACT_APP_1INCH_KEY}`
        );
      },
    })
  );
};

/* 
// �̷��� ���� "/swap" ��ο� ���ؼ��� ���Ͻ� ���� ��� only (http://localhost:3000/swap/)
createProxyMiddleware("/swap",{
target: "https://api.1inch.dev",
*/
