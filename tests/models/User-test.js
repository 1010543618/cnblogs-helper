var test = require('tape');
var User = require('../../lib/models/User').default;
var beans = require('../../lib/beans');

test('model-User test', function(t) {
    atest(t);
})

async function atest(t) {
    let user = new User();

    t.ok((await user.getCurrent()) instanceof beans.UserBean);

    t.end();
}