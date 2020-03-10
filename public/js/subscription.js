// test 公開鍵
//Payjp.setPublicKey("pk_test_9fd0175be5f918882aa96643");
//payjpじゃなくて、ストライプのほうが連携機能が優れているのか？

//正常な申請の時に呼び出される関数
function onCreated(res){
    console.log("成功したよ登録", res);
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
        //5に行った時にボタンを押せなくする、見た目も変える
        if(global_limits.work > 4){
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
        //5に行った時にボタンを押せなくする、見た目も変える
        if(global_limits.wadai > 1){
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