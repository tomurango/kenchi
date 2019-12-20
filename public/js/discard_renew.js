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
    //裏のvisibility を hidden にする
    $("#dash_display_user").css('visibility','hidden');
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        card.firstElementChild.style.display = "block";
    },50);
}

/*
// スクロール禁止
$("body").css('overflow','hidden');

// スクロール禁止 解除
$("body").css('overflow','auto');
*/
//カードを指定された位置に召還して動かす スペル両方ミスってるっぽいなｗ 定義時も使用時も
function apper_card(clicked_element_id, apper_element_id){
    console.log("appear card");
    //スクロール停止
    $("body").css('overflow','hidden');
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
    //裏のvisibility を hidden にする
    $("#dash_display_user").css('visibility','visible');
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
            //スクロール回復
            $("body").css('overflow','auto');
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick= function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
            document.getElementById("dash_display_greet").onclick = function(){display_card_greet()};
            document.getElementById("dash_display_message").onclick = function(){display_card_message()};
            document.getElementById("dash_display_ranking").onclick = function(){display_card_ranking()};
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
    //裏のvisibility を hidden にする
    $("#dash_display_job").css('visibility','hidden');
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        card.firstElementChild.style.display = "block";
    },50);
}

//nameを閉じるときの関数
function display_card_job_back(){
    //裏のvisibility を hidden にする
    $("#dash_display_job").css('visibility','visible');
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
            //スクロール回復
            $("body").css('overflow','auto');
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick = function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
            document.getElementById("dash_display_greet").onclick = function(){display_card_greet()};
            document.getElementById("dash_display_message").onclick = function(){display_card_message()};
            document.getElementById("dash_display_ranking").onclick = function(){display_card_ranking()};
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
    //裏のvisibility を hidden にする
    $("#dash_display_com").css('visibility','hidden');
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
    //裏のvisibility を hidden にする
    $("#dash_display_com").css('visibility','visible');
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
            //スクロール回復
            $("body").css('overflow','auto');
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick= function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
            document.getElementById("dash_display_greet").onclick = function(){display_card_greet()};
            document.getElementById("dash_display_message").onclick = function(){display_card_message()};
            document.getElementById("dash_display_ranking").onclick = function(){display_card_ranking()};
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

//挨拶かーーどの表示
function display_card_greet(){
    console.log("display_greet");
    //他の動作と被らないようにonclickを消す
    var cards = document.querySelectorAll('.dash-card_renew');
    for(var i = 0; i<cards.length; i++){
        cards[i].onclick="";
    }
    //拡大して表示する旧来のやつ
    var card = document.getElementById("dash_greet");
    //拡大させるカードを償還する
    apper_card("dash_display_greet", "dash_greet");
    //裏のvisibility を hidden にする
    $("#dash_display_greet").css('visibility','hidden');
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        card.firstElementChild.style.display = "block";
        //textを表示させる
        document.getElementById("greet_text").hidden = false;
    },50);
}
//greetを閉じるときの関数
function display_card_greet_back(){
    //裏のvisibility を hidden にする
    $("#dash_display_greet").css('visibility','visible');
    console.log("back_greet");
    //ボタンを押したときのエフェクトが実行されるためのタイムアウト
    setTimeout(function(){
        //縮小してしまうやつ
        var card = document.getElementById("dash_greet");
        //ボタンを非表示にする
        card.firstElementChild.style.display = "none";
        //textを表示させる
        document.getElementById("greet_text").hidden = true;
        //user card を縮小させる
        card.classList.remove("active");
        setTimeout(function(){
            //スクロール回復
            $("body").css('overflow','auto');
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick= function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
            document.getElementById("dash_display_greet").onclick = function(){display_card_greet()};
            document.getElementById("dash_display_message").onclick = function(){display_card_message()};
            document.getElementById("dash_display_ranking").onclick = function(){display_card_ranking()};
        },300);
    },100);
}

//メッセージ
function display_card_message(){
    console.log("display_message");
    //他の動作と被らないようにonclickを消す
    var cards = document.querySelectorAll('.dash-card_renew');
    for(var i = 0; i<cards.length; i++){
        cards[i].onclick="";
    }
    //拡大して表示する旧来のやつ
    var card = document.getElementById("dash_message");
    //拡大させるカードを償還する
    apper_card("dash_display_message", "dash_message");
    //裏のvisibility を hidden にする
    $("#dash_display_message").css('visibility','hidden');
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        card.firstElementChild.style.display = "block";
        //textを表示させる
        document.getElementById("message_text").hidden = false;
    },50);
}
//greetを閉じるときの関数
function display_card_message_back(){
    //裏のvisibility を hidden にする
    $("#dash_display_message").css('visibility','visible');
    console.log("back_message");
    //ボタンを押したときのエフェクトが実行されるためのタイムアウト
    setTimeout(function(){
        //縮小してしまうやつ
        var card = document.getElementById("dash_message");
        //ボタンを非表示にする
        card.firstElementChild.style.display = "none";
        //textを表示させる
        document.getElementById("message_text").hidden = true;
        //user card を縮小させる
        card.classList.remove("active");
        setTimeout(function(){
            //スクロール回復
            $("body").css('overflow','auto');
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick= function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
            document.getElementById("dash_display_greet").onclick = function(){display_card_greet()};
            document.getElementById("dash_display_message").onclick = function(){display_card_message()};
            document.getElementById("dash_display_ranking").onclick = function(){display_card_ranking()};
        },300);
    },100);
}

