<?php
$db = new SQLite3('../data/cao.sqlite');
$id=$_GET['id'];
$sql="DELETE FROM meat WHERE id= $id";
 $db->exec($sql);
