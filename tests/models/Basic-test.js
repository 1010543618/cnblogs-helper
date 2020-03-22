var tape = require("tape");
var cbh = require("../../lib/cbh").default;

tape("model-Basic test", function(t) {
  cbh.load(function() {
    atest(t);
  });
});

async function atest(t) {
  const Basic = require("../../lib/models/Basic").default;
  const PostBean = require("../../lib/beans").PostBean;
  let basic = new Basic();
  basic.tablename = "Post";
  basic.bean = PostBean;

  // add
  t.equal(
    await basic.add([
      new PostBean({
        postid: Math.random(),
        title: "basic-t-title",
        categories: "[test]"
      })
    ]),
    true
  );

  // get
  let tpost = await basic.get(["title = $test", { $test: "basic-t-title" }]);
  t.equal(tpost[0].title, "basic-t-title");
  t.equal(tpost[0].categories, "[test]");

  // edit
  t.equal(
    await basic.edit(
      new PostBean({
        title: "basic-t-title2",
        description: "basic-t-description"
      }),
      ["title = $test", { $test: "basic-t-title" }]
    ),
    true
  );

  t.end();
}
