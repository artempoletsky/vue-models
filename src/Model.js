import EventDispatcher from './EventDispatcher';
import Vue from 'vue';

let modelsMap = {};

const Model = EventDispatcher.extend({
  mapping: false,
  fields: {},
  idAttribute: 'id',
  constructor(data = {}) {
    let parsed = this.parse(data);
    for (let key in this.fields) {
      Vue.set(this, key, parsed[key] || this.fields[key]);
    }

    if (this.mapping && this[idAttribute]) {
      modelsMap[this.mapping] = modelsMap[this.mapping] || {};
      modelsMap[this.mapping][this.id] = this;
    }
  },

  serialize() {
    return Object.assign({}, this.attributes);
  },

  toJSON() {
    return this.serialize();
  },

  parse(json) {
    return json;
  },

  update(json) {
    let data = this.parse(json);
    for (var key in data) {
      Vue.set(this, key, data[key]);
    }
    return this;
  }
});

Model.fromStorage = function(name, id) {
  modelsMap[name] = modelsMap[name] || {};
  return modelsMap[name][id];
};

Model.createOrUpdate = function(constuctor, json) {
  var proto = constuctor.prototype,
    fromStorage, idAttr, parsed;
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

export default Model;
