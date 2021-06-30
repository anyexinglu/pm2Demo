module.exports = function pm2Monitor() {
  const globalPM2 = require("pm2");
  const prefix = "pm2监控";
  const logger = msg => {
    console.log(
      JSON.stringify({ level: "error", msg: `${prefix}输出-${msg}` })
    );
  };

  globalPM2.connect((ex, meta) => {
    // https://pm2.io/docs/runtime/reference/pm2-programmatic/#programmatic-api
    stopIfEx(ex, meta);

    globalPM2.launchBus((ex, bus) => {
      stopIfEx(ex);

      /**
       * https://github.com/Unitech/pm2/blob/master/lib/ProcessContainerLegacy.js#L292-L293
       * PM2 遇到未捕捉的异常，上报监控。如：
       * process:exception{"process":{"namespace":"default","rev":null,"name":"mobile-marketing-ssr","pm_id":2},"data":{"0":"2","1":"2","2":"2","3":"2","4":"2","5":"2","length":6},"at":1624088338364}
       */
      bus.on("process:exception", data => {
        // 将 "data":{"0":"2","1":"2","2":"2","3":"2","4":"2","5":"2","length":6} 还原为原字符串 222222
        let guessMsg = "";
        if (data && typeof data.data === "object" && data.data.length) {
          guessMsg = Object.entries(data.data)
            .filter(item => item[0] !== "length")
            .map(item => item[1])
            .join("");
        }
        const msg =
          `捕捉到未知的异常。${
            guessMsg ? "可能的错误信息：" + guessMsg : ""
          } 完整信息：` + JSON.stringify(data);
        logger(msg);
      });

      bus.on("process:event", data => {
        const event = data && data.event;
        if (event === "exit") {
          /**
           * PM2 中 exit 事件：https://github.com/Unitech/pm2/blob/master/lib/God.js#L437
           * 形如：process:event{"at":1624098667295,"process":{一大堆信息,"exit_code":7},"manually":false,"event":"exit"}
           */
          const simpleInfo = {
            event,
            manually: data && data.manually,
            exit_code: data && data.process && data.process.exit_code,
          };
          const msg = `捕捉到进程退出。${JSON.stringify(
            simpleInfo
          )}，完整信息：${JSON.stringify(data)}`;
          logger(msg);
        } else if (event === "restart overlimit") {
          /**
           * PM2 中 restart overlimit 事件：https://github.com/Unitech/pm2/blob/master/lib/God.js#L428
           */
          const simpleInfo = {
            event,
            status: data && data.process && data.process.status,
            unstable_restarts:
              data && data.process && data.process.unstable_restarts,
          };
          const msg = `捕捉到重启次数太多。${JSON.stringify(
            simpleInfo
          )}，完整信息：${JSON.stringify(data)}`;
          logger(msg);
        }
      });

      /**
       * PM2 中的 console.log 信息，具体有：
       * 1、disconnected：https://github.com/Unitech/pm2/blob/1def3d8fb96823ab157b62d3b677f528a2223f48/lib/God.js#L267
       * 如：
       * log:PM2{"data":"App name:mobile-marketing-ssr id:2 disconnected\n","at":1624088338394,"process":{"rev":null,"name":"PM2","pm_id":"PM2"}}
       *
       * 2、exited with code：https://github.com/Unitech/pm2/blob/1def3d8fb96823ab157b62d3b677f528a2223f48/lib/God.js#L365
       * 如：
       * log:PM2{"data":"App [mobile-marketing-ssr:2] exited with code [7] via signal [SIGINT]\n","at":1624088338394,"process":{"rev":null,"name":"PM2","pm_id":"PM2"}}
       *
       * 3、will restart in：https://github.com/Unitech/pm2/blob/1def3d8fb96823ab157b62d3b677f528a2223f48/lib/God.js#L463
       * 如：
       * log:PM2{"data":"App [mobile-marketing-ssr:2] will restart in 1000ms\n","at":1624088338395,"process":{"rev":null,"name":"PM2","pm_id":"PM2"}}
       *
       * 4、had too many unstable restarts：https://github.com/Unitech/pm2/blob/1def3d8fb96823ab157b62d3b677f528a2223f48/lib/God.js#L423
       * 如：
       * log:PM2{"data":"App [mobile-marketing-ssr:2] had too many unstable restarts (10). Stopped. "errored"
       *
       * 5、Reset the restart delay：https://github.com/Unitech/pm2/blob/master/lib/Worker.js#L169
       * 如：
       * log:PM2{"data":"[PM2][WORKER] Reset the restart delay, as app mobile-marketing-ssr has been up for more than 30000ms\n"
       */
      bus.on("log:PM2", data => {
        let msg = `输出日志信息：` + JSON.stringify(data);
        // 捕捉 will restart
        if (msg.indexOf("will restart") >= 0) {
          msg = "捕捉到 server 即将重启。" + msg;
          logger(msg);
        } else {
          logger(msg);
        }
      });

      /**
       * PM2 中的 log:err，输出 sever 遇到的 console.error 信息到日志平台，不上报监控。如：
       * log:err{"process":{"namespace":"default","rev":null,"name":"mobile-marketing-ssr","pm_id":2},"data":"\n222222\n","at":1624088338365}
       * log:err{"data":"[2021-06-19 16:57:46] [1.2.3] [error] [72] websocket client has been closed
       */
      bus.on("log:err", data => {
        const msg = `输出错误信息：` + JSON.stringify(data);
        logger(msg);
      });
    });
  });

  function stopIfEx(ex, meta) {
    if (ex) {
      const simpleInfo = {
        message: (ex && ex.message) || "未知原因",
        errorString: String(ex),
        errorObject: ex,
      };
      const msg = `捕捉到异常，server即将断开连接并退出。${JSON.stringify(
        simpleInfo
      )}, 完整信息：${meta}`;
      logger(msg);
      globalPM2.disconnect();
      process.exit(1);
    }
  }
};
