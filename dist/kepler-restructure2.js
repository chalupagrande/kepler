'use strict';

var Kepler = function () {

  return {
    components: new Map(),
    Component: function Component(opts) {
      var importee = (document._currentScript || document.currentScript).ownerDocument;
      var template = importee.querySelector(opts.element);
      var prototype = Object.create(HTMLElement.prototype);
      Object.assign(prototype._vm, opts.properties);
      prototype._vm.root = null;

      prototype.createdCallback = function () {
        prototype._vm.root = this.createShadowRoot();
        var callback = function () {
          //duplicates node appends it to shadowroot
          prototype._vm.root.appendChild(document.importNode(template.content, true));
          Kepler.components.set(this, { jamie: true });
        }.bind(this);
        //fetch linked styles in template and create styletag
        if (template.content.querySelector('link[rel="import"]')) {
          getStyleSheet(template.content, callback);
        } else {
          callback();
        }
      };

      prototype.attachedCallback = function () {
        var _this = this;

        //bind listeners to the elements within the template
        var listeners = opts.listeners;

        var _loop = function _loop(event) {
          var _loop2 = function _loop2(element) {
            var els = _this._vm.root.querySelectorAll(element);
            els.forEach(function (el) {
              el.addEventListener(event, listeners[event][element]);
            });
          };

          for (var element in listeners[event]) {
            _loop2(element);
          }
        };

        for (var event in opts.listeners) {
          _loop(event);
        }
        //bind methods to web-component
        for (var methodName in opts.methods) {
          this[methodName] = opts.methods[methodName];
        }

        if (opts.methods.init) {
          opts.methods.init.call(this);
        }
      };

      prototype.detachedCallback = function () {
        Kepler.components.delete(this);
      };

      prototype.attributeChangedCallback = function () {
        console.log('attr');
      };

      return this.register(prototype, opts.name);
    },

    register: function register(prototype, name) {
      return function (prototype, name) {
        return document.registerElement(name, {
          prototype: prototype
        });
      }.call(window, prototype, name);
    }
  };

  /*
    HELPERS
  ~~~~~~~~~~~~~~~~~~~~~~~~ */
  function getStyleSheet(fragment, cb) {
    var path = fragment.querySelector('link').getAttribute('href');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, false);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          createStyleTag(fragment, xhr.responseText);
          cb();
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {};
    xhr.send(null);
  }

  function createStyleTag(fragment, styleText) {
    //add encapsulated styles to fragment
    var encapsulatedStyle = document.createElement('style');
    encapsulatedStyle.innerHTML = styleText;
    fragment.insertBefore(encapsulatedStyle, fragment.firstElementChild);
  }
}();