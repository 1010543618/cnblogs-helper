const visit = require("unist-util-visit");
const is = require("unist-util-is");

const isImgExt = str => /\.(svg|png|jpg|jpeg|gif)$/.test(str);

module.exports = function replaceImgURL(callback) {
  return function attacher() {
    return function transformer(tree, file) {
      visit(tree, visitor(file, callback));
    };
  };
};

function visitor(file, callback) {
  return function(node) {
    if (is(node, "image") && isImgExt(node.url)) {
      node.url = callback(node.url);
    }
  };
}