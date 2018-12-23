var test = require('tape');
var Blog = require('../../lib/models/Blog').default;
var beans = require('../../lib/beans');

test('model-Blog test', function(t) {
    let blog = new Blog();

    blog.getFromCB([new beans.UserBean({ user: "test", pwd: "test" })]).catch(
        d => {
            t.equal(d.code, 500);
            t.equal(d.faultString, "User does not Exist");
        }
    );

    blog.getCurrent().then(
        d => {
            t.ok(d instanceof beans.BlogInfoBean);
        }
    );

    t.end();
})