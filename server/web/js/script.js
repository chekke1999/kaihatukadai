const socket = new WebSocket('ws://192.168.11.199:8080');
let xhr = new XMLHttpRequest()
xhr.responseType="";

let arr_j = [];
var day = new Object();
var data = new Object();
var id_value;

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
    console.log(req);
};

function getId(ele){
    let box = document.getElementById("box");//読み込みたい位置を指定

    let h;
	xhr.open("GET", "./parts.html", true);
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
            let restxt=xhr.responseText;//重要
            //console.log(restxt);
            box.insertAdjacentHTML("afterbegin", restxt);
            //console.log(restxt);
		}
	};
    xhr.send();
    id_value = ele.id; // eleのプロパティとしてidを取得
    //console.log(id_value); //「id01」
    const req2 = {
        "img" : {
            "db":"piscan",
            "id" : id_value
        }
    }


    socket.send(JSON.stringify(req2)); 
}

function getId_close(){
    console.log("click");
    const element = document.querySelector('section');
    element.remove();
}

window.addEventListener('beforeunload', function(e){
  /** 更新される直前の処理 */
  console.log('beforeunload');
  socket.close();
});

window.onload = function (e) {
    let box = document.getElementsByClassName('container')[0];//読み込みたい位置を指定
	xhr.open("GET", "./menu.html", true);
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
            let restxt=xhr.responseText;//重要
            //console.log(restxt);
            box.insertAdjacentHTML("afterbegin", restxt);

		}
	};
    xhr.send();

    const inpe_attach = document.getElementById('inpe_window');

    // const result_attach_2 = document.getElementById('result_picture2');


    // メッセージの待ち受け
    socket.onmessage = function (event) {
        
        var h;
        
        jdata = JSON.parse(event.data);

        // console.log(jdata);

        for(var key in jdata){

            let cnt = 0;
            if(key == "img"){
                const result_attach_1 = document.getElementById('result_picture1');
                const result_attach_2 = document.getElementById('result_picture2');
                const detail_title = document.getElementById('detail_title');
                console.log("img-------------");
                console.log(jdata);

                var p =    '<image src="data:image/png;base64,'
                        +   jdata["img"][0]
                        +   '" class="picture_1">';

                var p2 =    '<image src="data:image/png;base64,'
                        +   jdata["img"][1]
                        +   '" class="picture_2">';

                        data.arr = arr_j[1][3];
                        // console.log("else");
                    data.date = arr_j[id_value][2];
                    data.status = JSON.parse(data.arr);
                    data.type = data.status.type;
                    data.number = id_value;
                    let O_N = 0;
        
                    day = data.date.split('T');
                    day.date = day[0];
                    day.hours = day[1];
        
                    day.detail = day.date.split("-");
                    day.time = day.hours.split(":");
                    day.time[2] = Math.floor(day.time[2]);

                h =  day.detail[0] 
                    + '/' 
                    + day.detail[1] + '/' + day.detail[2] 
                    + "  " 
                    + day.time[0] + ':' + day.time[1] + ':' + day.time[2]
            
                detail_title.insertAdjacentHTML("afterbegin", h);


                result_attach_1.insertAdjacentHTML("afterbegin", p);
                result_attach_2.insertAdjacentHTML("afterbegin", p2);

            }else{
                data.arr = JSON.parse(event.data)[1][3];
                // console.log("else");
            data.date = jdata[key][2];
            data.status = JSON.parse(data.arr);
            data.type = data.status.type;
            data.number = key;
            let O_N = 0;

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

            arr_j[key] = jdata[key];

            h = '<div id="'
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
            + '<div id="result_picture1"></div>'
            + '</div>';
        
            inpe_attach.insertAdjacentHTML("afterbegin", h);
            }
        }
    }
}

