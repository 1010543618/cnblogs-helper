var test = require('tape');
var Category = require('../../lib/models/Category').default;
var beans = require('../../lib/beans');

test('model-Category test', function(t) {
    let category = new Category();

    category.pull(new beans.BlogInfoBean({ blogid: "test" }), new beans.UserBean({ user: "test", pwd: "test" })).catch(
        d => {
            t.equal(d.code, 500);
            t.equal(d.faultString, "User does not Exist");
        }
    );

    t.end();
})