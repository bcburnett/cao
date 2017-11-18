<?php
echo curl_exec( curl_init('http://api.upcdatabase.org/json/3455ee1ec8a973d2b1955f8edda004c2/'.$_GET['upc']));
