import config from './config';
import User from './models/User';
import { UserBean } from './beans';
import { sync, call } from './utils/sync';

const fs = require('fs');
const readline = require('readline');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();

sync(function*() {
    const dataFolderPath = path.resolve(config.userDataPath, config.dataFolder);
    fs.existsSync(dataFolderPath) || fs.mkdirSync(dataFolderPath);
    const db = new sqlite3.Database(path.resolve(dataFolderPath, config.dbName));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let userMap = {
            "cnblogs' username": "user",
            "cnblogs' password": "pwd"
        },
        user = new UserBean(),
        userModel = new User();

    db.exec(fs.readFileSync(path.resolve(__dirname, "./init.sql")).toString());

    // db.all("SELECT tbl_name FROM sqlite_master WHERE type = 'table';", (err: any, row: object[]) => {
    //     console.log(row);
    // });

    for (const key in userMap) {
        if (userMap.hasOwnProperty(key)) {
            user[userMap[key]] = yield new Promise((res, rej) => {
                rl.question(`${key}：`, (answer) => {
                    res(answer);
                });
            })
        }
    }

    rl.close();

    if (!user.user || !user.pwd) {
        return;
    }

    var test = yield call([userModel, "check"], user);
})
