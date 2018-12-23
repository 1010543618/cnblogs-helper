import { sync, call, error } from './utils/sync';
import usage from "./utils/usage";
import Post from './models/Post';
import Blog from './models/Blog';
import User from './models/User';

Object.defineProperty(post, "usage", {
    value: usage('post', 'cbh post', null)
})

export default function* post() {
    let postModel = new Post();

    yield call([postModel, "pull"],
        yield call([(new Blog()), "getCurrent"]),
            yield call([(new User()), "getCurrent"]));
}