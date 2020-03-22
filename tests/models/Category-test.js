var tape = require("tape");
var cbh = require("../../lib/cbh").default;

tape("model-Category test", function(t) {
  cbh.load(() => {
    atest(t);
  });
});

async function atest(t) {
  var Category = require("../../lib/models/Category").default;
  var beans = require("../../lib/beans");

  let category = new Category();

  try {
    t.ok(
      await category.pull(
        new beans.UserBean({ user: "tuser", pwd: "tpwd" }),
        new beans.BlogInfoBean({ blogid: "tblogid" })
      )
    );
  } catch (e) {
    t.fail(e);
  }

  t.end();
}
