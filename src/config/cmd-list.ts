export { aliases, shorthands, affordances, cmdList, types };

// short names for common things
var shorthands = {

}

var affordances = {

}

// these are filenames in .
var cmdList = [
    'init',
    'user',
    'blog',
    'category',
    'post'
]

var aliases = Object.assign({}, shorthands, affordances);

var types = {
    num: [null, Number],
    pangu: Boolean
}