import { sync, call, error } from './utils/sync';
import usage from "./utils/usage";
import Category from './models/Category';
import Blog from './models/Blog';
import User from './models/User';

Object.defineProperty(category, "usage", {
    value: usage('category', 'cbh category', null)
})

export default function category() {
    
}

export function* categoryGen() {
    let categoryModel = new Category();

    yield call([categoryModel, "pull"],
        yield call([(new Blog()), "getCurrent"]),
            yield call([(new User()), "getCurrent"]));
}