//material design writing
//textfieldのための
new mdc.autoInit();

/*
//top app bar
new mdc.topAppBar.MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
//tab bar
var header_tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('#community_bar'));
TopAppBar は nagare js でインスタンス化などをしていく
*/
//top app bar
new mdc.topAppBar.MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
//tab bar
var header_tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('#community_bar'));
//リスナー設定
$(document).ready(function(){
    header_tabBar.listen('MDCTabBar:activated',function(event){
        var index = event["detail"]["index"];
        console.log(index);
        get_nagare(index);
        //window.scrollTo(0,0);
        //リスナー設定
        re_register_tab_event();
    },{ once: true});
});

var tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('#footer_tab'));
//tab ページ切り替え
tabBar.listen('MDCTabBar:activated',function(event){
    var index = event["detail"]["index"];
    //bottom のアイコン等の書き換え
    bottom_icon_change(index);
    //user info 取得！！
    var user = firebase.auth().currentUser;
    if(user.isAnonymous){
        //fabは匿名なら常に非表示
        document.getElementById("start_fab").style.display = "none";
    }else{
        //fabの表示はまとめてonにする
        document.getElementById("start_fab").style.display = "flex";
    }
    //pageの要素を取得
    var dash = document.getElementById("page_contain_dash");
    var nagare = document.getElementById("page_contain_com");
    var guest = document.getElementById("page_contain_guest");
    var sirase = document.getElementById("page_contain_sirase");
    var irai = document.getElementById("page_contain_irai");
    //nagareで表示するheader
    var header = document.getElementById("community_bar");
    //listener でタッチ もともとindex0 にだけ設置されていたが、共通にしちゃう。これはワダイのリスナを解除する処理で、未定義（そもそもリッスンしてない）の時出るエラーへの対処
    try{nagare_listener_global();}catch(error){console.log("error", error);};
    try{sirasu_listener();}catch(error){console.log("error", error);};
    try{irai_listener();}catch(error){console.log("error", error);};
    if(index == 0){
        //hiddenの解除
        if(user.isAnonymous){
            //ゲストなので、guestを表示
            guest.hidden = false;
        }else{
            //ログインユーザなので、ダッシュボードを表示する
            dash.hidden = false;
        }
        //renew_card に onclickを代入する//下２行を追記2019/12/01
        document.getElementById("dash_display_user").onclick = function(){display_card_user()};
        document.getElementById("dash_display_job").onclick= function(){display_card_job()};
        document.getElementById("dash_display_com").onclick = function(){display_card_com()};
        document.getElementById("dash_display_greet").onclick = function(){display_card_greet()};
        document.getElementById("dash_display_message").onclick = function(){display_card_message()};
        //hederの非表示
        header.style.display = "none";
        nagare.classList.remove("active_page");
        sirase.classList.remove("active_page");
        irai.classList.remove("active_page");
        //シラセの取得
        sirasu_get();
        setTimeout(function(){
            if(user.isAnonymous){
                //ゲストなのでゲストページをアクティブにする
                guest.classList.add("active_page");
            }else{
                //ログインユーザなので、ダッシュボードをアクティブにする
                dash.classList.add("active_page");
            }
            fab_change(index);//このfabもguestの時は表示調整しなきゃ → とりま書き換えた
            //裏のページを確実にonclickできなくするためにhiddenする
            setTimeout(function(){
                //home以外をhiddenにする
                document.getElementById("page_contain_com").hidden = true;
                irai.hidden = true;
                sirase.hidden = true;
            },300);
        },25);
    }else if(index == 1){
        //シラセの処理をここに記述する
        document.getElementById("page_contain_sirase").hidden = false;//dash home の onclick 停止
        var cards = document.querySelectorAll('.dash-card_renew');
        for(var i = 0; i<cards.length; i++){
            cards[i].onclick="";
        }
        header.style.display = "none";
        nagare.classList.remove("active_page");
        dash.classList.remove("active_page");
        irai.classList.remove("active_page");
        guest.classList.remove("active_page");
        //siraseとworkをそれぞれ取ってくる処理を
        //sirasu_get(); これはホームでの処理になりました
        work_get();//この二つの関数はfab_additionalで定義してる
        //シラセを有効化したい
        setTimeout(function(){
            sirase.classList.add("active_page");
            fab_change(index);//ゲスト（コミュニティ未参加の時はそもそも表示しない処理に書き換えが必要）→取りま書き換えた
            //裏のページを確実にonclickできなくするためにhiddenする
            setTimeout(function(){
                //シラセ以外を非表示にする
                irai.hidden = true;
                nagare.hidden = true;
                if(user.isAnonymous){
                    //匿名なので、ゲストを非表示
                    guest.hidden = true;
                }else{
                    //ログインユーザなので、ダッシュボードを非表示にする
                    dash.hidden = true;
                }
            },300);
        },25);
    }else if(index == 2){
        //ワダイの処理をここに記述する
        //hiddenの解除
        document.getElementById("page_contain_com").hidden = false;
        //dash home の onclick 停止
        var cards = document.querySelectorAll('.dash-card_renew');
        for(var i = 0; i<cards.length; i++){
            cards[i].onclick="";
        }
        //TopAppBar内のTabの有効化
        //insert_communities_navi();この関数内部をいじって、コミュニティに参加してない人の処理を記述していく つもりだったが、ここで分岐させて関数増やして書く形で行ったほうがわかりやすいと思た
        if(user.isAnonymous){
            //匿名ユーザなのでguestの場合はゲストの非表示をするようにする
            guest.classList.remove("active_page");
            insert_guest_navi();
        }else{
            //匿名ユーザでないから dash を閉じる
            dash.classList.remove("active_page");
            insert_communities_navi();//コミュニティに参加してない人はトレンドのみのタブは表示しないようにするから、その対応処理をかけるようにする        
            //headerの表示
            header.style.display = "block";
        }
        irai.classList.remove("active_page");
        sirase.classList.remove("active_page");
        //nagereのページ全体を有効化
        setTimeout(function(){
            nagare.classList.add("active_page");
            fab_change(index);//ゲスト（コミュニティ未参加の時はそもそも表示しない処理に書き換えが必要）→取りま書き換えた
            //裏のページを確実にonclickできなくするためにhiddenする
            setTimeout(function(){
                //ナガレ以外を非表示にする これいらない記述か？
                sirase.hidden = true;
                irai.hidden = true;
                if(user.isAnonymous){
                    //匿名なので、ゲストを非表示
                    guest.hidden = true;
                }else{
                    //ログインユーザなので、ダッシュボードを非表示にする
                    dash.hidden = true;
                }
            },300);
        },25);
        //nagareを取得
        //nagare_change(0);
    }else if(index == 3){
        //イライの記述をここにする
        irai.hidden = false;
        //dash home の onclick 停止
        var cards = document.querySelectorAll('.dash-card_renew');
        for(var i = 0; i<cards.length; i++){
            cards[i].onclick="";
        }
        //active_page remove
        header.style.display = "none";
        dash.classList.remove("active_page");
        guest.classList.remove("active_page");
        nagare.classList.remove("active_page");
        sirase.classList.remove("active_page");
        //iraiをとってくる
        get_irai();
        //iraiのページ全体を有効化
        setTimeout(function(){
            irai.classList.add("active_page");
            fab_change(index);//ゲスト（コミュニティ未参加の時はそもそも表示しない処理に書き換えが必要）→取りま書き換えた
            //裏のページを確実にonclickできなくするためにhiddenする
            setTimeout(function(){
                nagare.hidden = true;
                sirase.hidden = true;
                if(user.isAnonymous){
                    //匿名なので、ゲストを非表示
                    guest.hidden = true;
                }else{
                    //ログインユーザなので、ダッシュボードを非表示にする
                    dash.hidden = true;
                }
            },300);
        },25);
    }
},false);

