<?php

if($_SERVER['REQUEST_METHOD'] == 'POST') {

    var_dump($_POST['name']);

} else if($_SERVER['REQUEST_METHOD'] == 'PUT') {

    $putfp = fopen('php://input', 'r');
    $putdata = '';
    while($data = fread($putfp, 1024))
    $putdata .= $data;
    fclose($putfp);
    
    //header('Content-Type: application/json');

    echo $putdata;

}
