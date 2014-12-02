
/**
 * Get Regex matches
 * @param  {string} regex   [regex string]
 * @param  {string} subject [the string where to apply regex]
 * @return {array}         [matched values]
 */
function getMatches(regex,subject){
	var res 	= [];
	var match   = regex.exec(subject);
	while (match != null) {
		res.push(match);
		match   = regex.exec(subject);
	}
	return res;
}

var SS = {
	snippets : [],
	$patterns : [],
	oldData	: {},
	data 	: {},

	$elem   : [],
	$data   : [],
	$regex 	: {},
	$func  	: {}, 

	init  : function(htmls,data,callback){
		SS.data = data;
		
		/**
		 * get the htmls string
		 */
		$.get(htmls,function(data){
			var data    = SS.$parse(data.trim()+";");
			SS.snippets = data;
			// get every page node
			var nodes = SS.$getNodes($("body"));
			SS.$validate(nodes);
			SS.$update();
			callback();
		})
	},

	$getNodes : function(elem){
		var nodes = [];
		var contents = $(elem).contents();
		for(var i = 0; i < contents.length ; i++){
			if($(contents[i]).contents().length){
				var n = SS.$getNodes($(contents[i]));
				for(var k in n)
					nodes.push(n[k]);
			}
			else{
				nodes.push( $(contents[i]) );
				nodes[nodes.length-1]["ss"] 	= $(contents[i])[0].data || $(contents[i]).attr("val") || $(contents[i])[0].innerHTML;
			}
		}
		return nodes;
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
			SS[snippetName]   	= SS.$initElem(data,snippetName);
		}
		return data;
	},
	$validate : function(nodes){
		// get elements matching the keys from the data variable
		for(var k in nodes){
			var textValue = (nodes[k][0].data || nodes[k].attr("val") || "").trim();
			if(textValue == ""){
				delete (nodes[k]);
				continue;
			}
			var regexes  = 0;
			var e 	 	 = nodes[k];
			var ss 		 = e[0].data || e.attr("val") || e[0].innerHTML;
			for(var i in SS.$regex){
				var regex 	= SS.$regex[i];
				var matches = getMatches(regex,ss);
				if(matches.length)
					regexes++;
				for(var j in matches){
					e.type 	= i; 
					e.val 	= matches[j][1];
					e.elem 	= [];
					SS.$addData(matches[j][1],e);
				}
			}
			// if doesn't march any regex delete it
			if(regexes == 0)
				delete nodes[k];
			else
				SS.$elem.push(nodes[k]);
		}
	},
	$initElem : function(data,name){
		return function(){
			var div = $("<div></div>").html(data[name]);
			var nodes = SS.$getNodes(div);
			SS.$validate(nodes);
			SS.$update();
			return div.contents();
		}
	},

	$compile : function(snippet){

		return function(data){
			var sn = snippet;
			for(var k in SS.$patterns){
				sn = SS.$patterns[k](sn,data);
			}
			return sn || "";
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
			// if(typeof SS.oldData[e.val] !== "undefined")
			// console.log(SS.oldData[e.val] , SS.data[e.val]);
			// 	if(SS.oldData[e.val] == SS.data[e.val])
			// 		continue;
				// console.log(e.val, SS.oldData[e.val] , SS.data[e.val] );
			switch(nodeName){
				case "#text":
					// update value only if the element is not the current one
					if (curElem != e[0])
					var f = SS.$compile(e.ss);
					// var d = $("<div>").html(node);
					// console.log(d.contents());
					if(e.type == "repeater"){
						node.data = "";
						var d 	= $("<div>").html(f(SS.data));
						var sl 	= d.contents();
						for(var g = 0 ; g < e.elem.length ; g++){
							$(node.parentNode).find(e.elem[g]).remove();
							$(sl[g]).insertBefore(node);
						}
						e.elem = sl;
					}
					else
						node.nodeValue = f(SS.data);
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
		SS.oldData = data;
	},

	$addData : function(elem,node){
		if(!SS.$data[elem])
			SS.$data[elem] = [node];
		else
			SS.$data[elem].push(node);
	},
	$addEvent : function(elem){
		var evt = $._data( elem[0] , 'events');
		if( typeof elem[0].ssEvent == "undefined" ){
			$(elem).on("input",function(){
				SS.data[elem.val] = $(this).val();
				SS.$update(this);
			})
		}
		elem[0].ssEvent = true;
	}
};


/**
 * SS patterns
 */
SS.$regex["php"] = /\$([a-zA-Z][\w\d\.]*)/gi;
SS.$pattern("php",function(snippet,data){
	data 		= data || {};
	var regex 	= /\$([a-zA-Z][\w\d\.]*)/gi;
	var match 	= regex.exec(snippet);
	while (match != null) {
		// parse variable
		regex.lastIndex = 0;
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
});

SS.$regex["func"] = /\^ *(\w[\w\.\d]+)/gi;
SS.$pattern("func",function(snippet,data){
	var regex 	= /\^ *(\w[\w\.\d]+)/gi;
	var match 	= regex.exec(snippet);
	while (match != null) {
		regex.lastIndex = 0;
		// parse variable
		var val 	= match[1].split(".");
		var func 	= SS.$func;

		for(k in val)
			func 	= func[val[k]];
		snippet 	= snippet.replace(match[0],func());
		match   	= regex.exec(snippet);
	}
	return snippet;
})

SS.$regex["repeater"] = /%([a-zA-Z][\w]*)\[([\w]*)\]/gi;
SS.$pattern("repeater",function(snippet,data){
	var regex 	= /%([a-zA-Z][\w]*)\[([\w]*)\]/gi;
	var match 	= regex.exec(snippet);
	while (match != null) {
		var name = match[2] || match[1];
		var html = '';
		var sn 	 = SS.snippets[match[1]];
		var d 	 = data[name];
		if(typeof name != "undefined"){
			for(var k in d){
				var pf = SS.$compile(sn);
				html += (pf(d[k]));
			}
			
		}
		html = html.replace(/(\r\n|\n|\r)/gm,"");
		snippet	= snippet.replace(match[0],html);
		match 	= regex.exec(snippet);
	}
	snippet = snippet.replace(/(\r\n|\n|\r)/gm,"").trim();
	return snippet;
})

