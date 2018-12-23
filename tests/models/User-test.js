var test = require('tape');
var User = require('../../lib/models/User').default;
var beans = require('../../lib/beans');

test('model-User test', function(t) {
    let user = new User();
    
    user.getCurrent().then(
        d => {
            t.ok(d instanceof beans.UserBean);
        }
    );

    t.end();
})