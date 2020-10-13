const conn = new WebSocket('ws://192.168.77.55:8080/');
const req = {
    "db_select_data" : {
        "xpath" : "//check"
    }
}



conn.onopen = function(e) {
    console.log("Connection established!");
    const cfm = document.getElementById("cfm_text");
    cfm.insertAdjacentHTML("afterbegin","接続完了");

    conn.send(JSON.stringify(req));
};
window.onload = function (e) {
    var arr = {}
    const inpe_attach = document.getElementById('inpe_window');
    conn.onmessage = function (e) {

        //console.log(JSON.parse(e.data));
        //console.log(e.data);
        //var arr = new Object();

        //arr.number = JSON.parse(e.data)["@attributes"].number;
        //arr.time = JSON.parse(e.data)["@attributes"].time;
        //arr.RFID = JSON.parse(e.data)["@attributes"].RFID;

        console.log(JSON.parse(e.data)["parts"][0]["@attributes"]);
        //var num = inpe_attach.insertAdjacentHTML("afterbegin", "<div>" + JSON.parse(e.data)["@attributes"].number + "</div>");
        //inpe_attach.insertAdjacentHTML("afterbegin", "<div>" + JSON.parse(e.data)["@attributes"].time + "</div>");
        //inpe_attach.insertAdjacentHTML("afterbegin", "<div>" + JSON.parse(e.data)["@attributes"].RFID + "</div>");

        var h ='<a href="parts.html">' 
            + '<div class="dynamic_box">'
            + '<div class="dynamic_innerbox_name">'
            + '基板'
            + JSON.parse(e.data)["@attributes"].number
            + '</div>'
            + '<div class="dynamic_innerbox_time">'
            + JSON.parse(e.data)["@attributes"].time
            + '</div>'
            + '<div class="dynamic_innerbox_rfid">'
            + JSON.parse(e.data)["@attributes"].RFID
            + '</div>'
            + '</div>'
            + '</a>';

        inpe_attach.insertAdjacentHTML("afterbegin",h);
    }

}


function C(){
    const lists = Array.from(document.querySelectorAll("div"));
    lists.forEach(li => {
        li.addEventListener("click", e => {
            const index = lists.findIndex(list => list === e.target);
            console.log(index);
            return index;
        });
    });
}

timerID = setInterval('clock()',500); //0.5秒毎にclock()を実行

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
    var mon = toDoubleDigits(now.getMonth()+1); //１を足すこと
    var day = toDoubleDigits(now.getDate());
    var hour = toDoubleDigits(now.getHours());
    var min = toDoubleDigits(now.getMinutes());
    var sec = toDoubleDigits(now.getSeconds());

	//出力用
	var s = year + "年" + mon + "月" + day + "日" + hour + "時" + min + "分" + sec + "秒";
	return s;
}
