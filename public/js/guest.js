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
}//second_card_back
function second_card_close(){
    var second_card = document.querySelector('#second_card');
    var second_card_back = document.querySelector('#second_card_back');
    //表示縮小をする
    second_card.classList.remove("display");
    //戻るボタンを非表示にする
    second_card_back.classList.remove("display");
    //同意ボタンを非表示にする
    document.querySelector("#second_card_approval").classList.remove("display");
    //rippleをもどす
    second_card.classList.add("mdc-ripple-surface");
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
    document.getElementById("page_contain_com").innerHTML = '<p style = "margin: 70px 20px 20px 20px; font-size:2em;">ここにfirestoreで取得したトレンドの話題を並べる</p>';
    get_trend();
}

function get_trend(){
    db.collectionGroup('nagare').get().then(function (querySnapshot) {
        //get カウント
        if(querySnapshot.size == 0){
            firestore_get_count += 1;
        }else{
            firestore_get_count += querySnapshot.size;
        }
        console.log("get", firestore_get_count);
        querySnapshot.forEach(function (doc) {
            console.log(doc.id, ' => ', doc.data());
        });
    }).catch(function(error){
        console.log("error => ", error);
    });
}

