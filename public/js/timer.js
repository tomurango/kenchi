//import { strict } from "assert";
var start_time;
function start_pushed(){
    document.getElementById("timer_div").hidden = false;
    //データ確認    
    //console.log(user_info_global);
    //console.log(user_doc_global);
    start_time = new Date();
    //setinterval
    count_interval = setInterval(count_number_display,1000);
    //変数がどんな感じにまたがれているのか知りたい
    //console.log(user_info_global); 把握しました
    //classを付け足す
    setTimeout(function(){
        /*fab からアニメーションさせる*/
        document.getElementById("start_fab").classList.add("open");
        document.getElementById("timer_div").classList.add("open");
        document.getElementById("count_number").classList.add("open");
        setTimeout(() => {
            document.getElementById("timer_button").classList.add("open");
            document.getElementById("back_timer_screen").classList.add("open");
        }, 200);
    }, 100);
}

function the_dialog_open(){
    //インターバルを一時停止する
    clearInterval(count_interval);
    //console.log("aa");
    //alert を表示して分岐で処理する 計測はリセットされてしまいますがよろしいでしょうか
    timer_delete_alert_dialog.open();    
    //dialogの表示内容とその表示をカウントによって分岐する

}

//キャンセルと同じ挙動にしたい
//timer_delete_alert_dialog.getScrimClickAction();
//これは閉じなくなる処理
//timer_delete_alert_dialog.setScrimClickAction("scrimClickAction":'');
 //できた！！

//データの破棄をキャンセル
function canseled_finish(){
    //setinterval
    count_interval = setInterval(count_number_display,1000);
}

//データの破棄を承認
//主にダイアログをしまうときに動作する関数
function finish_pushed(){
    //clearinterval
    clearInterval(count_interval);
    //number_countedを0に戻す
    number_counted = 0;
    setTimeout(function(){
        //classを取り除く
        document.getElementById("timer_button").classList.remove("open");
        document.getElementById("back_timer_screen").classList.remove("open");
        document.getElementById("count_number").classList.remove("open");
        setTimeout(() => {
            //count_number を 00:00 に書き直す
            document.getElementById("count_number").textContent = "00:00";
            document.getElementById("timer_div").classList.remove("open");
            document.getElementById("start_fab").classList.remove("open");
            //hidden で隠す
            setTimeout(function(){document.getElementById("timer_div").hidden = true;},300);
        }, 200);
    },100)
}

var count_interval;
var number_counted = 0;
function count_number_display(){
    var display_number;
    //display_numberに変数を格納する分岐処理
    if(number_counted == 0){
        display_number = "00:00";
    }else if(number_counted < 10){
        display_number ="00:0" + String(number_counted);
    }else if(number_counted < 60){
        display_number ="00:" + String(number_counted);
    }else if(number_counted < 600){
        if(number_counted % 60 <10){
            var sec = "0"+String(number_counted % 60);
        }else{
            var sec = String(number_counted % 60);
        }
        display_number ="0" + String(Math.floor(number_counted / 60)) + ":" + sec;
    }else if(number_counted < 3600){
        if(number_counted % 60 <10){
            var sec = "0"+String(number_counted % 60);
        }else{
            var sec = String(number_counted % 60);
        }
        display_number = String(Math.floor(number_counted / 60)) + ":" + sec;
    }
    //一時間突破した後の分岐を書く ここまでで1時間分しかかけてない
    
    document.getElementById("count_number").textContent = display_number;
    number_counted++;
}

//終わりを押したときにデータベースに送る処理をここから下にまとめる
//
//提出処理 書いていけ。
//
function send_work(){
    //終わった時間（今の時間）を取得
    var end_time = new Date();
    //テキストを取得する
    var work_text = document.getElementById("work_text_input").value;
    db.collection("users").doc(user_info_global.uid).collection("jobs").doc(user_doc_global.job).collection("works").add({
        time: number_counted,
        start: start_time,
        finish: end_time,
        userName: user_info_global.displayName,
        userIcon: user_info_global.photoURL,
        jobName: user_job_global.name,
        jobLevel: level_info_global[user_doc_global.job].level,
        text: work_text
    })
    .then(function() {
        //get カウント サーバー側でget 1 ,write 1
        firestore_get_count += 1;
        console.log("get", firestore_get_count);
        //write カウント
        firestore_write_count += 2;
        console.log("write", firestore_write_count);
        console.log("Document successfully written!");
        //経験値の表示を変える関数
        calc_level_info(number_counted);
        //画面の表示、カウント含めてもろとも終了させるやつ
        finish_pushed();
        //work_textの中身を空にする
        document.getElementById("work_text_input").value = "";
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}

//文字を入力させる関数
function work_text(){
    //ダイアログを開くのみ
    work_text_dialog.open();
}