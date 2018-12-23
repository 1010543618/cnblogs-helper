var test = require('tape');
var Basic = require('../../lib/models/Basic').default;
var PostBean = require('../../lib/beans').PostBean;

test('model-Basic test', function(t) {
    let basic = new Basic();
    basic.tablename = "Post";
    
    basic.add([new PostBean({title:"test"})]).then(
        d => {
            t.equal(d, true);
        }
    );

    t.end();
})
