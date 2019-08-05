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
        <?php if($change > $poker->change){ ?>
            <form action="./include/pokerchange.php" method="post">
                <?php foreach($poker->hands as $playc => $hand): ?>
                    <h2 class="pokertext">
                        <?= $playc ?> <?php if($poker->change > 0) echo $poker->changecards[$playc]."枚交換した。" ?>
                    </h2>
                    <div class="cards">
                        <?php foreach($hand as $number => $card): ?>
                            <div class="card">
                                <?php if($playc == "Player"){ ?>
                                    <input id="<?= $number ?>" class="inputcard" type="checkbox" name="change[]" value="<?= $number ?>">
                                    <label for="<?= $number ?>">
                                        <img src="./image/<?= $card["number"] ?>of<?= $card["mark"] ?>.png" alt="<?= $card["mark"] ?>の<?= $card["number"] ?>" height="<?= $poker::CARD_HEIGHT ?>" width="<?= $poker::CARD_WIDTH ?>">
                                    </label>
                                <?php }else{ ?>
                                    <img src="./image/backcard.png" alt="CARD" height="<?= $poker::CARD_HEIGHT ?>" width="<?= $poker::CARD_WIDTH ?>">
                                <?php } ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <?php if($playc == "Player"){ ?>
                        <div class="submit">
                            <input type="submit" value="交換する">
                        </div>
                    <?php }else{ ?>
                        <?= $poker->comchange($hand,$playc) ?>
                    <?php } ?>
                    <input type="hidden" name="flag" value="1">
                <?php endforeach; ?>
            </form>
        <?php }else{ ?>
            <h1 class="pokertext">結果</h1>
            <?php $i = 0 ?>
            <?php foreach($poker->hands as $playc => $hand): ?>
                <h2 class="pokertext"><?= $playc ?></h2>
                    <?php $result[$i] = $poker->pokerrole($poker->hands[$playc]) ?>
                <h2 class="pokertext"><?= $result[$i][0] ?></h2>
                <div class="cards">
                    <?php foreach($hand as $number => $card): ?>
                        <div class="card">
                            <img src="./image/<?= $card["number"] ?>of<?= $card["mark"] ?>.png" alt="<?= $card["mark"] ?>の<?= $card["number"]?>" height="<?= $poker::CARD_HEIGHT ?>" width="<?= $poker::CARD_WIDTH ?>">
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php $i++ ?>
            <?php endforeach; ?>
            <?php $judge = $poker->strengthrole($result,$playnum) ?>
            <?php 
            for($i = 0;$i < $playnum;$i++){
                if($judge[$i][1] == 1){
                    $win = $i;
                }
            }
            ?>
            <div class='result'>
                <h2 class='pokertext'>勝者は<?= $poker->playchar[$win] ?>！</h2>
            </div>
            <?php $_SESSION = array() ?>
            <h3 class='submit'><a class='submit' href='poker.php'>戻る</a></h3>
        <?php } ?>
    </div>
</body>
</html>