//console.log("content script loaded");

var css = '.selassist-highlight { border: thick dotted red; border-radius: 5px; opacity:0.5; background-color: yellow; }',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

style.type = 'text/css';
if (style.styleSheet){
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}

head.appendChild(style);

// Highlight element
function highlightElement(element){
    //console.log("content_script - inside highlight function");
    
    // Scroll to the element on webpage
    var position = getPosition(element);
    window.scrollTo(position.x, position.y-150);
    
    element.classList.add("selassist-highlight");
}

// Undo highlight
function removeHighlight(element){
    //console.log("content_script - inside remove highlight function");
    element.classList.remove("selassist-highlight");
}

// Retrieve coordinates of an HTML element
function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += element.offsetTop;
        
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}