import Basic from "./Basic";
import { UserBean } from "../beans";
export default class User extends Basic < UserBean > {
    tablename = "User";
    bean = UserBean;
    getCurrent(): Promise < UserBean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.db.get("select * from User where isCurrent = 1", (err, row) => {
                    if (err) { rej(err); return; }
                    res(new UserBean(row));
                });
            } catch (error) {
                rej(error);
            }
        });
    }
}