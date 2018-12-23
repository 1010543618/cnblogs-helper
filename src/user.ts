import User from './models/User';
import Blog from './models/Blog';
import { UserBean } from './beans';
import { sync, call } from './utils/sync';
import usage from "./utils/usage";

const readline = require('readline');

Object.defineProperty(user, "usage", {
    value: usage('user', 'cbh user', null)
})

export default function* user() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let userMap = {
                "cnblogs' username": "user",
                "cnblogs' password": "pwd"
            },
            user = new UserBean(),
            userModel = new User(),
            blogModel = new Blog();

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

        // 用不不存在会抛出异常
        yield call([blogModel, "getFromCB"], user);

        user.isCurrent = 1;
        yield call([userModel, "add"], [user]);
}