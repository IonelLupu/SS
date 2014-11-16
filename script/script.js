var data = {
		id 			: 5677,
		userName 	: "Johnny",
		userStatus 	: "Developing",
		eur			: "dd",
		ron			: 55,
		items 		: [
			{
				name 	: "Lorem ipsum.",
				age 	: 3
			},
			{
				name 	: "bbbbbum.",
				age 	: 5
			},
			{
				name 	: "Logfghghm.",
				age 	: 45
			},
			{
				name 	: "Lo45345345.",
				age 	: 12
			}
		]
	};


$(function(){

	SS.init("htmls.html",data);
	SS.$func.currency = {
		getEur : function(){
			return data.ron * 4.5;
		},
		getUsd : function(){
			return data.ron * 3.5;
		}
	}
})