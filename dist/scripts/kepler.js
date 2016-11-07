'use strict';

var Kepler = function () {
  var _events = {};

  return {
    components: new Map(),
    //COMPONENT CREATOR
    Component: function Component(element, opts) {

      var importee = (document._currentScript || document.currentScript).ownerDocument;
      var template = importee.querySelector(element);
      var prototype = Object.create(HTMLElement.prototype);
      //TODO -- ADD DATABINDING
      prototype._vm = addDataBinding.call(prototype, opts.properties, template);

      //TODO -- move the _root
      prototype._vm._root = null;

      prototype.createdCallback = function () {
        prototype._vm._root = this.createShadowRoot();
        var callback = function () {
          //duplicates node appends it to shadowroot
          prototype._vm._root.appendChild(document.importNode(template.content, true));
          Kepler.components.set(this, { template: template });
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
          var _loop2 = function _loop2(_element) {
            var els = _this._vm._root.querySelectorAll(_element);
            els.forEach(function (el) {
              el.addEventListener(event, listeners[event][_element]);
            });
          };

          for (var _element in listeners[event]) {
            _loop2(_element);
          }
        };

        for (var event in opts.listeners) {
          _loop(event);
        }

        //bind methods to web-component
        for (var methodName in opts.methods) {
          this[methodName] = opts.methods[methodName].bind(this);
        }
        if (opts.methods.init) {
          opts.methods.init.call(this);
        }

        this._vm._root.innerHTML = parse(template, opts.properties);
      };

      prototype.detachedCallback = function () {
        Kepler.components.delete(this);
      };

      prototype.attributeChangedCallback = function () {
        console.log('attr');
      };

      return this.register(prototype, opts.name || element.slice(1));
    },

    //MODEL CLASS
    Model: function Model(opts) {
      var obj = Object.assign(opts, {
        set: function set(prop, d) {
          //ADD DATABINDING HERE
          this[prop] = d;
        },
        get: function get(prop) {
          //ADD DATABINDING HERE
          return this[prop];
        }
      }, true);
      return obj;
    }, // END MODEL


    /*
      EXTRA CREDIT
    ~~~~~~~~~~~~~~~~~~~~~~~ */

    register: function register(prototype, name) {
      return function (prototype, name) {
        return document.registerElement(name, {
          prototype: prototype
        });
      }.call(window, prototype, name);
    },

    on: function on(event, callback) {
      if (_events[event]) console.warn('\'' + event + '\' already exists, and was overwritten.');
      _events[event] = callback;
    },

    trigger: function trigger(event, context) {
      var args = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

      var cb = _events[event];
      if (cb) {
        return cb.apply(context, args);
      } else {
        console.warn('There is no event by the name of ' + event);
      }
    }
  };

  /*
    HELPERS
  ~~~~~~~~~~~~~~~~~~~~~~~~ */
  function getStyleSheet(fragment, cb) {
    var path = fragment.querySelector('link').getAttribute('href');
    var xhr = new XMLHttpRequest();
    // false makes it synchronous!!!
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

  /*
    Parse
  searches throught the `catalog`, and replaces the keys with the valuse in `values`
  ~~~~~~~~~~~~~~~*/
  function parse(catalog, values) {
    debugger;
    var template = catalog.innerHTML || catalog;
    var re = /\{\{([^\}]+)?\}\}/g,
        // matches {{ thing.here }}
    match;
    while (match = re.exec(template)) {
      template = findTag(match, values[match[1]]);
    }
    return template;
  }

  function addDataBinding(obj, handler) {
    var copy = Object.assign({}, obj, true);
    var bound = {};
    Object.keys(copy).forEach(function (key) {
      bound[key] = {
        get: function get() {
          return copy[key];
        },
        set: function set(d) {
          console.log(this);
          debugger;

          /*
            The template at this point is the UPDATED Element..
            meaning that it no longer has the binding
            I need references to where the the original {{}} was.
          */

          /*
          TODO <<<<<<< 11/3/2016 | 6:09pm
              compile a list of references with the k-tags in the _vm and use
              those to be set but the parse
           IDEA <<<<
              You could grab the references made to k-tag on the components
              attached lifecycle, create a MAP of those references, with the
              DOMElement => template w/ {{}} ... and then remove the k-tags.
              It was like you were never there!!!!!
          */

          copy[key] = d;
          this._root.innerHTML = parse(this._root, copy);
          return;
        }
      };
    });
    return Object.defineProperties(obj, bound);
  }

  /*  --  FIND TAG
     This takes a REGEXP match object, and a value to replace that
    match's input text with, and returns a new HTML String where the DOM
    element that contained the match is marked with:
     `k-tag = {{name_of_property}}`
     So if the component has a property of `title: 'Kepler'`, and the template text
    looks like this `<h1> Chapter 1: {{title}}</h1>`, findTag will spit out:
     `<h1 k-tag='kepler'> Chapter 1: Kepler</h1>`
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  function findTag(match, value) {
    var input = match.input;
    var index = match.index;
    var htmlString = void 0,
        taggedHTMLString = void 0,
        replacedTaggedHTMLString = void 0,
        newTemplate = void 0,
        DOMElement = void 0,
        parser = new DOMParser(),
        result = [];
    while (input[index] != '<') {
      index -= 1;
    }
    while (result.length < 4) {
      if (input[index] == ">" || input[index] == "<") {
        result.push(index);
      }
      index += 1;
    }
    result[3] += 1;
    htmlString = input.slice(result[0], result[3]);
    DOMElement = parser.parseFromString(htmlString, 'text/xml').firstChild;
    DOMElement.setAttribute('k-tag', match[1]);
    taggedHTMLString = DOMElement.outerHTML;
    replacedTaggedHTMLString = taggedHTMLString.replace(new RegExp(match[0], 'g'), value);
    newTemplate = input.replace(htmlString, replacedTaggedHTMLString);
    return newTemplate;
  }
}();