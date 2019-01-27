import cbh from "./cbh";
import { cmdList } from "./config/cmd-list";

export default function(args, cb) {
    var opts = cbh.config.get('opts');
    var argv = opts.argv.cooked;

    var section = cbh.deref(args[0]) || args[0];

    // cbh help
    if (!section) {
        npmUsage(opts.long);
        return;
    }

    // cbh <command> -h: show command usage
    if (opts.usage &&
        cbh.commands[section] &&
        cbh.commands[section].usage) {
        console.log(cbh.commands[section].usage)
        return;
    }
};

function npmUsage(long) {
    console.log(`用法: cbh <command>

<command> 可以是:
${long ? usages()
: '    ' + wrap(cmdList)}

cbh <command> -h     <command> 的快速帮助
cbh -l               例出全部 <command> 的使用`);
}

function usages() {
    // return a string of <command>: <usage>
    var maxLen = 0
    return Object.keys(cbh.commands).reduce(function(set, c) {
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

function wrap(arr) {
    var out = ['']
    var l = 0
    var line

    line = process.stdout.columns
    if (!line) {
        line = 60
    } else {
        line = Math.min(60, Math.max(line - 16, 24))
    }

    arr.sort(function(a, b) { return a < b ? -1 : 1 })
        .forEach(function(c) {
            if (out[l].length + c.length + 2 < line) {
                out[l] += ', ' + c
            } else {
                out[l++] += ','
                out[l] = c
            }
        })
    return out.join('\n    ').substr(2)
}