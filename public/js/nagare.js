//主にnagareの中で使うglobal変数
var nagare_global = [];
//ナガレの取得で時間利用するためのもの
var nagare_timestamp = [];
//page_nagare

//コミュニティが変更されない限り1度の実行にするため nagare globalを書き換えたら falseとかにするかな （未実装）
var community_change_state = true;
//auth 56 から飛んで処理
function insert_communities_navi(){
    //snedに自分の画像を代入する
    document.getElementById("comment_div_while_img").src = user_info_global.photoURL;
    //参加しているコミュニティを一つの配列にまとめる
    var all_user_communities = user_doc_global.auth;
    all_user_communities = all_user_communities.concat(user_doc_global.model);
    all_user_communities = all_user_communities.concat(user_doc_global.join);
    //nagareglobalに代入して
    nagare_global = all_user_communities;
    //community_state_change で一度の実行にする
    if(community_change_state){
        //navigationの中身をトレンドだけにする
        document.getElementById("nagares_navi").innerHTML = '<button id="community_navi_trend" class="mdc-tab" role="tab" aria-selected="true" tabindex="0"><span class="mdc-tab__content"><span class="mdc-tab__text-label nagare_part">トレンド</span></span><span class="mdc-tab__ripple nagare_part"></span><span class="mdc-tab-indicator"><span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline nagare_part"></span></span></button>';
        //トレンドのナガレはここで作る
        document.getElementById("page_contain_com").innerHTML = '<div id="nagare_trend" class="nagare_page index_0" style="top: 106px; left:'+ String(all_user_communities.length*102) +'vw"><h1>トレンド（未実装）</h1><div>';
        for(var i= 0; i<all_user_communities.length; i++ ){
            //コミュニティをTopAppBarにぶち込んでく
            var one_c = all_user_communities[i];
            document.getElementById("community_navi_trend").insertAdjacentHTML("beforebegin", '<button id="community_navi_'+ one_c +'" class="mdc-tab" role="tab" aria-selected="false" tabindex="-1"><span class="mdc-tab__content"><span class="mdc-tab__text-label nagare_part">'+ community_list_global[one_c].name +'</span></span><span class="mdc-tab__ripple nagare_part"></span><span class="mdc-tab-indicator"><span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline nagare_part"></span></span></button>')
            //コミュニティごとにナガレを生成する
            document.getElementById("nagare_trend").insertAdjacentHTML("beforebegin", '<div id="nagare_'+ one_c +'" class="nagare_page index_0" style="top: 106px; left:'+ String(i*102) +'vw; min-height: 100vh; "></div>');
            //timestampに１週間まえの日付をぶち込む コミュニティが変更等されない限りは一度の実行 ここのifは書き換え
            if(community_change_state){
                var one_week_ago = new Date();
                one_week_ago.setDate(one_week_ago.getDate() - 7);
                nagare_timestamp[i] = firebase.firestore.Timestamp.fromDate(one_week_ago);
            }
        }
    }
    community_change_state = false;
    //このタイミング(for処理後)で処理しないとforがエラーになる
    //nagare_global.push("トレンド");
    //インスタンス化 再定義
    header_tabBar.destroy();
    //tab bar
    header_tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('#community_bar'));
    //ページ切り替えのデフォルトタブの設定
    header_tabBar.activateTab(0);
}
function re_register_tab_event(){
    header_tabBar.listen('MDCTabBar:activated',function(event){
        var index = event["detail"]["index"];
        //表示する流れを変える
        nagare_change(index);
        //高さ調節 hidden absolute visible しがらみからの解放
        re_define_nagare_height(index);
        //入れ子でイベント設定して一度の実行にして、重複を防ぐ
        re_register_tab_event();
    },{ once: true});
}
function nagare_change(nec_index){
    //ナガレのindex変化前をトレンドから取得するかな
    var pre_index = Number(document.getElementById("nagare_trend").className.slice(-1));
    console.log(pre_index, '=>', nec_index);
    var nagare_array = document.getElementsByClassName("nagare_page");
    //classのindex番号の書き換え
    for(var i= 0; i<nagare_array.length; i++){
        //一つ前は取り消して新しいのを取り付ける
        nagare_array[i].classList.remove('index_' + String(pre_index));
        nagare_array[i].classList.add('index_' + String(nec_index));
    }
    move_point = String((nec_index*102));
    $('.nagare_page').css({
        transform: 'translateX(-' + move_point + 'vw)'
    });
    //スクロールトップ
    document.getElementById("the_main").scrollTo(0, 0);
    //sendの中身を書き換える
    var trend_num = nagare_global.length;
    if(nec_index == trend_num){
        //トレンドに対する処理
        document.getElementById("comment_div_while_sup").textContent = "トレンド";
        //buttonを非表示にする
        document.getElementById("start_fab").style.display = "none";
    }else{    
        //トレンド以外に対する処理
        document.getElementById("comment_div_while_sup").textContent = community_list_global[nagare_global[nec_index]].name;
        //buttonを表示する
        document.getElementById("start_fab").style.display = "flex";
        //dbから流れを取得する あんど 変更を受け取るリスナを置く。今動いてるリスナは停止させる
        get_nagare(nec_index);
    }
}

