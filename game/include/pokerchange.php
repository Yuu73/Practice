<?php
include "poker.php";

if(isset($_POST["flag"]) && $_POST["flag"] == 1){
    foreach($_SESSION["playchar"] as $playchar){
        if($playchar != "Player"){
            if(isset($_POST["change".$playchar])){
                foreach($_POST["change".$playchar] as $num){
                    $card = array_shift($_SESSION["deck"]);
                    $_SESSION["hands"][$playchar][$num]["mark"] = $card["mark"];
                    $_SESSION["hands"][$playchar][$num]["number"] = $card["number"];
                }
                $_SESSION["changecards"][$playchar] = count($_POST["change".$playchar]);
            }else{
                $_SESSION["changecards"][$playchar] = 0;
            }
        }else{
            if(isset($_POST["change"])){
                foreach($_POST["change"] as $num){
                    $card = array_shift($_SESSION["deck"]);
                    $_SESSION["hands"][$playchar][$num]["mark"] = $card["mark"];
                    $_SESSION["hands"][$playchar][$num]["number"] = $card["number"];
                }
                $_SESSION["changecards"][$playchar] = count($_POST["change"]);
            }else{
                $_SESSION["changecards"][$playchar] = 0;
            }
        }
    }
    $_SESSION["change"]++;
    header("Location: ../poker.php#poker");
    exit();
}
?>