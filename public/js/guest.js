//import { firestore } from "firebase";
//上の文の自動生成はfirestoreと入力して、自動変換張りに何も考えずにEnter押した結果かもしれない なんか草

//チュートリアルの画面を表示する等の処理をする
$(document).ready(function(){
    if (localStorage.getItem('UserLoginTime')) {
        //二回目以降のログイン
        //ログイン回数+1
        localStorage.setItem('UserLoginTime', Number(localStorage.getItem('UserLoginTime')) + 1);
        console.log('UserLoginTime:' + localStorage.getItem('UserLoginTime'));
    } else {
        //初めてのログイン
        //ログイン回数を1回にセット
        localStorage.setItem('UserLoginTime', 1);
        console.log('UserLoginTime:' + localStorage.getItem('UserLoginTime'));
        for_the_first_time();//初めてなので紹介と、規約同意の提示、アンド操作を少し学習してもらう
    }
});

//始めてサイトに訪れたときの処理
function for_the_first_time(){
    //page_contain_dash を非表示にする
    document.getElementById("page_contain_dash").hidden = true;
    //header を非表示にする
    document.getElementById('the_header').style.display = "none";
    //footer を非表示にする
    document.getElementById('top_footer').hidden = true;
    //fab を非表示にする
    document.getElementById('start_fab').style.display = "none";
    //main を非表示にする → 要素をクリックできるようにするため
    document.getElementById('the_main').hidden = true;
    //ようこそカードを表示する
    var first_card = document.querySelector('#first_card');
    new mdc.ripple.MDCRipple(first_card);//ripple effect をつける
    first_card.style.display = "flex";
}//first_card_display
function first_card_display(){
    var first_card = document.querySelector('#first_card');
    var first_card_back = document.querySelector('#first_card_back');
    //表示拡大をする
    first_card.classList.add("display");
    //戻るボタンを表示する
    first_card_back.classList.add("display");
    //onclickをなくす
    first_card.onclick = "";
    //rippleをなくす
    first_card.classList.remove("mdc-ripple-surface");
    //welcomeを表示する
    document.getElementById("welcome").hidden = false;
    //second_cardを表示する
    setTimeout(function(){
        //時間差で表示しないとタイミング的になんかおかしくなる
        var second_card = document.querySelector('#second_card');
        new mdc.ripple.MDCRipple(second_card);//ripple effect をつける
        second_card.style.display = "flex";
    },500);
}//first_card_back
function first_card_close(){
    var first_card = document.querySelector('#first_card');
    var first_card_back = document.querySelector('#first_card_back');
    //welcomeを非表示する
    document.getElementById("welcome").hidden = true;
    //表示縮小をする
    first_card.classList.remove("display");
    //戻るボタンを非表示にする
    first_card_back.classList.remove("display");
    //rippleをもどす
    first_card.classList.add("mdc-ripple-surface");
    //onclickを元に戻す
    setTimeout(function(){
        //なんか間を置かないと暴発して全然戻らない
        first_card.onclick = function(){first_card_display()};
    },500);
}

//about second card
function second_card_display(){
    var second_card = document.querySelector('#second_card');
    var second_card_back = document.querySelector('#second_card_back');
    //表示拡大をする
    second_card.classList.add("display");
    //戻るボタンを表示する
    second_card_back.classList.add("display");
    //同意ボタンを表示する
    document.querySelector("#second_card_approval").classList.add("display");
    //onclickをなくす
    second_card.onclick = "";
    //rippleをなくす
    second_card.classList.remove("mdc-ripple-surface");
    //利用規約を表示する
    document.getElementById("concern_terms").hidden = false;
}//second_card_back
function second_card_close(){
    var second_card = document.querySelector('#second_card');
    var second_card_back = document.querySelector('#second_card_back');
    //スクロールを初期位置にする
    document.getElementById("second_card").scrollTop = 0;
    //表示縮小をする
    second_card.classList.remove("display");
    //戻るボタンを非表示にする
    second_card_back.classList.remove("display");
    //同意ボタンを非表示にする
    document.querySelector("#second_card_approval").classList.remove("display");
    //rippleをもどす
    second_card.classList.add("mdc-ripple-surface");
    //利用規約を非表示する
    document.getElementById("concern_terms").hidden = true;
    //onclickを元に戻す
    setTimeout(function(){
        //なんか間を置かないと暴発して全然戻らない
        second_card.onclick = function(){second_card_display()};
    },500);
}
//同意
function tutorial_approval(){
    //とりあえず、表示を戻してからの処理をする
    second_card_close();
    //fab を表示する
    document.getElementById("third_fab").style.display = "flex";
}

