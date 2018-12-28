var tape = require('tape');
var Category = require('../../lib/models/Category').default;
var beans = require('../../lib/beans');

tape('model-Category test', function(t) {
    atest(t);
})

async function atest(t) {
    let category = new Category();

    try {
        await category.pull(new beans.BlogInfoBean({ blogid: "test" }),
            new beans.UserBean({ user: "test", pwd: "test" }));
    } catch (e) {
        t.equal(e.code, 500);
    }

    t.end();
}