var tape = require("tape");
var cbh = require("../../lib/cbh").default;

tape("model-Blog test", function(t) {
  cbh.load(() => {
    atest(t);
  });
});

async function atest(t) {
  var Blog = require("../../lib/models/Blog").default;
  var beans = require("../../lib/beans");
  let blog = new Blog();

  // get form cnblogs
  try {
    t.ok(
      (await blog.getFromCB(
        new beans.UserBean({ user: "tuser", pwd: "tpwd" })
      )) instanceof beans.BlogInfoBean
    );
  } catch (e) {
    fail(e);
  }

  // get current
  t.ok((await blog.getCurrent()) instanceof beans.BlogInfoBean);

  t.end();
}
