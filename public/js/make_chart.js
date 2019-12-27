﻿//import { get } from "https";
//なんか気づいたら上の行のやつが書かれてたけど、よくわからん

//円グラフ作成代入の関数（あくまで、最初のページに関してのみの話である）
var doughnut_chart;
var doughnut_chart_detail;
function insert_level_chart(exp_array){
    //すでに描画されていたら書き換え
    if(doughnut_chart){doughnut_chart.destroy()};
    //挿入値ログ
    console.log("exp_array =>", exp_array);
    var ctx = document.getElementById('myChart');//.getContext('2d');
    //データのセット
    var data = {
        labels: ['昨日までの経験値', '今日のワークの経験値', '最新のワークの経験値', 'レベルアップまでの経験値'],
        datasets: [{
            data: exp_array,
            backgroundColor: ['#0066ff','#ff9800','#ff6900','#eeeeee']
        }],
    };
    //オプションのマップ
    var options = {
        cutoutPercentage: 80,
        maintainAspectRatio: false,
        legend:{
            display: false
        }
        //devicePixelRatio: window.devicePixelRatio 
    };//window.devicePixelRatio 
    // ドーナツチャート
    doughnut_chart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: options
    });
    //ジョブの詳細を表示したときのほうのグラフ
    if(doughnut_chart_detail){doughnut_chart_detail.destroy()};
    //データのセットの更新
    var data = {
        labels: ['昨日までの経験値', '今日のワークの経験値', '最新のワークの経験値', 'レベルアップまでの経験値'],
        datasets: [{
            data: exp_array,
            backgroundColor: ['#0066ff','#ff9800','#ff6900','#eeeeee']
        }],
    };
    //オプションの更新
    var options = {
        cutoutPercentage: 80,
        maintainAspectRatio: false,
        legend:{
            position: 'bottom',
            labels:{
                fontSize:16
            }
        }
    };
    var doughnut_detail = document.getElementById("doughnut_detail");
    doughnut_chart_detail = new Chart(doughnut_detail, {
        type: 'doughnut',
        data: data,
        options: options
    });
}

var just_level_global = "測定不能";
//insert_level_info auth の 302 で使用中
function insert_level_info(job_id, latest_time){
    var job_doc = level_info_global[job_id];
    //仕事のレベルの書き換え
    document.getElementById("user_job_level_display").textContent = "Lv" + String(job_doc.level);
    document.getElementById("user_job_level_display_renew").textContent = "Lv" + String(job_doc.level);
    //経験値のグラフの書き換えをするための引数を作る
    var remain_time = level_exp_needed(job_doc.level) - job_doc.level_time;
    //[level_timeからtoday_timeを引いた数, today_timeからlatest_timeを引いた数, latest_time, remain_time]
    var exp_array = [job_doc.level_time - job_doc.today_time, job_doc.today_time - latest_time, latest_time, remain_time];
    //グラフ描画
    insert_level_chart(exp_array);
}

//今のレベルで必要な経験値を返す関数。引数はレベル
function level_exp_needed(the_level){
    var first = 300;
    var result = 300;
    for(var i= 1; i< the_level; i++){
        result = Math.floor(first*1.1);
        first = Math.floor(first*1.1);
    }
    return result;
}

