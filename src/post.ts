import { sync, call, sleep } from './utils/sync';
import usage from "./utils/usage";
import Post from './models/Post';
import Blog from './models/Blog';
import User from './models/User';
import cbh from './cbh';
import { PostBean } from './beans';

const fs = require("fs");
const path = require("path");

Object.defineProperty(post, "usage", {
    value: usage('post', `
cbh post pull [--num <number>]
说明: 从博客园拉随笔到本地
参数：
    --num 从博客园拉随笔的个数（默认200）

cbh post add
说明: 本地随笔变动添加到数据暂存区

cbh post push
说明: 将暂存区随笔变动推到博客园
    `, null)
})

export default function post(argv) {
    switch (argv[0]) {
        case "pull":
            sync(pullPostGen, cbh.config.get('opts').num);
            break;
        case "add":
            addPostGen();
            break;
        case "push":
            sync(pushPostGen);
            break;
        default:
            break;
    }
}

export function* pullPostGen(num = 200) {
    let postModel = new Post();

    yield call([postModel, "add"],
        yield call([postModel, "getCB"],
            yield call([(new Blog()), "getCurrent"]),
                yield call([(new User()), "getCurrent"]), num));
}

export function* pushPostGen() {
    let postModel = new Post();
    let curBlog = yield call([(new Blog()), "getCurrent"]);
    let curUser = yield call([(new User()), "getCurrent"]);
    let addedPost = yield call([postModel, "get"], ["addtype = $addtypec", { $addtypec: "added" }]);
    let modifiedPost = yield call([postModel, "get"], ["addtype = $addtypec", { $addtypec: "modified" }]);

    for (let i = 0; i < addedPost.length; i++) {
        let post = addedPost[i];
        let postid = yield call([postModel, "addCB"], curBlog, curUser, post);
        let where = [`(title = $titlec or titlePangu = $titlec) and categories like $categoriesc`,
            {
                $titlec: post.title,
                $categoriesc: `%${post.categories}%`
            }
        ];
        // 这里用 PostBean 会带有空的 category
        yield call([postModel, "edit"], new PostBean({ postid, addtype: "null" }), where);
        yield sleep(66666); // 30秒内只能发布1篇博文
    }

    for (let i = 0; i < modifiedPost.length; i++) {
        let post = modifiedPost[i];
        let where = [`(title = $titlec or titlePangu = $titlec) and categories like $categoriesc`,
            {
                $titlec: post.title,
                $categoriesc: `%${post.categories}%`
            }
        ];
        yield call([postModel, "editCB"], curUser, post);
        yield call([postModel, "edit"], new PostBean({ addtype: "null" }), where);
    }

    console.log("dbh post push 成功，添加随笔：");
    console.log(addedPost.map(d => d.title).join("\r\n"));

    console.log("修改随笔：");
    console.log(modifiedPost.map(d => d.title).join("\r\n"));
}

function addPostGen() {
    let categoryMap = cbh.config.get('categoryMap');
    let promises = [];
    for (const key in categoryMap) {
        if (categoryMap.hasOwnProperty(key)) {
            // 遍历所有配置的文件夹中的 .md 文件
            let folderPath = path.resolve(process.cwd(), key);
            fs.readdirSync(folderPath).forEach(function(file, index) {
                let curPath = path.resolve(folderPath, file),
                    curStat = fs.statSync(curPath);
                if (path.extname(curPath) === ".md" && !curStat.isDirectory()) {
                    promises.push(addOrEditPost(
                        path.basename(curPath, ".md"),
                        fs.readFileSync(curPath).toString(),
                        categoryMap[key]
                    ));
                }
            });
        }
    }
    Promise.all(promises).then((val) => {
        console.log("dbh post add 成功，添加记录：");
        console.log(val.filter(d => d).join("\r\n"));
    }).catch((e) => {
        console.log(e)
    })
}

async function addOrEditPost(title, description, categorie) {
    let post = new Post();
    let where = [`(title = $titlec or titlePangu = $titlec) and categories like $categoriesc`,
        {
            $titlec: title,
            $categoriesc: `%${categorie}%`
        }
    ];
    let currentPost = (await post.get(where))[0];
    let tempPost = new PostBean();
    if (currentPost) { // 已有该随笔
        let categories = JSON.parse( < string > currentPost.categories);
        if (currentPost.description === description) { // 内容一致
            if (categories.indexOf("[Markdown]") !== -1) { // 有 Markdown 分类
                return false;
            }
        }

        // 内容不一致 - 修改
        tempPost.description = description;
        // 发布 Markdown 随笔要加上 [Markdown] 这个分类
        tempPost.categories = JSON.stringify([categorie, "[Markdown]"]);
        if (currentPost.addtype !== "added") { // 状态为 added 时不改变状态
            tempPost.addtype = "modified";
        }
        post.edit(tempPost, where);
        return `edit ${categorie}\\${title}`;
    }

    // 没有该随笔 - 添加
    tempPost.title = title;
    tempPost.description = description;
    // 发布 Markdown 随笔要加上 [Markdown] 这个分类
    tempPost.categories = JSON.stringify([categorie, "[Markdown]"]);
    tempPost.addtype = "added";
    post.add([tempPost]);
    return `add ${categorie}\\${title}`;
}