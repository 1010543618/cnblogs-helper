import cbh from "./cbh";

export default function(args, cb) {
    var opts = cbh.config.get('opts');
    var argv = opts.argv.cooked;
  
    var section = cbh.deref(args[0]) || args[0]
  
    // cbh help <noargs>:  show basic usage
    if (!section) {
      var valid = argv[0] === 'help' ? 0 : 1
      return npmUsage(valid, cb)
    }
  
    // cbh <command> -h: show command usage
    if (opts.usage &&
        cbh.commands[section] &&
        cbh.commands[section].usage) {
      console.log(cbh.commands[section].usage)
      return cb()
    }
};

function npmUsage(valid, cb) {
    console.log(`Usage: cbh <command>`);
    cb(valid)
}

function usages() {
    // return a string of <command>: <usage>
    var maxLen = 0
    return Object.keys(cbh.commands).filter(function(c) {
        return c === cbh.deref(c)
    }).reduce(function(set, c) {
        set.push([c, cbh.commands[c].usage || ''])
        maxLen = Math.max(maxLen, c.length)
        return set
    }, []).map(function(item) {
        var c = item[0]
        var usage = item[1]
        return '\n    ' +
            c + (new Array(maxLen - c.length + 2).join(' ')) +
            (usage.split('\n').join('\n' + (new Array(maxLen + 6).join(' '))))
    }).join('\n')
}