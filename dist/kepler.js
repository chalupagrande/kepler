'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Kepler = function () {
  /*
    opts: {
      element: CSS SELECTOR --id of component template
      name: STRING -- string for component name
      expose: BOOLEAN -- expose the component to the DOM
      createdCallback: FUNC -- function to be called when element is created
    }
  */
  function Kepler(opts) {
    _classCallCheck(this, Kepler);

    var importee = (document._currentScript || document.currentScript).ownerDocument;
    var template = importee.querySelector(opts.element);

    var node = Object.create(HTMLElement.prototype);
    //createdCallback
    node.createdCallback = function () {
      var clone = document.importNode(template.content, true);
      if (opts.expose) {
        this.appendChild(clone);
      } else {
        var root = this.createShadowRoot();
        root.appendChild(clone);
      }
    };

    //attachedCallback
    node.attachedCallback = function () {
      console.log('kepler attached', this);
    };
    //detachedCallback
    node.detachedCallback = function () {};
    //attributeChangedCallback
    node.attributeChangedCallback = function () {};

    node.foo = function () {
      console.log('fooooooo');
    };

    var register = function register() {

      var jamie = document.registerElement(opts.name, {
        prototype: node
      });
      console.log('thing', this);
    };
    var k = register.bind(window);
    k();

    this.node = node;
  }

  _createClass(Kepler, [{
    key: 'method',
    value: function method() {
      console.log('KEPLER');
    }
  }]);

  return Kepler;
}();

/* Helpers 
~~~~~~~~~~~~~~ */