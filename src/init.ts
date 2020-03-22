import { blogGen } from "./blog";
import { categoryGen } from "./category";
import { pullPostGen } from "./post";
import { sync } from "./utils/sync";
import usage from "./utils/usage";
import { userGen } from "./user";
import cbh from "./cbh";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

Object.defineProperty(init, "usage", {
  value: usage(
    "init",
    `cbh init [--reset]
初始化博客园随笔同步工具
参数：
    --reset : 删除原有数据库，重新初始化`,
    null
  )
});

export default function init(argv, cb) {
  sync(initGen, [cbh.config.get("opts").reset], cb);
}

export function* initGen(reset) {
  const dataFolderPath = path.resolve(
    cbh.config.userDataPath,
    cbh.config.dataFolder
  );
  fs.existsSync(dataFolderPath) || fs.mkdirSync(dataFolderPath);
  const dbpath = path.resolve(dataFolderPath, cbh.config.dbName);
  // TODO: reset
  // reset && fs.existsSync(dbpath) && fs.unlinkSync(dbpath);
  const db = new sqlite3.Database(dbpath);

  yield new Promise((res, rej) => {
    db.exec(
      fs.readFileSync(path.resolve(__dirname, "./init.sql")).toString(),
      error => {
        if (error) {
          rej(error);
          return;
        }
        // db.all("SELECT tbl_name FROM sqlite_master WHERE type = 'table';", (err: any, row: object[]) => {
        //     console.log(row);
        // });
        res();
      }
    );
  });

  yield* userGen(cbh.config.opts.username, cbh.config.opts.password);
  yield* blogGen();
  yield* categoryGen();
  yield* pullPostGen(999);
  console.log("Successful initialization!");
  return true;
}
