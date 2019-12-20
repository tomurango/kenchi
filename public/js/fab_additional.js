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
var work_library = [];//idの文字列を格納する為だけのlist
var global_work_dictionary = {};//onclickの時、詳細を閲覧するために格納しておくためのリスト
function work_get(){
    //1日以内のものを取得する
    db.collectionGroup('works').where('finish', '>' , work_timestamp).orderBy("finish", "desc").limit(10).get().then(function (querySnapshot) {
        //timestamp
        work_timestamp = firebase.firestore.Timestamp.now();
        firestore_get_count += querySnapshot.size;
        //カウントを表示
        console.log("read_one", firestore_get_count);
        var works_reverse = querySnapshot.docs.reverse();
        console.log(works_reverse);
        works_reverse.forEach(function(doc) {
            //console.log(doc.data(), "検証");
            // doc.data() is never undefined for query doc snapshots
            var work_insert_flag = 0;
            for(var i= 0; i < work_library.length; i++){
                if(doc.id == work_library[i]){
                    //何もしない
                    console.log("重複取得");
                    work_insert_flag = 1;
                    break
                }
            }
            if(work_insert_flag == 0){
                work_library.push(doc.id);
                insert_work(doc.id, doc.data());
            }
        });
        //empty message の有無の確認
        check_work_isornot();
        //workのリスナを配置する limit(1)は重複回避の記述だが要検討(wadaiリスナからのコピペ)
        work_listener = db.collectionGroup('works').where('finish', '>' , work_timestamp).orderBy("finish", "desc").onSnapshot(function(listen_work){
            //timestamp
            work_timestamp = firebase.firestore.Timestamp.now();
            //read count
            firestore_get_count += 1;
            console.log("read_one", firestore_get_count);
            //listener取得は一つに限定してるけど、foreach回さないとエラー出てくる（不思議ですねぇ～～～～）
            listen_work.forEach(function(listen_doc){    
                //listにして表示していく関数 送信のaninmation と被んないように遅らせてる
                var work_insert_flag_listen = 0;
                for(var i= 0; i < work_library.length; i++){
                    if(listen_doc.id == work_library[i]){
                        //何もしない
                        console.log("重複取得");
                        work_insert_flag_listen = 1;
                        break
                    }
                }
                if(work_insert_flag_listen == 0){
                    work_library.push(listen_doc.id);
                    setTimeout(function(){
                        insert_work(listen_doc.id, listen_doc.data());
                    },600);
                }
            });
            //empty message の有無の確認
            check_work_isornot();
        });
        
    }).catch(function(error){
        console.log("error -> ", error);
    });
};

