function sirasu(){
    //firestore
    db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").update({
        count :firebase.firestore.FieldValue.increment(1)
    });
    firestore_write_count += 1;
    //カウントを表示
    console.log("write_one", firestore_write_count);
}

function sirasu_get(){
    db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").get().then(function(doc){
        firestore_get_count += 1;
        //カウントを表示
        console.log("read_one", firestore_get_count);
        //数値の書き換え
        var the_count = doc.data().count;
        document.getElementById("sirasu_count").textContent = the_count;
        document.getElementById("sirasu_count_another").textContent = the_count;
        //リスナの設置
        sirasu_listener = db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").onSnapshot(function(doc) {
            firestore_get_count += 1;
            //カウントを表示
            console.log("read_one", firestore_get_count);
            //数値の書き換え
            var the_count = doc.data().count;
            document.getElementById("sirasu_count").textContent = the_count;
            document.getElementById("sirasu_count_another").textContent = the_count;
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
one_date_ago_trend.setDate(one_date_ago_trend.getDate() - 1);
var work_timestamp = firebase.firestore.Timestamp.fromDate(one_date_ago_trend);
function work_get(){
    //1日以内のものを取得する
    db.collectionGroup('works').where('finish', '>' , work_timestamp).orderBy("finish", "desc").limit(10).get().then(function (querySnapshot) {
        //timestamp
        work_timestamp = firebase.firestore.Timestamp.now();
        firestore_get_count += querySnapshot.size;
        //カウントを表示
        console.log("read_one", firestore_get_count);
        var works_reverse = querySnapshot.docs.reverse();
        works_reverse.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            insert_work(doc.id, doc.data());
        });
        //empty message の有無の確認
        check_work_isornot();
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
            //empty message の有無の確認
            check_work_isornot();
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
    //挿入後に検証してしまう(未検証)191112
    check_work_isornot();
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
    var irai_card = document.getElementById("irai_submit_card");
    irai_card.hidden = false;
    setTimeout(function(){
        irai_card.classList.add("open");
    }, 50);
}

function submit_irai(){
    var irai_title = document.getElementById("irai_title").value;
    if(irai_title == ""){
        //入力が空の時
        irai_caution_dialog.open();
    }else{
        //入力がある時ユーザ情報などその他入力をする


        db.collection('irais').add({
            title: irai_title,
            createdAt: firebase.firestore.Timestamp.now()
        }).then(function(){
            console.log("イライ送信完了");
            //関数名で勘違いしないで not_submit って書いてあるけど、送信できてるから
            not_submit_irai();
        }).catch(function(error){
            console.log("error =>", error);
        })
    }
}

function not_submit_irai(){
    //非表示にして閉じる
    var irai_card = document.getElementById("irai_submit_card");
    document.getElementById("irai_submit_card").classList.remove("open");
    setTimeout(function(){
        irai_card.hidden = true;
    }, 400);
    //input の中身を空にする
    document.getElementById("irai_title").value = "";
}

//リスナの定義
var irai_listener;
//一か月前をデフォルトにしたい
var one_month_ago_trend = new Date();
one_month_ago_trend.setDate(one_month_ago_trend.getMonth() - 1);
var irai_timestamp = firebase.firestore.Timestamp.fromDate(one_month_ago_trend);
function get_irai(){
    console.log("firetime ->", irai_timestamp);
    console.log("datetime ->", irai_timestamp.toDate());
    db.collection("irais").where('createdAt', '>' , irai_timestamp).orderBy("createdAt", "desc").limit(10).get().then(function(irai_docs){
        //timestamp
        irai_timestamp = firebase.firestore.Timestamp.now();
        //firebase get count
        if(irai_docs.size == 0){
            firestore_get_count += 1;
        }else{
            firestore_get_count += irai_docs.size;
        }
        console.log("read =>" , firestore_get_count);
        irai_docs.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            insert_irai(doc.id, doc.data());
        });
        //workのリスナを配置する limit(1)は重複回避の記述だが要検討(wadaiリスナからのコピペ)
        irai_listener = db.collection('irais').where('createdAt', '>' , irai_timestamp).orderBy("createdAt", "desc").limit(1).onSnapshot(function(listen_irai){
            //timestamp
            irai_timestamp = firebase.firestore.Timestamp.now();
            //read count
            firestore_get_count += 1;
            console.log("read_one", firestore_get_count);
            //listener取得は一つに限定してるけど、foreach回さないとエラー出てくる（不思議ですねぇ～～～～）
            listen_irai.forEach(function(listen_doc){    
                //listにして表示していく関数 送信のaninmation と被んないように遅らせてる
                setTimeout(function(){
                    insert_irai(listen_doc.id, listen_doc.data());
                },600);
            });
        });
    })
}

function insert_irai(irai_id, irai_doc){
    var irai_cell = '<div class="mdc-layout-grid__cell"><div id="irai_'+ irai_id +'" class="mdc-card"><p style="text-align: center;">'+ irai_doc.title +'</p></div></div>';
    //insert
    document.getElementById("irai_inner").insertAdjacentHTML("afterbegin", irai_cell);
}

function check_work_isornot(){
    if(document.getElementById("work_line_inner").hasChildNodes()){
        //中身あり
        document.getElementById("no_work_div").hidden = true;
    }else{
        //中身なし
        document.getElementById("no_work_div").hidden = false;
    }
}