//主にnagareの中で使うglobal変数
var nagare_global = [];
//ナガレの取得で時間利用するためのもの
var nagare_timestamp = [];
//page_nagare

//コミュニティが変更されない限り1度の実行にするため nagare globalを書き換えたら falseとかにするかな （未実装）
var community_change_state = true;
//var all_user_communities;//84行目で再利用するため。ひっどいコードになってきたｗ
//auth 56 から飛んで処理
function insert_communities_navi(){
    //snedに自分の画像を代入する
    //それはなしでdocument.getElementById("comment_div_while_img").src = user_info_global.photoURL;
    //参加しているコミュニティを一つの配列にまとめる
    var all_user_communities = user_doc_global.auth;
    all_user_communities = all_user_communities.concat(user_doc_global.model);
    all_user_communities = all_user_communities.concat(user_doc_global.join);
    //nagareglobalに代入して
    nagare_global = all_user_communities;
    //community_state_change で一度の実行にする
    if(community_change_state){
        //navigationの中身を最新だけにする
        document.getElementById("nagares_navi").innerHTML = '<button id="community_navi_trend" class="mdc-tab" role="tab" aria-selected="true" tabindex="0"><span class="mdc-tab__content"><span class="mdc-tab__text-label nagare_part">最新</span></span><span class="mdc-tab__ripple nagare_part"></span><span class="mdc-tab-indicator"><span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline nagare_part"></span></span></button>';
        //最新のナガレはここで作る
        document.getElementById("page_contain_com").innerHTML = '<div id="nagare_trend" class="nagare_page index_0" style="top: 106px; left:'+ String(all_user_communities.length*102) +'vw"><h1>最新（未実装）</h1><div>';
        for(var i= 0; i<all_user_communities.length; i++ ){
            //コミュニティをTopAppBarにぶち込んでく
            var one_c = all_user_communities[i];
            //wadai_nagare_globalのためにマップを代入しておく
            wadai_nagare_glbal[one_c] = {};
            document.getElementById("community_navi_trend").insertAdjacentHTML("beforebegin", '<button id="community_navi_'+ one_c +'" class="mdc-tab" role="tab" aria-selected="false" tabindex="-1"><span class="mdc-tab__content"><span class="mdc-tab__text-label nagare_part">'+ community_list_global[one_c].name +'</span></span><span class="mdc-tab__ripple nagare_part"></span><span class="mdc-tab-indicator"><span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline nagare_part"></span></span></button>')
            //コミュニティごとにナガレを生成する
            document.getElementById("nagare_trend").insertAdjacentHTML("beforebegin", '<div id="nagare_'+ one_c +'" class="nagare_page index_0" style="top: 106px; left:'+ String(i*102) +'vw; min-height: 100vh; "></div>');
            //empty state を挿入
            insert_no_wadai(document.getElementById( 'nagare_' + nagare_global[i]));
            //timestampに１週間まえの日付をぶち込む コミュニティが変更等されない限りは一度の実行 ここのifは書き換え
            if(community_change_state){
                var one_week_ago = new Date();
                one_week_ago.setDate(one_week_ago.getDate() - 7);
                nagare_timestamp[i] = firebase.firestore.Timestamp.fromDate(one_week_ago);
            }
        }
    }
    community_change_state = false;
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
    //ナガレのindex変化前を最新から取得するかな
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
        //buttonを非表示にする
        document.getElementById("start_fab").style.display = "none";
        //これ最新の処理だね guestに合わせるために、一度最新の中身を非表示というか、クリアしてからの代入になるが、正直非効率的な気がする 今はいいが要修正
        //document.getElementById("page_contain_com").innerHTML = '<div id="nagare_trend" class="nagare_page index_0" style="top: 106px; left:'+ String(all_user_communities.length*102) +'vw"><div>';
        document.getElementById("nagare_trend").innerHTML = "";//中身を空にする
        get_trend();
    }else{
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
            //画像が入力されていなくてもいけ－
            document.getElementById("comment_div_while_send").style.display = "block";
        }
    });
}

