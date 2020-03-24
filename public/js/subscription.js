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
    