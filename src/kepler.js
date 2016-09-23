class Kepler {
  /*
    opts: {
      element: CSS SELECTOR --id of component template
      name: STRING -- string for component name
      expose: BOOLEAN -- expose the component to the DOM
      createdCallback: FUNC -- function to be called when element is created
    }
  */
  constructor(opts){
    let importee = (document._currentScript || document.currentScript).ownerDocument;
    var template = importee.querySelector(opts.element)

    let node = Object.create(HTMLElement.prototype)
    //createdCallback
    node.createdCallback = function(){
      // createDemoStyleTag(template)
      let callback = (function(){
        let clone = document.importNode(template.content, true)
        if(opts.expose){
          this.appendChild(clone)
        } else {
          let root = this.createShadowRoot()
          root.appendChild(clone)
        }
      }).bind(this)
      getStyleSheet(template.content, callback)
    }

    //attachedCallback
    node.attachedCallback = function(){
      console.log('kepler attached', this)
    }
    //detachedCallback
    node.detachedCallback = function(){

    }
    //attributeChangedCallback
    node.attributeChangedCallback = function(){

    }

    
    node.foo = function(){
      console.log('fooooooo')
    }
    
    let register = function(){
      
      var jamie = document.registerElement(opts.name, {
        prototype: node
      })
      console.log('thing', this)
    }
    let k = register.bind(window)
    k()
  
    
    this.node = node
  }
  method(){
    console.log('KEPLER')
  }
}

/* Helpers 
~~~~~~~~~~~~~~ */


function getStyleSheet(fragment, cb){
  var path = fragment.querySelector('link').getAttribute('href')
  fetch(path).then(function(response){
    return response.blob()
  }).then(function(blob){
    var reader = new FileReader() 
    reader.addEventListener("loadend", function(){
      //SUCCESSFULLY FETCHED THE STYLES!!
      createStyleTag(fragment, this.result)
      cb()
    })
    reader.readAsText(blob)

  })

}


function createDemoStyleTag(fragment){
  debugger;
  var style = document.createElement('style')
  style.innerHTML = "button { background-color: cyan}"
  fragment.content.appendChild(style)

}

function createStyleTag(fragment, styleText){
  var style = document.createElement('style')
  style.innerHTML = styleText
  fragment.insertBefore(style, fragment.firstElementChild)
}