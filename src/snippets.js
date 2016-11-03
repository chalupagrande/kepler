
/*

RANDOM SNIPPETS OF CODE TO REMEMBER

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function extendBrowserSupport(){
  if (!Object.prototype.watch)
      Object.prototype.watch = function (prop, handler) {
          var oldval = this[prop], newval = oldval,
          getter = function () {
              return newval;
          },
          setter = function (val) {
              oldval = newval;
              return newval = handler.call(this, prop, oldval, val);
          };
          if (delete this[prop]) { // can't watch constants
              if (Object.defineProperty) // ECMAScript 5
                  Object.defineProperty(this, prop, {
                      get: getter,
                      set: setter
                  });
              else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
                  Object.prototype.__defineGetter__.call(this, prop, getter);
                  Object.prototype.__defineSetter__.call(this, prop, setter);
              }
          }
      };

  // object.unwatch
  if (!Object.prototype.unwatch)
      Object.prototype.unwatch = function (prop) {
          var val = this[prop];
          delete this[prop]; // remove accessors
          this[prop] = val;
      };
}


//
// USED IN KEPLER

// function findTag(match, value){
//   let input = match.input
//   let index = match.index
//   let htmlString, taggedHTMLString, replacedTaggedHTMLString, newTemplate, DOMElement, parser = new DOMParser(), result = [];
//   while(input[index] != '<'){
//     index -=1
//   }
//   while(result.length < 4){
//     if(input[index] == ">" || input[index] == "<"){
//       result.push(index)
//     }
//     index+=1
//   }
//   result[3]+=1
//   htmlString = input.slice(result[0], result[3])
//   DOMElement = parser.parseFromString(htmlString, 'text/xml').firstChild
//   DOMElement.setAttribute('k-tag', match[1])
//   taggedHTMLString = DOMElement.outerHTML
//   replacedTaggedHTMLString = taggedHTMLString.replace(new RegExp(match[0],'g'), value)
//   newTemplate = input.replace(htmlString, replacedTaggedHTMLString)
//   return newTemplate

// }