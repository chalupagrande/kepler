'use strict';

var app = document.getElementById('app');
var imports;
window.addEventListener('HTMLImportsLoaded', function (e) {
  // all imports loaded
  console.log(window.clone);
  app.appendChild(window.clone);
});