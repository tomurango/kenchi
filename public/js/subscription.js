// test 公開鍵
//Payjp.setPublicKey("pk_test_9fd0175be5f918882aa96643");
//payjpじゃなくて、ストライプのほうが連携機能が優れているのか？

//正常な申請の時に呼び出される関数
function onCreated(res){
    console.log("成功したよ登録", res);
    money_reload_dialog.open();
    //今はめんどくさいから、分岐しないけど、レスポンスに応じて処理を変えていく感じにする必要があるならする

}

//error の時に実行される関数
function onFailed(res, error){
    console.log("失敗しましたよ登録", res, error);
}

//以下にサイト表示に関するエフェクトや条件分岐に動作管理の記述をする
var global_limits;
//日付更新であるか否かで処理を分岐（そうしなければ、日付更新処理とlimit処理がかみ合わないで、前日の制限がそのまま使用されてしまうから）
function get_limits(userid, day_first){
    if(day_first){
        global_limits = {
            hello: 0,
            work: 0,
            wadai: 0
        };
        reflect_limits(0);
    }else{
        //制限に関する情報を取得してグローバル変数に代入する
        db.collection('users').doc(userid).collection("limits").doc("day").get().then(function(doc){
            //代入
            global_limits = doc.data();
            //console.log(global_limits);
            reflect_limits(0);
        }).catch(function(error){
            console.log("error", error);
        });
    }
}

//挙動制限にかかるボタンの識別と制限動作を行う関数、ナビゲーションでボタンを切り替える時も動かす
//数値をカウントしたのちに実行すること
var limit_display_count = {hello: 0, work: 0, wadai: 0}
function reflect_limits(navigation_number){
    //0 → hello, 1 → work, 2 → wadai
    if(navigation_number == 0){
        //1になったとき時にボタンを押せなくする、見た目も変える
        if(global_limits.hello > 0){
            document.getElementById("start_fab").disabled = "disabled";
            document.getElementById("start_fab").classList.add("limit");
            if(limit_display_count.hello == 0){
                limit_display_count.hello = 1;
                display_limit_message("ハローアクション");
            }
        }else{
            document.getElementById("start_fab").disabled = "";
            document.getElementById("start_fab").classList.remove("limit");
        }
    }else if(navigation_number == 1){
        if(waiwai){
            //ワイワイユーザは5回しようしたらもう使えない
            var work_limit_count = 4;
        }else{
            //ノーマルユーザは１回使用したら使えない
            var work_limit_count = 0;
        }
        if(global_limits.work > work_limit_count){
            document.getElementById("start_fab").disabled = "disabled";
            document.getElementById("start_fab").classList.add("limit");
            if(limit_display_count.work == 0){
                limit_display_count.work = 1;
                display_limit_message("ワークアクション");
            }
        }else{
            document.getElementById("start_fab").disabled = "";
            document.getElementById("start_fab").classList.remove("limit");
        }
    }else if(navigation_number == 2){
        if(waiwai){
            //ワイワイユーザは5回しようしたらもう使えない
            var wadai_limit_count = 4;
        }else{
            //ノーマルユーザは1回使用したら使えない
            var wadai_limit_count = 0;
        }
        if(global_limits.wadai > wadai_limit_count){
            document.getElementById("start_fab").disabled = "disabled";
            document.getElementById("start_fab").classList.add("limit");
            if(limit_display_count.wadai == 0){
                limit_display_count.wadai = 1;
                display_limit_message("ワダイアクション");
            }
        }else{
            document.getElementById("start_fab").disabled = "";
            document.getElementById("start_fab").classList.remove("limit");
        }
    }else{
        //nvigation_number == 3 に対して以来を適用していく形になるのが理想なんだけどね
        console.log("イライに対する制限ものちに追加すると思うよ");
    }
    //表示に反映する
    reflect_limits_todisplay();
}

//なんかこれやたらとうざいから、ボタン押したときのメッセージに切り替えるかも
function display_limit_message(actionName){
    //message を挿入する
    document.getElementById("what_limit").textContent = actionName;
    //タイムアウトで代入されてから実行する
    setTimeout(function(){
        //表示する
        display_limit_dialog.open();
    },500);
}