function insert_work(work_id, work_doc){
    //card_idは未定義だったらundefined_undefinedみたいになる
    var card_id = work_doc.userId + "_" + work_doc.jobId + "_" + work_id;
    console.log(work_id, " work => ", work_doc);
    var time_list = fire_time_normalization(work_doc.finish);
    var exp_list = exp_to_time(work_doc.time);
    var work_icon = '<div class="mdc-card__media mdc-card__media--square work_media" style="background-image: url(' +"'"+ work_doc.userIcon +"'"+');"></div>';
    var time_info_tag = '<p style="margin: 16px 16px 8px 16px"><span style="font-size: 1.5em">'+ exp_list[0] +'</span>' + exp_list[1] + "　" + '<span style="font-size: 1.5em">'+ work_doc.text +'</span></p>';//テキスト情報を追加しました。2019/12/04
    var user_info_tag = '<p style="font-size: 0.7em; color: #595959; margin:8px 16px 16px 16px;">' + work_doc.userName + ' ・ ' + time_list[2] + ' : ' + time_list[3] + '<br>Lv' + work_doc.jobLevel + ' ' + work_doc.jobName + '</p>';
    var text_div = '<div class="work_text">' + time_info_tag + user_info_tag + '</div>';
    //<div class="goodcount">0</div>ボタンの左におくのはひとまずなしにしようか（workよりもワダイのほうが集合性つける感あるし,,,）まあわからんから保留2019/12/18
    //すでにいいねしているかどうかの確認
    var good_class = "";
    if(already_good(work_id)){good_class = "good"}
    var action_area = '<div class="mdc-card__actions"><div class="mdc-card__action-icons"><button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon good_work_button ' + good_class + '" onclick="good_work(this);" title="Good">thumb_up</button><button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon" title="Share">share</button><button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon" title="More options">more_vert</button></div></div>';
    var insert_element = '<div class="mdc-layout-grid__cell"><div id="workcard_' + card_id + '" class="mdc-card" style="position:relative; padding: 0px;"><div onclick="work_detail_display(this)" class="mdc-card__primary-action work_action" tabindex="0">'+ work_icon + text_div + '</div>' + action_area + '</div></div>';
    document.getElementById('work_line_inner').insertAdjacentHTML('afterbegin', insert_element);
    //挿入後に検証してしまう(未検証)191112
    check_work_isornot();
    //ワークカードonclickで引き出せるように辞書を作成する
    make_work_dictionary(work_id, work_doc);
    //rippleさせる
    var selector_text = "#workcard_" + card_id + " .work_action";
    var ripple_selector = document.querySelector(selector_text)
    //親要素を指定してその子要素のwork_actionクラスにリップルさせる処理
    do_ripple(ripple_selector);
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

//global_work_dictionaryにworkの情報を記録するための関数。workカードのonclickで情報を閲覧するための関数
function make_work_dictionary(work_id, work_doc){
    //ユーザーidレベルの存在確認
    global_work_dictionary[work_id] = work_doc;
}

function han_to_zen(str){
    //10進数の場合
    str.replace(/[0-9]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 65248);
    });
}

/*
// スクロール禁止
$("body").css('overflow','hidden');

// スクロール禁止 解除
$("body").css('overflow','auto');
*/
//ワークの表示イベントのためのバトン
var work_event_batton;
//work_cardから詳細を閲覧するためのonclick関数
function work_detail_display(clicked_element){
    //console.log(clicked_element);
    //ワーク普通のカード
    var work_normal = clicked_element.parentNode;
    //カードを非表示にするための記述
    work_event_batton = work_normal;
    //ワークdetailのカード
    var work_card = document.getElementById("work_detail");
    //高さと位置を揃えて
    plasize_copy(work_normal, work_card);
    //トランジションをきれいに見せるためのdiv
    var work_card_bluff = document.getElementById("work_bluff_erea");
    //console.log(clicked_element.innerHTML);
    work_card_bluff.innerHTML = clicked_element.innerHTML;
    var work_card_display = document.getElementById("work_display_erea");
    //アニメーションのための布石
    work_card_bluff.style.display = "flex";
    work_card_display.style.display = "none";
    work_card.style.display = "flex";
    //rippleアニメーションを見るためのタイムアウト
    setTimeout(function(){
        //cardの出現
        work_card.style.zIndex = 5;
        setTimeout(function(){
            //bluffトランジション
            work_card_bluff.classList.add("tosee");
            //detail全体トランジション
            work_card.classList.add("display");
            //トランジション調整
            setTimeout(function(){
                work_card_bluff.style.display = "none";
            },145);
            setTimeout(function(){
                //displayereaトランジション
                work_card_display.classList.add("tosee");
                work_card_display.style.display = "flex";
                //ワダイのカードを非表示にする
                work_event_batton.style.visibility = "hidden";
            },150);
        }, 100);
    }, 100);
}
function work_detail_display_back(){
    //カードを表示する
    work_event_batton.style.visibility = "visible";
    //fixedのworkdetailってやつ
    var work_card = document.getElementById("work_detail");
    //トランジションをきれいに見せるためのdiv
    var work_card_bluff = document.getElementById("work_bluff_erea");
    //detail閲覧のためのdiv
    var work_card_display = document.getElementById("work_display_erea");
    //全体のアニメーション
    work_card.classList.remove("display");
    //displayereaトランジション
    work_card_display.classList.remove("tosee");
    setTimeout(function(){
        //トランジション調整
        work_card_display.style.display = "none";
        work_card_bluff.style.display = "flex";
        //bluffトランジション
        setTimeout(function(){   
            work_card_bluff.classList.remove("tosee");
            setTimeout(function(){
                work_card.style.zIndex = 0;
                work_card.style.display = "none";
                // スクロール解除
                $("body").css('overflow','auto');
            }, 150)
        }, 10);
    }, 150);
}


