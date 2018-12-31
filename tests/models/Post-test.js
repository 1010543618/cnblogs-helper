var tape = require('tape');
var Post = require('../../lib/models/Post').default;
var beans = require('../../lib/beans');

tape('model-Post test', function(t) {
    atest(t);
})

async function atest(t) {
    let post = new Post();

    try {
        await post.getCB(new beans.BlogInfoBean({ blogid: "test" }),
            new beans.UserBean({ user: "test", pwd: "test" }), 1);
    } catch (e) {
        t.equal(e.code, 500);
    }

    try {
        await post.addCB(new beans.BlogInfoBean({ blogid: "test" }),
            new beans.UserBean({ user: "test", pwd: "test" }),
            new beans.PostBean({ title: "test", description: "test" }));
    } catch (e) {
        t.ok(e.code === 500);
    }

    try {
        await post.editCB(new beans.UserBean({ user: "test", pwd: "test" }),
            new beans.PostBean({ postid: 'test' }));
    } catch (e) {
        t.equal(e.code, 500);
    }

    await post.add([new beans.PostBean({ title: "test-ra", addtype: "added"})])
    t.equal(await post.removeAddtype(new beans.PostBean({ title: "test-ra"})), true);

    t.end();
}