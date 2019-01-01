var tape = require('tape');
var Basic = require('../../lib/models/Basic').default;
var PostBean = require('../../lib/beans').PostBean;

tape('model-Basic test', function(t) {
    atest(t);
})

async function atest(t) {
    let basic = new Basic();
    basic.tablename = "Post";
    basic.bean = PostBean;

    t.equal(await basic.add([new PostBean({ title: "test" })]), true);

    let tpost = await basic.get(["title = $test", { $test: "test" }]);
    t.equal(tpost[0].title, "test");

    t.equal(await basic.edit(new PostBean({ title: "test", "description": "test" }),
        ["title = $test", { $test: "test" }]), true);

    t.end();
}