//fab
new mdc.ripple.MDCRipple(document.querySelector('.mdc-fab'));

//button 初期の提出ボタンダメでした
//new mdc.ripple.MDCRipple(document.querySelector('#dialog_up_button'));
var buttons = document.querySelectorAll('.mdc-button');
for(var i=0; i<buttons.length; i++){
    var mdc_button = buttons[i];
    new mdc.ripple.MDCRipple(mdc_button);
}
//ripple
//全てのdash-card  rippleにtry!
function card_ripple_re(){
    var cards = document.querySelectorAll('.dash-card_renew');
    //console.log("card ripple re", cards.length);
    for(var i=0; i<cards.length; i++){
        var card = cards[i];
        new mdc.ripple.MDCRipple(card);
    }
}function lists_ripple_re(){
    var lists = document.querySelectorAll('.community_li');
    //console.log("lists ripple re", lists.length);
    for(var i=0; i<lists.length; i++){
        var a_list = lists[i];
        new mdc.ripple.MDCRipple(a_list);
    }
}

function do_ripple(selector){
    new mdc.ripple.MDCRipple(selector);
}

//dialog timer_delete_alert_dialog
var timer_delete_alert_dialog = new mdc.dialog.MDCDialog(document.querySelector('#timer_delete_alert_dialog'));
timer_delete_alert_dialog.scrimClickAction = "";

var community_create_dialog = new mdc.dialog.MDCDialog(document.querySelector('#community_create_dialog'));
community_create_dialog.scrimClickAction = "";

var community_create_caution_dialog = new mdc.dialog.MDCDialog(document.querySelector('#community_create_caution_dialog'));
community_create_caution_dialog.scrimClickAction = "";

var community_leave_caution_dialog = new mdc.dialog.MDCDialog(document.querySelector('#community_leave_caution_dialog'));
community_leave_caution_dialog.scrimClickAction = "";

var community_wana_join_dialog = new mdc.dialog.MDCDialog(document.querySelector('#community_wana_join_dialog'));
community_wana_join_dialog.scrimClickAction = "";

