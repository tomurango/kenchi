//ユーザのカードを大きくするときの関数
function display_card_user(){
    console.log("display_user");
    //他の動作と被らないようにonclickを消す
    var cards = document.querySelectorAll('.dash-card_renew');
    for(var i = 0; i<cards.length; i++){
        cards[i].onclick="";
    }
    //拡大して表示する旧来のやつ
    var card = document.getElementById("dash_name");
    //拡大させるカードを償還する
    apper_card("dash_display_user", "dash_name");
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        card.firstElementChild.style.display = "block";
    },50);
}

//カードを指定された位置に召還して動かす スペル両方ミスってるっぽいなｗ 定義時も使用時も
function apper_card(clicked_element_id, apper_element_id){
    console.log("appear card");
    //それぞれエレメントを取得
    var clicked_element = document.getElementById(clicked_element_id);
    var apper_element = document.getElementById(apper_element_id);
    //クリックした要素の情報を取得
    var rect = clicked_element.getBoundingClientRect();
    var left = rect.left;
    var top = rect.top;  
    var width = rect.width;
    var height = rect.height;
    //出現させる
    apper_element.style.top = String(top) + "px";
    apper_element.style.left = String(left) + "px";
    apper_element.style.width = String(width) + "px";
    apper_element.style.height = String(height) + "px";
    apper_element.style.display = "block";
}

//nameを閉じるときの関数
function display_card_user_back(){
    console.log("back_user");
    //ボタンを押したときのエフェクトが実行されるためのタイムアウト
    setTimeout(function(){
        //縮小してしまうやつ
        var card = document.getElementById("dash_name");
        //ボタンを非表示にする
        card.firstElementChild.style.display = "none";
        //user card を縮小させる
        card.classList.remove("active");
        setTimeout(function(){
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick= function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
        },300);
    },100);
}

//ジョブのカードを大きくするときの関数
function display_card_job(){
    console.log("display_job");
    //他の動作と被らないようにonclickを消す
    var cards = document.querySelectorAll('.dash-card_renew');
    for(var i = 0; i<cards.length; i++){
        cards[i].onclick="";
    }
    //拡大して表示する旧来のやつ
    var card = document.getElementById("dash_job");
    //拡大させるカードを償還する
    apper_card("dash_display_job", "dash_job");
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        card.firstElementChild.style.display = "block";
    },50);
}

//nameを閉じるときの関数
function display_card_job_back(){
    console.log("back_job");
    //ボタンを押したときのエフェクトが実行されるためのタイムアウト
    setTimeout(function(){
        //縮小してしまうやつ
        var card = document.getElementById("dash_job");
        //ボタンを非表示にする
        card.firstElementChild.style.display = "none";
        //user card を縮小させる
        card.classList.remove("active");
        setTimeout(function(){
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick = function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
        },300);
    },100);
}


//コミュニティを大きくするときの関数
function display_card_com(){
    console.log("display_com");
    //他の動作と被らないようにonclickを消す
    var cards = document.querySelectorAll('.dash-card_renew');
    for(var i = 0; i<cards.length; i++){
        cards[i].onclick="";
    }
    //拡大して表示する旧来のやつ
    var card = document.getElementById("dash_community");
    //拡大させるカードを償還する
    apper_card("dash_display_com", "dash_community");
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        document.getElementById("community_back").style.display = "block";
        setTimeout(function(){
            //参加作成ボタンに関するjsに記述を書く
            document.getElementById("join_community").style.display = "block";
            document.getElementById("create_community").style.display = "block";
            //なんの community のメンバー及び管理者であるかの情報
            document.getElementById("user_join_list_div").hidden = false;
        },200);
    },50);
}

function display_card_com_back(){
    console.log("back_com");
    //ボタンを押したときのエフェクトが実行されるためのタイムアウト
    setTimeout(function(){
        document.getElementById("user_join_list_div").hidden = true;
        //参加作成ボタンに関するjsに記述を書く
        document.getElementById("join_community").style.display = "none";
        document.getElementById("create_community").style.display = "none";
        //縮小してしまうやつ
        var card = document.getElementById("dash_community");
        //ボタンを非表示にする
        document.getElementById("community_back").style.display = "none";
        //user card を縮小させる
        card.classList.remove("active");
        setTimeout(function(){
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick= function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
        },300);
    },100);
}

//利用規約の記述
function terms_of_service(){
    document.getElementById("terms_of_service").classList.toggle("display");
}
//プライバシーポリシーの記述
function privacy_policy(){
    document.getElementById("privacy_policy").classList.toggle("display");
}