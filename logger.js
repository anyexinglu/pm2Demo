const fs = require("fs");
const prefix = "pm2监控";

const loggerFileName = "log.txt";
const logger = msg => {
  let info = JSON.stringify({ level: "error", msg: `${prefix}输出-${msg}` });
  console.log(info);
  let beforeInfo = "";
  try {
    beforeInfo = fs.readFileSync(loggerFileName, "utf8");
  } catch (e) {}

  fs.writeFileSync(loggerFileName, beforeInfo + "/n" + info);
};

// console.log("...logger", logger("test"));

module.exports = logger;
