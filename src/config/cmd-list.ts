export { aliases, shorthands, affordances, cmdList, types };

// short names for common things
var shorthands = {
  h: ["--usage"],
  H: ["--usage"],
  "?": ["--usage"],
  help: ["--usage"],
  l: ["--long"],
  u: ["--username"],
  p: ["--password"],
  w: ["--wait"]
};

var cmdshorthands = {};

var affordances = {};

// these are filenames in .
var cmdList = ["init", "user", "blog", "category", "post", "help"];

var aliases = Object.assign({}, cmdshorthands, affordances);

var types = {
  usage: Boolean,
  num: [null, Number],
  pangu: Boolean,
  reset: Boolean,
  username: ["", String],
  password: ["", String],
  long: Boolean,
  all: Boolean,
  waitpush: Boolean,
  failed: Boolean,
  wait: [66666, Number]
};
