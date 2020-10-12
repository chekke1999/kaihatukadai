const conn = new WebSocket('ws://localhost:8080');
const req = {
    "db_select_data" : {
        "xpath" : "//check"
    }
}
conn.onopen = function(e) {
    console.log("Connection established!");
};
window.onload = function(e){
    const inpe_attach = document.getElementById('inpe_window');
    conn.send(JSON.stringify(req));
    conn.onmessage = function(e) {
        console.log(JSON.parse(e.data));
        inpe_attach.insertAdjacentHTML("beforeend",e.data);
    };
}
