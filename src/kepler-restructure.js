class Kepler {
  constructor(){
    this.components = []
  }

  static Component(opts){
    let importee = (document._currentScript || document.currentScript).ownerDocument;
    var template = importee.querySelector(opts.element)
    let prototype = Object.create(HTMLElement.prototype)
    prototype._root = null

    prototype.createdCallback = function(){
      prototype._root = this.createShadowRoot()

      let callback = (function(){
        //duplicates node appends it to shadowroot
        prototype._root.appendChild(document.importNode(template.content, true))
      }).bind(this)

      //fetch linked styles in template and create styletag
      if(template.content.querySelector('link[rel="import"]')){
        getStyleSheet(template.content, callback)
      } else {
        callback()
      }
    }

    prototype.attachedCallback = function(){
      let listeners = opts.listeners
      for(let event in opts.listeners){
        for(let element in listeners[event]){
          let els = this._root.querySelectorAll(element)
          els.forEach((el)=>{
            el.addEventListener(event, listeners[event][element])
          })
        }
      }
    }
    prototype.detachedCallback = function(){
      //TODO: detach event listeners ??? maybe dont have to
      console.log('detached')
    }

    prototype.attributeChangedCallback = function(){
      console.log('attribute changed callback')
    }


    return this.register(prototype, opts.name)
  }




  getStyleSheet(fragment, cb){
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
      console.log(xhr.statusText)
    }
    xhr.send(null)
  }

  createStyleTag(fragment, styleText){
    let result = findEncapsulatedStyles(styleText)
    //add encapsulated styles to fragment
    var encapsulatedStyle = document.createElement('style')
    encapsulatedStyle.innerHTML = result.tagged
    fragment.insertBefore(encapsulatedStyle, fragment.firstElementChild)


    //add styles to Global Stylesheet
    let globalStyle = document.createElement('style')
    globalStyle.innerHTML = result.untagged
    document.head.appendChild(globalStyle)
  }

  findEncapsulatedStyles(styleString){
    let result = {
      tagged: [],
      untagged: []
    }

    let initialTagged = styleString.match(/\:kepler[^{]+[^}]+/gi)
    if(initialTagged){
      result.tagged = initialTagged.map((el)=>{
        styleString = styleString.replace(el+'}', '')
        el = el.replace(/\:kepler /gi,'')
        return el += '}'
      })
      result.tagged = result.tagged.join('\n')
    }
    result.untagged.push(styleString.trim())
    result.untagged = result.untagged.join('\n')

    console.log(result)
    return result
  }

  static register(prototype, name){
    return ((prototype, name)=>{
      return document.registerElement(name, {
        prototype: prototype
      })
    }).call(window, prototype, name)
  }
}
