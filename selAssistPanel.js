
var angMain = angular.module('myApp', []);

angMain.controller('userInputController', ['$scope', function($scope){
	
	$scope.locator = ["Id", "Name", "Class Name", "Tag Name", "Link Text", "Partial Link Text", "CSS", "Xpath"];
	
	$scope.selection = "Xpath";
	
	$scope.userEntry = '';
	
	$scope.message = "";
    
    $scope.resultCount = 0;
    
	$scope.resultElements = [];
		
	// Reset message when locator selection changes
	$scope.$watch('selection', function(newVal, oldVal){
	    $scope.findElement($scope.userEntry, false);
	});

	$scope.copyLocatorValue = function(){		
	    var pathField = document.querySelector('#locatorValue');
		// select the contents
		pathField.select();
		   
		document.execCommand('copy');
	};

	$scope.clearLocatorValue = function(){
		$scope.userEntry = "";
		$scope.findElement($scope.userEntry, false);
	};

	$scope.findElement = function(textEntered, findEvent){
		//textEntered = textEntered.replace(/'/g, '"');

		// findEvent = true when element highlight needed else false
		if(textEntered != "")
		{			
			evaluateContentScript(getLocatorText(textEntered, findEvent), findEvent);
		}
		else
		{
			$scope.message = "";
            $scope.resultElements.length = 0;
		}
		
	};

	$scope.keyPress = function(keyCode){
		//console.log("userEntry after keypress - " +$scope.userEntry);
		if($scope.userEntry == undefined)
		{
			$scope.userEntry = "";
		}

		switch(keyCode){
			case 13:
				// Enter key pressed
				$scope.findElement($scope.userEntry, true);
				return;
				/*
			case 222:
				// pairing for key -> '
				$scope.userEntry = $scope.userEntry.replace(/'/g, "''");
				// pairing for key -> "
				$scope.userEntry = $scope.userEntry.replace(/"/g, '""');
				// replace ' with "
				$scope.userEntry = $scope.userEntry.replace(/'/g, '"');
				break;
			case 219:
				// pairing for key -> [
				$scope.userEntry = $scope.userEntry.replace(/\[/g, "[]");
				break;
			case 57:
				// pairing for key -> (
				$scope.userEntry = $scope.userEntry.replace(/\(/g, "()");
				break;
				*/			
		}
			
		// After every keypress display number of matching elements
		$scope.findElement($scope.userEntry, false);
						
	};
 
	function getLocatorText(enteredText, findEvent){
		var locatorType = $scope.selection.replace(/ /g, "").toUpperCase();
		
		//console.log(locatorType+ " | " +enteredText);

        var locatorText = generateDOMQueryString(locatorType, enteredText);

        var locatorTextSuffix = findEvent ? "[0]": ".length";
		if(locatorType != "ID")
			locatorText += locatorTextSuffix;

		//console.log("Locator text - "+ locatorText);

		return locatorText;
	};

    function generateDOMQueryString(locatorType, enteredText){
        var locatorText = "";
        
        switch(locatorType){
			case "ID":
				locatorText = "document.getElementById('"+enteredText+"')";
				break;
			case "NAME":
				locatorText = "document.getElementsByName('"+enteredText+"')";
				break;
			case "CLASSNAME":
				locatorText = "document.getElementsByClassName('"+enteredText+"')";
				break;
			case "TAGNAME":
				locatorText = "document.getElementsByTagName('"+enteredText+"')";
				break;
			case "LINKTEXT":
				enteredText = enteredText.replace(/'/g, "\'");
				locatorText = "$x(\"//a[.='"+enteredText+"']\")";
				break;
			case "PARTIALLINKTEXT":
				enteredText = enteredText.replace(/'/g, "\'");
				locatorText = "$x(\"//a[contains(text(),'"+enteredText+"')]\")";
				break;
			case "CSS":
				enteredText = enteredText.replace(/'/g, '"');
				locatorText = "$$('"+enteredText+"')";
				break;
			case "XPATH":
				enteredText = enteredText.replace(/'/g, '"');
				locatorText = "$x('"+enteredText+"')";
				break;
			default:
		      	alert("case not handled yet");	
		}
        
        return locatorText;
    }
    
	function evaluateContentScript(evaluationText, findEvent){
		if(findEvent)
            evaluationText = "inspect("+ evaluationText + ")";
        
		//console.log(evaluationText);

		chrome.devtools.inspectedWindow.eval(
		    evaluationText,
		    function(result, isException) {
		    	//console.log(result);
		    	// When find button is clicked don't display matching elements
				if (isException || result == null || result == undefined || result == "0")
				{
					$scope.message = "No element found";
                    $scope.resultCount = 0;
					//console.log("exception encountered");
				    //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
				}
				else if($scope.selection == "Id" && !findEvent)
				{
					if(typeof result === "object"){
						$scope.message = "1 element found";
                        $scope.resultCount = 1;                        
					}						
				}
				else
				{	
					if(!isNaN(result) && !findEvent)
					{						
						var elementText = parseInt(result) > 1? " elements":" element";           			
						$scope.message = result + elementText +" found";
                        $scope.resultCount = parseInt(result);                        
					}
				}
                
                //console.log($scope.resultCount);
                
                $scope.resultElements.length = 0;
                
                if($scope.resultCount > 0){
                    fetchMatchingElements();                    
                }
                
				$scope.$apply();
                                
			}
     	);
	};
    
    function fetchMatchingElements(){
        var locatorType = $scope.selection.replace(/ /g, "").toUpperCase();
        var elementLocator = generateDOMQueryString(locatorType, $scope.userEntry);
        
        innerHTMLContent = "";
        outerHTMLContent = "";
        
        if(locatorType === "ID"){
            /*
            chrome.devtools.inspectedWindow.eval(elementLocator+".outerHTML.replace("+elementLocator+".innerHTML,'')", function(result, isException){
                if(isException){
                     //console.log("Issue occured while getting result element(s)" );
                     //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                 }
                 else{
                     $scope.resultElements.push(result);
                     $scope.$apply();
                     //console.log(result);
                 }
             });
            */
            
            chrome.devtools.inspectedWindow.eval(elementLocator+".innerHTML", function(result, isException){
                if(isException){
                    //console.log("Issue occured while getting result element(s)" );
                    //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                }
                else{
                    innerHTMLContent = result;
                    //console.log("InnerHTML - " +innerHTMLContent);                    
                }
            });
            
            chrome.devtools.inspectedWindow.eval(elementLocator+".outerHTML", function(result, isException){
                if(isException){
                    //console.log("Issue occured while getting result element(s)" );
                    //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                 }
                else{
                    outerHTMLContent = result;
                    //console.log("OuterHTML - "+outerHTMLContent);
                    
                    removeInnerTags(innerHTMLContent, outerHTMLContent);
                 }
            });        
            
        }
        else{
            // Iterate over all matching elements
            for ( var i = 0 ; i < $scope.resultCount ; i++ ){
                /*
                //console.log(elementLocator +"[" + i +"].outerHTML.replace("+ elementLocator+ "["+ i+"].innerHTML, '')");
                chrome.devtools.inspectedWindow.eval(elementLocator +"[" + i +"].outerHTML.replace("+ elementLocator+ "["+ i+"].innerHTML, '')", function(result, isException){
                     if(isException){
                         //console.log("Issue occured while getting result element(s)" );
                         //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                     }
                     else{
                         $scope.resultElements.push(result);
                         $scope.$apply();
                         //console.log(result);
                     }
                 });
                 */
                chrome.devtools.inspectedWindow.eval(elementLocator+"["+i+"].innerHTML", function(result, isException){
                    if(isException){
                        //console.log("Issue occured while getting result element(s)" );
                        //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                    }
                    else{
                        innerHTMLContent = result;
                        //console.log("InnerHTML - " +innerHTMLContent);
                    }
                });

                chrome.devtools.inspectedWindow.eval(elementLocator+"["+i+"].outerHTML", function(result, isException){
                    if(isException){
                        //console.log("Issue occured while getting result element(s)" );
                        //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                     }
                    else{
                        outerHTMLContent = result;
                        //console.log("OuterHTML - "+outerHTMLContent);

                        removeInnerTags(innerHTMLContent, outerHTMLContent);
                     }
                });
            }
        }        
    };
    
    // Remove inner tags from matching tag and retain current tag innertext
    function removeInnerTags(innerHTMLContent, outerHTMLContent){
        // Check if HTML tags are present. If present remove them.
        if(innerHTMLContent.indexOf('<') > -1 ){
            var removalContent = innerHTMLContent.substring(innerHTMLContent.indexOf('<'), innerHTMLContent.lastIndexOf('>')+1)
            //console.log("RemoveContent - "+removalContent);
        }
        
        //console.log("After removing - " +outerHTMLContent.replace(removalContent, ''));
        $scope.resultElements.push(outerHTMLContent.replace(removalContent, ''));
        $scope.$apply();
    }
    
    $scope.highlightInElementsPanel = function (index){
        //console.log("Inside highlightElement function with param " + index);
        var locatorType = $scope.selection.replace(/ /g, "").toUpperCase();
        
        var queryText = generateDOMQueryString(locatorType, $scope.userEntry);
        
        if(locatorType != "ID")
            queryText = queryText+ "[" + index + "]";
        
        queryText = "inspect(" + queryText + ")";
        //console.log("query text inside highlightInElementsPanel "+queryText);
        chrome.devtools.inspectedWindow.eval(queryText, 
            function(result, isException){
                if(isException){
                    //console.log("Issue occured while getting result element(s)" );
                    //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                }
                else{                         
                     //console.log(result);
                }
            });
        
    }
    
    // Focus/highlight matching element on webpage
    $scope.focusElement = function(index){
        //console.log("inside focus element function");
        var locatorType = $scope.selection.replace(/ /g, "").toUpperCase();
        
        var queryText = generateDOMQueryString(locatorType, $scope.userEntry);
        
        if(locatorType != "ID")
            queryText = queryText+ "[" + index + "]";
        
        chrome.devtools.inspectedWindow.eval("highlightElement("+queryText+")", {useContentScriptContext:true},
            function(result, isException){
                if(isException){
                    //console.log("Issue occured while getting result element(s)" );
                    //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                }
                else{                         
                     //console.log(result);
                }
            }); 
    }
    
    // Undo above changes
    $scope.removeFocus = function(index){
        //console.log("inside remove focus function");
        var locatorType = $scope.selection.replace(/ /g, "").toUpperCase();
        
        var queryText = generateDOMQueryString(locatorType, $scope.userEntry);
        
        if(locatorType != "ID")
            queryText = queryText+ "[" + index + "]";
        
        chrome.devtools.inspectedWindow.eval("removeHighlight("+queryText+")", {useContentScriptContext:true},
            function(result, isException){
                if(isException){
                    //console.log("Issue occured while getting result element(s)" );
                    //console.log(isException.isError +"<>"+ isException.code +"<>"+ isException.description +"<>"+ isException.details +"<>"+ isException.isException +"<>"+ isException.value +"<>");
                }
                else{                         
                     //console.log(result);
                }
            });
    }
    
    // Set result list element height when selassist panel loaded
    window.addEventListener('load',function(){
        //console.log("selassist panel loaded");
        document.getElementById('resultList').style.height = (window.innerHeight-120).toString() +"px";
        
        // Load SelAssist related style into the webpage
        chrome.devtools.inspectedWindow.eval("loadSelAssistStyle()", {useContentScriptContext:true})
    })
    
    // Set result list element height when selassist panel resized
    window.addEventListener('resize',function(){
        //console.log("selassist panel resized");
        document.getElementById('resultList').style.height = (window.innerHeight-120).toString() +"px";
    })
    
    // Create a connection to the background page ( reload devtools when webpage is loaded )
    var backgroundPageConnection = chrome.runtime.connect({
        name: "panel"
    });
    
    backgroundPageConnection.postMessage({
        name: 'init',
        tabId: chrome.devtools.inspectedWindow.tabId
    });
    
    backgroundPageConnection.onMessage.addListener(function(msg) {
        if (msg.action == "refresh"){
            // Reload the SelAssist panel
            location.reload();
        }    
    });    
    
}]);