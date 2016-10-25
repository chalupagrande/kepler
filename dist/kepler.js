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
    node.createdCallback = function () {
      this._root = this.createShadowRoot();
      var callback = function () {
        var clone = document.importNode(template.content, true);

        // complicates things
        // if(opts.expose){
        //   this.appendChild(clone)
        // } else {
        //   this._root.appendChild(clone)
        // }
        this._root.appendChild(clone);

        console.log('calling back');
      }.bind(this);
      getStyleSheet(template.content, callback);
    };

    //attachedCallback
    node.attachedCallback = function () {
      var _this = this;

      console.log('attached');
      //attach event listeners
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

      for (var event in listeners) {
        _loop(event);
      }
    };
    node.detachedCallback = function () {
      console.log('detachedCallback');

      //TODO: detach event listeners? Not sure if i need to
    };
    //attributeChangedCallback
    node.attributeChangedCallback = function () {
      console.log('attribtue changed');
    };

    node._foo = function () {
      console.log('fooooooo');
    };

    var register = function register() {
      document.registerElement(opts.name, {
        prototype: node
      });
    };
    register.call(window);

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

function getStyleSheet(fragment, cb) {
  var path = fragment.querySelector('link').getAttribute('href');

  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, false);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
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

function createDemoStyleTag(fragment) {
  var style = document.createElement('style');
  style.innerHTML = "button { background-color: cyan}";
  fragment.content.appendChild(style);
}

function createStyleTag(fragment, styleText) {
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

// TODO:  make this regex more elegant.
// TODO / IDEA: reverse the meaning of TAGGED/UNTAGGED depending on whether
//    or not the expose variable is true.
function findEncapsulatedStyles(styleString) {
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