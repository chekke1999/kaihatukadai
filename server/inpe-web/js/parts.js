const conn = new WebSocket('ws://192.168.77.55:8080/');
const req = {
    "db_select_data": {
        "xpath": "//check"
    }
}

var data = hensuu();
//console.log(data);

var urlParams = new URLSearchParams(window.location.search);
var num = urlParams.get('number');
console.log(num);

conn.onopen = function (e) {
    console.log("Connection established!");
    const cfm = document.getElementById("cfm_text");
    cfm.insertAdjacentHTML("afterbegin", "接続完了");

    conn.send(JSON.stringify(req));
};
window.onload = function (e) {
    var arr = {}
    const inpe_attach = document.getElementById('inpe_window');
    conn.onmessage = function (e) {

        var arr = new Object();
        var a = JSON.parse(e.data);
        var arr_a = new Object();
        var cnt = 0;

        arr.number = JSON.parse(e.data)["@attributes"].number;
        arr.time = JSON.parse(e.data)["@attributes"].time;
        arr.RFID = JSON.parse(e.data)["@attributes"].RFID;



        if (JSON.parse(e.data)["@attributes"].number == num) {
            //console.log(a);
            cnt = cnt + 1;
            arr_a = JSON.parse(e.data)["@attributes"];

            var h = '<table bgcolor="#faf8ed" border="1" style="border-collapse: collapse;border-color: #ca1818;width:80%">'
                + '<tr><th>'
                + '基板番号'
                + '</th><td>'
                + JSON.parse(e.data)["@attributes"].number
                + '</td></tr>'
                + '<tr><th>'
                + '日時'
                + '</th><td>'
                + JSON.parse(e.data)["@attributes"].time
                + '</td></tr>'
                + '<tr><th>'
                + 'RFID'
                + '</th><td>'
                + JSON.parse(e.data)["@attributes"].RFID
                + '</td></tr>'
                + '</table>';

            inpe_attach.insertAdjacentHTML("beforeend", h);

            //console.log(JSON.parse(e.data)["parts"][0]["@attributes"]);
            inpe_attach.insertAdjacentHTML("beforeend",JSON.parse(e.data)["parts"][1]["Mounted_parts"]);

            var h2 = '<table bgcolor="#faf8ed" border="1" style="border-collapse: collapse;border-color: #ca1818;width:80%">'
                + '<tr><th>'
                + '部品名'
                + '</th><td>'
                + JSON.parse(e.data)["parts"][0]["@attributes"].name
                + '</td></tr>'
                + '<tr><th>'
                + '部品名'
                + '</th><td>'
                + JSON.parse(e.data)["parts"][1]["@attributes"].name
                + '</td></tr>'
                + '<tr><th>'
                + 'RFID'
                + '</th><td>'
                + JSON.parse(e.data)["@attributes"].RFID
                + '</td></tr>'
                + '</table>';

            inpe_attach.insertAdjacentHTML("beforeend", h2);

        }

    }

}

timerID = setInterval('clock()', 500); //0.5秒毎にclock()を実行

function clock() {
    document.getElementById("view_clock").innerHTML = getNow();
}
var toDoubleDigits = function (num) {
    num += "";
    if (num.length === 1) {
        num = "0" + num;
    }
    return num;
}

function getNow() {
    var now = new Date();
    var year = now.getFullYear();
    var mon = toDoubleDigits(now.getMonth() + 1); //１を足すこと
    var day = toDoubleDigits(now.getDate());
    var hour = toDoubleDigits(now.getHours());
    var min = toDoubleDigits(now.getMinutes());
    var sec = toDoubleDigits(now.getSeconds());

    //出力用
    var s = year + "年" + mon + "月" + day + "日" + hour + "時" + min + "分" + sec + "秒";
    return s;
}
