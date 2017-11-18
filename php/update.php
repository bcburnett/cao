<?php
$db = new SQLite3('../data/cao.sqlite');
	$value=$_POST['value'];
		$id=$_POST['id'];
        $field =$_POST['field'];
	$sql="update meat set $field = \"$value\" where id= $id";
	 $db->exec($sql);
     if($field == 'name'){
         $sql="update meat set variety = \"\" where id= $id";
         $db->exec($sql);
     }
	$sql="SELECT * from meat where id =$id";
	$result = $db->query($sql);
	$json = "";
	$i=0;
	while($res = $result->fetchArray(SQLITE3_ASSOC)){
		$i++;
		if($i > 1){
			$json .= ",";
		}
		$json .= json_encode($res);
	}
	echo "[".$json."]";
