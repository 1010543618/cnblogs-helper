import Basic from "./Basic";
import { UserBean, BlogInfoBean, PostBean } from "../beans";
export default class Post extends Basic < PostBean > {
    tablename = "Post";
    pull(blog: BlogInfoBean, user: UserBean, num: Number): Promise < boolean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.client.methodCall('metaWeblog.getRecentPosts', [blog.blogid, user.user, user.pwd, num], (err, value) => {
                    if (err) { rej(err); return; }
                    value = value.map(d => new PostBean(d));
                    _this.add(value).then(d => res(true)).catch(e => rej(e));
                });
            } catch (error) {
                rej(error);
            }
        });
    };

    // addOrEdit(): Promise < boolean > {

    // };

    push(blog: BlogInfoBean, user: UserBean, posts: Array < PostBean > ): Promise < boolean > {
        var _this = this;
        return new Promise((res, rej) => {
            try {
                _this.client.methodCall('metaWeblog.getRecentPosts', [blog.blogid, user.user, user.pwd], (err, value) => {
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