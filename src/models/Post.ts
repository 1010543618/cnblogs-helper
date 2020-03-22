import Basic from "./Basic";
import { UserBean, BlogInfoBean, PostBean } from "../beans";
export default class Post extends Basic<PostBean> {
  tablename = "Post";
  bean = PostBean;
  getCB(
    blog: BlogInfoBean,
    user: UserBean,
    num: Number
  ): Promise<Array<PostBean>> {
    var _this = this;
    return new Promise((res, rej) => {
      try {
        _this.client.methodCall(
          "metaWeblog.getRecentPosts",
          [blog.blogid, user.user, user.pwd, num],
          (err, value) => {
            if (err) {
              rej(err);
              return;
            }
            res(value.map(d => new PostBean({ ...d, p_state: "latest" })));
          }
        );
      } catch (error) {
        rej(error);
      }
    });
  }

  addCB(blog: BlogInfoBean, user: UserBean, post: PostBean): Promise<boolean> {
    var _this = this;
    post = post.getCBParas().removeEmpty();
    return new Promise((res, rej) => {
      try {
        _this.client.methodCall(
          "metaWeblog.newPost",
          [blog.blogid, user.user, user.pwd, post, true],
          (err, value) => {
            if (err) {
              rej(err);
              return;
            }
            res(value);
          }
        );
      } catch (error) {
        rej(error);
      }
    });
  }

  editCB(
    user: UserBean,
    post: PostBean,
    publish: Boolean = true
  ): Promise<boolean> {
    var _this = this;
    post = post.getCBParas().removeEmpty();
    return new Promise((res, rej) => {
      try {
        _this.client.methodCall(
          "metaWeblog.editPost",
          [post.postid, user.user, user.pwd, post, publish],
          (err, value) => {
            if (err) {
              rej(err);
              return;
            }
            res(value);
          }
        );
      } catch (error) {
        rej(error);
      }
    });
  }

  deleteCB(user: UserBean, post: PostBean): Promise<boolean> {
    var _this = this;
    return new Promise((res, rej) => {
      try {
        post = post.getCBParas().removeEmpty();
        _this.client.methodCall(
          "blogger.deletePost",
          [user.appKey, post.postid, user.user, user.pwd, false],
          (err, value) => {
            if (err) {
              rej(err);
              return;
            }
            res(value);
          }
        );
      } catch (error) {
        rej(error);
      }
    });
  }
}
