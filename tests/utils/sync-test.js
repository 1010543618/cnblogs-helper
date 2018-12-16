var test = require('tape');
var sync = require('../../dist/utils/sync')
test('sync test', function(t) {
    sync.sync(function*() {
        let a = yield 123;
        let b = yield(new Promise((res, rej) => {
            setTimeout(() => { res(a) }, 1000);
        }));
        let c = yield sync.call((val) => new Promise((res, rej) => {
            res(val)
        }), b);
        let obj = {
            val: 666,
            // 这里不能滥用箭头函数（会无法绑定this）
            pro: function(val){
                return new Promise((res, rej) => {
                    res(val + this.val);
                });
            }
        }
        let d = yield sync.call([obj, 'pro'], 'sync');
        t.equal(a, 123);
        t.equal(b, 123);
        t.equal(c, 123);
        t.equal(d, 'sync666');
        t.end();
    })
});