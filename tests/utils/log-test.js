var tape = require('tape');
var log = require('../../lib/utils/log').default;
tape('log test', function(t) {
    t.equal(log("test", "test"), true);
    t.equal(log("test", ["test1", "test2"]), true);
    t.end();
});