$(document).ready(function(){
    //console.log("ロゴを見えなくする処理をする");
    //早すぎるからタイムアウトさせる
    scrollTo(0,0);
    //document.getElementById("my_body").style.overflowY = "hidden";
    setTimeout(smallrogo, 5000);
});

function smallrogo(){
    document.getElementById("rogo").classList.add("small");
    setTimeout(openpage, 300);
}

function openpage(){
    //document.getElementById("rogo_screen").hidden = true;
    //記述を変えてアニメーションできるようにする
    document.getElementById("rogo_screen").classList.add('end');
    document.getElementById("rogo").classList.add('end');
    setTimeout(display_hidden, 550);
}

function display_hidden(){
    document.getElementById("rogo_screen").hidden = true;
    //document.getElementById("my_body").style.overflowY = "scroll";
}