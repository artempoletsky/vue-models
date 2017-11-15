'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Class = require('./Class');

var _Class2 = _interopRequireDefault(_Class);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var eventSplitter = /\s+/,
    namespaceSplitter = '.',
    makeBind = function makeBind(event, fn, context, isSignal) {
  var arr = event.split(namespaceSplitter);
  return {
    c: context,
    s: isSignal,
    fn: fn,
    n: arr[0], //name
    ns: arr.slice(1) //namespace array
  };
},
    compare = function compare(request, target) {
  var compared = (!request.fn || request.fn === target.fn) && (!request.n || request.n === target.n) && (!request.c || request.c === target.c),
      ns2 = void 0;
  //сравнивает пространсва имен
  if (compared && request.ns.length) {
    ns2 = target.ns;
    compared = !request.ns.some(function (val) {
      return ns2.indexOf(val);
    });
  }
  return compared;
},
    findBinds = function findBinds(binds, event, fn, context, mode) {
  var result = mode === 'any' ? false : [],
      bind = makeBind(event, fn, context),
      bindsArray = void 0,
      l = void 0,
      i = void 0,
      bindObject = void 0,
      compared = void 0,
      ns2 = void 0;
  if (!mode) {
    mode = 'filter';
  }
  if (!binds[bind.n]) {
    return result;
  }

  bindsArray = binds[bind.n];

  for (i = 0, l = bindsArray.length; i < l; i++) {
    bindObject = bindsArray[i];

    if (compare(bind, bindObject)) {
      if (mode === 'filter') {
        result.push(bindObject);
      } else if (mode === 'any') {
        result = true;
        break;
      }
    }
  }

  return result;
},
    remove = function remove(me, event, fn, context) {
  var bind = void 0,
      i = void 0,
      l = void 0,
      listeners = {},
      key = void 0,
      binds = void 0;
  if (!me._listeners) {
    return;
  }
  if (!event && !fn && !context) {
    delete me._listeners;
    return;
  }

  bind = makeBind(event, fn, context);

  if (!bind.ns.length && !fn && !context) {
    delete me._listeners[bind.n];
    return;
  }

  if (bind.n && !me._listeners[bind.n]) {
    return;
  }

  if (bind.n) {
    listeners[bind.n] = me._listeners[bind.n];
  } else {
    listeners = me._listeners;
  }

  for (key in listeners) {
    binds = listeners[key];
    for (i = 0; i < binds.length; i++) {
      if (compare(bind, binds[i])) {
        binds.splice(i, 1);
        i--;
      }
    }
  }
};

var EventDispatcher = _Class2.default.extend({
  on: function on(events, fn, context, callOnce) {
    var self = this,
        ctx = void 0,
        eventNames = void 0,
        i = void 0,
        l = void 0,
        event_name = void 0,
        bind = void 0,
        binds = void 0,
        curBind = void 0;

    if ((typeof events === 'undefined' ? 'undefined' : _typeof(events)) == 'object') {
      ctx = fn || self;
      for (event_name in events) {
        self.on(event_name, events[event_name], ctx, callOnce);
      }
      return this;
    }

    if (typeof fn !== 'function') {
      throw TypeError('function expected');
    }

    if (!context) {
      context = self;
    }

    eventNames = events.split(eventSplitter);
    for (i = 0, l = eventNames.length; i < l; i++) {
      bind = makeBind(eventNames[i], fn, context, callOnce);

      binds = self._listeners || {};

      curBind = binds[bind.n] || [];

      curBind.push(bind);

      binds[bind.n] = curBind;

      self._listeners = binds;
    }
    return self;
  },
  off: function off(events, fn, context) {
    var me = this,
        i = void 0,
        l = void 0,
        eventNames = void 0;
    if (!events) {
      remove(me, '', fn, context);
      return me;
    }

    eventNames = events.split(eventSplitter);
    for (i = 0, l = eventNames.length; i < l; i++) {
      remove(me, eventNames[i], fn, context);
    }
    return me;
  },
  fire: function fire(events) {
    if (!this._listeners) {
      return this;
    }

    var me = this,
        i = void 0,
        l = void 0,
        eventNames = void 0,
        bind = void 0,
        bindsArray = void 0,
        j = void 0,
        bindObject = void 0;

    eventNames = events.split(eventSplitter);

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    for (i = 0, l = eventNames.length; i < l; i++) {

      bind = makeBind(eventNames[i], false, false);

      if (bind.n) {
        bindsArray = me._listeners[bind.n];
        if (!bindsArray) {
          return me;
        }

        for (j = 0; j < bindsArray.length; j++) {
          bindObject = bindsArray[j];

          if (compare(bind, bindObject)) {
            //если забинден через one  удаляем
            if (bindObject.s) {
              bindsArray.splice(j, 1);
              j--;
            }

            bindObject.fn.apply(bindObject.c, rest);
          }
        }
      } else {
        throw 'not implemented';
      }
    }
    return me;
  },
  one: function one(events, fn, context) {
    return this.on(events, fn, context, true);
  },
  hasListener: function hasListener(event) {
    if (!this._listeners) {
      return false;
    }
    return findBinds(this._listeners, event, false, false, 'any');
  }
});
EventDispatcher.prototype.trigger = EventDispatcher.prototype.fire;

exports.default = EventDispatcher;