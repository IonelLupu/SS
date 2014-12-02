var data = {
		id 			: 5677,
		userName 	: "Johnny",
		userStatus 	: "Developing",
		eur			: "dd",
		ron			: 55,
		items 		: [
			{
				name 	: "Jack.",
				age 	: 3
			},
			{
				name 	: "Boyd.",
				age 	: 5
			},
			{
				name 	: "Adam.",
				age 	: 45
			},
			{
				name 	: "Lory.",
				age 	: 42
			}
		],
		message : "How are you today?"
	};


$(function(){

	for(var i = 0; i <= 100; i++)
		data.items.push({
			name : i+" "+i,
			age : i
		})

	SS.init("htmls.html",data,function(){
		$(".container").append(SS.body());
		$(".container").append(SS.message());
		$(".container").append(SS.message());
		$(".container").append(SS.message());
		$(".container").append(SS.message());
	});

	window.addUser = function(){
		var name = data.name;
		var age = data.age;
		console.log(name,age);
		data.items.push({
			name : name,
			age : age
		});
		SS.$update();
	}

	SS.$func.currency = {
		getEur : function(){
			return data.ron / 4.5;
		},
		getUsd : function(){
			return data.ron / 3.5;
		}
	}

})