//subscription を開始した時のフィードバックをわかりやすくするような記述及び、アプリ起動時に登録ユーザーであったときに
//それを反映する処理の記述を加える
function if_waiwaiuser(){
    db.collection("waiwai_users").doc(user_info_global.uid).get().then(function(doc) {
        if (doc.exists) {
            if(doc.data().cancel == true){
                //存在しても、停止しているときの処理。
                define("waiwai",false);
                //ワイワイユーザではないが、過去にそうであった経験がある場合の処理。
                document.getElementById("which_for_subscriptuon").value = "not";
            }else{
                //存在するときの処理
                console.log("Document data:", doc.data());
                document.getElementById("user_plan_display_renew").textContent = "ワイワイプラン";
                document.getElementById("user_plan_display").textContent = "ワイワイプラン";
                /*
                document.getElementById("plan_explaining").textContent = "ワイワイプランであるときの説明がここに、、、";
                */
                //formをけす
                document.getElementById("plan_purchase_form").style.display = "none";
                //元に戻すボタンを取り付ける
                document.getElementById("plan_downgrade_form").style.display = "flex";
                //const waiwai = true;
                define("waiwai",true);
            }
            //存在すれば、どっちにしろ実効
            define("waiwainformation",doc.data());
            return
        } else {
            // doc.data() will be undefined in this case
            //この場合は特に何もしないでreturn
            console.log("No such document!");
            //const waiwai = false;
            define("waiwai",false);
            return
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

/// グローバル定数を定義する ザッコピペ 不変なグローバル変数を作るために利用する
function define(name, value){
    Object.defineProperty(window, name, { 
        get: function(){return value;},
        set: function(){
            //料金変更した時はこの変数再定義ができないので、
            //ここでリロードしてくださいのダイアログを出力する
            //それはレスポンスの関数で実行させます
            console.log("無理");
            //money_reload_dialog.open();
            throw(name+' is already defined !!');
        }
    });
}

//ただリロードするためだけの関数
function reload_right_now(){
    location.reload();
}

//注意事項を表示するダイアログ
function open_cancel_alert(){
    money_cancel_dialog.open();
}

function send_cancel_form(){

    /*
    $.post( 'https://httpbin.org/post', 'name=taro' ).done(function( data ) {
        
        console.log( data.form );
        
    });
    */

    var obj = document.forms["plan_downgrade_form"];

    document.getElementById("cancel_open_button").disabled = "disabled";

    $.ajax({
        url: "https://us-central1-keikenchi-cf891.cloudfunctions.net/stopwaiwaiPlan",
        type: 'post',
        data: $(obj).serialize(),
        dataType: 'text'
    }).done(function(data) {
        console.log("成功", data);
        money_canceled_dialog.open();
    }).fail(function(data) {
        console.log("失敗", data);
        
        document.getElementById("cancel_open_button").disabled = "false";
    });
}
    

var global_mojisuu; //=0
//もじすうをカウントして月別のリミットに対しての実装を行う場所
//結局cloud functionで書き換えるから、意味ない記述かもしれん（小並感）;
//使うとしたら、表示側の調整をするための処理に利用すると考えられる
function moji_limit(count){
    console.log("moji_count => ", count);
    //カウントの制限を上回らせるための
    //裏利用への対処
    if(count < 0){
        //カウントが負の値である（不正利用）時、何もしないで返す
        return
    }else{
        //新しくカウントしたのちに表示を切り替える
        //ここでグローバル文字数を検討して、NaNが出る計算の場合、出力を変更する書き換えを加える
        //undefinedのときに、仮値で計算する？仕組みを決める、subscriptionの276あたりのmoji_limitでundefinedの時、表示を切り替えるようにする
        if(typeof global_mojisuu === "undefined"){
            return
        }else{
            global_mojisuu -= count;
            //詳細のほう
            document.getElementById("dash_limit_count").textContent = global_mojisuu;
            //homeに表示されてるほう
            document.getElementById("dash_display_limit_count").textContent = global_mojisuu;
        }
    }
}

//グローバル変数と、waiwaiuserであるか否かを確認したのちに実行する関数
function reflect_limits_todisplay(){
    //もじすう以外を反映する
    if(waiwai){
        //ワイワイユーザの場合
        document.getElementById("hello_remain").textContent = String(1 - global_limits.hello);
        document.getElementById("work_remain").textContent = String(5 - global_limits.work);
        document.getElementById("wadai_remain").textContent = String(5 - global_limits.wadai);
    }else{
        //ノーマルユーザの場合
        document.getElementById("hello_remain").textContent = String(1 - global_limits.hello);
        document.getElementById("work_remain").textContent = String(1 - global_limits.work);
        document.getElementById("wadai_remain").textContent = String(1 - global_limits.wadai);
    }
}

//とりあえず、monthのlimitを取得するものだけど、、、、、
//この関数繰り返しに制限を書き加えたほうが安心な希ガス（してない）
function get_mojisuu(){
    db.collection("users").doc(user_info_global.uid).collection("limits").doc("month").get().then(function(doc) {
        //不変定義と、グローバル定義する
        console.log("document is this ", doc.data());
        console.log("global_mojisuu in getmojisuu", global_mojisuu);
        if (typeof doc.data() === "undefined") {
            //初めての実行の時、まだドキュメントが生成されていないため取得ができない可能性が高い
            //console.log("aは未定義");
            setTimeout(function(){
                get_mojisuu();
            },10000);
        }else{
            reflect_mojisuu(doc.data());
            //操作を可能にする
            enable_control();
        }
    }).catch(function(error){
        console.log("error", error);
    });
}

function reflect_mojisuu(doc_data){
    if(waiwai){
        //waiwaiユーザー
        var remain_count = 1000 - doc_data.text_num;
    }else{
        //normalユーザー
        var remain_count = 100 - doc_data.text_num;
    } 
    console.log("global_mojisuu in refmoji pre", global_mojisuu);
    //globalもじすうに代入
    global_mojisuu = remain_count;
    console.log("global_mojisuu last", global_mojisuu);
    //詳細のほう
    document.getElementById("dash_limit_count").textContent = remain_count;
    //homeに表示されてるほう
    document.getElementById("dash_display_limit_count").textContent = remain_count;
    //耐久中に消費した分の要素を反映できていないので対策とりたいなら、それに対する処理を行う

}

var can_control = false;
function enable_control(){
    document.getElementById("start_fab").style.display = "flex";
    can_control = true;
}