//はじまりのおわり
function the_third(){
    //チュートリアルのマテリアルたちを非表示にする
    document.querySelector('#first_card').style.display = "none";
    document.querySelector('#second_card').style.display = "none";
    document.getElementById("third_fab").style.display = "none";
    //guest の場合と そうでない場合に分岐表示する(基本的にチュートリアル処理をこなしているのでguestであることが想定される)
    //今ログインしてるユーザが匿名ユーザであるかどうかで判別
    var user = firebase.auth().currentUser;
    if(user.isAnonymous){
        //匿名ユーザ（ゲスト）のログイン
        anonymous_true();
    }else{
        //もうすでにログイン済み（こっちルートはアプリ版とか作ったらそうなるのだろうか？）
        //191012現在は挙動不審してることになる処理
        anonymous_false();
    }
}

//匿名だから、特別バージョンをお見舞いする
function anonymous_true(){
    //page_contain_guest を表示する
    document.getElementById("page_contain_guest").hidden = false;
    //header を表示する
    document.getElementById('the_header').style.display = "flex";
    //footer を表示する
    document.getElementById('top_footer').hidden = false;
    //fab は非表示のまま
    //document.getElementById('start_fab').style.display = "flex";
    //main を表示する
    document.getElementById('the_main').hidden = false;
    
    //なんかheaderの位置がおかしいからtop 0 にする
    document.getElementById("the_header").style.top = "0px";
    //mainをスクロールできないようにしたいから、高さを100%にする(そもそも、dashのための位置が生成されてしまっているようでおかしい希ガス)
    document.getElementById('the_main').style.height = "100%";
}
//匿名じゃないので規定の表示に戻す
function anonymous_false(){
    //page_contain_dash を表示する
    document.getElementById("page_contain_dash").hidden = false;
    //header を表示する
    document.getElementById('the_header').style.display = "flex";
    //footer を表示する
    document.getElementById('top_footer').hidden = false;
    //fab を表示する
    document.getElementById('start_fab').style.display = "flex";
    //main を表示する
    document.getElementById('the_main').hidden = false;
}

//material 89 で採用している。tabbarの表示時にエラーになるのでその対応
function insert_guest_navi(){
    var header = document.getElementById("community_bar");
    //trend だけ表示して、firestore で情報取得と挿入をしていく感じ
    header.style.display = "none";
    //今は試しに書き込んでる
    //document.getElementById("page_contain_com").innerHTML = '<p style = "margin: 70px 20px 20px 20px; font-size:2em;">ここにfirestoreで取得したトレンドの話題を並べる</p>';
    document.getElementById("page_contain_com").innerHTML = '<div id="nagare_trend" class="nagare_page index_0" style="top: 106px;"><div>';
    get_trend();
}

//1週間以内のnagareについて扱うためのタイムスタンプ
var one_week_ago_trend = new Date();
one_week_ago_trend.setDate(one_week_ago_trend.getDate() - 7);
var nagare_timestamp_trend = firebase.firestore.Timestamp.fromDate(one_week_ago_trend);
function get_trend(){
    //collectionGroup → _collectionGroup アンダーバー付けたら、funtion じゃないよエラーから、許可下りてませんよエラーになった。
    db.collectionGroup('nagare').where('date', '>' , nagare_timestamp_trend).orderBy("date", "desc").limit(10).get().then(function (querySnapshot) {
        //timestamp
        //nagare_timestamp_trend = firebase.firestore.Timestamp.now();トレンドは常に最新のものを取得したいから、タイムスタンプは惜しませン
        //get カウント
        if(querySnapshot.size == 0){
            firestore_get_count += 1;
            //空だった時にからの情報を提示
            insert_no_wadai(document.getElementById("nagare_trend"));
            console.log("ワダイがない in trend");
        }else{
            firestore_get_count += querySnapshot.size;
            console.log("ワダイがある in trend");
        }
        console.log("get", firestore_get_count);
        //そのまま取得した要素に対しては逆順でなければ上に行ってくれない
        querySnapshot.docs.reverse().forEach(function (doc) {
            console.log(doc.id, ' => ', doc.data());
            insert_to_trend(doc.id, doc.data());
        });
    }).catch(function(error){
        console.log("error => ", error);
    });
}

