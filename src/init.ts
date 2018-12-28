import { blogGen } from './blog';
import { categoryGen } from './category';
import { pullPostGen } from './post';
import { sync } from './utils/sync';
import usage from "./utils/usage";
import { userGen } from './user';
import cbh from './cbh';

const fs = require('fs');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();

Object.defineProperty(init, "usage", {
    value: usage('init', 'cbh init', null)
})

export default function init() {
    sync(initGen);
}

export function* initGen() {
    const dataFolderPath = path.resolve(cbh.config.userDataPath, cbh.config.dataFolder);
    fs.existsSync(dataFolderPath) || fs.mkdirSync(dataFolderPath);
    const db = new sqlite3.Database(path.resolve(dataFolderPath, cbh.config.dbName));

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

    yield* userGen();
    yield* blogGen();
    yield* categoryGen();
    yield* pullPostGen(10);
    yield "Successful initialization!";
}