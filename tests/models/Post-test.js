var test = require('tape');
var Post = require('../../lib/models/Post').default;
var beans = require('../../lib/beans');

test('model-Post test', function(t) {
    let post = new Post();

    post.pull(new beans.BlogInfoBean({ blogid: "test" }), new beans.UserBean({ user: "test", pwd: "test" })).catch(
        d => {
            t.equal(d.code, 500);
            t.equal(d.faultString, "blogapp is not matched");
        }
    );

    t.end();
})