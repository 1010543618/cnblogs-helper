import Basic from "./Basic";
import { UserBean, BlogInfoBean, PostBean } from "../beans";
export default class Post extends Basic {
    tablename = "Post";

    pull(blog: BlogInfoBean, user: UserBean): Promise < boolean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.client.methodCall('metaWeblog.getRecentPosts', [blog.blogid, user.user, user.pwd, 200], (err, value) => {
                    if (err) { rej(err); return; }
                    value = value.map(d => new PostBean(d));
                    _this.add(value).then(d => res(true)).catch(e => rej(e));
                });
            } catch (error) {
                rej(error);
            }
        });
    }
}