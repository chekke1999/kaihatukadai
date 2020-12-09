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

const req3 ={
    "sql" : {
        "db":"piscan",
        "query" :"SELECT COUNT(*) FROM pi_camera;",
        "commit":false
    }
}


// 接続が開いたときのイベント
socket.onopen = function (event) {
    socket.send(JSON.stringify(req3)); 
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

function page_generate(page){
    console.log(page);

}

window.onload = function (e) {
    var cnt_page_processing = 0;
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
        var page_cnt;
        var h;
        var h2;
        var today = new Date();
        jdata = JSON.parse(event.data);
        const search_date_o = document.getElementById('S_date_year_old');
        const search_date_n = document.getElementById('S_date_year_new');
        const search_time_o = document.getElementById('S_date_start_H');
        const search_time_n = document.getElementById('S_date_now_H');
        var G_B_text;
        


        const cnt_result = document.getElementById('cnt_result');
        const cnt_good = document.getElementById('cnt_good');
        const cnt_bad = document.getElementById('cnt_bad');
        // console.log(jdata);
        var cnt_g = 0;
        var cnt_b = 0;

        if(cnt_page_processing==0){
            const pages_attach = document.getElementById('nav-links');

            var page_max_text;
            cnt_page_processing = 1;
            page_cnt = parseInt(jdata[1] / 50) + 1 ;

            page_cnt = 1;
            console.log(page_cnt);
            page_generate(page_cnt)
            if(page_cnt > 4){
                page_max_text = '<div class="page_box ">...</div>'
                                +   '<div class="page_box detail_link_last">'
                                +   page_cnt  
                                +   '</div>';
            }else if(page_cnt == 4){
                page_max_text = '<div class="page_box detail_link_last">'
                                +   page_cnt  
                                +   '</div>';
            }else{
                page_max_text = '';
            }

            var page_html = '<div class="page_box ">《</div>'
            +   '<div class="page_box detail_link_previous">1</div>'
            +   '<div class="page_box detail_link_current">2</div>'
            +   '<div class="page_box detail_link_next">3</div>'
            +   page_max_text
            +   '<div class="page_box ">》</div>';

            pages_attach.insertAdjacentHTML("afterbegin", page_html);


        }

        for(var key in jdata){

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


                    // arr_j[id_value][3]
                    let arr_table = arr_j[id_value][3];
                    arr_table = JSON.parse(arr_table)

                    console.log(arr_table);

                h =  day.detail[0] 
                    + '/' 
                    + day.detail[1] + '/' + day.detail[2] 
                    + "  " 
                    + day.time[0] + ':' + day.time[1] + ':' + day.time[2]
            
                detail_title.insertAdjacentHTML("afterbegin", h);


                // h = '<li class="parts_name">'
                //     + arr_j[3].status
                //     + '</li>'
                //     +
                //     + '<li class="inspection_name1">'
                //     + '</li>'
                //     + '<li class="inspection_name2">'
                //     + '</li>'


                result_attach_1.insertAdjacentHTML("afterbegin", p);
                result_attach_2.insertAdjacentHTML("afterbegin", p2);

            }else{




            search_date_o.value = "*";
            search_date_n.value = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate();
            search_time_o.value = "00:00";
            search_time_n.value = today.getHours() + ":" + today.getMinutes();
            
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

            var false_cnt = 0;
            false_cnt = jdata[key][3].indexOf("false");

            if(false_cnt < 0){
                O_N = '〇';
                cnt_g++;
                G_B_text = '<div class="dai4">'
            }else{
                O_N = '×';
                cnt_b++;
                G_B_text = '<div class="dai4 bad">'
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
            + G_B_text
            + O_N
            + '</div>'
            + '<div id="result_picture1"></div>'
            + '</div>';
        
            inpe_attach.insertAdjacentHTML("afterbegin", h);

            cnt_result.innerHTML = key;
            cnt_good.innerHTML = cnt_g;
            cnt_bad.innerHTML = cnt_b;
            }
        }
    }
}

function search(){
    console.log("click");

    const search_date_o = document.getElementById('S_date_year_old');
    const search_date_n = document.getElementById('S_date_year_new');
    const search_time_o = document.getElementById('S_date_start_H');
    const search_time_n = document.getElementById('S_date_now_H');

    console.log(arr_j[1][2]);
}