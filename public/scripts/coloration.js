var pres = document.getElementsByTagName("pre");
     for( var i = 0; i < pres.length; i++ ) {
	 var my_code = pres[i].firstChild;
	 if( my_code != undefined ) {
	     var text = my_code.innerHTML;
	     pres[i].innerHTML = text;
	     if( is_js ) {
		pres[i].className = "brush: js";
	     } else {
		 pres[i].className = "brush: cpp";
	     }
	 } 
     }
     SyntaxHighlighter.all();
