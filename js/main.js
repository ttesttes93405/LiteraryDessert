
//------------------------------
//工具
var Utility = {

	//範圍內隨機值
	Random: {
		Value: function(){
			return Math.random();
		},
		Range: function(min, max){
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	},

	//Dictionary
	Dictionary: {
		List: [],
		Add: function(item) {
			if (!this.Has(item)) {
				this.List.push(item);
				this.Save();
			}
		},
		Remove: function(item) {
			if (this.Has(item)) { 
				this.List = this.List.filter(i => (i !== item));
				this.Save();
			}
		},
		Has: function(item) {
			return (this.List.indexOf(item) != -1);
		},
		Toggle: function(item) {
			if (this.Has(item)) {
				this.Remove(item);
			}
			else{
				this.Add(item);
			}
		},
		CleanEmpty: function() {
			this.Remove("");
		},
		Save: function() {
			localStorage["BookMark"] = this.List.join(",");
		},
		Create: function(){
			return this;
		}
	}

}

//------------------------------
//Vue
var vm = new Vue({
	el:"#app",
	data:{
		AllStory	: [{title:"",content:""}],
		StoryInx	: 0,
		NowDiv		: 1,             //Welcome,Read,Search
		NowSide		: 0,             //側邊欄分頁
		Side		: false,
		Black		: false,
		SearchList	: [],
		BookMark	: Utility.Dictionary.Create(),
		SearchString:"",
		RandomSroty	:[]
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
					if (this.AllStory[i].title.indexOf(this.SearchString) != -1){  //title
						Arr.push(i);
					}
					else if(this.AllStory[i].group.indexOf(this.SearchString) != -1){   //group
						Arr.push(i);
					}
				}
			}
			this.ShowSearchList(Arr);
		},
		ShowSearchList: function(list){
			this.SearchList = list;
		},
		GetHash: function(inx){
			return "#inx-" + inx;
		},
		SearchItemClick: function(){
			SideBox(false);
		},
		SideToggle: function(){		
			this.Side = !this.Side;
			SideBox(this.Side);
		},
		GetSummary: function(index){
			var Content = this.AllStory[index].content;
			return Content.substring(0, 80).replace(/<br>|<br|<b|</g,'\n');
		},
		FreshRandomStory: function(){
			this.RandomSroty = [];
			this.RandomSroty.push(Utility.Random.Range(0, this.AllStory.length));
			this.RandomSroty.push(Utility.Random.Range(0, this.AllStory.length));
			this.RandomSroty.push(Utility.Random.Range(0, this.AllStory.length));
		}
	}
});

$(function(){

	$("#app").css("display","block");

	GetData();	
	vm.FreshRandomStory();

	$(window).bind("hashchange",function(){
		ChangeInx(ParseUrl());
	});

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
	$(".searchBtn").bind("click",function(){
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

});

//------------------------------
//顯示與資料

//隨機抽故事
function GetRandomStory(){
	ChangeHash(Utility.Random.Range(0, vm.AllStory.length));
	vm.NowDiv = 0;
}

//開關書籤
function ToggleBookMark(){;
						  vm.BookMark.Toggle(vm.StoryInx);
						 }


//------------------------------
//資料

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
function ParseUrl(){
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

//改變Hash
function ChangeHash(inx){
	location.hash = "inx-" + inx;
}


//------------------------------
//顯示

//開關側邊攔
function SideBox(b){
	vm.Black = b;
	vm.Side = b;
	
}

function ChangeInx(inx){
	if(inx < 0 ) return;
	if(vm.AllStory[inx].title == "") return;


	$(".container").css("opacity", 1).animate({opacity:0}, 300,function(){

		vm.FreshRandomStory();
		vm.StoryInx = inx;   
		vm.NowDiv = 0;

		$(".container").css("opacity", 0).animate({opacity:1}, 800);
		Topit();

	});
}


//回頂部
var isScrolling = false;
function Topit(){
	if (!isScrolling){
		isScrolling = true;
		$("html,body").animate({scrollTop:0}, 300, function(){
			isScrolling = false;
		});
	}
}
