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

oplog.setMaxListeners(0); // infinity

oplog.on('op', function(data) {
  var ns = data.ns.split('.');
  var op = data.op === 'i' ? 'insert' :
    data.op === 'r' ? 'remove' :
    false;

  if (op === false) {
    return;
  }

  // emitting from each portion of ns
  while (ns.length) {
    oplog.emit([
      'ref::',
      ns.join('.'),
      '::',
      op
    ].join(''), data.o);
    ns.pop();
  }
});

function Reference(ns) {
  if (!(this instanceof Reference)) return new Reference(ns);

  this.ns = ns;
}
Reference.prototype.__proto__ = EventEmitter.prototype;

Reference.prototype.on = function(op, callback) {
  oplog.on([
    'ref::',
    this.ns,
    '::',
    op
  ].join(''), callback);
};

module.exports = Reference;
