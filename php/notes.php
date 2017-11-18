<?php
$file = '../data/notes.txt';
if(isset($_GET['data'])){
    $current = $_GET['data'];
    file_put_contents($file, $current);
}
$content = file_get_contents($file);
echo $content;
