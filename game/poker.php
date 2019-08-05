<?php
    include "include/poker.php";

    if(!isset($_SESSION["change"]) || $_SESSION["change"] == 0 || $_SESSION["game"] != "poker"){
        $_SESSION = array();
    }
    $playnum = 2;
    $change = 2;
    $poker = new poker($playnum,$change,1);
?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>ポーカー</title>
    <link rel="stylesheet" href="style.css" type="text/css">
</head>
<body id="pokerbody">
    <div id="header">
        <p><a href="index.php">トップページ</a></p>
    </div>
    <div id="poker">
        <?php
        if($change > $poker->change){
            $poker->displaycard();
        }else{
            $poker->result($playnum);
        }
        ?>
    </div>
</body>
</html>