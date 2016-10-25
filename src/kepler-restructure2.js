let Kepler = (()=>{

  return {
    components: new Map(),
    Component: function(element, opts){

      let importee = (document._currentScript || document.currentScript).ownerDocument;
      var template = importee.querySelector(element)
      let prototype = Object.create(HTMLElement.prototype)
      prototype._vm = Object.assign({}, opts.properties)
      prototype._vm._root = null

      prototype.createdCallback = function(){
        prototype._vm._root = this.createShadowRoot()
        let callback = (function(){
          //duplicates node appends it to shadowroot
          prototype._vm._root.appendChild(document.importNode(template.content, true))
          Kepler.components.set(this, {jamie: true})
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
    }
  }


  /*
    HELPERS
  ~~~~~~~~~~~~~~~~~~~~~~~~ */
  function getStyleSheet(fragment, cb){
    var path = fragment.querySelector('link').getAttribute('href')
    let xhr = new XMLHttpRequest();
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

})()