import { sync, call, sleep } from "./utils/sync";
import usage from "./utils/usage";
import Post from "./models/Post";
import Blog from "./models/Blog";
import User from "./models/User";
import cbh from "./cbh";
import { PostBean } from "./beans";

const fs = require("fs");
const path = require("path");
const unified = require("unified");
const markdown = require("remark-parse");
const stringify = require("remark-stringify");
const replaceImgURL = require("remark-replace-img-url");

Object.defineProperty(post, "usage", {
  value: usage(
    "post",
    `cbh post pull [--num <number>]
说明: 从博客园拉随笔到本地
参数：
    --num 从博客园拉随笔的个数（默认200）

cbh post add
说明: 本地随笔变动添加到数据暂存区

cbh post push
说明: 将暂存区随笔变动推到博客园

cbh post list 
说明: 列出暂存区随笔
`,
    null
  )
});

const postModel = new Post();

export default function post(argv, cb) {
  switch (argv[0]) {
    case "pull":
      sync(pullPostGen, [cbh.config.get("opts").num], cb);
      break;
    case "add":
      addPost(cb);
      break;
    case "push":
      sync(pushPostGen, [cbh.config.get("opts").wait], cb);
      break;
    case "list":
      sync(listPostGen, [cbh.config.get("opts")], cb);
    default:
      break;
  }
}

export function* pullPostGen(num = 200) {
  yield call(
    [postModel, "add"],
    yield call(
      [postModel, "getCB"],
      yield call([new Blog(), "getCurrent"]),
      yield call([new User(), "getCurrent"]),
      num
    )
  );
}

function* pushPostGen(wait) {
  let curBlog = yield call([new Blog(), "getCurrent"]);
  let curUser = yield call([new User(), "getCurrent"]);
  let addedPost = yield call(
    [postModel, "get"],
    ["p_state = $p_statec", { $p_statec: "add" }]
  );
  let modifiedPost = yield call(
    [postModel, "get"],
    ["p_state = $p_statec", { $p_statec: "update" }]
  );

  // 先修改比较好，因为添加需要等好久
  for (let i = 0; i < modifiedPost.length; i++) {
    let post = modifiedPost[i];
    let errMsg = null;
    let where = [
      `postid = $postidc`,
      {
        $postidc: post.postid
      }
    ];
    try {
      yield call([postModel, "editCB"], curUser, post);
    } catch (error) {
      errMsg = error.toString();
    }
    if (errMsg) {
      console.log(`修改随笔失败：${post.title}，失败原因：${errMsg}`);
    } else {
      console.log(`修改随笔：${post.title}`);
    }
    yield call(
      [postModel, "edit"],
      new PostBean({ p_state: errMsg ? "update_failed" : "latest" }),
      where
    );
  }

  for (let i = 0; i < addedPost.length; i++) {
    yield sleep(wait); // 30秒内只能发布1篇博文
    let post = addedPost[i];
    let postid = "";
    let errMsg = null;
    try {
      postid = yield call([postModel, "addCB"], curBlog, curUser, post);
    } catch (error) {
      errMsg = error.toString();
    }
    let where = [
      `title = $titlec and categories like $categoriesc`,
      {
        $titlec: post.title,
        $categoriesc: `%${post.categories}%`
      }
    ];
    yield call(
      [postModel, "edit"],
      new PostBean({ postid, p_state: errMsg ? "add_failed" : "latest" }),
      where
    );
    if (errMsg) {
      console.log(`添加随笔失败：${post.title}，失败原因：${errMsg}`);
    } else {
      console.log(`添加随笔：${post.title}`);
    }
  }

  // 输出结果
  console.log("cbh post push 完成");
}

function* listPostGen(options) {
  let where = [],
    posts = [];
  if (options.failed) {
    where = [
      "p_state in ($p_state1c, $p_state2c)",
      { $p_state1c: "add_failed", $p_state2c: "update_failed" }
    ];
  } else if (options.all) {
    where = ["true", {}];
  } else {
    //willpush
    where = [
      "p_state in ($p_state1c, $p_state2c)",
      { $p_state1c: "add", $p_state2c: "update" }
    ];
  }
  posts = yield call([postModel, "get"], where);
  posts.forEach(d => {
    console.log(`${d.p_state}:${d.title}`);
  });
  return posts;
}

function addPost(cb) {
  let categoryMap = cbh.config.get("categoryMap");
  let promises = [];
  for (const key in categoryMap) {
    if (categoryMap.hasOwnProperty(key)) {
      // 遍历所有配置的文件夹中的 .md 文件
      let folderPath = path.resolve(process.cwd(), key);
      fs.readdirSync(folderPath).forEach(file => {
        let curPath = path.resolve(folderPath, file),
          curStat = fs.statSync(curPath);
        if (path.extname(curPath) === ".md" && !curStat.isDirectory()) {
          promises.push(
            addOrEditPost(
              path.basename(curPath, ".md"),
              processDescription(key, fs.readFileSync(curPath).toString()),
              categoryMap[key]
            )
          );
        }
      });
    }
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
}

async function addOrEditPost(title, description, category) {
  let where = [
    `title = $titlec and categories like $categoriesc and p_state = $p_state`,
    {
      $titlec: title,
      $categoriesc: `%${category}%`,
      $p_state: "latest"
    }
  ];
  let currentPost = (await postModel.get(where))[0];
  let tempPost = new PostBean();
  if (currentPost) {
    // 已有该随笔
    let categoriesSet = new Set(JSON.parse(<string>currentPost.categories));
    if (currentPost.description === description) {
      // 内容一致
      return false;
    }

    // 内容不一致 - 修改
    tempPost.description = description;
    // 发布 Markdown 随笔要加上 [Markdown] 这个分类
    categoriesSet.add(category);
    categoriesSet.add("[Markdown]");
    tempPost.categories = JSON.stringify([...categoriesSet]);
    tempPost.p_state = "update";
    await postModel.edit(tempPost, [
      "postid = $postidc",
      {
        $postidc: currentPost.postid
      }
    ]);
    return `edit ${category}\\${title}`;
  }

  // 没有该随笔 - 添加
  tempPost.title = title;
  tempPost.description = description;
  // 发布 Markdown 随笔要加上 [Markdown] 这个分类
  tempPost.categories = JSON.stringify([category, "[Markdown]"]);
  tempPost.p_state = "add";
  tempPost.postid = Math.random()
    .toString(36)
    .replace("0.", "_");
  await postModel.add([tempPost]);
  return `add ${category}\\${title}`;
}

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
