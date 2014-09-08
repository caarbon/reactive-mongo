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

});

function Reactive() {
  if (!(this instanceof Reactive)) return new Reactive();
}
Reactive.prototype.__proto__ = EventEmitter.prototype;

module.exports = Reactive;
