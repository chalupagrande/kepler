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
      let clone = document.importNode(template.content, true)
      if(opts.expose){
        this.appendChild(clone)
      } else {
        let root = this.createShadowRoot()
        root.appendChild(clone)
      }
      
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
