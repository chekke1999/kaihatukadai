const socket = new WebSocket('ws://192.168.11.199:8080');

const req = {
    "sql" : {
        "db":"piscan",
        "query" :"SELECT scan_id,plc_mac,datetime,scan_data FROM pi_camera;",
        "commit":false
    }
}
const req_img = {
    "img" : {
        "db":"piscan",
        "id":"1"
    }
}

// 接続が開いたときのイベント
socket.onopen = function (event) {
    socket.send(JSON.stringify(req_img)); 
  };

// メッセージの待ち受け
socket.onmessage = function (event) {
    console.log(JSON.parse(event.data));
}