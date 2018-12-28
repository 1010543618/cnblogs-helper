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

    yield call([postModel, "pull"],
        yield call([(new Blog()), "getCurrent"]),
            yield call([(new User()), "getCurrent"]), num);
}

export function* pushPostGen() {
    let postModel = new Post();

    yield call([postModel, "pull"],
        yield call([(new Blog()), "getCurrent"]),
            yield call([(new User()), "getCurrent"]));
}

async function addPostGen() {
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
        Promise.all(promises).then(() => {
            console.log("成功");
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
            return;
        }
        // 内容不一致 - 修改
        currentPost.description = description;
        post.edit(currentPost, where);
        return;
    }

    // 没有该随笔 - 添加
    currentPost = new PostBean();
    currentPost.title = title;
    currentPost.description = description;
    currentPost.categories = [categorie];
    post.add([currentPost]);

}