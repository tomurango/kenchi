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
    //fabの表示はまとめてonにする
    document.getElementById("start_fab").style.display = "flex";
    var index = event["detail"]["index"];
    //pageの要素を取得
    var dash = document.getElementById("page_contain_dash");
    var nagare = document.getElementById("page_contain_com");
    //nagareで表示するheader
    var header = document.getElementById("community_bar");
    if(index == 0){
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
            dash.classList.add("active_page");
            fab_change(index);
        },25);
    }else if(index == 1){
        //dash home の onclick 停止
        var cards = document.querySelectorAll('.dash-card_renew');
        for(var i = 0; i<cards.length; i++){
            cards[i].onclick="";
        }
        //headerの表示
        header.style.display = "block";
        //TopAppBar内のTabの有効化
        insert_communities_navi();
        //dash を閉じる
        dash.classList.remove("active_page");
        //nagereのページ全体を有効化
        setTimeout(function(){
            /*
            dash.style.display = "none";
            nagare.style.display = "block";
            */
            nagare.classList.add("active_page");
            fab_change(index);
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
    //fabの要素を取得
    var the_fab = document.getElementById("start_fab");
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
const menu = new mdc.menu.MDCMenu(document.querySelector('.mdc-menu'));