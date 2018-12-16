import { Basic } from "./Basic";
import { UserBean } from "../beans";
export default class User extends Basic {
    check(user: UserBean): Promise < boolean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.client.methodCall('blogger.getUsersBlogs', [user.appKey, user.user, user.pwd], (error, value) => {
                    if (value && value.length > 0) { // 用户存在
                        res(true);
                    } else { // 用户不存在 
                        res(false);
                    }
                });
            } catch (error) {
                rej(error);
            }
        });
    }
}