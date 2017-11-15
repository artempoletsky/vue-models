'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _EventDispatcher = require('./EventDispatcher');

var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var modelsMap = {};

var Model = _EventDispatcher2.default.extend({
  mapping: false,
  fields: {},
  idAttribute: 'id',
  constructor: function constructor() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var parsed = this.parse(data);
    for (var key in this.fields) {
      _vue2.default.set(this, key, parsed[key] || this.fields[key]);
    }

    if (this.mapping && this[this.idAttribute]) {
      modelsMap[this.mapping] = modelsMap[this.mapping] || {};
      modelsMap[this.mapping][this.id] = this;
    }
  },
  serialize: function serialize() {
    return Object.assign({}, this.attributes);
  },
  toJSON: function toJSON() {
    return this.serialize();
  },
  parse: function parse(json) {
    return json;
  },
  update: function update(json) {
    var data = this.parse(json);
    for (var key in data) {
      _vue2.default.set(this, key, data[key]);
    }
    return this;
  }
});

Model.fromStorage = function (name, id) {
  modelsMap[name] = modelsMap[name] || {};
  return modelsMap[name][id];
};

Model.createOrUpdate = function (constuctor, json) {
  var proto = constuctor.prototype,
      fromStorage,
      idAttr,
      parsed;
  if (proto.mapping) {
    idAttr = proto.idAttribute;
    parsed = proto.parse(json);
    fromStorage = Model.fromStorage(proto.mapping, parsed[idAttr]);
    if (fromStorage) {
      fromStorage.update(json);
      return fromStorage;
    }
  }
  return new constuctor(json);
};

exports.default = Model;