var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    u: 'uri'
  },
  default: {
    uri: 'mongodb://127.0.0.1:27017/local'
  }
});

var EventEmitter = require('events').EventEmitter;
var oplog = require('mongo-oplog')(argv.uri).tail();

oplog.on('op', function(data) {
  var ns = data.ns.split('.');
  var op = data.op === 'i' ? 'insert' :
    data.op === 'r' ? 'remove' : false;

  if (op === false) {
    return;
  }

  // emitting from each portion of ns
  while (ns.length) {
    oplog.emit('ref::' + ns.join('.'), op, data.o);
    ns.pop();
  }
});

function Reference(ns) {
  if (!(this instanceof Reference)) return new Reference(ns);

  this.ns = ns;
  return this;
}
Reference.prototype.__proto__ = EventEmitter.prototype;

module.exports = Reference;