//console.log("content script loaded");

var css = '.selassist-highlight { outline: thick dotted red; opacity: 0.5; background-color: yellow; } .selassist-tooltiptext { font-size: 12px !Important; opacity:1 !Important; background-color: black; color: #37EF50; text-align: center;  border-radius: 6px; padding: 5px; position: fixed; z-index: 999999999999;} .selassist-tooltiptext::after { content: " "; position: absolute; top: 100%; left: 50%; margin-left: -8px; border-width: 8px; border-style: solid; border-color: black transparent transparent transparent;}',          
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
    
    // HTML Element pointer
    var node = document.createElement("SPAN");
    var textnode = document.createTextNode("Here");
    node.appendChild(textnode);
    node.setAttribute("class", "selassist-tooltiptext")
    var pos = element.getBoundingClientRect();
    node.style.top = pos.top - 35 +"px";
    node.style.left = pos.left +"px";
    document.body.appendChild(node);
}

// Undo highlight
function removeHighlight(element){
    //console.log("content_script - inside remove highlight function");
    element.classList.remove("selassist-highlight");
    
    // Remove element pointer
    document.body.removeChild(document.body.querySelector('span.selassist-tooltiptext'));
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