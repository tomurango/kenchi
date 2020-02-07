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
            document.getElementById("timer_type_timer").classList.add("open");
            document.getElementById("timer_type_log").classList.add("open");
        }, 200);
    }, 100);
}

function the_dialog_open(){
    if(number_counted>10){
        //インターバルを一時停止する
        clearInterval(count_interval);
        //console.log("aa");
        //alert を表示して分岐で処理する 計測はリセットされてしまいますがよろしいでしょうか
        timer_delete_alert_dialog.open();    
        //dialogの表示内容とその表示をカウントによって分岐する
    }else{
        finish_pushed();
    }
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
        document.getElementById("timer_type_timer").classList.remove("open");
        document.getElementById("timer_type_log").classList.remove("open");
        document.getElementById("count_number").classList.remove("open");
        setTimeout(() => {
            //count_number を 00:00 に書き直す
            document.getElementById("count_number").textContent = "00:00";
            document.getElementById("timer_div").classList.remove("open");
            document.getElementById("start_fab").classList.remove("open");
            //hidden で隠す
            setTimeout(function(){document.getElementById("timer_div").hidden = true;},300);
            //typeを元に戻す 裏での変更が見れないようにタイムアウト内で記述中
            type_to_timer();
            //インターバルをクリアする（上のタイプ切り替えでタイマーが再起動してしまうので、その対策）
            clearInterval(count_interval);
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
        //重病経過
        display_number ="00:" + String(number_counted);
    }else if(number_counted < 600){
        //一分経過
        if(number_counted % 60 <10){
            var sec = "0"+String(number_counted % 60);
        }else{
            var sec = String(number_counted % 60);
        }
        display_number ="0" + String(Math.floor(number_counted / 60)) + ":" + sec;
    }else if(number_counted < 3600){
        //十分経過
        if(number_counted % 60 <10){
            var sec = "0"+String(number_counted % 60);
        }else{
            var sec = String(number_counted % 60);
        }
        display_number = String(Math.floor(number_counted / 60)) + ":" + sec;
    }else if(number_counted < 86400){
        //一時間経過
        var sec_num = number_counted % 60;
        if(sec_num < 10){
            var sec = "0"+String(sec_num);
        }else{
            var sec = String(sec_num);
        }
        var min_num = (number_counted - sec_num) % 3600 / 60;
        if(min_num < 10){
            var min = "0"+String(min_num);
        }else{
            var min = String(min_num);
        }
        var hour_num = Math.floor((number_counted - min_num -sec_num) / 3600);
        var hour = String(hour_num);
        display_number = hour + ":" + min + ":" + sec;
        //24時間未満
    }else{
        //24時間経過
        display_number = "24時間経過";
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
    //worktypeがlogだったら、入力値から時間を算出
    if(work_type == "log"){
        //ログの不正値を検出して引数として返却することも可能である
        number_counted = from_log();
    }
    db.collection("users").doc(user_info_global.uid).collection("jobs").doc(user_doc_global.job).collection("works").add({
        time: number_counted,
        start: start_time,
        finish: end_time,
        userName: user_info_global.displayName,
        userIcon: user_info_global.photoURL,
        jobName: user_job_global.name,
        jobLevel: level_info_global[user_doc_global.job].level,
        text: work_text,
        //ここから下は言い値機能の実装のためのidと思ったがやはり不要では？wやっぱ必要ですgoodwork記録するのに使用します。
        userId: user_info_global.uid,
        jobId: user_doc_global.job,
        goodWork: 0,
        //work_typeはのちに反映する可能性大
        workType: work_type
    })
    .then(function() {
        //get カウント サーバー側でget 1 ,write 1 追加しました2020/02/07
        firestore_get_count += 2;
        console.log("get", firestore_get_count);
        //write カウント
        firestore_write_count += 3;
        console.log("write", firestore_write_count);
        console.log("Document successfully written!");
        //経験値の表示を変える関数
        calc_level_info(number_counted);
        //画面の表示、カウント含めてもろとも終了させるやつ
        finish_pushed();
        //work_textの中身を空にする
        document.getElementById("work_text_input").value = "";
        /*なんか書いてあるけどfinish_pushedないで下の停止切り替え処理してるからする必要なくね？
        //typeを元に戻す
        type_to_timer();
        //インターバルをクリアする（上のタイプ切り替えでタイマーが再起動してしまうので、その対策）
        clearInterval(count_interval);
        */
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

//でふぉるとはタイマータイプ
var work_type = "timer";
function type_to_timer(){
    console.log("to timer");
    work_type = "timer";
    //サイズ調整
    document.getElementById("count_number").classList.add("open");
    document.getElementById("type_log_container").classList.remove("open");
    //ボタンの色調整
    document.getElementById("timer_type_timer").classList.add("thistype");
    document.getElementById("timer_type_log").classList.remove("thistype");
    //ログする数値の初期化
    document.getElementById("count_log_hour").value = 1;
    document.getElementById("count_log_min").value = 0;
    //インターバルを一時停止する
    clearInterval(count_interval);
    //数値カウントを再開
    count_interval = setInterval(count_number_display,1000);
    //始めた時間を上書きするが、挙動不審につながらないように要件等
    start_time = new Date();
}

function to_log_dialog_open(){
    if(number_counted>10){
        //インターバルを一時停止する
        clearInterval(count_interval);
        //ダイアログ表示
        type_to_log_dialog.open();
    }else{
        //インターバルをクリアして
        clearInterval(count_interval);
        //タイプを切り替える
        type_to_log();
    }
}
function type_to_log(){
    console.log("to log");
    work_type = "log";
    //サイズ調整
    document.getElementById("count_number").classList.remove("open");
    document.getElementById("type_log_container").classList.add("open");
    //数値の初期化
    number_counted = 0;
    count_number_display();
    //ボタンの色調整
    document.getElementById("timer_type_timer").classList.remove("thistype");
    document.getElementById("timer_type_log").classList.add("thistype");
    //始めた時間を上書きするが、挙動不審につながらないように要件等
    start_time = new Date();
}
function not_to_log(){
    console.log("not to log");
    //setinterval
    count_interval = setInterval(count_number_display,1000);
}

function from_log(){
    var hour_log = Number(document.getElementById("count_log_hour").value);
    var min_log = Number(document.getElementById("count_log_min").value);
    //不正値はここで検出する
    if(hour_log > 24){
        hour_log = 0;
    }
    if(min_log>60){
        min_log = 60;
    }
    var result = hour_log*60*60 + min_log*60;
    return result;
}