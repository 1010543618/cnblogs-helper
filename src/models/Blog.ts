import Basic from "./Basic";
import { UserBean, BlogInfoBean } from "../beans";
export default class Blog extends Basic {
    tablename = "BlogInfo";
    getFromCB(user: UserBean): Promise < BlogInfoBean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.client.methodCall('blogger.getUsersBlogs', [user.appKey, user.user, user.pwd], (err, value) => {
                    if (err) { rej(err); return; }
                    res(new BlogInfoBean(value[0]));
                });
            } catch (error) {
                rej(error);
            }
        });
    }
    getCurrent(): Promise < BlogInfoBean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.db.get("select * from User where isCurrent = 1", (err, row) => {
                    if (err) { rej(err); return; }
                    res(new BlogInfoBean(row));
                });
            } catch (error) {
                rej(error);
            }
        });
    }
}