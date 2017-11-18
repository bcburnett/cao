<?php
$db = new SQLite3('../data/cao.sqlite');
	$name=$_POST['name'];
	$ordercode=$_POST['ordercode'];
	$variety="";
	$book=$_POST['book'];
	$saledate=$_POST['saledate'];
	$comments=$_POST['comments'];
	$catagory=$_POST['catagory'];
	$sql="INSERT INTO meat VALUES ('$name','$ordercode','$variety','$book','$saledate','$comments','$catagory',NULL,NULL)";
	$db->exec($sql);
  echo "success";
