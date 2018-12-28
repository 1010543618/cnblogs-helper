var tape = require('tape');
var Blog = require('../../lib/models/Blog').default;
var beans = require('../../lib/beans');

tape('model-Blog test', function(t) {
    atest(t);
})

async function atest(t) {
    let blog = new Blog();
    
    try {
        await blog.getFromCB([new beans.UserBean({ user: "test", pwd: "test" })]);
    } catch (e) {
        t.equal(e.code, 500);
    }

    t.ok((await blog.getCurrent()) instanceof beans.BlogInfoBean);

    t.end();
}