function send_tweet(){
    //divを表示→divのtransition
    var fab_mimic_nagare = document.getElementById("comment_div");
    fab_mimic_nagare.hidden = false;
    //fabを非表示に
    document.getElementById("start_fab").style.display = "none";
    setTimeout(function(){
        //サイズを調整
        fab_mimic_nagare.classList.add("nagactive");
        setTimeout(function(){
            //サイズ調整の合間に中身を切り替える
            document.getElementById("comment_div_until").hidden = true;
            document.getElementById("comment_div_while").hidden = false;
            //textareaにfocusする
            document.getElementById("comment_div_while_textarea").focus();
            //page_nagareとtop_footerのonclickの書き換え
            document.getElementById("page_contain_com").onclick = function(){comment_div_while_back()};
            document.getElementById("top_footer").onclick = function(){comment_div_while_back()};
        },150);
    },10);
    //textarea に対してイベントを指定する
    var $input = $('#comment_div_while_textarea');
    //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
    $input.on('input', function(event) {
        var value = $input.val();
        //console.log(value, event);
        if(value == ""){
            document.getElementById("comment_div_while_send").style.display = "none";
        }else{
            document.getElementById("comment_div_while_send").style.display = "block";
        }
    });
}
function comment_div_while_back(){
    //page_nagareとtop_footerのonclickの書き換え
    document.getElementById("page_contain_com").onclick = function(){};
    document.getElementById("top_footer").onclick = function(){};
    //textarea に対してイベントを指定する
    var $input = $('#comment_div_while_textarea');
    //このイベント投稿欄を閉じたときに停止させる
    $input.off('input');
    //中身を空にする textarea
    document.getElementById("comment_div_while_textarea").value = "";
    //送信ボタンを無力化する
    document.getElementById("comment_div_while_send").style.display = "none";
    //divのtranstion
    var fab_mimic_nagare = document.getElementById("comment_div");
    fab_mimic_nagare.classList.remove("nagactive");
    setTimeout(function(){
        //サイズ調整の合間に中身を切り替える
        document.getElementById("comment_div_until").hidden = false;
        document.getElementById("comment_div_while").hidden = true;
        setTimeout(function(){
            //fabを表示（元に戻す）
            document.getElementById("start_fab").style.display = "flex";
            fab_mimic_nagare.hidden = true;
        },150);
    },150);
}
function send_nagare_to_com(){
    //ナガレのindex変化前をトレンドから取得する
    var now_index = Number(document.getElementById("nagare_trend").className.slice(-1));
    //トレンドで反応することがない前提の処理
    var community_doc_id = nagare_global[now_index];
    //テキストエリアからテキストを取得する
    var new_text = document.getElementById("comment_div_while_textarea").value;
    //page_nagareとtop_footerのonclickの書き換え
    document.getElementById("page_contain_com").onclick = function(){};
    document.getElementById("top_footer").onclick = function(){};
    //sendingでanimationをつける
    document.getElementById("comment_div").classList.add("sending");
    //textarea に対してイベントを取り消し
    var $input = $('#comment_div_while_textarea');
    //このイベント投稿欄を閉じたときに停止させる
    $input.off('input');
    db.collection("communities").doc(community_doc_id).collection("nagare").add({
        date: new Date(),
        name: user_doc_global.name,
        uimg: user_info_global.photoURL,
        text: new_text
    }).then(function(){
        //write カウント
        firestore_write_count += 1;
        console.log("write", firestore_write_count);
        //rules count
        firestore_extra_count += 3;
        console.log("extra", firestore_extra_count);
        //textareaの中身を空にする
        document.getElementById("comment_div_while_textarea").value = "";
        //送信ボタンを無力化する
        document.getElementById("comment_div_while_send").style.display = "none";
        //表示の切り替え
        setTimeout(function(){
            //トレンドかそれ以外かを識別する
            var now_now_index = Number(document.getElementById("nagare_trend").className.slice(-1));
            var trend_num = nagare_global.length;
            if(now_now_index == trend_num){
                //トレンドに対する処理
                document.getElementById("start_fab").style.display = "none";
            }else{
                //トレンド以外に対する処理
                //fabを元に戻して表示
                document.getElementById("start_fab").style.display = "flex";
            }
        },600);
    }).catch(function(error){
        console.log("error", error);
    });
    
    setTimeout(function(){
        //入れ物を非表示
        document.getElementById("comment_div").hidden = true;
        //中身を切り替える
        document.getElementById("comment_div_until").hidden = false;
        document.getElementById("comment_div_while").hidden = true;
        //中身のクラスをつけかける
        document.getElementById("comment_div").classList.remove("sending");
        document.getElementById("comment_div").classList.remove("nagactive");
    },600);
}

