<?php

if($_SERVER['REQUEST_METHOD'] == 'POST') {

    //var_dump($_POST['name']);

    echo json_encode(["errors"=>["The value field is required."]]);

} else if($_SERVER['REQUEST_METHOD'] == 'PUT') {

    $putfp = fopen('php://input', 'r');
    $putdata = '';
    while($data = fread($putfp, 1024))
    $putdata .= $data;
    fclose($putfp);
    
    //header('Content-Type: application/json');

    //echo $putdata;

    echo json_encode(["errors"=>["The value field is required."]]);

} else if ($_SERVER['REQUEST_METHOD'] == 'GET') {

    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_URL => 'http://loripsum.net/api/1/short/plaintext'
    ));
    $resp = curl_exec($curl);
    curl_close($curl);

    //echo json_encode([explode('=', $_SERVER['QUERY_STRING'])[1] => $resp]);
    echo json_encode([1=>"account",2=>"meta"]);
}
