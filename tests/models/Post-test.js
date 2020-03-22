var tape = require("tape");
var cbh = require("../../lib/cbh").default;

tape("model-Post test", function(t) {
  cbh.load(() => {
    atest(t);
  });
});

async function atest(t) {
  var Post = require("../../lib/models/Post").default;
  var beans = require("../../lib/beans");
  let post = new Post();

  try {
    t.ok(
      await post.getCB(
        new beans.BlogInfoBean({ blogid: "tblogid" }),
        new beans.UserBean({ user: "tuser", pwd: "tpwd" }),
        1
      )
    );
  } catch (e) {
    t.fail(e);
  }

  try {
    t.ok(
      await post.addCB(
        new beans.BlogInfoBean({ blogid: "tblogid" }),
        new beans.UserBean({ user: "tuser", pwd: "tpwd" }),
        new beans.PostBean({ title: "ttitle", description: "tdescription" })
      )
    );
  } catch (e) {
    t.fail(e);
  }

  try {
    t.ok(
      post.editCB(
        new beans.UserBean({ user: "tuser", pwd: "tpwd" }),
        new beans.PostBean({ postid: "12539406" })
      )
    );
  } catch (e) {
    t.fail(e);
  }

  try {
    t.ok(
      post.deleteCB(
        new beans.UserBean({ user: "tuser", pwd: "tpwd" }),
        new beans.PostBean({ postid: "12539406" })
      )
    );
  } catch (e) {
    t.fail(e);
  }

  t.end();
}
