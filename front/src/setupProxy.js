const { createProxyMiddleware } = require("http-proxy-middleware");
// .env���� ȯ�溯�� �ε�
require("dotenv").config();

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/swap", {
      target: "https://api.1inch.dev",
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        // API key�� ��û ����� �߰�
        proxyReq.setHeader(
          "Authorization",
          `Bearer ${process.env.REACT_APP_1INCH_KEY}`
        );
      },
    })
  );
};
