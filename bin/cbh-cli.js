#!/usr/bin/env node
;(function () {
  var cbh = require('../lib/cbh.js')

  var command = require('../lib/config/cmd-list.js')
  var shorthands = command.shorthands
  var types = command.types
  var nopt = require('nopt')

  var conf = nopt(types, shorthands)
  cbh.argv = conf.argv.remain
  if (cbh.deref(cbh.argv[0])) cbh.command = cbh.argv.shift()
  else conf.usage = true

  if (conf.usage && cbh.command !== 'help') {
    cbh.argv.unshift(cbh.command)
    cbh.command = 'help'
  }

  // 运行命令
  // now actually fire up npm and run the command.
  // this is how to use npm programmatically:
  conf._exit = true
  cbh.load(conf, function (er) {
    if (er) return console.error(er);
    cbh.commands[cbh.command](cbh.argv, function (err) {
      console.error(err);
    })
  })
})()
