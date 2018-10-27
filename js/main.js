
//載入完成進入點
document.addEventListener("DOMContentLoaded", function(){


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


	vm.Enter();

}); 


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
				this.List = this.List.filter(function(i){ return (i !== item)});
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
		ShowNavTitle: false,
		isScrolling	: false,
		SearchList	: [],
		BookMark	: Utility.Dictionary.Create(),
		SearchString: "",
		RandomSroty	: [],
        CurrentHref : ""
	},
	computed:{
		GetThisStory: function(){
			if(this.StoryInx >= 0){				
				return this.AllStory[this.StoryInx].content.split("<br>");
			}
		}
	},
	methods:{

		//進入點
		Enter: function(){

			this.GetData();	

            /*
			var Inx = this.ParseUrl();
			if(Inx >= 0) { 
				this.StoryInx = Inx; 
				this.NowDiv = 0;
			}*/

			window.addEventListener("hashchange", this.HashCheck);

			this.FreshRandomStory();

			if(localStorage["BookMark"] == undefined){
				this.BookMark.List = [];
			}
			else{
				this.BookMark.List = localStorage["BookMark"].split(",");
			}

			//書籤紀錄
			this.BookMark.CleanEmpty();
            
            this.HashCheck();
            
            new ClipboardJS("#CopyBtn");


		},

		//篩選出故事清單並顯示
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

		//顯示搜尋故事清單(清單)
		ShowSearchList: function(list){
			this.SearchList = list;
		},

		//綁定hashchange事件
		HashCheck: function(){
			this.ChangeInx(this.ParseUrl());
            this.CurrentHref = document.location.href;
		},

		//取得Index對應的hash
		GetHash: function(inx){
			return "#inx-" + inx;
		},

		//取得故事的大綱
		GetSummary: function(index){
			var Content = this.AllStory[index].content;
			return Content.substring(0, 80).replace(/<br>|<br|<b|</g,'\n');
		},

		//刷新隨機故事
		FreshRandomStory: function(){
			this.RandomSroty = [];
            var RandomStoryCount = 3;
            
            while(this.RandomSroty.length < RandomStoryCount){
                
                if (this.AllStory.length < RandomStoryCount) break;
                
                var st = Utility.Random.Range(0, this.AllStory.length)
                if (this.AllStory[st].title != "" && this.RandomSroty.indexOf(st) == -1){
					this.RandomSroty.push(st);
				}
            }
            /*
			for(var i=0; i<3; i++){
				var st = Utility.Random.Range(0, this.AllStory.length);
				if (this.AllStory[st].title != ""){
					this.RandomSroty.push(st);
				}
			}*/
		},

		//改變故事Index
		ChangeInx: function(inx){
			if(inx < 0 ) return;
			if(this.AllStory[inx].title == "") return;

			$(".container").css("opacity", 1).animate({opacity:0}, 300,function(){

				vm.FreshRandomStory();
				vm.StoryInx = inx;   
				vm.NowDiv = 0;

				$(".container").css("opacity", 0).animate({opacity:1}, 800);
				vm.Topit();

			});
		},

		//解Hash
		ParseUrl: function(){
			var url_hash = location.hash;

			if (url_hash.indexOf("#") != -1){

				if (url_hash != "#"){			
					url_hash = url_hash.replace("#","");
					var Nm = url_hash;

					if(Nm.substr(0,4) == "inx-"){
						Nm = Nm.replace("inx-","");
						if (Nm == "random"){
							Nm = Range(0,this.AllStory.length);
						}
						return Nm;
					}
				}		
			}
			else{
				location.hash = "#";
			}	
			return -1;	
		},

		//開關側邊攔
		SideBox: function(b){
			this.Black = b;
			this.Side = b;
		},

		//側邊攔反轉開關
		SideToggle: function(){		
			this.Side = !this.Side;
			this.SideBox(this.Side);
		},

		//開關書籤
		ToggleBookMark: function (){
			this.BookMark.Toggle(this.StoryInx);
		},

		//取得JSON
		GetData: function(){

			$.getJSON({
				url:"data.json",  
				success:
				function(data) {			
					vm.AllStory = data.story;
				},
				async:false
			});
		},

		//隨機抽故事
		GetRandomStory: function(){
			ChangeHash(Utility.Random.Range(0, vm.AllStory.length));
			vm.NowDiv = 0;
		},

		//改變Hash
		ChangeHash: function(inx){
			location.hash = "inx-" + inx;
		},

		//回頂部
		Topit: function (){

			if (!this.isScrolling){
				this.isScrolling = true;
				$("html,body").animate({scrollTop:0}, 300, function(){
					vm.isScrolling = false;
				});
			}
		},
        
        CopyToClipboard: function(){
            
        }
	}
});

