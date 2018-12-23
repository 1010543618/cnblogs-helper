import Basic from "./Basic";
import { CategoryInfoBean, UserBean, BlogInfoBean } from "../beans";

export default class Category extends Basic {
    tablename = "CategoryInfo";

    pull(user: UserBean, blog: BlogInfoBean): Promise < boolean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.client.methodCall('metaWeblog.getCategories', [blog.blogid, user.user, user.pwd], (err, value) => {
                    if (err) { rej(err); return; }
                    value = value.map(d => new CategoryInfoBean(d));
                    _this.add(value).then(d => res(true)).catch(e => rej(e));
                });
            } catch (error) {
                rej(error);
            }
        });
    }
}