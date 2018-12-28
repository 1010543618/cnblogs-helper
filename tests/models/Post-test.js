var tape = require('tape');
var Post = require('../../lib/models/Post').default;
var beans = require('../../lib/beans');

tape('model-Post test', function(t) {
    atest(t);
})

async function atest(t) {
    let post = new Post();

    try {
        await post.pull(new beans.BlogInfoBean({ blogid: "test" }),
            new beans.UserBean({ user: "test", pwd: "test" }), 1);
    } catch (e) {
        t.equal(e.code, 500);
    }

    t.end();
}