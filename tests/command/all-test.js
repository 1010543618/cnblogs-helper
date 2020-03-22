var tape = require("tape");
var cbh = require("../../lib/cbh.js").default;

tape("command-post test", function(t) {
  atest(t);
});

async function atest(t) {
  cbh.load(function(err) {
    cbh.command = "init";
    cbh.config.set("opts", {
      username: "tuser",
      password: "tpwd",
      reset: true
    });
    if (err) t.fail(err);
    cbh.commands[cbh.command]([], function(err) {
      if (err) {
        t.fail(err);
        t.end();
        return;
      } else {
        t.pass("init success");
        cbh.command = "post";
        cbh.commands[cbh.command](["pull"], function(err) {
          if (err) {
            t.fail(err);
            t.end();
            return;
          } else {
            t.pass("pull success");
            cbh.command = "post";
            cbh.commands[cbh.command](["add"], function(err) {
              t.pass("add success");
              if (err) {
                t.fail(err);
                t.end();
                return;
              } else {
                cbh.command = "post";
                cbh.config.set("opts", {
                  wait: 0
                });
                cbh.commands[cbh.command](["push"], function(err) {
                  t.pass("push success");
                  if (err) {
                    t.fail(err);
                    t.end();
                    return;
                  } else {
                    t.end();
                  }
                });
              }
            });
          }
        });
      }
    });
  });
}
