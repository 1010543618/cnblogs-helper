const Koa = require("koa");
const parse = require("co-body");
const app = (module.exports = new Koa());
const resData = require("./res-data.js");

app.use(async function(ctx) {
  const body = await parse.text(ctx.req);
  console.log(body);

  for (let key in resData) {
    if (~body.indexOf(key)) {
      let body = "";
      if (typeof resData[key] === "function") {
        body = resData[key]();
      } else {
        body = resData[key];
      }
      ctx.body = body;
      return;
    }
  }
});

if (!module.parent) app.listen(14180);