//残り経験値と、レベルアップした値を計算 workの処理後に以下をバックエンドで実装する
function calc_level_info(user_work_time){
    //差し引かれる前の残りの値
    var level_needed = level_exp_needed(level_info_global[user_doc_global.job].level) - level_info_global[user_doc_global.job].level_time;
    //経験値の差を求める
    var the_diff = user_work_time - level_needed;
    //レベルの上がった数を計測する変数
    var level_result = 0;
    while (the_diff >= 0){
        //レベルのグローバルを上げる 4行下の処理に適応させるため
        level_info_global[user_doc_global.job].level ++;
        //上がるレベルをカウントする
        level_result ++;
        //上がったレベルの経験値を取得して評価する
        level_needed = level_exp_needed(level_info_global[user_doc_global.job].level);
        the_diff = the_diff - level_needed;
    }
    //レベルの表示を変える
    document.getElementById("user_job_level_display").textContent = "Lv" + String(level_info_global[user_doc_global.job].level);
    document.getElementById("user_job_level_display_renew").textContent = "Lv" + String(level_info_global[user_doc_global.job].level);
    //差が負の値になったら、diffを一つ前に戻してその値を経験値のプラス値にする
    console.log(the_diff ,"+" ,level_needed);
    the_diff = the_diff + level_needed;
    //操作しやすいように変数を定義
    var new_level_info = level_info_global[user_doc_global.job];
    //level_info_globalを書き換える
    //new_level_info.level += level_result;
    new_level_info.total_time += user_work_time;//ここ += the_diff でも同じだね
    //レベルが上がったかどうかで分岐する
    if(level_result == 0){
        //レベルが上がっていないので、経験値を加算する
        new_level_info.level_time += the_diff;
    }else{
        //レベルが上がったので経験値をそのまま代入する
        new_level_info.level_time = the_diff;
        //todayもレバルが上がったのでっ更新する
        new_level_info.today_time = 0;
    }
    //timestampを確認して、日付が異なったらアップデートしてタイムスタンプも書き換える
    if(new_level_info.timestamp.toDate().getDate() != new Date().getDate()){
        //日付が変わるので、得た経験値をそのまま代入する
        new_level_info.today_time = the_diff;
    }else{
        //日付は変わらないので、そのまま加算する
        new_level_info.today_time += the_diff;
    }
    //ここで計算をする
    level_needed = level_exp_needed(level_info_global[user_doc_global.job].level) - level_info_global[user_doc_global.job].level_time;
    //グラフを描画する
    var new_array = [new_level_info.level_time - new_level_info.today_time, new_level_info.today_time - the_diff, the_diff, level_needed];
    insert_level_chart(new_array);
}

//ジョブの名前を変える関数
function change_job_name(){
    console.log("名前変える");
    //変えたい名前を入力する
    job_name_dialog.open();
}
function change_job_name_send(){
    //ここで名前を変更して、送信する処理を行う
    var new_job_name = document.getElementById("job_name_input").value;
    console.log(new_job_name);
    //ジョブドックとれべいんふぉの書き換えをするため、onupdateを設置する
    db.collection("users").doc(user_info_global.uid).collection("jobs").doc(user_doc_global.job).update({
        name: new_job_name
    }).then(function() {
        //writeカウント
        firestore_write_count +=2;
        console.log("write", firestore_write_count);
        //user_job_globalに代入
        user_job_global["name"] = new_job_name;
        update_job_display(user_job_global);
    });
}
function update_job_display(job_doc){
    console.log("ジョブの名前変更を見た目に反映する");
    document.getElementById("user_job_display_renew").textContent = job_doc.name;
    document.getElementById("user_job_display").textContent = job_doc.name;
}

//authでジョブを取得していたが、それはメインジョブに関するもののみだったので、
//ジョブのカードを開くときに、メインジョブ以外のデータを取得してリストに挿入する関数を実装する2019/12/27
var alljob_getflag = true;
function get_all_jobs(){
    //flagで分岐
    if(alljob_getflag){
        //まだ取得してないから、取得する関数
        console.log("全ジョブ取得");
        db.collection('users').doc(user_info_global.uid).collection("jobs").where("main", "==", false)
        .get().then(function (querySnapshot) {
            //カウントを表示
            firestore_get_count += querySnapshot.size;
            if(querySnapshot.size == 0) {firestore_get_count += 1};
            console.log("read_one", firestore_get_count);
            querySnapshot.forEach(function(doc) {
                console.log(doc.id ," => ", doc.data());
                //グローバル変数に代入する
                user_alljob_global[doc.id] = doc.data();
            }); 
            //リストに代入する関数
            console.log("alljob => ",user_alljob_global);
        });
        alljob_getflag = false;
    }else{
        //すでに取得したので何もしない
        console.log("ジョブをもう取ってこない");
        return;
    }
}
