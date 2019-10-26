function sirasu(){
    //firestore
    db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").update({
        count :firebase.firestore.FieldValue.increment(1)
    });
}

function sirasu_get(){
    db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").get().then(function(doc){
        //数値の書き換え
        var the_count = doc.data().count;
        document.getElementById("sirasu_count").textContent = the_count;
        //リスナの設置
        sirasu_listener = db.collection("sirasu").doc("6WrFkQ2L0tuoatHbw4Qj").onSnapshot(function(doc) {
            //数値の書き換え
            var the_count = doc.data().count;
            document.getElementById("sirasu_count").textContent = the_count;
        });
    }).catch(function(error){
        console.log("error → ", error);
    });
};

var sirasu_listener;//リスナデタッチのためのグロ変

function work_get(){
    console.log("work取得→挿入→リスナ設置");
    db.collectionGroup('works').orderBy("finish", "desc").limit(10).get().then(function (querySnapshot) {
        console.log(querySnapshot);
    }).catch(function(error){
        console.log("error -> ", error);
    });
};


function tanomu(){
    console.log("tanomu");
}