var data = {
		ff 			: 5677,
		userName 	: "Johnny",
		userStatus 	: "Developing",
		eur			: "dd",
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


	SS.init("htmls.html",data,function(){

 		// $(".container").ss(data);
		// $(".span").ss(user);

	})

})