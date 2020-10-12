<?php
namespace MyApp;
class XdbRequestsJson
{
    function DReq($req)
    {
        $XmlFile = simplexml_load_file("../XMLDB/test_db.xml");
        // var_dump($XmlFile->xpath("//搭載部品"));
        foreach($XmlFile->xpath($req) as $value){
           yield json_encode($value,JSON_UNESCAPED_UNICODE);
        }
    }
}

?>