var nagare_listener_global;
//一度実行したら変更させる
function get_nagare(number_tab){
    console.log(number_tab, "get_nagare");
    //nagareを取得
    db.collection("communities").doc(nagare_global[number_tab]).collection("nagare").where('date', '>' ,nagare_timestamp[number_tab]).orderBy("date", "desc").limit(10).get().then(function(nagares){
        //timestamp
        nagare_timestamp[number_tab] = firebase.firestore.Timestamp.now();
        //listener でタッチ
        try{nagare_listener_global();}catch(error){console.log("error", error);};
        //listener を設置
        nagare_listener_global = db.collection("communities").doc(nagare_global[number_tab]).collection("nagare").where('date', '>' ,nagare_timestamp[number_tab]).onSnapshot(function(listen_snap){
            //timestamp
            nagare_timestamp[number_tab] = firebase.firestore.Timestamp.now();
            //read count
            if(listen_snap.size == 0){
                firestore_get_count += 1;
            }else{
                firestore_get_count += listen_snap.size;
            }
            //console.log("read listen", firestore_get_count);
            //var listen_snap_reverse = listen_snap.docs.reverse();
            //console.log("normal =>", listen_snap);
            //console.log("reverse =>", listen_snap_reverse);
            listen_snap.forEach(function(listen_doc){    
                //listにして表示していく関数 送信のaninmation と被んないように遅らせてる
                setTimeout(function(){
                    insert_nagare_list(listen_doc.id, listen_doc.data(), number_tab, "afterbegin");
                },600);
            });
        });
        var nagares_reverse = nagares.docs.reverse();
        //取得した物事に表示していく処理
        nagares_reverse.forEach(function(doc) {
            //listにして表示していく関数
            insert_nagare_list(doc.id, doc.data(), number_tab, "afterbegin");
        });
        //取得したのが0の時もカウント
        if(nagares.size == 0){
            firestore_get_count += 1;
        }else{
            firestore_get_count += nagares.size;
        }
        //カウントを表示
        console.log("read", firestore_get_count);
    }).catch(function(error){
        console.log("error", error);
    });
}