function plasize_copy(info_element, next_element){
    // スクロール禁止
    $("body").css('overflow','hidden');
    //クリックした要素の情報を取得
    var rect = info_element.getBoundingClientRect();
    var left = rect.left;// + window.pageXOffset;
    var top = rect.top;// + window.pageYOffset;
    var width = rect.width;
    var height = rect.height;
    //console.log("left", left, "top", top, "width", width, "height", height);
    //隠し話題に適用
    next_element.hidden = false;
    next_element.style.top = String(top) + "px";
    next_element.style.left = String(left) + "px";
    next_element.style.height = String(height) + "px";
    next_element.style.width = String(width) + "px";
}


//goodwork機能追加
function good_work(good){
    id_card = good.parentNode.parentNode.parentNode.id;
    //_で区切って分割する workcard userId jobId workId
    var what_user_job_work = id_card.split('_');
    //userがいいねしてるかどうか確認する
    var number = 0;
    if(already_good(what_user_job_work[3])){
        //すでにグッドしてる グッドを取り消す
        number = -1;
        var type = "delete";
        good.classList.remove("good");
    }else{
        //まだグッドしてない グッドをつける
        number = 1;
        var type = "add";
        good.classList.add("good");
    }
    //とりあえず以下何もしない形でエラーの反応を見る
    db.collection("users").doc(what_user_job_work[1]).collection("jobs").doc(what_user_job_work[2]).collection("works").doc(what_user_job_work[3]).update({
        good: firebase.firestore.FieldValue.increment(number)
    }).then(function(){
        //write カウント
        firestore_write_count += 1;
        console.log("write", firestore_write_count);
        //userのgoodも書き換える
        update_user_good(type, what_user_job_work[3]);
    }).catch(function(error){
        console.log("error", error);
    });
}

//すでにグッドしたものかどうかの確認
function already_good(work_id){
    for(var i=0; i< user_doc_global.good.length; i++){
        if(user_doc_global.good[i] == work_id){
            return true;
        }
    }
    return false;
}

//userのgoodeのカラムを書き換える
function update_user_good(type, work_id){
    //global変数のほうを書き換える
    if(type == "add"){
        user_doc_global.good.push(work_id);
    }else if(type == "delete"){
        /*spliceだと最後の一つになったときに挙動が怪しい
        for(var i=0; i<user_doc_global.good.length; i++){
            if(user_doc_global.good[i] == work_id){
                user_doc_global.good.splice(i, i);
            }
        }
        */
        user_doc_global.good = user_doc_global.good.filter(function( item ) {
            return item !== work_id;
        });
    }
    console.log( "update", type , work_id, user_doc_global.good );
    //firestore のデータベースを書き換える
    var change;
    if(type == "add"){
        change = firebase.firestore.FieldValue.arrayUnion(work_id);
    }else if(type == "delete"){
        change = firebase.firestore.FieldValue.arrayRemove(work_id);
    }
    db.collection("users").doc(user_info_global.uid).update({
        good: change
    }).then( function(){
        //write カウント
        firestore_write_count += 1;
        console.log("write", firestore_write_count);
    }).catch(function(error){
        console.log("error => ", error)
    })
}