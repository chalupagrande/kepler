'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Kepler = function () {
  function Kepler() {
    _classCallCheck(this, Kepler);

    this.components = [];
    this.register = function (name, prototype) {
      return document.registerElement(name, { prototype: prototype });
    }.bind(window);
  }

  _createClass(Kepler, [{
    key: 'getStyleSheet',
    value: function getStyleSheet(fragment, cb) {
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
      xhr.onerror = function (e) {
        console.log(xhr.statusText);
      };
      xhr.send(null);
    }
  }, {
    key: 'createStyleTag',
    value: function createStyleTag(fragment, styleText) {
      var result = findEncapsulatedStyles(styleText);
      //add encapsulated styles to fragment
      var encapsulatedStyle = document.createElement('style');
      encapsulatedStyle.innerHTML = result.tagged;
      fragment.insertBefore(encapsulatedStyle, fragment.firstElementChild);

      //add styles to Global Stylesheet
      var globalStyle = document.createElement('style');
      globalStyle.innerHTML = result.untagged;
      document.head.appendChild(globalStyle);
    }
  }, {
    key: 'findEncapsulatedStyles',
    value: function findEncapsulatedStyles(styleString) {
      var result = {
        tagged: [],
        untagged: []
      };

      var initialTagged = styleString.match(/\:kepler[^{]+[^}]+/gi);
      if (initialTagged) {
        result.tagged = initialTagged.map(function (el) {
          styleString = styleString.replace(el + '}', '');
          el = el.replace(/\:kepler /gi, '');
          return el += '}';
        });
        result.tagged = result.tagged.join('\n');
      }
      result.untagged.push(styleString.trim());
      result.untagged = result.untagged.join('\n');

      console.log(result);
      return result;
    }
  }], [{
    key: 'Component',
    value: function Component(opts) {
      debugger;
      var importee = (document._currentScript || document.currentScript).ownerDocument;
      var template = importee.querySelector(opts.element);
      var prototype = Object.create(HTMLElement.prototype);
      prototype._root = null;

      prototype.createdCallback = function () {
        debugger;
        prototype._root = this.createShadowRoot();
        var callback = function () {
          //duplicates node appends it to shadowroot
          prototype._root.appendChild(document.importNode(template.content, true));
        }.bind(this);
        //fetch linked styles in template and create styletag
        getStyleSheet(template.content, callback);
      };

      prototype.attachedCallback = function () {
        var _this = this;

        debugger;
        var listeners = opts.listeners;

        var _loop = function _loop(event) {
          var _loop2 = function _loop2(element) {
            var els = _this._root.querySelectorAll(element);
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
      };
      prototype.detachedCallback = function () {
        //TODO: detach event listeners ??? maybe dont have to
        console.log('detached');
      };

      prototype.attributeChangedCallback = function () {
        console.log('attribute changed callback');
      };

      return prototype;
    }
  }, {
    key: 'register',
    value: function register() {}
  }]);

  return Kepler;
}();