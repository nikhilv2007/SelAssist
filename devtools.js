/*******************************************************************************

    SelAssist - a browser extension to assist in selenium automation framework.
    Copyright (C) 2015 Nikhilesh Venkataramana Reddy

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/nikhilv2007/SelAssist
*/

chrome.devtools.panels.elements.createSidebarPane("SelAssist",
	function(sidebar) {
		function updateSidebar(){
			sidebar.setExpression("("+expValue.toString()+")()");			
		}      
		updateSidebar();
		chrome.devtools.panels.elements.onSelectionChanged.addListener(updateSidebar);
	}
);

chrome.devtools.panels.create("SelAssist",
    null,	//image
    "selAssistPanel.html",
    function(panel) {
      // code invoked on panel creation
       	panel.onShown.addListener(function(win){ 
       		win.focus();
       		//win.document.body.appendChild(document.createTextNode('Hello!'));
       	});
    }
);

var expValue = function(){
	if(typeof $0.attributes !== 'undefined')
	{		
		//Dictionary ElementRect Members equiv code
				
		//----------------------------isDisplayed() section---------------------------------------------------
		//var displayed = window.getComputedStyle($0).getPropertyValue('display') !== "none" && ($0.offsetWidth > 0 && $0.offsetHeight > 0)	? true: false;
		
		//Source  -- https://stackoverflow.com/questions/178325/checking-if-an-element-is-hidden		
		var elem = $0;
		var displayed = document.hidden || elem.offsetWidth==0 || elem.offsetHeight==0 || elem.style.visibility=='hidden' || elem.style.display=='none' || elem.style.opacity===0 ? false:true;
		
		if(displayed){
			var comp = null;
			if(window.getComputedStyle || elem.currentStyle){
				while (elem) {
	                if (elem === document) {break;} 
	                else if(!elem.parentNode){ displayed = false; break;}
	                comp = window.getComputedStyle ? window.getComputedStyle(elem, null) : elem.currentStyle;
	                if (comp && (comp.visibility=='hidden' || comp.display == 'none' || (typeof comp.opacity !=='undefined' && comp.opacity != 1))){ 
	                	displayed = false; 
	                	break;
	                }
	                elem = elem.parentNode;
	            }
			}
		}	
		
		//----------------------------getAttributes() section-------------------------------------------------------
		//var att = {}, attLength = $0.attributes.length;
		var attLength = $0.attributes.length;
		var att;
		if(attLength>0)
			att = {};
		else
			att = '**No Attributes**';
			
		for(var i=0; i< attLength; i++){
			var attName = $0.attributes[i].nodeName, attValue = $0.attributes[i].nodeValue;
			att[attName] = attValue;
		}

		if($0.value !== undefined)
			att["value"] = $0.value;

		//--------------------------------getCSS() section----------------------------------------------------------
		//var cssValue = window.getComputedStyle($0);console.log(window.getComputedStyle($0));
		var cssValue = {}, cssLength = window.getComputedStyle($0).length;
		for(var i=0; i<cssLength; i++){
			cssValue[window.getComputedStyle($0).item(i)] = window.getComputedStyle($0).getPropertyValue(window.getComputedStyle($0).item(i));
		}
		
		//--------------------------------getText() section---------------------------------------------------------------
		var text = $0.innerText.replace(/\n/g,'\\n').replace(/\r/g,"\\r");//.replace(/\t/g,"\\t");//.replace(/\b/g,'\\b').replace(/\f/g,'\\f');
				
		//---------------------------------getTagname() section-----------------------------------------------------------
		var tagname = $0.tagName.toLowerCase();
					
		//--------------------------------isSelected() section---------------------------------------------------------
		var selected = false;//'N/A';
		switch(tagname){
			case "option":
				selected = $0.selected;
				break;
			case "input":
				if(att['type'] == 'checkbox' || att['type'] == 'radio')
					selected = $0.checked;					
				break;			
		}  
		
		//----------------------------------ElementRect section--------------------------------------------------------
		var rectElem = $0, rect = {x:0, y:0, height:$0.offsetHeight, width:$0.offsetWidth };
		
		do{
			rect.x += rectElem.offsetLeft;
			rect.y += rectElem.offsetTop;
			rectElem = rectElem.offsetparent;
		}while(rectElem);
		
				
		//--------------------------------isEnabled() section---------------------------------------------------------
		/*
		 * 
		var enabled = "N/A";
		if(typeof $0.disabled === "boolean" )
			enabled = !$0.disabled;
		*/
			
		//assumption : if disabled attribute isn't present then it is enabled
		var enabled = true;
		if($0.disabled === true)
			enabled = false;
		 
			
		return {"Displayed*": displayed, "Selected": selected, "Attribute(s) Name:Value pair": att, "CSS propertyName:Value pair": cssValue, "Text*": text, "Tagname": tagname, "Enabled": enabled, "Rect": rect};
	}
};