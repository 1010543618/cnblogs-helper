export { aliases, shorthands, affordances, cmdList, types };

// short names for common things
var shorthands = {
    h: ['--usage'],
    H: ['--usage'],
    '?': ['--usage'],
    help: ['--usage'],
    l: ['--long']
}

var cmdshorthands = {
    
}

var affordances = {

}

// these are filenames in .
var cmdList = [
    'init',
    'user',
    'blog',
    'category',
    'post',
    'help'
]

var aliases = Object.assign({}, cmdshorthands, affordances);

var types = {
    usage: Boolean,
    num: [null, Number],
    pangu: Boolean,
    reset: Boolean,
    long: Boolean
}