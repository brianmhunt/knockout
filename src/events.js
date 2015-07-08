/*global setupEvents*/
/* eslint no-unused-vars: 0 */

function isLocal(anchor) {
  return (location.protocol === anchor.protocol &&
          location.host === anchor.host)
}



//
// For JS history see:
// https://github.com/devote/HTML5-History-API
//
function onAnchorClick(evt) {
  if (!isLocal(this)) { return true }
  if ($(evt.target).parents("live-example").length !== 0) {
    // click on an element in an example.
    return true
  }
  try {
    $root.open(evt.target.getAttribute('href'))
  } catch(e) {
    console.log(`Error/${evt.target.getAttribute('href')}`, e)
  }
  history.pushState(null, null, this.href)
  document.title = `Knockout.js – ${$(this).text()}`
  return false
}


function onPopState(/* evt */) {
  // Consider https://github.com/devote/HTML5-History-API
  $root.open(location.hash)
}


function setupEvents() {
  $(document.body)
    .on('click', "a", onAnchorClick)

  $(window)
    .on('popstate', onPopState)
}
