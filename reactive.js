var EventEmitter = require('events').EventEmitter;

function Reactive(uri) {
  if (!(this instanceof Reactive)) {
    return new Reactive(uri);
  }

  this.setMaxListeners(0); // infinity

  var oplog = require('mongo-oplog')(uri || 'mongodb://127.0.0.1:27017/local').tail();
  var root = this;

  oplog.on('error', function(err) {
    root.emit('error', err);
  });

  oplog.on('op', function(raw) {
    var ns = raw.ns.split('.');
    var op = raw.op === 'i' ? 'insert' :
      raw.op === 'd' ? 'delete' :
      raw.op === 'u' ? 'update' :
      false;

    if (op === false) {
      return;
    }

    // emitting from each portion of ns
    while (ns.length) {
      root.emit(ns.join('.'), op, raw.o, raw.o2, raw);
      ns.pop();
    }
  });

  function Reference(ns) {
    if (!(this instanceof Reference)) {
      return new Reference(ns);
    }

    this.ns = ns;
    this.setMaxListeners(0); // infinity

    var self = this;

    root.on(this.ns, function(op, doc, query, raw) {
      self.emit('op', op, doc);
      self.emit(op, doc, query, raw);
    });
  }
  Reference.prototype.__proto__ = EventEmitter.prototype;

  return Reference;
}
Reactive.prototype.__proto__ = EventEmitter.prototype;

module.exports = Reactive;
