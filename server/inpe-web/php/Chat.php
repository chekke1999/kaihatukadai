<?php
namespace MyApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use MyApp\XdbRequestsJson;

class Chat implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }
    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection to send messages to later
        $this->clients->attach($conn);//clientsに接続を保存してる
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $numRecv = count($this->clients) - 1;
        $jmsg = json_decode($msg);
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');
        foreach ($this->clients as $client) {
            if ($from === $client) {//クライアントに返信。否定すると送信者以外の全員に転送。
                if ($jmsg->db_select_data !== NULL){
                    foreach (XdbRequestsJson::DReq($jmsg->db_select_data->xpath) as $SendMsg){
                        var_dump($SendMsg);
                        $client->send($SendMsg);
                    }
                }else if($jmsg->banana !== NULL){
                        var_dump($jmsg);
                        $client->send(json_encode($jmsg));
                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }
}