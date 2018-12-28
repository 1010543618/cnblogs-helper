const path = require('path');
const fs = require('fs');

const config = require("../lib/config/config").default;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.resolve(config.userDataPath, config.dataFolder, config.dbName));
let testDataDir = path.resolve(__dirname, "../tests/testData/");
fs.existsSync(testDataDir) || fs.mkdirSync(testDataDir);
db.each("select * from post limit 10", (e, post) => {
    fs.writeFileSync(path.resolve(testDataDir, post.title + ".md"), post.description);
    console.log("添加：" + post.title + ".md");
});