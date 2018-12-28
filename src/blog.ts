import { sync, call, error } from './utils/sync';
import usage from "./utils/usage";
import Blog from './models/Blog';
import User from './models/User';
import { BlogInfoBean } from './beans';

Object.defineProperty(blog, "usage", {
    value: usage('blog', 'cbh blog', null)
})

export default function blog() {

}

export function* blogGen() {
    let blogModel = new Blog(),
        userModel = new User(),
        blog = yield call([blogModel, "getFromCB"],
            yield call([userModel, "getCurrent"]));

    blog.isCurrent = 1;
    yield call([blogModel, "add"], [blog]);
}