//user see list
function insert_nagare_list(nagare_id ,nagare_data, nagare_number, type){
    //時間差を求める
    //var time_difference = get_time_difference(nagare_data.date.toDate());
    //時間を求める
    var time_record = nagare_data.date.toDate().getHours() + ":" + nagare_data.date.toDate().getMinutes();
    //insert していく記述
    var nagare_container = document.getElementById("nagare_" + nagare_global[nagare_number]);
    var nagare_img = '<img src="'+ nagare_data.uimg +'" style="position: relative; top: 16px; left: 16px; width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">';
    var nagare_name = '<p style="position: relative; color: #0d0d0d; font-size: 0.8em; top: -34px; left: 72px; width: calc(100vw - 128px); margin: 0px;">'+ nagare_data.name + ' ・ <span style="color: #606060">' + time_record +'</span></p>';
    var nagare_text = '<p style="position: relative; top: -30px; left: 72px; width: calc(100vw - 128px); margin: 0px; ">'+ nagare_data.text +'</p>';
    var favorite_button = '<button class="mdc-icon-button material-icons nagare_icons_favorite">thumb_up</button>';
    var reply_button = '<button class="mdc-icon-button material-icons nagare_icons_reply">insert_comment</button>';
    var report_button = '<button class="mdc-icon-button material-icons nagare_icons_report">more_vert</button>';
    nagare_container.insertAdjacentHTML(type, '<div id="'+ nagare_global[nagare_number] + '_' + nagare_id +'" style="border-bottom: solid 1px #cccccc; min-height: 80px; position: relative">' + nagare_img + nagare_name + nagare_text + favorite_button + reply_button + report_button +'</div>');
    //高さ調整
    re_define_nagare_height(nagare_number);
}

//page_contain_comの高さを挿入するごとに書き換える
function re_define_nagare_height(com_index){
    var trend_num = nagare_global.length;
    //console.log(trend_num);
    //console.log(com_index);
    if(com_index == trend_num){
        //トレンドに対する処理
        document.getElementById("page_contain_com").style.height = "300px";
        //console.log(300, 'px');
    }else{    
        //トレンド以外に対する処理
        var nagare_element_id = 'nagare_' + nagare_global[com_index];
        //console.log(nagare_element_id);
        //console.log(document.getElementById(nagare_element_id));
        var height = document.getElementById(nagare_element_id).clientHeight;
        //console.log(height, "px");
        document.getElementById("page_contain_com").style.height = String(height + 200) + "px";
    }
}

/*error を吐くので未使用なう*/
function get_time_difference(the_time){
    //the_timeは必ず過去のことなので、日付の差が負の値になったときも分岐処理を行えばいい いや、なんか処理があったからコピペしてきた
    var now_time = new Date();
    //var daysDiff = Math.floor(msDiff / (1000 * 60 * 60 *24));
    var the_diff = now_time.getTime() - the_time.getTime();
    var day_difference = Math.floor( the_diff / (1000 * 60 * 60 *24));
    if(day_difference==0){
        //細かく
        var hour_difference = Math.floor( the_diff / (1000 * 60 * 60));
        if(hour_difference==0){
            //細かく
            var minute_difference = Math.floor( the_diff / (1000 * 60 ));
            if(minute_difference==0){
                //細かく
                var second_difference = Math.floor( the_diff / (1000));
                //秒差を返す
                return String(second_difference) + "秒前";
            }else{
                //分差を返す
                return String(minute_difference) + "分前";
            }
        }else{
            //時間差を返す
            return String(hour_difference) + "時間前";
        }
    }else{
        //日付差を返す
        return String(day_difference) +"日前";
    }
}

