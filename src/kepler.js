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
      console.log('attribtue changed')
    }


    node.foo = function(){
      console.log('fooooooo')
    }

    let register = function(){

      var jamie = document.registerElement(opts.name, {
        prototype: node
      })
    }
    register.call(window)


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
  var style = document.createElement('style')
  style.innerHTML = "button { background-color: cyan}"
  fragment.content.appendChild(style)

}

function createStyleTag(fragment, styleText){
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



// TODO:  make this regex more elegant.
// TODO / IDEA: reverse the meaning of TAGGED/UNTAGGED depending on whether
//    or not the expose variable is true.
function findEncapsulatedStyles(styleString){
  let result = {
    tagged: [],
    untagged: []
  }

  let initialTagged = styleString.match(/\:kepler[^{]+[^}]+/gi)
  result.tagged = initialTagged.map((el)=>{
    styleString = styleString.replace(el+'}', '')
    el = el.replace(/\:kepler /gi,'')
    return el += '}'
  })
  result.untagged.push(styleString.trim())
  result.tagged = result.tagged.join('\n')
  result.untagged = result.untagged.join('\n')

  return result

}