//ランキング
function display_card_ranking(){
    console.log("display_ranking");
    //他の動作と被らないようにonclickを消す
    var cards = document.querySelectorAll('.dash-card_renew');
    for(var i = 0; i<cards.length; i++){
        cards[i].onclick="";
    }
    //拡大して表示する旧来のやつ
    var card = document.getElementById("dash_ranking");
    //拡大させるカードを償還する
    apper_card("dash_display_ranking", "dash_ranking");  
    //裏のvisibility を hidden にする
    $("#dash_display_ranking").css('visibility','hidden');  
    setTimeout(function(){
        //拡大させる
        card.classList.add("active");
        //ボタンを表示させる
        card.firstElementChild.style.display = "block";
        //textを表示させる
        document.getElementById("ranking_information").hidden = false;
        //ランキング情報を取得して代入する
        get_ranking();


    },50);
}
//rankingを閉じるときの関数
function display_card_ranking_back(){
    //裏のvisibility を hidden にする
    $("#dash_display_ranking").css('visibility','visible');
    console.log("back_ranking");
    //ボタンを押したときのエフェクトが実行されるためのタイムアウト
    setTimeout(function(){
        //縮小してしまうやつ
        var card = document.getElementById("dash_ranking");
        
        //ボタンを非表示にする
        card.firstElementChild.style.display = "none";
        //textを表示させる
        document.getElementById("ranking_information").hidden = true;
        
        //user card を縮小させる
        card.classList.remove("active");
        setTimeout(function(){
            //スクロール回復
            $("body").css('overflow','auto');
            //user card を非表示にする
            card.style.display = "none";
            //renew_card に onclickを代入する
            document.getElementById("dash_display_user").onclick = function(){display_card_user()};
            document.getElementById("dash_display_job").onclick= function(){display_card_job()};
            document.getElementById("dash_display_com").onclick = function(){display_card_com()};
            document.getElementById("dash_display_greet").onclick = function(){display_card_greet()};
            document.getElementById("dash_display_message").onclick = function(){display_card_message()};
            document.getElementById("dash_display_ranking").onclick = function(){display_card_ranking()};
        },300);
    },100);
}

var ranking_flag = 0;
//ジョブを月ごとのランキングで取得するための関数
function get_ranking(){
    //一度取得していたら何もしないで終了させる
    if(ranking_flag == 1){return};
    //とりあえず取得上限１０個
    db.collectionGroup('levinfo').orderBy("month_time", "desc").limit(10).get().then(function (querySnapshot) {
        //カウントを表示
        firestore_get_count += querySnapshot.size;
        if(querySnapshot.size == 0) {firestore_get_count += 1};
        console.log("read_one", firestore_get_count);
        var ranking_reverse = querySnapshot.docs.reverse();
        //console.log(ranking_reverse);
        document.getElementById("ranking_information").innerHTML = "";
        //順位づけのための変数
        var rank_number = querySnapshot.size;
        ranking_reverse.forEach(function(doc) {
            insert_ranking(doc.id, doc.data(), rank_number);
            //ひとつづつ下げてく
            rank_number -= 1;
        });
        ranking_flag = 1;
    });
}
//ジョブをインサートしていく関数
function insert_ranking(job_id, job_doc, rank_number){
    var the_name = '<span class="mdc-list-item__secondary-text" style="position: absolute; top: 32px; left: 72px">'+ job_doc.job_name +'</span><span class="mdc-list-item__graphic"></span>';
    var the_rank = '<span class="mdc-list-item__primary-text" style="position: absolute; top: 0px; left: 72px">第'+ rank_number +'位</span>';
    var the_image = '<img src="'+ job_doc.user_image +'" style="height: 40px; width:40px; object-fit: cover; border-radius: 50%; margin-right: 16px;">';
    var the_list = '<li id="' + job_id + '" class="mdc-list-item" style="height: 72px">' + the_image + the_rank + the_name + '</li>'
    document.getElementById("ranking_information").insertAdjacentHTML("afterbegin", the_list);
    //console.log(job_id, " => ", job_doc);
}


