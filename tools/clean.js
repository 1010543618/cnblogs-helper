const cbh = require("../lib/cbh").default;
const { sync, call, sleep } = require("../lib/utils/sync");
const { PostBean } = require("../lib/beans");

const fs = require("fs");
const path = require("path");
const unified = require("unified");
const markdown = require("remark-parse");
const stringify = require("remark-stringify");
const replaceImgURL = require("remark-replace-img-url");

forceUpdateAll();

function forceUpdateAll() {
  cbh.load(function() {
    const Blog = require("../lib/models/Blog").default;
    const User = require("../lib/models/User").default;
    const Post = require("../lib/models/post").default;
    const postModel = new Post();
    sync(function* fuaGen() {
      let posts = yield call(
        [postModel, "get"],
        ["true", {}]
        // [
        //   "p_state = $p_statec",
        //   {
        //     $p_statec: "p_fail"
        //   }
        // ]
      );
      let categoryMap = cbh.config.get("categoryMap");
      let promises = [];
      let i = 0;
      for (const key in categoryMap) {
        if (categoryMap.hasOwnProperty(key)) {
          // 遍历所有配置的文件夹中的 .md 文件
          let folderPath = path.resolve(process.cwd(), key);
          fs.readdirSync(folderPath).forEach(file => {
            let curPath = path.resolve(folderPath, file),
              curStat = fs.statSync(curPath);
            if (path.extname(curPath) === ".md" && !curStat.isDirectory()) {
              i++;
              promises.push(
                updatePost(
                  path.basename(curPath, ".md"),
                  processDescription(key, fs.readFileSync(curPath).toString()),
                  categoryMap[key],
                  posts[i]
                )
              );
            }
          });
        }
      }

      for (; i < posts.length; i++) {
        promises.push(updatePost("deleted", "deleted", null, posts[i]));
      }

      Promise.all(promises)
        .then(val => {
          console.log("cbh post add 成功，添加记录：");
          console.log(val.filter(d => d).join("\r\n"));
          cb();
        })
        .catch(e => {
          console.log(e);
        });
    });

    function processDescription(fileRelativeDirPath, description) {
      // const base = cbh.config.get("replaceImgURL")?.base;
      const replaceImgURLCfg = cbh.config.get("replaceImgURL");
      const base = replaceImgURLCfg && replaceImgURLCfg.base;
      if (base) {
        return unified()
          .use(markdown)
          .use(stringify)
          .use(
            replaceImgURL(function(imgURL) {
              let input = "";
              try {
                input = "" + new URL(imgURL);
              } catch (_) {
                input = path.join(fileRelativeDirPath, imgURL);
              }
              return new URL(input, base);
            })
          )
          .processSync(description)
          .toString();
      }
      return description;
    }

    async function updatePost(title, description, category, tempPost) {
      let categoriesSet = new Set();
      // 内容不一致 - 修改
      tempPost.title = title;
      tempPost.description = description;
      // 发布 Markdown 随笔要加上 [Markdown] 这个分类
      if (category) {
        categoriesSet.add(category);
        categoriesSet.add("[Markdown]");
      }
      tempPost.categories = JSON.stringify([...categoriesSet]);
      tempPost.p_state = "update";
      await postModel.edit(tempPost, [
        "postid = $postidc",
        {
          $postidc: tempPost.postid
        }
      ]);
      return `edit ${category}\\${title}`;
    }
  });
}

function fixtitle() {
  cbh.load(function() {
    const Blog = require("../lib/models/Blog").default;
    const User = require("../lib/models/User").default;
    const Post = require("../lib/models/post").default;
    const pangu = require("pangu");
    const postModel = new Post();
    sync(function* delGen() {
      let curBlog = yield call([new Blog(), "getCurrent"]);
      let curUser = yield call([new User(), "getCurrent"]);
      let posts = yield call(
        [postModel, "get"],
        ["true", {}]
        // [
        //   "p_state = $p_statec",
        //   {
        //     $p_statec: "p_fail"
        //   }
        // ]
      );

      for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        let errMsg = null;
        let where = [
          `postid = $postidc`,
          {
            $postidc: post.postid
          }
        ];
        try {
          let panguT = pangu.spacing(post.title);
          if (post.title === panguT) {
            continue;
          }
          post.title = yield call([postModel, "editCB"], curUser, post);
        } catch (error) {
          errMsg = error.toString();
        }
        if (errMsg) {
          post.p_state = "p_fail";
          console.log(`pangu失败：${post.title}，失败原因：${errMsg}`);
        } else {
          post.p_state = "p";
          console.log(`pangu：${post.title}`);
        }
        yield call([postModel, "edit"], post, where);
      }

      // 输出结果
      console.log("success");
    });
  });
}

function delposts() {
  cbh.load(function() {
    const Blog = require("../lib/models/Blog").default;
    const User = require("../lib/models/User").default;
    const Post = require("../lib/models/post").default;
    const postModel = new Post();
    sync(function* delGen() {
      let curBlog = yield call([new Blog(), "getCurrent"]);
      let curUser = yield call([new User(), "getCurrent"]);
      let delPost = yield call(
        [postModel, "get"],
        [
          "p_state = $p_statec and categories = $categoriesc",
          { $p_statec: "latest", $categoriesc: "[]" }
        ]
      );

      for (let i = 0; i < delPost.length; i++) {
        let post = delPost[i];
        let errMsg = null;
        let where = [
          `postid = $postidc`,
          {
            $postidc: post.postid
          }
        ];
        try {
          post.title = "deleted";
          yield call([postModel, "editCB"], curUser, post);
        } catch (error) {
          errMsg = error.toString();
        }
        if (errMsg) {
          post.p_state = "delete_fail";
          console.log(`删除随笔失败：${post.title}，失败原因：${errMsg}`);
        } else {
          post.p_state = "deleted";
          console.log(`删除随笔：${post.title}`);
        }
        yield call([postModel, "edit"], post, where);
      }

      // 输出结果
      console.log("success");
    });
  });
}
