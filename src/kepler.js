let Kepler = (()=>{

  setup()
  var _events = {};

  return {
    components: new Map(),
    Component: function(element, opts){

      let importee = (document._currentScript || document.currentScript).ownerDocument;
      var template = importee.querySelector(element)
      let prototype = Object.create(HTMLElement.prototype)
      prototype._vm = addDataBinding.call(prototype, opts.properties, template)
      prototype._vm._root = null

      prototype.createdCallback = function(){
        prototype._vm._root = this.createShadowRoot()
        let callback = (function(){
          //duplicates node appends it to shadowroot
          prototype._vm._root.appendChild(document.importNode(template.content, true))
          Kepler.components.set(this, {template: template})
        }).bind(this)
        //fetch linked styles in template and create styletag
        if(template.content.querySelector('link[rel="import"]')){
          getStyleSheet(template.content, callback)
        } else {
          callback()
        }
      }

      prototype.attachedCallback = function(){
        //bind listeners to the elements within the template
        let listeners = opts.listeners
        for(let event in opts.listeners){
          for(let element in listeners[event]){
            let els = this._vm._root.querySelectorAll(element)
            els.forEach((el)=>{
              el.addEventListener(event, listeners[event][element])
            })
          }
        }

        //bind methods to web-component
        for(let methodName in opts.methods){
          this[methodName] = opts.methods[methodName].bind(this)
        }
        if(opts.methods.init){
          opts.methods.init.call(this)
        }

        this._vm._root.innerHTML = parse(template, opts.properties)
      }

      prototype.detachedCallback = function(){
        Kepler.components.delete(this)
      }

      prototype.attributeChangedCallback = function(){
        console.log('attr')
      }

      return this.register(prototype, opts.name || element.slice(1))
    },

    register: function(prototype, name){
      return ((prototype, name)=>{
        return document.registerElement(name, {
          prototype: prototype
        })
      }).call(window, prototype, name)
    },

    on: function(event, callback){
        if(_events[event]) console.warn(`'${event}' already exists, and was overwritten.`)
        _events[event] = callback
    },

    trigger: function(event, context, args = []){
      var cb = _events[event]
      if(cb){
        return cb.apply(context, args)
      } else {
        console.warn('There is no event by the name of '+event)
      }
    },
  }// end KEPLER Object


  /*
    HELPERS
  ~~~~~~~~~~~~~~~~~~~~~~~~ */
  function getStyleSheet(fragment, cb){
    var path = fragment.querySelector('link').getAttribute('href')
    let xhr = new XMLHttpRequest();
    // false makes it synchronous!!!
    xhr.open('GET', path, false)
    xhr.onload = (e)=>{
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          createStyleTag(fragment, xhr.responseText)
          cb()
        } else {
          console.error(xhr.statusText);
        }
      }
    }
    xhr.onerror = (e)=>{
    }
    xhr.send(null)
  }

  function createStyleTag(fragment, styleText){
    //add encapsulated styles to fragment
    var encapsulatedStyle = document.createElement('style')
    encapsulatedStyle.innerHTML = styleText
    fragment.insertBefore(encapsulatedStyle, fragment.firstElementChild)
  }

  /*
    Parse
  searches throught the `catalog`, and replaces the keys with the valuse in `values`
  ~~~~~~~~~~~~~~~*/
  function parse(catalog, values){
    var template = catalog.innerHTML || catalog;
    var re = /\$\{([^\}]+)?\}/g,
        match;
    while(match = re.exec(template)){
      template = template.replace(match[0], values[match[1]])
    }
    return template
  }


  function addDataBinding(obj, handler){
    let copy = Object.assign({}, obj, true)
    let bound = {}
    Object.keys(copy).forEach((key)=>{
      bound[key] = {
        get: function(){
          return copy[key]
        },
        set: function(d){
          console.log(this)
          debugger;

          /*
            The template at this point is the UPDATED Element..
            meaning that it no longer has the binding
            I need references to where the the original ${} was.
          */
          this._root.innerHTML = parse(this._root, this )
          return  copy[key] = d
        }
      }
    })
    return Object.defineProperties(obj, bound)
  }

























  /*

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  // function extendBrowserSupport(){
  //   if (!Object.prototype.watch)
  //       Object.prototype.watch = function (prop, handler) {
  //           var oldval = this[prop], newval = oldval,
  //           getter = function () {
  //               return newval;
  //           },
  //           setter = function (val) {
  //               oldval = newval;
  //               return newval = handler.call(this, prop, oldval, val);
  //           };
  //           if (delete this[prop]) { // can't watch constants
  //               if (Object.defineProperty) // ECMAScript 5
  //                   Object.defineProperty(this, prop, {
  //                       get: getter,
  //                       set: setter
  //                   });
  //               else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
  //                   Object.prototype.__defineGetter__.call(this, prop, getter);
  //                   Object.prototype.__defineSetter__.call(this, prop, setter);
  //               }
  //           }
  //       };

  //   // object.unwatch
  //   if (!Object.prototype.unwatch)
  //       Object.prototype.unwatch = function (prop) {
  //           var val = this[prop];
  //           delete this[prop]; // remove accessors
  //           this[prop] = val;
  //       };
  // }

  function setup(){
    // extendBrowserSupport()
  }

})()