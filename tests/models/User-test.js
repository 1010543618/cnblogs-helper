var test = require("tape");
var cbh = require("../../lib/cbh").default;

test("model-User test", function(t) {
  cbh.load(() => {
    atest(t);
  });
});

async function atest(t) {
  var User = require("../../lib/models/User").default;
  var beans = require("../../lib/beans");
  let user = new User();

  t.ok((await user.getCurrent()) instanceof beans.UserBean);

  t.end();
}
