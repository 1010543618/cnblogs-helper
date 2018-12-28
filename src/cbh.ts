import { aliases, cmdList } from './config/cmd-list';
import {default as defaultConfig} from './config/config';

// 实例化 cbh 为 EventEmitter
var EventEmitter = require('events').EventEmitter

var fs = require('fs');
var path = require('path')
var abbrev = require('abbrev')

let cbh = new EventEmitter()
// config
cbh.config = {
    loaded: false,
    get: function(key) {
        if (!this.loaded) throw new Error('cbh.load() required');
        return this[key];
    },
    set: function(key, val) {
        if (!this.loaded) throw new Error('cbh.load() required');
        return this[key] = val;
    }
}

// commands
cbh.commands = {}

// cbh 的 name 和 version
try {
    // startup, ok to do this synchronously
    var j = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../package.json')) + '')
    cbh.name = j.name
    cbh.version = j.version
} catch (ex) {
    try {
        console.info('error reading version', ex)
    } catch (er) {}
    cbh.version = ex
}

// 初始化命令和别名
var commandCache = {}
var aliasNames = Object.keys(aliases)

var fullList = cmdList.concat(aliasNames)
var abbrevs = abbrev(fullList)

var registryRefer
var registryLoaded

Object.keys(abbrevs).forEach(function addCommand(c) {
    Object.defineProperty(cbh.commands, c, {
        get: function() {
            if (!loaded) {
                throw new Error(
                    'Call cbh.load(config, cb) before using this command.\n' +
                    'See the README.md or bin/cbh-cli.js for example usage.'
                )
            }
            var a = cbh.deref(c)

            cbh.command = c
            if (commandCache[a]) return commandCache[a]

            // 引用 typescript 生成的 cjs
            var cmd = require(path.join(__dirname, a + '.js')).default

            commandCache[a] = function() {
                var args = Array.prototype.slice.call(arguments, 0)
                if (typeof args[args.length - 1] !== 'function') {
                    args.push(defaultCb)
                }
                if (args.length === 1) args.unshift([])

                // Options are prefixed by a hyphen-minus (-, \u2d).
                // Other dash-type chars look similar but are invalid.
                Array(args[0]).forEach(function(arg) {
                    if (/^[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.test(arg)) {
                        console.error('arg', 'Argument starts with non-ascii dash, this is probably invalid:', arg)
                    }
                })

                if (!registryRefer) {
                    registryRefer = [a].concat(args[0]).map(function(arg) {
                        // exclude anything that might be a URL, path, or private module
                        // Those things will always have a slash in them somewhere
                        if (arg && arg.match && arg.match(/\/|\\/)) {
                            return '[REDACTED]'
                        } else {
                            return arg
                        }
                    }).filter(function(arg) {
                        return arg && arg.match
                    }).join(' ')
                    if (registryLoaded) cbh.registry.refer = registryRefer
                }

                cmd.apply(cbh, args)
            }

            Object.keys(cmd).forEach(function(k) {
                commandCache[a][k] = cmd[k]
            })

            return commandCache[a]
        },
        enumerable: fullList.indexOf(c) !== -1,
        configurable: true
    })

    // make css-case commands callable via camelCase as well
    if (c.match(/-([a-z])/)) {
        addCommand(c.replace(/-([a-z])/g, function(a, b) {
            return b.toUpperCase()
        }))
    }
})

// 默认回调
function defaultCb(er, data) {
    if (er) console.error(er.stack || er.message)
    else console.log(data)
}

// 找到输入命令的真名
// PS: Purpose. DEREF returns the object reference of argument expr, where expr must return a REF to an object.
cbh.deref = function(c) {
    if (!c) return ''
    if (c.match(/[A-Z]/)) {
        c = c.replace(/([A-Z])/g, function(m) {
            return '-' + m.toLowerCase()
        })
    }
    var a = abbrevs[c]
    while (aliases[a]) {
        a = aliases[a]
    }
    return a
}

var loaded = false
var loading = false
var loadErr = null
var loadListeners = []

// 加载回调
function loadCb(er) {
    loadListeners.forEach(function(cb) {
        process.nextTick(cb.bind(cbh, er, cbh))
    })
    loadListeners.length = 0
}

// 加载命令（调用命令）
cbh.load = function(cli, cb_) {
    if (!cb_ && typeof cli === 'function') {
        cb_ = cli
        cli = {}
    }
    if (!cb_) cb_ = function() {}
    if (!cli) cli = {}
    loadListeners.push(cb_)
    if (loaded || loadErr) return cb(loadErr)
    if (loading) return
    loading = true

    function cb(er) {
        if (loadErr) return
        loadErr = er
        if (er) return cb_(er)
        initConfig(cli);
        loaded = true
        // 会调用 loadListeners 中的 cb_
        loadCb(loadErr = er)
    }

    cb(null);
}

// 简化调用（简化为通过 cbh 的属性调用）
// the better to repl you with
Object.getOwnPropertyNames(cbh.commands).forEach(function(n) {
    if (cbh.hasOwnProperty(n) || n === 'config') return

    Object.defineProperty(cbh, n, {
        get: function() {
            return function() {
                var args = Array.prototype.slice.call(arguments, 0)
                var cb = defaultCb

                if (args.length === 1 && Array.isArray(args[0])) {
                    args = args[0]
                }

                if (typeof args[args.length - 1] === 'function') {
                    cb = args.pop()
                }
                cbh.commands[n](args, cb)
            }
        },
        enumerable: false,
        configurable: true
    })
})

if (require.main === module) {
    require('../bin/cbh-cli.js')
}

function initConfig(cli){
    let userConfigPath = process.cwd() + '/cbhconfig.json';
    Object.assign(cbh.config, defaultConfig);
    
    if(fs.existsSync(userConfigPath)){
        Object.assign(cbh.config, require(userConfigPath));
    }
    
    cbh.config.opts = cli;
    cbh.config.loaded = true;
}

export default cbh;