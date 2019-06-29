import config from "../config/config"
const fs = require("fs");
const path = require("path");
const os = require("os");
export default function(lvl, message) {
    let logPath = path.resolve(config.userDataPath, config.dataFolder, "cbh.log");
    try {
        message = Array.isArray(message) ? message.join(os.EOL) : message;
        fs.appendFileSync(logPath, `${lvl}:${message}${os.EOL}`);
    } catch (err) {
        return err;
    }
    return true;
}