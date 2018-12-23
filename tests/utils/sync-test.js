var test = require('tape');
var sync = require('../../lib/utils/sync')
test('sync test', function(t) {
    sync.sync(function*() {
        // 普通
        let a = yield 123;

        // Promise
        let b = yield(new Promise((res, rej) => {
            setTimeout(() => { res(a) }, 1000);
        }));

        // call
        let c = yield sync.call((val) => new Promise((res, rej) => {
            res(val)
        }), b);
        let obj = {
            val: 666,
            // 这里不能滥用箭头函数（会无法绑定this）
            pro: function(val) {
                return new Promise((res, rej) => {
                    res(val + this.val);
                });
            }
        }
        let d = yield sync.call([obj, 'pro'], 'sync');

        // error
        let e = null;
        try {
            yield sync.error("错错错错错");
        } catch (error) {
            e = error;
        }

        // nest
        let aa, bb, cc, dd, ee;
        yield* (function*() {
            // 普通
            aa = yield 123;

            // Promise
            bb = yield(new Promise((res, rej) => {
                setTimeout(() => { res(aa) }, 1000);
            }));

            // call
            cc = yield sync.call((val) => new Promise((res, rej) => {
                res(val)
            }), bb);
            let obj = {
                val: 666,
                // 这里不能滥用箭头函数（会无法绑定this）
                pro: function(val) {
                    return new Promise((res, rej) => {
                        res(val + this.val);
                    });
                }
            }
            dd = yield sync.call([obj, 'pro'], 'sync');

            // error
            try {
                yield sync.error("错错错错错");
            } catch (error) {
                ee = error;
            }

        })();

        // after nest
        let f = yield "after nest";

        t.equal(a, 123);
        t.equal(b, 123);
        t.equal(c, 123);
        t.equal(d, "sync666");
        t.equal(e, "错错错错错");
        t.equal(aa, 123);
        t.equal(bb, 123);
        t.equal(cc, 123);
        t.equal(dd, "sync666");
        t.equal(ee, "错错错错错");
        t.equal(f, "after nest");
        t.end();
    })
});