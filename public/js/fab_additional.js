function sirasu(){
    //firestore
    db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").update({
        count :firebase.firestore.FieldValue.increment(1)
    });
    firestore_write_count += 1;
    //カウントを表示
    console.log("read_one", firestore_write_count);
}

function sirasu_get(){
    db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").get().then(function(doc){
        firestore_get_count += 1;
        //カウントを表示
        console.log("read_one", firestore_get_count);
        //数値の書き換え
        var the_count = doc.data().count;
        document.getElementById("sirasu_count").textContent = the_count;
        //リスナの設置
        sirasu_listener = db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").onSnapshot(function(doc) {
            firestore_get_count += 1;
            //カウントを表示
            console.log("read_one", firestore_get_count);
            //数値の書き換え
            var the_count = doc.data().count;
            document.getElementById("sirasu_count").textContent = the_count;
        });
    }).catch(function(error){
        console.log("error → ", error);
    });
};

var sirasu_listener;//リスナデタッチのためのグロ変
var work_listener;

//timestampも書く
//1週間以内のnagareについて扱うためのタイムスタンプ
var one_date_ago_trend = new Date();
one_date_ago_trend.setDate(one_week_ago_trend.getDate() - 1);
var work_timestamp = firebase.firestore.Timestamp.fromDate(one_date_ago_trend);
function work_get(){
    //1日以内のものを取得する
    db.collectionGroup('works').where('finish', '>' , work_timestamp).orderBy("finish", "desc").limit(10).get().then(function (querySnapshot) {
        //timestamp
        work_timestamp = firebase.firestore.Timestamp.now();
        firestore_get_count += querySnapshot.size;
        //カウントを表示
        console.log("read_one", firestore_get_count);
        //var works_reverse = querySnapshot.docs.reverse();
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            insert_work(doc.id, doc.data());
        });
        //workのリスナを配置する limit(1)は重複回避の記述だが要検討(wadaiリスナからのコピペ)
        work_listener = db.collectionGroup('works').where('finish', '>' , work_timestamp).orderBy("finish", "desc").limit(1).onSnapshot(function(listen_work){
            //timestamp
            work_timestamp = firebase.firestore.Timestamp.now();
            //read count
            firestore_get_count += 1;
            console.log("read_one", firestore_get_count);
            //listener取得は一つに限定してるけど、foreach回さないとエラー出てくる（不思議ですねぇ～～～～）
            listen_work.forEach(function(listen_doc){    
                //listにして表示していく関数 送信のaninmation と被んないように遅らせてる
                setTimeout(function(){
                    insert_work(listen_doc.id, listen_doc.data());
                },600);
            });
        });
        
    }).catch(function(error){
        console.log("error -> ", error);
    });
};

function insert_work(work_id, work_doc){
    console.log(work_id, " work => ", work_doc);
    var time_list = fire_time_normalization(work_doc.finish);
    var exp_list = exp_to_time(work_doc.time);
    var work_icon = '<img src="' + work_doc.userIcon + '" height="40px" width="40px">';
    var user_info_div = '<div style="position: absolute; left: 72px;"><p style="font-size: 0.7em; color: #595959">' + work_doc.userName + '/ Lv' + work_doc.jobLevel + work_doc.jobName + '/' + time_list[2] + ':' + time_list[3] + '</p></div>';
    var time_info_tag = '<p style="text-align: center;"><span style="font-size: 2em">'+ exp_list[0] +'</span>' + exp_list[1] + '</p>';
    var insert_element = '<div class="mdc-layout-grid__cell"><div id="workcard_' + work_id + '" class="mdc-card" style="position:relative">'+ work_icon + user_info_div + time_info_tag +'</div></div>';
    document.getElementById('work_line_inner').insertAdjacentHTML('afterbegin', insert_element);
}

function exp_to_time(exp){
    if(exp < 60){
        return [exp, "秒"];
    }else if(exp < 3600){
        return [Math.floor(exp / 60), "分"];
    }else if(exp < 86400){
        return [Math.floor(exp / 3600), "時間"];
    }else{
        return [1, "日以上"];
    }
}

function tanomu(){
    console.log("tanomu");
}