var community_wana_model_dialog = new mdc.dialog.MDCDialog(document.querySelector('#community_wana_model_dialog'));

var community_wana_auth_dialog = new mdc.dialog.MDCDialog(document.querySelector('#community_wana_auth_dialog'));

var permission_decide_dialog = new mdc.dialog.MDCDialog(document.querySelector('#permission_decide_dialog'));

var permission_reject_dialog = new mdc.dialog.MDCDialog(document.querySelector('#permission_reject_dialog'));

var nagare_delete_dialog = new mdc.dialog.MDCDialog(document.querySelector('#nagare_delete_dialog'));

var irai_caution_dialog = new mdc.dialog.MDCDialog(document.querySelector('#irai_caution_dialog'));

var work_text_dialog = new mdc.dialog.MDCDialog(document.querySelector('#work_text_dialog'));
work_text_dialog.scrimClickAction = "";

//snakebar
const snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('.mdc-snackbar'));

function fab_change(page_num){
    var the_fab = document.getElementById("start_fab");
    //guestの時はfabを常に非表示にして、関数終了
    var user = firebase.auth().currentUser;
    if(user.isAnonymous){
        the_fab.style.display = "none";
        return
    }
    //fabの要素を取得
    the_fab.onclick = "";
    var the_fab_icon = document.getElementById("fab_icon");
    var the_fab_text = document.getElementById("fab_text");
    //シラスとワークスタートのボタンとページの組み合わせを切り替えたので、if の順番が崩れてます
    if(page_num == 1){
        //ホームのボタン
        the_fab.classList.remove("nagare");
        the_fab.classList.remove("sirase");
        the_fab.classList.remove("irai");
        the_fab.classList.add("small");
        setTimeout(function (){
            the_fab_icon.textContent = "add";
            the_fab_text.textContent = "始める";
            the_fab.classList.remove("small");
            the_fab.classList.add("home");
            the_fab.onclick = function(){start_pushed()};
        },100);
    }else if(page_num == 0){
        //siraseのボタン
        the_fab.classList.remove("home");
        the_fab.classList.remove("nagare");
        the_fab.classList.remove("irai");
        the_fab.classList.add("small");
        setTimeout(function (){
            the_fab_icon.textContent = "emoji_people";
            the_fab_text.textContent = "ハロー";
            the_fab.classList.remove("small");
            the_fab.classList.add("sirase");
            the_fab.onclick = function(){sirasu()};
        },100);
    }else if(page_num == 2){
        //ナガレのボタン
        the_fab.classList.remove("home");
        the_fab.classList.remove("sirase");
        the_fab.classList.remove("irai");
        the_fab.classList.add("small");
        setTimeout(function (){
            the_fab_icon.textContent = "chat";
            the_fab_text.textContent = "ナガス";
            the_fab.classList.remove("small");
            the_fab.classList.add("nagare");
            the_fab.onclick = function(){send_tweet()};
        },100);
    }else if(page_num == 3){
        //iraiのボタン
        the_fab.classList.remove("home");
        the_fab.classList.remove("nagare");
        the_fab.classList.remove("sirase");
        the_fab.classList.add("small");
        setTimeout(function (){
            the_fab_icon.textContent = "emoji_flags";
            the_fab_text.textContent = "タノム";
            the_fab.classList.remove("small");
            the_fab.classList.add("irai");
            the_fab.onclick = function(){tanomu()};
        },100);
    }
}

/* list community_join */
const list = new mdc.list.MDCList(document.querySelector('.mdc-list'));

/* menu */
const menu = new mdc.menu.MDCMenu(document.querySelector('#community_detail_verb_menus'));
//const login_menu = new mdc.menu.MDCMenu(document.querySelector('#login_menu'));


/* bottom_icon */
function bottom_icon_change(num){
    //console.log(num);
    //始めにclass .bab_icon.usingのやつのusingを取り消す
    var elem = document.querySelectorAll('.bab_icon.using');
    elem.forEach(function(value) {
        value.classList.remove("using");
    });
    //書き換えるぞおらー クラスを書き足して色を変化させる処理
    if(num == 0){
        document.getElementById("bab_icon_home").classList.add("using");
        document.getElementById("bab_icon_home_text").classList.add("using");
    }else if(num == 1){
        document.getElementById("bab_icon_sirase").classList.add("using");
        document.getElementById("bab_icon_sirase_text").classList.add("using");    
    }else if(num == 2){
        document.getElementById("bab_icon_wadai").classList.add("using");
        document.getElementById("bab_icon_wadai_text").classList.add("using");    
    }else if(num == 3){
        document.getElementById("bab_icon_irai").classList.add("using");
        document.getElementById("bab_icon_irai_text").classList.add("using");        
    }
}

//drawer
const drawer = new mdc.drawer.MDCDrawer(document.querySelector('.mdc-drawer'));
      
function drawer_open(){
  drawer.open = !drawer.open;
}