$(document).ready(function(){
    //console.log("ロゴを見えなくする処理をする");
    //早すぎるからタイムアウトさせる
    scrollTo(0,0);
    //document.getElementById("my_body").style.overflowY = "hidden";
    setTimeout(smallrogo, 3000);
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
    setTimeout(display_hidden, 300);
}

function display_hidden(){
    document.getElementById("rogo_screen").hidden = true;
    //document.getElementById("my_body").style.overflowY = "scroll";
    //place holder ui の調整を行います 本当は表示が完了した時点の非同期を行うことで対応したいが、、、、やり方知らない
    setTimeout(function(){
        document.getElementById("placeholder_dash").classList.add("delete");
        setTimeout(placeholder_delete, 300);
    },3000);
}

function placeholder_delete(){
    document.getElementById("placeholder_dash").style.display = "none";
}