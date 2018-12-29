import { sync, call, error } from './utils/sync';
import usage from "./utils/usage";
import Post from './models/Post';
import Blog from './models/Blog';
import User from './models/User';
import cbh from './cbh';
import { PostBean } from './beans';

const fs = require("fs");
const path = require("path");

Object.defineProperty(post, "usage", {
    value: usage('post', 'cbh post', null)
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
    let addedPost = yield call([postModel, "get"], "addtype = added");
    let modifiedPost = yield call([postModel, "get"], "addtype = modified");
    
    for (let i = 0; i < addedPost.length; i++) {
        const post = addedPost[i];
        yield call([postModel, "addCB"], curBlog, curUser, post);
    }

    for (let i = 0; i < modifiedPost.length; i++) {
        const post = addedPost[i];
        yield call([postModel, "editCB"], curBlog, curUser, post);
    }

    console.log("dbh post push 成功，添加随笔：");
    console.log(addedPost.map(d => d.title).join("\r\n"));

    console.log("修改随笔：");
    console.log(modifiedPost.map(d => d.title).join("\r\n"));
}

function addPostGen() {
    let categoryMap = cbh.config.get('categoryMap');
    for (const key in categoryMap) {
        let promises = [];
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
        Promise.all(promises).then((val) => {
            console.log("dbh post add 成功，添加记录：");
            console.log(val.filter(d => d).join("\r\n"));
        }).catch((e) => {
            console.log(e)
        })
    }
}


async function addOrEditPost(title, description, categorie) {
    let post = new Post();
    let where = `title = '${title}' or titlePangu = '${title}' and categories like '%${categorie}%'`;
    let currentPost = (await post.get(where))[0];

    if (currentPost) { // 已有该随笔
        if (currentPost.description === description) {
            return false;
        }
        // 内容不一致 - 修改
        currentPost.description = description;
        currentPost.addtype = "modified";
        post.edit(currentPost, where);
        return `edit ${categorie}\\${title}`;
    }

    // 没有该随笔 - 添加
    currentPost = new PostBean();
    currentPost.title = title;
    currentPost.description = description;
    currentPost.categories = [categorie];
    currentPost.addtype = "added";
    post.add([currentPost]);
    return `add ${categorie}\\${title}`;
}