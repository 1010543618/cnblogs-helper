import { sync, call, sleep } from "./utils/sync";
import usage from "./utils/usage";
import Post from "./models/Post";
import Blog from "./models/Blog";
import User from "./models/User";
import cbh from "./cbh";
import { PostBean } from "./beans";

const fs = require("fs");
const path = require("path");

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

cbh post remove
说明: 将暂存区随笔变动清除`,
        null
    )
});

const postModel = new Post();

export default function post(argv) {
    switch (argv[0]) {
        case "pull":
            sync(pullPostGen, cbh.config.get("opts").num);
            break;
        case "add":
            addPost();
            break;
        case "push":
            sync(pushPostGen);
            break;
        case "remove":
            removePost();
            break;
        case "list":
            sync(listPostGen, cbh.config.get("opts"));
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

function* pushPostGen() {
    let curBlog = yield call([new Blog(), "getCurrent"]);
    let curUser = yield call([new User(), "getCurrent"]);
    let addedPost = yield call(
        [postModel, "get"],
        ["addtype = $addtypec", { $addtypec: "added" }]
    );
    let modifiedPost = yield call(
        [postModel, "get"],
        ["addtype = $addtypec", { $addtypec: "modified" }]
    );

    for (let i = 0; i < addedPost.length; i++) {
        let post = addedPost[i];
        let postid = "";
        let errMsg = null;
        try {
            postid = yield call([postModel, "addCB"], curBlog, curUser, post);
        } catch (error) {
            errMsg = error.toString();
        }
        let where = [
            `(title = $titlec or titlePangu = $titlec) and categories like $categoriesc`,
            {
                $titlec: post.title,
                $categoriesc: `%${post.categories}%`
            }
        ];
        yield call(
            [postModel, "edit"],
            new PostBean({ postid, addtype: errMsg ? "failed" : "success" }),
            where
        );
        if (errMsg) {
            console.log(`添加随笔失败：${post.title}，失败原因：${errMsg}`)
        } else {
            console.log(`添加随笔：${post.title}`)
        }
        yield sleep(66666); // 30秒内只能发布1篇博文
    }

    for (let i = 0; i < modifiedPost.length; i++) {
        let post = modifiedPost[i];
        let errMsg = null;
        let where = [
            `(title = $titlec or titlePangu = $titlec) and categories like $categoriesc`,
            {
                $titlec: post.title,
                $categoriesc: `%${post.categories}%`
            }
        ];
        try {
            yield call([postModel, "editCB"], curUser, post);
        } catch (error) {
            errMsg = error.toString();
        }
        if (errMsg) {
            console.log(`修改随笔失败：${post.title}，失败原因：${errMsg}`)
        } else {
            console.log(`修改随笔：${post.title}`)
        }
        yield call([postModel, "edit"], new PostBean({ addtype: errMsg ? "failed" : "success" }), where);
    }

    // 输出结果
    console.log("dbh post push 完成");
}

function* listPostGen(options) {
    let where = [],
        posts = [];
    if (options.failed) {
        where = ["addtype = $addtypec", { $addtype1c: "failed" }]
    } else if (options.all) {
        where = ["true", {}]
    } else {
        //willpush
        where = ["addtype in ($addtype1c, $addtype2c)", { $addtype1c: "added", $addtype2c: "modified" }]
    }
    posts = yield call(
        [postModel, "get"],
        where 
    );
    posts.forEach(d => {
        console.log(`${d.addtype}:${d.title}`)
    });
    return posts;
}

function addPost() {
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
                            fs.readFileSync(curPath).toString(),
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
        })
        .catch(e => {
            console.log(e);
        });
}

function removePost() {
    postModel
        .remove()
        .then(_ => {
            console.log("cbh post remove 成功，暂存区已无待提交的随笔");
        })
        .catch(e => {
            console.log(e);
        });
}

async function addOrEditPost(title, description, category) {
    let where = [
        `(title = $titlec or titlePangu = $titlec) and categories like $categoriesc`,
        {
            $titlec: title,
            $categoriesc: `%${category}%`
        }
    ];
    let currentPost = (await postModel.get(where))[0];
    let tempPost = new PostBean();
    if (currentPost) {
        // 已有该随笔
        let categoriesSet = new Set(JSON.parse( < string > currentPost.categories));
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
        if (currentPost.addtype !== "added") {
            // 状态为 added 时不改变状态
            tempPost.addtype = "modified";
        }
        await postModel.edit(tempPost, where);
        return `edit ${category}\\${title}`;
    }

    // 没有该随笔 - 添加
    tempPost.title = title;
    tempPost.description = description;
    // 发布 Markdown 随笔要加上 [Markdown] 这个分类
    tempPost.categories = JSON.stringify([category, "[Markdown]"]);
    tempPost.addtype = "added";
    await postModel.add([tempPost]);
    return `add ${category}\\${title}`;
}