function open_nagare_delete_dialog(){
    //入力値がなかったらcomment_div_while_backへ 入力があったらダイアログを表示する
    var $input = $('#comment_div_while_textarea');
    var value = $input.val();
    var community_icon_create = document.getElementById("comment_div_while_image").value.split('.');
    if(value == ""){
        //値が入力されているか確認
        if(con_file_ext(community_icon_create[community_icon_create.length - 1].toLowerCase())){
            nagare_delete_dialog.open();
        }else{
            //ココだけすぐに処理
            comment_div_while_back();
        }
    }else{
        nagare_delete_dialog.open();
    }
}

function comment_div_while_back(){
    //textarea に対してイベントを指定する
    var $input = $('#comment_div_while_textarea');
    //このイベント投稿欄を閉じたときに停止させる
    $input.off('input');
    //中身を空にする textarea file も
    document.getElementById("comment_div_while_textarea").value = "";
    document.getElementById("comment_div_while_image").value = "";
    //label内のimageも書き換える
    $("#comment_div_while_image_tag").attr('src', 'img/add_photo_alternate-24px.svg');
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

function send_nagare_to_com_try(){
    var community_icon_create = document.getElementById("comment_div_while_image").value.split('.');
    var result = con_file_ext(community_icon_create[community_icon_create.length - 1].toLowerCase());
    console.log("result", result, typeof result);
}

function send_nagare_to_com(){
    var community_icon_create = document.getElementById("comment_div_while_image").value.split('.');
    var result = con_file_ext(community_icon_create[community_icon_create.length - 1].toLowerCase());
    //ナガレのindex変化前を最新から取得する
    var now_index = Number(document.getElementById("nagare_trend").className.slice(-1));
    //最新で反応することがない前提の処理
    var community_doc_id = nagare_global[now_index];
    //テキストエリアからテキストを取得する
    var new_text = document.getElementById("comment_div_while_textarea").value;
    //sendingでanimationをつける
    document.getElementById("comment_div").classList.add("sending");
    if(result){//画像が入力されているときの処理
        //textarea に対してイベントを取り消し
        var $input = $('#comment_div_while_textarea');
        //このイベント投稿欄を閉じたときに停止させる
        $input.off('input');
        //以下コピペ
        var fileList = document.getElementById("comment_div_while_image").files;
        for(var i=0; i<fileList.length; i++){
            place += fileList[i].name;
        }
        place = "nagares/" + place;
        var storageRef = firebase.storage().ref();
        var ref = storageRef.child(place);
        var file = document.getElementById("comment_div_while_image").files[0]; // use the Blob or File API
        ref.put(file).then(function() {
            console.log('Uploaded or file!');
            image_place = firebase.storage().ref().child(place).getDownloadURL().then(function(url){
                db.collection("communities").doc(community_doc_id).collection("nagare").add({
                    date: new Date(),
                    name: user_doc_global.name,
                    uimg: user_info_global.photoURL,
                    text: new_text,
                    contentImage: url,
                    communityId: community_doc_id,
                    replyCount: 0,
                    replyText: ""
                }).then(function(){
                    console.log("画像含めてアップロード完了");            
                    //textareaの中身を空にする
                    document.getElementById("comment_div_while_textarea").value = "";
                    document.getElementById("comment_div_while_image").value = "";
                    //label内のimageも書き換える
                    $("#comment_div_while_image_tag").attr('src', 'img/add_photo_alternate-24px.svg');
                }).catch(function(error){
                    console.log("error", error);
                });
            });
        });
    }else{//テキストのみで画像が入力されてないときの処理
        db.collection("communities").doc(community_doc_id).collection("nagare").add({
            date: new Date(),
            name: user_doc_global.name,
            uimg: user_info_global.photoURL,
            text: new_text,
            contentImage: true,
            communityId: community_doc_id,
            replyCount: 0,
            replyText: ""
        }).then(function(){
            console.log("画像なしでアップロード完了");            
            //textareaの中身を空にする
            document.getElementById("comment_div_while_textarea").value = "";
            document.getElementById("comment_div_while_image").value = "";
            //label内のimageも書き換える
            $("#comment_div_while_image_tag").attr('src', 'img/add_photo_alternate-24px.svg');
        }).catch(function(error){
            console.log("error", error);
        });
    }
    //write カウント
    firestore_write_count += 1;
    console.log("write", firestore_write_count);
    //rules count
    firestore_extra_count += 3;
    console.log("extra", firestore_extra_count);
    //送信ボタンを無力化する
    document.getElementById("comment_div_while_send").style.display = "none";
    //表示の切り替え
    setTimeout(function(){
        //最新かそれ以外かを識別する
        var now_now_index = Number(document.getElementById("nagare_trend").className.slice(-1));
        var trend_num = nagare_global.length;
        if(now_now_index == trend_num){
            //最新に対する処理
            document.getElementById("start_fab").style.display = "none";
        }else{
            //最新以外に対する処理
            //fabを元に戻して表示
            document.getElementById("start_fab").style.display = "flex";
        }
    },600);
    
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
    //nagareを取得 時間取得でタイムスタンプおいてるのに重複した。要注意
    db.collection("communities").doc(nagare_global[number_tab]).collection("nagare").where('date', '>' ,nagare_timestamp[number_tab]).orderBy("date", "desc").limit(10).get().then(function(nagares){
        //timestamp
        nagare_timestamp[number_tab] = firebase.firestore.Timestamp.now();
        //listener でタッチ
        try{nagare_listener_global();console.log("listener でタッチ")}catch(error){console.log("error", error);};
        //listener を設置 このリスナに複数のオブジェクトがヒットして重複が発生してしまうのでlimit１にして対応する が、実験的であるため、要修正
        nagare_listener_global = db.collection("communities").doc(nagare_global[number_tab]).collection("nagare").where('date', '>' ,nagare_timestamp[number_tab]).limit(1).onSnapshot(function(listen_snap){
            //timestamp
            nagare_timestamp[number_tab] = firebase.firestore.Timestamp.now();
            //read count
            if(listen_snap.size == 0){
                firestore_get_count += 1;
            }else{
                firestore_get_count += listen_snap.size;
                //empty state を削除
                try{document.getElementById( 'nagare_' + nagare_global[number_tab] + '_no_wadai').hidden = true;}catch(error){console.log(error)};
            }
            console.log("read listen", firestore_get_count);
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
            //empty state を削除
            try{document.getElementById( 'nagare_' + nagare_global[number_tab] + '_no_wadai').hidden = true;}catch(error){console.log(error)};
        }
        //カウントを表示
        console.log("read", firestore_get_count);
    }).catch(function(error){
        console.log("error", error);
    });
}

//user see list
function insert_nagare_list(nagare_id ,nagare_data, nagare_number, type){
    if(nagare_data.contentImage == true){//画像は入力されてないときの処理
        console.log(nagare_data.contentImage, typeof nagare_data.contentImage);
        //時間を求める
        var time_list = fire_time_normalization(nagare_data.date);
        var time_record = time_list[0] + "月" + time_list[1] + "日 " + time_list[2] + ":" + time_list[3];
        //insert していく記述
        var nagare_container = document.getElementById("nagare_" + nagare_global[nagare_number]);
        var nagare_time = '<p style="position: relative; color: #606060; font-size: 0.8em; margin-left: 20px; margin-top: 26px; margin-right: 48px;">' + time_record +'</p>';
        var nagare_text = '<p style="position: relative; margin: 0px 0px 0px 20px; font-size: 2em;">'+ nagare_data.text +'</p>';
        nagare_container.insertAdjacentHTML(type, '<div id="'+ nagare_global[nagare_number] + '_' + nagare_id +'" class="nagare_ripple mdc-ripple-surface mdc-card" onclick="display_talk(this)" style="padding: 0px; margin: 20px 20px 20px 20px; border-radius:5px; position: relative; background-color: #ffffff; height: calc(41.42vw - 16.57px); overflow: hidden">' + nagare_time + nagare_text +'</div>');
    }else{//画像とテキストが両方入力されてるときの処理
        console.log("画像は入力されてるはず");
        //時間を求める
        var time_list = fire_time_normalization(nagare_data.date);
        var time_record = time_list[0] + "月" + time_list[1] + "日 " + time_list[2] + ":" + time_list[3];
        //insert していく記述
        var nagare_container = document.getElementById("nagare_" + nagare_global[nagare_number]);
        //var report_button = '<button class="mdc-icon-button material-icons nagare_icons_report">more_vert</button>';
        var nagare_content_image = '<img src="' + nagare_data.contentImage + '" style="height: calc(41.42vw - 16.57px); width: 100%; object-fit: cover;">';
        var nagare_time = '<p style="position: relative; color: #606060; font-size: 0.8em; margin-left: 20px; margin-right: 48px; margin-top: 26px;">' + time_record +'</p>';
        var nagare_text = '<p style="position: relative; margin: 0px 0px 0px 20px; font-size: 2em;">'+ nagare_data.text +'</p>';
        nagare_container.insertAdjacentHTML(type, '<div id="'+ nagare_global[nagare_number] + '_' + nagare_id +'" class="nagare_ripple mdc-ripple-surface mdc-card" onclick="display_talk(this)" style="padding: 0px; margin: 20px 20px 20px 20px; border-radius:5px; position: relative; background-color: #ffffff; height: calc(82.84vw - 33.14px); overflow: hidden">' + nagare_content_image + nagare_time + nagare_text +'</div>');
    }
    //あとでtalkを開くときのためにタイムスタンプを押すwadai_nagare_global 安定の一週間前デフォルト
    var one_week_ago = new Date();
    one_week_ago.setDate(one_week_ago.getDate() - 7);
    //疑似配列って一々定義していくものなのだろうか一応動いたけども
    wadai_nagare_glbal[nagare_global[nagare_number]][nagare_id] = {
        timeStamp: firebase.firestore.Timestamp.fromDate(one_week_ago),
        commentDocs: []
    };
    //高さ調整
    re_define_nagare_height(nagare_number);
    //material ripples をつける
    var lists = document.querySelectorAll('.nagare_ripple');
    //console.log("lists ripple re", lists.length);
    for(var i=0; i<lists.length; i++){
        var a_list = lists[i];
        new mdc.ripple.MDCRipple(a_list);
    }
}

//page_contain_comの高さを挿入するごとに書き換える
function re_define_nagare_height(com_index){
    var trend_num = nagare_global.length;
    if(com_index == trend_num){
        //最新に対する処理
        var height = document.getElementById("nagare_trend").clientHeight;
        document.getElementById("page_contain_com").style.height = String(height + 200) + "px";
        //console.log(300, 'px');
    }else{    
        //最新以外に対する処理
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



//input type file の値が切り替わったら起動する。画像をプレビューする discard 30 からコピーしたやーつ
$(document).ready(function(){
    $('#comment_div_while_image').on('change', function (e) {
        var community_icon_create = document.getElementById("comment_div_while_image").value.split('.');
        if(con_file_ext(community_icon_create[community_icon_create.length - 1].toLowerCase())){
            //入力されている処理
            document.getElementById("comment_div_while_send").style.display = "none";//一時的にボタンを止める
            var reader = new FileReader();
            reader.onload = function (e) {
                $("#comment_div_while_image_tag").attr('src', e.target.result);
                //テキストの入力値を確認して入力されていたらボタンをon そうでなければoff にする
                if($("#comment_div_while_textarea").val() == ""){
                    //入力されていないのでボタンを非表示にする
                    document.getElementById("comment_div_while_send").style.display = "none";
                }else{
                    //どちらも入力されているので、ボタンを表示する
                    document.getElementById("comment_div_while_send").style.display = "block";
                }
            }
            reader.readAsDataURL(e.target.files[0]);
        }else{
            //入力されていない処理
            $("#comment_div_while_image_tag").attr('src', 'img/add_photo_alternate-24px.svg');
            alert("svg, png, jpg, gif のいずれかの形式でアップロードしてください");
        }
    });
});

//このライブラリの 320 あたり？ insert nagare のところで時間表示をただすために使用
function fire_time_normalization(firestore_timestamp){
    //時間を求める
    var month = String(firestore_timestamp.toDate().getMonth() + 1);
    var date = String(firestore_timestamp.toDate().getDate());
    var hours = firestore_timestamp.toDate().getHours();
    var minutes = firestore_timestamp.toDate().getMinutes();
    //hour と minutes は一桁だったら 0 を描きたす
    if(Math.floor(hours / 10) == 0){
        hours = "0"+ String(hours);
    }else{
        hours = String(hours);
    }
    if(Math.floor(minutes / 10) == 0){
        minutes = "0"+ String(minutes);
    }else{
        minutes = String(minutes);
    }
    return [month, date, hours, minutes];
}

//裏のスクロールを調整して戻して表示するためのグローバル変数
//var window_y = window.pageYOffset;bodyでスクロール調整ができると判明したので、置き換える2019/12/20
/*
// スクロール禁止
$("body").css('overflow','hidden');

// スクロール禁止 解除
$("body").css('overflow','auto');
*/
//ワダイのイベントを閉じるときにつなぐための変数
var wadai_event_batton;
//wadai click で nagare display display_talk になってるがnagareとしていたものをwadaiにしたから、命名が複雑化
function display_talk(wadai_element){
    // スクロール禁止
    $("body").css('overflow','hidden');
    var com_nag = wadai_element.id.split("_");
    document.getElementById("wadai_nagare_id_hidden").value = wadai_element.id;//コメントを送信するときに参照する
    //クリックした要素の情報を取得
    var rect = wadai_element.getBoundingClientRect();
    var left = rect.left;// + window.pageXOffset;
    var top = rect.top;// + window.pageYOffset;
    var width = rect.width;
    var height = rect.height;
    //console.log("left", left, "top", top, "width", width, "height", height);
    //隠し話題に適用
    var hidden_wadai = document.getElementById("hidden_wadai");
    hidden_wadai.hidden = false;
    hidden_wadai.style.top = String(top) + "px";
    hidden_wadai.style.left = String(left) + "px";
    hidden_wadai.style.height = String(height) + "px";
    hidden_wadai.style.width = String(width) + "px";
    //スクロールしてる親要素の高さを100％にするかhidden_wadaiに合わせることでスクロール調節する
    //absoluteで対応していく路線で決定 => fixed でelementスクロールにするとsafariで挙動が望ましくない形でスライドしたりするからその対策かな？
    //だが、現在また考え中という感じ。fixedのほうが早く実装できそうだから fixed にする
    var hidden_wadai_mimic = document.getElementById("hidden_wadai_mimic");//トランジションをきれいに見せるためのdiv
    hidden_wadai_mimic.innerHTML = wadai_element.innerHTML;
    var hidden_wadai_content = document.getElementById("hidden_wadai_content");//閲覧とかボタンとかのwadaiを見るときに表示するdiv
    var hidden_wadai_fixed = document.getElementById("hidden_wadai_fixed");
    //裏がわを非表示
    wadai_element.style.visibility = "hidden";
    wadai_event_batton = wadai_element;
    setTimeout(function(){
        hidden_wadai.classList.add("being");
        setTimeout(function(){
            //transition 中に表示を切り替える
            //hidden_wadai_mimic.hidden = true;
            hidden_wadai_content.hidden = false;
            setTimeout(function(){
                hidden_wadai_fixed.hidden = false;
                //裏ですくろーできないように
                document.getElementById("page_contain_com").hidden = true;
            }, 150);
        },150);
    },100);
    //textarea に対してイベントを指定する
    var hidden_wadai_fixed_text_input = $('#hidden_wadai_fixed_text');
    //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
    hidden_wadai_fixed_text_input.on('input', function(event) {
        var value = hidden_wadai_fixed_text_input.val();
        //console.log(value, event);
        if(value == ""){
            //無効か
            $("#hidden_wadai_fixed_send").attr('disabled', true);
            document.getElementById("hidden_wadai_fixed_send").style.color = "#595959";
        }else{
            // 有効化
            $("#hidden_wadai_fixed_send").attr('disabled', false);
            document.getElementById("hidden_wadai_fixed_send").style.color = "#0066ff";
        }
    });
    //listener でタッチ
    try{nagare_listener_global();console.log("listener でタッチ")}catch(error){console.log("error", error);};
    //talkを取得して代入する
    get_talk_content(com_nag);
}

function display_talk_back(){
    //裏を元に戻す
    document.getElementById("page_contain_com").hidden = false;
    //裏がわを非表示 この上の行の書き換えが不要説出てる要検証2019/12/20本当は下の記述で試したいけど、id持ってこれないかん
    wadai_event_batton.style.visibility = "visible";
    //window.scrollTo( 0, window_y );
    //元に戻す処理を書く
    var hidden_wadai = document.getElementById("hidden_wadai");
    //var hidden_wadai_mimic = document.getElementById("hidden_wadai_mimic");//トランジションをきれいに見せるためのdiv
    var hidden_wadai_content = document.getElementById("hidden_wadai_content");//閲覧とかボタンとかのwadaiを見るときに表示するdiv
    var hidden_wadai_fixed = document.getElementById("hidden_wadai_fixed");
    hidden_wadai_content.innerHTML = "";
    setTimeout(function(){
        hidden_wadai_fixed.hidden = true;
        hidden_wadai.classList.remove("being");//アニメーションの開始
        setTimeout(function(){
            //transition 中に表示を切り替える
            hidden_wadai_content.hidden = true;
            //hidden_wadai_mimic.hidden = false;
            setTimeout(function(){
                // スクロール禁止 解除
                $("body").css('overflow','auto');
                hidden_wadai.hidden = true;
                //talkを取得して代入する            
                //ナガレのindex変化前を最新から取得するかな(このライブラリの60からコピー)
                var nagare_index_number = Number(document.getElementById("nagare_trend").className.slice(-1));
                //console.log(nagare_index_number, typeof nagare_index_number);
                document.getElementById("wadai_nagare_id_hidden").value = "";
                if(nagare_global.length == nagare_index_number){
                    //最新の時の処理
                    //get_trend();何もしないのが正解！？
                    console.log("最新は何もしない");
                }else{
                    //それ以外の処理
                    get_nagare(nagare_index_number);
                }
            }, 150);
        },150);
    }, 100);
    //なんかエラー出たから下の2行もtryで囲うが要確認修正
    try{
        //イベント無効か
        var hidden_wadai_fixed_text_input = $('#hidden_wadai_fixed_text');
        //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
        hidden_wadai_fixed_text_input.off('input');
    }catch(error){console.log("error ->", error)};
    //wadai_nagare_glbalのリスナ停止
    try{talk_listener_global();console.log("wadai_nagare_glbal でタッチ")}catch(error){console.log("error", error);};
}

//ボタンを有効化するリスナはこのライブラリの500行当たり
function send_reply(){
    //送信ボタンの無効化
    $("#hidden_wadai_fixed_send").attr('disabled', true);
    document.getElementById("hidden_wadai_fixed_send").style.color = "#595959";
    var talk_text = document.getElementById("hidden_wadai_fixed_text").value;
    var com_nag = document.getElementById("wadai_nagare_id_hidden").value.split("_");
    //データベースに送信する ps 匿名かどうかで処理を分ける
    var user = firebase.auth().currentUser;
    if(user.isAnonymous){
        //匿名ユーザ（ゲスト）のログイン
        db.collection("communities").doc(com_nag[0]).collection("nagare").doc(com_nag[1]).collection("comments").add({
            createdAt: new Date(),
            name: "匿名ユーザ",
            comment: talk_text,
            member: false,
            iconUrl: "img/account_circle-24px.svg",
            uid: user.uid
        }).then(function(){
            document.getElementById("hidden_wadai_fixed_text").value = "";//送信後にする
            //書き込みカウント
            firestore_write_count ++;
            console.log("書き込みカウント", firestore_write_count);
        }).catch(function(error){
            console.log("error", error);
        });
    }else{
        //もうすでにログイン済み ps あとでログイン済みでもコミュニティのメンバーかどうかで分岐するはず
        db.collection("communities").doc(com_nag[0]).collection("nagare").doc(com_nag[1]).collection("comments").add({
            createdAt: new Date(),
            name: user_doc_global.name,
            comment: talk_text,
            member: true,
            iconUrl: user_info_global.photoURL,
            uid: user_info_global.uid
        }).then(function(){
            document.getElementById("hidden_wadai_fixed_text").value = "";//送信後にする
            //書き込みカウント
            firestore_write_count ++;
            console.log("書き込みカウント", firestore_write_count);
        }).catch(function(error){
            console.log("error", error);
        });
    }
}

var talk_listener_global;//あとでリスナとか置くときに活躍します
var wadai_nagare_glbal = {};//wadai と nagare を保存しておくための
function get_talk_content(com_nag){
    //タイムスタンプは347で一週間前に一度インサート同時に押しておく
    db.collection("communities").doc(com_nag[0]).collection("nagare").doc(com_nag[1]).collection("comments")
    .where('createdAt', '>' , wadai_nagare_glbal[com_nag[0]][com_nag[1]]["timeStamp"]).orderBy("createdAt", "desc").limit(10)
    .get().then(function(docs){
        //timestamp
        wadai_nagare_glbal[com_nag[0]][com_nag[1]]["timeStamp"] = firebase.firestore.Timestamp.now();
        //listenerの設置 20191107limit(1)を追加記述 20191107limit(1)消去（1回しか取れなくなった）同日現状リスナで取得したものを繰り返し挿入する傾向を発見 同日orderByとlimit()を追加
        talk_listener_global = db.collection("communities").doc(com_nag[0]).collection("nagare").doc(com_nag[1]).collection("comments")
        .where('createdAt', '>' ,wadai_nagare_glbal[com_nag[0]][com_nag[1]].timeStamp).orderBy("createdAt", "desc").limit(1).onSnapshot(function(listen_snap){
            //timestamp
            wadai_nagare_glbal[com_nag[0]][com_nag[1]]["timeStamp"] = firebase.firestore.Timestamp.now();
            //read count
            if(listen_snap.size == 0){
                firestore_get_count += 1;
            }else{
                firestore_get_count += listen_snap.size;
            }
            console.log("read listen", firestore_get_count);
            listen_snap.forEach(function(listen_doc){    
                //コメントドックsに代入
                console.log("comment id => " , listen_doc.id);
                wadai_nagare_glbal[com_nag[0]][com_nag[1]].commentDocs.push(listen_doc.data());
                insert_talk_content(listen_doc.data());
            });
        });
        docs.docs.reverse().forEach(function(one_comment){
            //コメントドックsに代入
            wadai_nagare_glbal[com_nag[0]][com_nag[1]].commentDocs.push(one_comment.data());
        });
        //コメントドックの中身でループする
        for(var i=0 ; i< wadai_nagare_glbal[com_nag[0]][com_nag[1]].commentDocs.length; i++){
            insert_talk_content(wadai_nagare_glbal[com_nag[0]][com_nag[1]].commentDocs[i]);
        }
        //読み込みカウント
        if(docs.size == 0){
            firestore_get_count += 1;
        }else{
            firestore_get_count += docs.size;
        }
        console.log("読み込みカウント", firestore_get_count);
    }).catch(function(error){
        console.log("error", error);
    });
};

function insert_talk_content(comment_doc){
    //console.log(comment_doc);
    //時間を求める
    var time_list = fire_time_normalization(comment_doc.createdAt);
    var comment_time = time_list[0] + "月" + time_list[1] + "日 " + time_list[2] + ":" + time_list[3] ;
    var comment_icon = '<img src="' + comment_doc.iconUrl + '" width="40px" height="40px" style="border-radius: 50%; objectfit:cover; top:16px; left: 16px; position:absolute;">';
    var comment_content = '<p style="position: relative; left: 72px; font-size: 18px; width: calc(100vw - 88px)">' + comment_doc.comment + '</p>';
    var comment_name = '<p style="position: relative; left: 72px; top: 16px;color: #606060; font-size: 0.8em; margin: 0px">'+ comment_doc.name + '・' + comment_time + '</p>';
    var comment_list = document.getElementById("hidden_wadai_content");
    comment_list.insertAdjacentHTML("beforeend", '<div style="position: relative; overflow: hidden">' + comment_icon + comment_name + comment_content + '</div>' );
    // 現在の縦スクロール位置
    //var scrollPosition = document.getElementById("hidden_wadai_content").scrollTop;
    // スクロール要素の高さ
    //var scrollHeight = document.getElementById("hidden_wadai_content").scrollHeight;
    document.getElementById("hidden_wadai").scrollTop = document.getElementById("hidden_wadai").scrollHeight;
}

//wadaiがない時に適宜挿入する
function insert_no_wadai(div_element){
    //empty message
    div_element.innerHTML = '<div id="' + div_element.id + '_no_wadai"><img src="img/no_wadai_03.svg" style="object-fit: cover;width: 80%;height: 80%; margin: 0px 10% 0px 10%;"><p style="font-size: 2em; text-align: center; margin: 0px">投稿はありません</p><p style="text-align: center; margin: 0px">投稿されたワダイが<br>ここに表示されます。</p></div>';
    //高さ調整
    document.getElementById("page_contain_com").style.height = "100%";
}