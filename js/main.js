
var Dictionary = {
	List: [],
	Add: function(item){
		if (!this.Has(item)){
			this.List.push(item);
			this.Save();
		}
	},
	Remove: function(item){
		if (this.Has(item)){
			this.List = this.List.filter(i => i !== item);
			this.Save();
		}
	},
	Has: function(item){
		return (this.List.indexOf(item) != -1);
	},
	Toggle: function(item){
		if (this.Has(item)){
			this.Remove(item);
		}
		else{
			this.Add(item);
		}
	},
	CleanEmpty: function(){
		this.Remove("");
	},
	Save: function(){
		localStorage["BookMark"] = this.List.join(",");
	}
}

//Vue
var vm = new Vue({
	el:"#app",
	data:{
		AllStory	: [{title:"",content:""}],
		StoryInx	: 0,
		NowDiv		: 1,		//Welcome,Read,Search
		NowSide		: 0,
		Side		: false,
		SearchList	:[],
		BookMark	: Dictionary,
		SearchString:""
	},
	computed:{
		GetThisStory: function(){
			if(this.StoryInx >= 0){				
				return this.AllStory[this.StoryInx].content.split("<br>");
			}
		}
	},
	methods:{
		SearchFilter: function(){
			var Arr = [];
			if (this.SearchString != ""){
				for(var i=0;i<this.AllStory.length;i++){
					if (this.AllStory[i].title.indexOf(this.SearchString) != -1)	{
						Arr.push(i);
					}
				}
			}
			this.ShowSearchList(Arr);
		},
		ShowSearchList: function(list){
			this.SearchList = list;
		},
		GetHash:function(inx){
			return "#inx-" + inx;
		},
		SearchItemClick: function(){
			SideBox(false);
		},
		SideToggle: function(){		
			this.Side = !this.Side;
			SideBox(this.Side);
		}
	}
});

$(function(){
	
	$("#app").css("display","block");
	
	GetData();

	$(window).bind("hashchange",function(){FadeChange(ParseUrl());});
	
	$(".searchTxt").bind("keypress",function(e){
		if (e.keyCode == 13) {
			vm.SearchFilter();
			$(".searchTxt").blur();
			return false;
		}
	});
	$(".searchTxt").bind("change",function(){
		vm.SearchFilter();
		$(".searchTxt").blur();
	});

	var Inx = ParseUrl();
	if(Inx >= 0) { 
		vm.StoryInx = Inx; 
		vm.NowDiv = 0;
	}

	Black(false);
	
	if(localStorage["BookMark"] == "undefined"){
		localStorage["BookMark"] = "";
	};
	
	//書籤紀錄
	vm.BookMark.List = localStorage["BookMark"].split(",");
	vm.BookMark.CleanEmpty();
	
	//console.log(vm.BookMark.List);
	
});

//------------------------------

//開關書籤
function ToggleBookMark(){;
	vm.BookMark.Toggle(vm.StoryInx);
	//console.log(vm.BookMark.List);
}

//側邊攔
var isSiding = false;
function SideBox(b){
	if (isSiding) return;
	
	Black(b);
	isSiding = true;
	$(".sideBox").animate({"right":(b)?"0":"-350px"},300,function(){
		isSiding = false;
	});
	
	if (b){
		if (vm.NowSide == 0){
			$(".searchTxt").focus();
		}
	}
	
}

//黑幕
function Black(b){
	
	if (isSiding) return;
	
	if (b){
		$(".bigBLACK").show().animate({"opacity":"0.3"},400);		
	}
	else{
		vm.Side = false;
		$(".bigBLACK").animate({"opacity":"0"},400,function(){
			$(".bigBLACK").hide();
		});
	}
}

//取得JSON
function GetData(){

	$.getJSON({
		url:"data.json",  
		success:
			function(data) {			
				vm.AllStory = data.story;
			},
		async:false
	});
}

//解Hash
function ParseUrl(isFast){
	var url_hash = location.hash;
		
	if (url_hash.indexOf("#") != -1){
		
		if (url_hash != "#"){			
			url_hash = url_hash.replace("#","");
			var Nm = url_hash;

			if(Nm.substr(0,4) == "inx-"){
				Nm = Nm.replace("inx-","");
				if (Nm == "random"){
					Nm = Range(0,vm.AllStory.length);
				}
				return Nm;
			}
		}		
	}
	else{
		location.hash = "#";
	}	
	return -1;	
}

//隨機抽故事
function GetRandomStory(){
	ChangeHash(Range(0,vm.AllStory.length));
	vm.NowDiv = 0;
}

//改變Hash
function ChangeHash(inx){
	location.hash = "inx-" + inx;
}

//故事淡入
function FadeChange(inx){
	vm.StoryInx = inx;
	if(inx >= 0){ vm.NowDiv = 0; }
	$(".read").css("opacity", 0).animate({opacity:1}, 1000);
	Topit();
}

//指定範圍
function Range(min,max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//TOP
var isScrolling = false;
function Topit(){
	if (!isScrolling){
		isScrolling = true;
		$("html,body").animate({scrollTop:0},400,function(){
			isScrolling = false;
		});
	}
}