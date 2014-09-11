var EventEmitter = require('events').EventEmitter;

function Reactive(uri) {
  if (!(this instanceof Reactive)) {
    return new Reactive(uri);
  }

  var oplog = require('mongo-oplog')(uri || 'mongodb://127.0.0.1:27017/local').tail();
  var root = this;

  oplog.on('error', function(err) {
    root.emit('error', err);
  });

  oplog.on('op', function(data) {
    var ns = data.ns.split('.');
    var op = data.op === 'i' ? 'insert' :
      data.op === 'd' ? 'delete' :
      data.op === 'u' ? 'update' :
      false;

    if (op === false) {
      return;
    }

    // emitting from each portion of ns
    while (ns.length) {
      root.emit(ns.join('.'), op, data.o);
      ns.pop();
    }
  });

  function Reference(ns) {
    if (!(this instanceof Reference)) {
      return new Reference(ns);
    }

    this.ns = ns;
    var self = this;

    root.on(this.ns, function(op, doc) {
      self.emit('op', op, doc);
      self.emit(op, doc);
    });
  }
  Reference.prototype.__proto__ = EventEmitter.prototype;

  return Reference;
}
Reactive.prototype.__proto__ = EventEmitter.prototype;

module.exports = Reactive;
