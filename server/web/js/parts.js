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
  };

var urlParams = new URLSearchParams(window.location.search);
var num = urlParams.get('number');

window.onload = function (e) {
    const inpe_attach = document.getElementById('inpe_window');
    // メッセージの待ち受け
    socket.onmessage = function (event) {

        const title_attach = document.getElementById('title_detail');
        //console.log(JSON.parse(event.data));
        var data = new Object();
        data.arr = JSON.parse(event.data)[num][3];

        data.date = JSON.parse(event.data)[num][2];
        data.status = JSON.parse(data.arr);
        data.type = data.status.type;
        data.number = num;

        let O_N = 0;
        var day = new Object;
        day = data.date.split('T');
        day.date = day[0];
        day.hours = day[1];

        day.detail = day.date.split("-");

        day.time = day.hours.split(":");
        day.time[2] = Math.floor(day.time[2]);
        

        var false_cnt = event.data.indexOf("false");

        console.log(day.date);

        if(false_cnt < 0){
            O_N = '〇';
        }else{
            O_N = '×';
        }

        var h = day.date
            +   "　"
            + day.time[0] + ':' + day.time[1] + ':' + day.time[2];
        title_attach.insertAdjacentHTML("afterbegin", h);
        console.log(h);
    
    }

}

