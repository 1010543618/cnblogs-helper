import config from './config/config';
import blog from './blog';
import category from './category';
import post from './post';
import { sync } from './utils/sync';
import usage from "./utils/usage";
import user from './user';

const fs = require('fs');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();

Object.defineProperty(init, "usage", {
    value: usage('init', 'cbh init', null)
})

sync(init);

export default function* init() {
    const dataFolderPath = path.resolve(config.userDataPath, config.dataFolder);
    fs.existsSync(dataFolderPath) || fs.mkdirSync(dataFolderPath);
    const db = new sqlite3.Database(path.resolve(dataFolderPath, config.dbName));

    yield new Promise((res, rej) => {
        db.exec(fs.readFileSync(path.resolve(__dirname, "./init.sql")).toString(),
            (error) => {
                if (error) { rej(error); return; }
                // db.all("SELECT tbl_name FROM sqlite_master WHERE type = 'table';", (err: any, row: object[]) => {
                //     console.log(row);
                // });
                res();
            });
    });

    yield* user();
    yield* blog();
    yield* category();
    yield* post();
    yield "Successful initialization!";
}