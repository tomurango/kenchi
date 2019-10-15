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
    //user info 取得！！
    var user = firebase.auth().currentUser;
    if(user.isAnonymous){
        //fabは匿名なら常に非表示
        document.getElementById("start_fab").style.display = "none";
    }else{
        //fabの表示はまとめてonにする
        document.getElementById("start_fab").style.display = "flex";
    }
    var index = event["detail"]["index"];
    //pageの要素を取得
    var dash = document.getElementById("page_contain_dash");
    var nagare = document.getElementById("page_contain_com");
    var guest = document.getElementById("page_contain_guest");
    //nagareで表示するheader
    var header = document.getElementById("community_bar");
    if(index == 0){
        //hiddenの解除
        if(user.isAnonymous){
            //ゲストなので、guestを表示
            guest.hidden = false;
        }else{
            //ログインユーザなので、ダッシュボードを表示する
            dash.hidden = false;
        }
        //listener でタッチ
        try{nagare_listener_global();}catch(error){console.log("error", error);};
        //renew_card に onclickを代入する
        document.getElementById("dash_display_user").onclick = function(){display_card_user()};
        document.getElementById("dash_display_job").onclick= function(){display_card_job()};
        document.getElementById("dash_display_com").onclick = function(){display_card_com()};
        //hederの非表示
        header.style.display = "none";
        nagare.classList.remove("active_page");
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
                document.getElementById("page_contain_com").hidden = true;
            },300);
        },25);
    }else if(index == 1){
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
        //nagereのページ全体を有効化
        setTimeout(function(){
            nagare.classList.add("active_page");
            fab_change(index);//ゲスト（コミュニティ未参加の時はそもそも表示しない処理に書き換えが必要）→取りま書き換えた
            //裏のページを確実にonclickできなくするためにhiddenする
            setTimeout(function(){
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
    if(page_num == 0){
        the_fab.classList.remove("nagare");
        the_fab.classList.add("small");
        setTimeout(function (){
            the_fab_icon.textContent = "add";
            the_fab_text.textContent = "始める";
            the_fab.classList.remove("small");
            the_fab.classList.add("home");
            the_fab.onclick = function(){start_pushed()};
        },100);
    }else if(page_num == 1){
        the_fab.classList.remove("home");
        the_fab.classList.add("small");
        setTimeout(function (){
            the_fab_icon.textContent = "chat";
            the_fab_text.textContent = "ナガス";
            the_fab.classList.remove("small");
            the_fab.classList.add("nagare");
            the_fab.onclick = function(){send_tweet()};
        },100);
    }
}

/* list community_join */
const list = new mdc.list.MDCList(document.querySelector('.mdc-list'));

/* menu */
const menu = new mdc.menu.MDCMenu(document.querySelector('#community_detail_verb_menus'));
const login_menu = new mdc.menu.MDCMenu(document.querySelector('#login_menu'));