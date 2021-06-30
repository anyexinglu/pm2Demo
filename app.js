var http = require("http");
var pm2Monitor = require("./pm2Monitor");

pm2Monitor();

var app = http.createServer(function (request, response) {
  // 发送 HTTP 头部
  // HTTP 状态值: 200 : OK
  // 内容类型: text/plain
  response.writeHead(200, { "Content-Type": "text/plain" });

  new Promise((_resove, reject) => {
    console.log(request && request.url, `reject('222222-222')`);
    reject("222222");
  });

  throw new Error("11111111");

  // 发送响应数据 "Hello World"
  response.end("Hello World\n");
});

app.listen(8888).on("error", err => {
  console.log("...listen error", err);
  throw err;
});

// 终端打印如下信息
console.log("Server running at http://127.0.0.1:8888/");
