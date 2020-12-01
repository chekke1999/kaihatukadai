const socket = new WebSocket('ws://192.168.11.199:8080');

const req = {
    "sql" : {
        "db":"piscan",
        "query" :"SELECT scan_id,plc_mac,datetime,scan_data FROM pi_camera;",
        "commit":false
    }
}

// 接続が開いたときのイベント
socket.onopen = function (event) {
    socket.send(JSON.stringify(req)); 
    // console.log("req");
};



function getId(ele){

	let xhr = new XMLHttpRequest()
	let box = document.getElementById("box");//読み込みたい位置を指定
    let h;
	xhr.responseType="";//XMLとして扱いたいので一応記述
	xhr.open("GET", "./parts.html", true);
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
            let restxt=xhr.responseText;//重要
            //console.log(restxt);
            box.innerHTML = restxt ;
		}
	};
    xhr.send();
    var id_value = ele.id; // eleのプロパティとしてidを取得
    //console.log(id_value); //「id01」
    const req2 = {
        "img" : {
            "db":"piscan",
            "id" : id_value
        }
    }
    socket.send(JSON.stringify(req2)); 

}

window.onload = function (e) {

    const inpe_attach = document.getElementById('inpe_window');
    const result_attach_1 = document.getElementById('result_picture1');
    const result_attach_2 = document.getElementById('result_picture2');

    // メッセージの待ち受け
    socket.onmessage = function (event) {
        
        // console.log(JSON.parse(event.data));
        var data = new Object();

        
        jdata = JSON.parse(event.data);

        // console.log(jdata);

        for(var key in jdata){
            
            if(key == "img"){
                console.log("img-------------");
                console.log(jdata["img"][0]);

                let p =     'data:image/png;base64,'
                        +   jdata["img"][0];

                result_attach_1.insertAdjacentHTML("afterbegin", p);

            }else{
                data.arr = JSON.parse(event.data)[1][3];
                // console.log("else");
            data.date = jdata[key][2];
            data.status = JSON.parse(data.arr);
            data.type = data.status.type;
            data.number = key;
            let O_N = 0;
            var day = new Object;
            day = data.date.split('T');
            day.date = day[0];
            day.hours = day[1];

            day.detail = day.date.split("-");
            day.time = day.hours.split(":");
            day.time[2] = Math.floor(day.time[2]);

            var false_cnt = event.data.indexOf("false");

            if(false_cnt < 0){
                O_N = '〇';
            }else{
                O_N = '×';
            }

            var h = '<div id="'
            + data.number
            + '" class="result_element" onclick="getId(this);">'
            + '<div class="dai1">'
            + day.detail[0] + '/' + day.detail[1] + '/' +day.detail[2]
            + '</div>'
            + '<div class="dai2">'
            + day.time[0] + ':' + day.time[1] + ':' + day.time[2]
            + '</div>'
            + '<div class="dai3">'
            + data.type
            + '</div>'
            + '<div idO_N" class="dai4">'
            + O_N
            + '</div>'
            + '</div>';
        
            inpe_attach.insertAdjacentHTML("afterbegin", h);
            }
        }
    }
}

// var url = location.href ;