//挿入していくための関数
function insert_to_trend(doc_id , doc_data){
    //時間を求める
    var time_list = fire_time_normalization(doc_data.date);
    var time_record = time_list[0] + "月" + time_list[1] + "日 " + time_list[2] + ":" + time_list[3];
    var wadai_time = '<p style="position: relative; color: #606060; font-size: 0.8em; margin-left: 20px; margin-right: 48px; margin-top: 26px;">' + time_record +'</p>';
    var wadai_text = '<p style="position: relative; margin: 0px 0px 0px 20px; font-size: 2em;">'+ doc_data.text +'</p>';
    if(doc_data.contentImage == true){
        //画像なしカードの処理
        var wadai_card_img = '';
        var card_height = 'height: calc(41.42vw - 16.57px);';
    }else{
        //画像ありのカードの処理
        var wadai_card_img = '<img src="' + doc_data.contentImage + '" style="height: calc(41.42vw - 16.57px); width: 100%; object-fit: cover;">';
        var card_height = 'height: calc(82.84vw - 33.14px);';
    }
    //trendをぶち込んでくelement
    var wadai_card = '<div id="' + doc_data.communityId + '_' + doc_id +'" class="nagare_ripple mdc-ripple-surface mdc-card" onclick="display_talk(this)" style="padding: 0px; margin: 20px 20px 20px 20px; border-radius:5px; position: relative; background-color: #ffffff;' + card_height + ' overflow: hidden">' + wadai_card_img + wadai_time + wadai_text + '</div>';
    document.getElementById("nagare_trend").insertAdjacentHTML("afterbegin", wadai_card);
    //高さ調節
    var height = document.getElementById("nagare_trend").clientHeight;
    document.getElementById("page_contain_com").style.height = String(height + 200) + "px";
    //rippleの書き足し
    var lists = document.querySelectorAll('.nagare_ripple');
    //console.log("lists ripple re", lists.length);
    for(var i=0; i<lists.length; i++){
        var a_list = lists[i];
        new mdc.ripple.MDCRipple(a_list);
    }
    //talkごとのタイムスタンプ だが、今までのやつパクったので理解が薄い。要注意
    var one_week_ago = new Date();
    one_week_ago.setDate(one_week_ago.getDate() - 7);
    //タイムスタンプとtalk内容の分岐生成処理
    if(wadai_nagare_glbal[doc_data.communityId]){
        //コミュニティレベルで既に存在してる
        if(wadai_nagare_glbal[doc_data.communityId][doc_id]){
            //ワダイレベルで既に存在してる恐らく、これが挙動不審の部分になる
            //理由はwadaiを再取得して検証してることになるから
            console.log("挙動不審");//今のところ常に最新の状態に保ちたいから、この挙動を積極的に取り入れていくので行っちゃう 要は挙動不審を許容しますよってことかな？
            //ただ、特に細かい処理はしない
        }else{
            //wadaiレベルで定義
            wadai_nagare_glbal[doc_data.communityId][doc_id] = {
                timeStamp: firebase.firestore.Timestamp.fromDate(one_week_ago),
                commentDocs: []
            };
        }
    }else{
        //コミュニティレベルで存在してないなら、コミュニティレベルの連想配列を生成したのちに、wadaiの文も生成する
        wadai_nagare_glbal[doc_data.communityId] = {};
        //疑似配列って一々定義していくものなのだろうか一応動いたけども
        wadai_nagare_glbal[doc_data.communityId][doc_id] = {
            timeStamp: firebase.firestore.Timestamp.fromDate(one_week_ago),
            commentDocs: []
        }
    }
}

function how_to_login_open(){
    document.getElementById("how_to_login").classList.add("display");
}

function how_to_login_close(){
    document.getElementById("how_to_login").classList.remove("display");
}


/*
$(document).ready(function(){
    //var google_login_img = document.getElementById('google_login_img');

    //ON
    document.getElementById('google_login_img').addEventListener('mouseenter', () => {
        google_login_img.src = "img/btn_google_signin_light_focus_web.png";
    }, false);

    //OUT
    document.getElementById('google_login_img').addEventListener('mouseleave', () => {
        google_login_img.src = "img/btn_google_signin_light_normal_web.png";
    }, false);

    //CLICK
    document.getElementById('google_login_img').addEventListener('mousedown', () => {
        google_login_img.src = "img/btn_google_signin_light_pressed_web.png";
    }, false);
});
*/