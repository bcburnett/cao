<?php
$db = new SQLite3('../data/cao.sqlite');
$sql = "select * from meat ";
$result = $db->query($sql);
$json = "";
$i=0;
while($res = $result->fetchArray(SQLITE3_ASSOC)){
    $i++;
    if($i > 1){
        $json .= ",";
    }
    $res['id'] = ''.$res['id'];
    $json .= json_encode($res);
}
echo "[".$json."]";
file_put_contents( '../data/data.json',  "[".$json."]");
