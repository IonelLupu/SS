
/**
 * Get Regex matches
 * @param  {string} regex   [regex string]
 * @param  {string} subject [the string where to apply regex]
 * @return {array}         [matched values]
 */
function getMatches(regex,subject){
	var m = [];
	match   = regex.exec(subject);
	while (match != null) {
		m.push(match)
		match   = regex.exec(subject);
	}
	return m;
}

var SS = {
	snippets : [],
	$patterns : [],
	data 	: {},

	$elem   : [],
	$data   : [],
	$regex 	: {},

	init  : function(htmls,data,callback){
		SS.data = data;
		
		/**
		 * get the htmls string
		 */
		$.get(htmls,function(data){
			var data    = SS.$parse(data.trim()+";");

			// get every page node
			SS.$getNodes($("body"));
			for(var k in SS.$elem){
				var textValue = (SS.$elem[k][0].data || SS.$elem[k][0].value || "").trim();
				if(textValue == "")
					delete (SS.$elem[k]);
			}
			
			// get elements matching the keys from the data variable
			for(var k in SS.$elem){
				var e 	 	 = SS.$elem[k];
				var node 	 = SS.$elem[k][0];
				var nodeName = SS.$elem[k][0].nodeName.toLowerCase();
				var ss 		 = e[0].data || e[0].value || e[0].innerHTML;
				for(var i in SS.$regex){
					var regex 	= SS.$regex[i];
					var matches = getMatches(regex,ss);
					if(!matches.length)
						delete SS.$elem[k];
					for(var j in matches){
						// if(typeof SS.data[matches[j][1]] != "undefined")
							e.val = matches[j][1];
							SS.$addData(matches[j][1],e);
						
					}
				}
			}
			// re-index elements array
			SS.$elem = SS.$elem.filter(function (item) { return item != undefined });

			SS.$update();
			callback();
		})
	},

	$getNodes : function(elem,array){
		var contents = $(elem).contents();
		for(var i = 0; i < contents.length ; i++){
			if($(contents[i]).contents().length)
				SS.$getNodes($(contents[i]));  
			else{
				SS.$elem.push ( $(contents[i]) );
				SS.$elem[SS.$elem.length-1]["ss"] 	= $(contents[i])[0].data || $(contents[i])[0].value || $(contents[i])[0].innerHTML;

			}
		}

	},

	$parse : function(htmls){
		var data = [];
		var regex   = /#([a-zA-Z][\w]+?) *?{{[\s\r\t\n]*([\s\S]*?)[\s\r\t\n]*?}}(?=\s*\#|;)/gi;
		match = regex.exec(htmls);
		while (match != null) {
			var snippetName   = match[1];
			var snippetValue  = match[2];
			data[snippetName]   = snippetValue;
			match         		= regex.exec(htmls);
			SS[snippetName]   	= SS.$compile(snippetValue);
		}
		return data;
	},

	$compile : function(snippet){
		return function(data){
			var sn = "";
			for(var k in SS.$patterns)
				sn = SS.$patterns[k](snippet,data);
			return sn;
		}
	},
	$pattern : function(name,func){
		SS.$patterns[name] = func;
	},

	$update : function(curElem){
		for(var k in SS.$elem){
			var e 	 	 = SS.$elem[k];
			var node 	 = SS.$elem[k][0];
			var nodeName = SS.$elem[k][0].nodeName.toLowerCase();
			switch(nodeName){
				case "#text":
					// trim node value
					var f = SS.$compile(e.ss);
					node.data = f(SS.data);
					break; 
				case "input":
					var f = SS.$compile(e.ss);
					// update value only if the element is not the current one
					if (curElem != e[0])
						node.value = f(SS.data);
					// attach events only if it is not attached already
					SS.$addEvent(e);
					break;
			}
		}
	},

	$addData : function(elem,node){
		if(!SS.$data[elem])
			SS.$data[elem] = [node];
		else
			SS.$data[elem].push(node);
	},
	$addEvent : function(elem){
		var evt = $._data( elem[0] , 'events');
		if( typeof evt == "undefined" || typeof evt["input"] == "undefined" )
			$(elem).bind("input",function(){
				SS.data[elem.val] = $(this).val();
				SS.$update(this);
			})
	}
};

SS.$regex["php"] = /\$([a-z][\w\d\.]*)/gi;
SS.$pattern("php",function(snippet,data){
	var regex 	= SS.$regex["php"];
	var match 	= regex.exec(snippet);
	while (match != null) {
		// parse variable
		var vars 	= match[1].split(".");
		var d 		= data;
		for(var k in vars)
			if(typeof d[vars[k]] !== "undefined")
				d = d[vars[k]];
			else
				d = "";

		snippet = snippet.replace(match[0],d);
		match   = regex.exec(snippet);
	}
	return snippet;
})

