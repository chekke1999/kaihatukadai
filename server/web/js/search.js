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



window.onload = function (e) {

// メッセージの待ち受け
socket.onmessage = function (event) {
    // console.log(JSON.parse(event.data));
	data = event.data;
}

    const inpe_attach = document.getElementById('inpe_window');
    const s_year_o = document.getElementById('S_date_year_old');
    const s_year_n = document.getElementById('S_date_year_new');
    const s_n_hour = document.getElementById('S_date_now_H');
    const s_s_minute = document.getElementById('S_date_start_H');
    const today = new Date();


    for(let step= 1; step<100;step++){
        var h = '<a href="Top.html">'
                + '<div class="result_element">'
                + '<div class="dai1">2020/11/'
                + step
                + '</div>'
                + '<div class="dai2">15:34:55</div>'
                + '<div class="dai3">A</div>'
                + '<div class="dai4">×</div>'
                + '</div>'
                + '</a>';
        
                inpe_attach.insertAdjacentHTML("afterbegin", h);
        }

        const year_date1 =  today.getFullYear()
                        +   '/'
                        +   (today.getMonth()+1)
                        +   '/'
                        +   today.getDate();
        
        s_year_o.value = '*';
        s_year_n.value = year_date1;
        s_n_hour.value = today.getHours() + ':' + today.getMinutes();
        s_s_minute.value = '00:00';
}

document.getElementById("search_B").onclick = function() {
    const type = document.getElementById("Type_sel").value;
    const date = document.getElementById("S_date_year").value;
    const month = document.getElementById("S_date_month").value;
    const day = document.getElementById("S_date_day").value;
    const hour_start = document.getElementById("S_date_start_H").value;
    const hour_stop = document.getElementById("S_date_now_H").value;
    console.log(type);
    console.log(date);
    console.log(month);
    console.log(hour_start);
    console.log(hour_stop);
};