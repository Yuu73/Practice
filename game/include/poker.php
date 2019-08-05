<?php
session_start();
class poker{
    public $deck; //トランプのデッキ
    public $marks;  //トランプのマーク
    public $playchar; //プレイヤーの種類
    private $phand = 5;   //各プレイヤーの手札の数
    const MAX_CARD = 52;    //カードの枚数
    private $max_card;  //各マークのトランプの枚数
    public $hands;    //各プレイヤーの手札
    public $change; //交換した回数
    const CARD_HEIGHT = 140;    //カードの高さ
    const CARD_WIDTH = 90; //カードの幅
    public $changecards;

    //各変数に値を代入しする。セッションが残っていた場合はセッションの値を代入する。
    public function __construct($playnum,$changecard,$sort){
        $_SESSION["game"] = "poker";
        $this->marks = array("spade","clover","diamond","heart");
        $this->max_card = intval(self::MAX_CARD / 4);

        //セッションに値が入っているか確認し、入っていたらそれらを代入する。
        if(isset($_SESSION["deck"]) && isset($_SESSION["hands"]) && isset($_SESSION["playchar"]) && isset($_SESSION["change"]) && isset($_SESSION["changecards"])){
            $this->deck = $_SESSION["deck"];
            $this->hands = $_SESSION["hands"];
            $this->playchar = $_SESSION["playchar"];
            $this->change = $_SESSION["change"];
            $this->changecards = $_SESSION["changecards"];

            //手札をソートする
            $this->sortcard($sort);
        }else{
            $this->playchar = array();
            $this->deck = array();
            $this->hands = array();
            $this->change = 0;
            $this->changecards = array();
            
            $this->players($playnum);

            //デッキを構築する
            foreach($this->marks as $mark){
                for($i = 1;$i <= 13;$i++){
                    $this->deck[] = array("mark" => $mark,"number" => $i);
                }
            }

            //デッキを混ぜる
            $this->shufflecard(1000);

            //デッキから各プレイヤーに必要な数だけ手札を配る
            $this->givecard($playnum);

            //手札をソートする
            $this->sortcard($sort);
        }
        //各項目をセッションに格納する
        $_SESSION["deck"] = $this->deck;
        $_SESSION["hands"] = $this->hands;
        $_SESSION["playchar"] = $this->playchar;
        $_SESSION["change"] = $this->change;
        $_SESSION["changecards"] = $this->changecards;
    }

    //デッキから各プレイヤーに必要な数だけ手札を配る
    protected function givecard($playnum){
        for($i = 1;$i <= $this->phand;$i++){
            for($j = 1;$j <= $playnum;$j++){
                $card = array_shift($this->deck);
                $this->hands[$this->playchar[$j-1]][] = array("mark" => $card["mark"],"number" => $card["number"]);
            }
        }
    }

    //人数に対して配列にcomと最後にプレイヤーを入れる
    protected function players($playnum){
        for($i = 1;$i <= $playnum;$i++){
            if($i == $playnum){
                $this->playchar[] = "Player";
            }else{
                $this->playchar[] = "Computer".$i;
            }
        }

        //手札にプレイヤーの種類を入れる
        for($i = 1;$i <= $playnum;$i++){
            $this->hands[$this->playchar[$i-1]] = array();
            $this->changecards[$this->playchar[$i-1]] = 0;
        }
    }

    //カードをまぜる第1引数にシャッフルする回数、第2引数にカードの枚数(初期値は52)を入れる
    protected function shufflecard($suffle,$max = self::MAX_CARD){
        for($i = 0;$i < $suffle;$i++){
            $num1 = mt_rand(0,$max-1);
            $num2 = mt_rand(0,$max-1);
            $tmp = $this->deck[$num1];
            $this->deck[$num1] = $this->deck[$num2];
            $this->deck[$num2] = $tmp;
        }
    }

    //カードに強さを付ける。$ifが1だと数字>マークで2だとマーク>数字になる
    protected function comparecard($mk,$num,$if){
        $sum = 0;
        if($if == 1){
            switch($mk){
                case "spade":
                $sum += $num*count($this->marks)-3;
                break;
                case "clover":
                $sum += $num*count($this->marks)-2;
                break;
                case "diamond":
                $sum += $num*count($this->marks)-1;
                break;
                case "heart":
                $sum += $num*count($this->marks);
                break;
                default:
            }
            $sum = self::MAX_CARD + 1 - $sum;
        }elseif($if == 2){
            switch($mk){
                case "spade":
                $sum += $this->max_card*3;
                break;
                case "clover":
                $sum += $this->max_card*2;
                break;
                case "diamond":
                $sum += $this->max_card;
                break;
                case "heart":
                $sum += 0;
                break;
                default:
            }
            $sum += $this->max_card + 1 - $num;
        }
        return $sum;
    }

    //カードをソートする$ifを1にすると数字>マークで2にするとマーク>数字でソートする
    protected function sortcard($if){
        foreach($this->hands as $playc => $hand){
            for($i = 0;$i < $this->phand;$i++){
                for($j = $i+1;$j < $this->phand;$j++){
                    $card1 = $this->comparecard($this->hands[$playc][$i]["mark"],$this->hands[$playc][$i]["number"],$if);
                    $card2 = $this->comparecard($this->hands[$playc][$j]["mark"],$this->hands[$playc][$j]["number"],$if);
                    if($card1 < $card2){
                        $tmp = $this->hands[$playc][$i]["mark"];
                        $this->hands[$playc][$i]["mark"] = $this->hands[$playc][$j]["mark"];
                        $this->hands[$playc][$j]["mark"] = $tmp;
                        $tmp = $this->hands[$playc][$i]["number"];
                        $this->hands[$playc][$i]["number"] = $this->hands[$playc][$j]["number"];
                        $this->hands[$playc][$j]["number"] = $tmp;
                    }
                }
            }
        }
    }

    //カードを画面に表示する
    public function displaycard(){
        echo "<form action='./include/pokerchange.php' method='post'>";
        foreach($this->hands as $playc => $hand){
            echo "<h2 class='pokertext'>".$playc;
            if($this->change > 0){
                echo " ".$this->changecards[$playc]."枚交換した。";
            }
            echo "</h2>";
            echo "<div class='cards'>";
            foreach($hand as $number => $card){
                echo "<div class='card'>";
                if($playc == "Player"){
                    echo "<input id='".$number."' class='inputcard' type='checkbox' name='change[]' value='".$number."'>";
                    echo "<label for='".$number."'><img src='./image/".$card["number"]."of".$card["mark"].".png' alt='".$card["mark"]."の".$card["number"]."' height='".self::CARD_HEIGHT."' width='".self::CARD_WIDTH."'></label>";
                    //echo "<label class='label' for='".$number."'>".$card["mark"]."の".$card["number"]."</label>";
                }else{
                    echo "<img src='./image/backcard.png' alt='CARD' height='".self::CARD_HEIGHT."' width='".self::CARD_WIDTH."'><br>";
                    //echo $card["mark"]."の".$card["number"];
                }
                echo "</div>";
            }
            echo "</div>";
            if($playc == "Player"){
                echo "<div class='submit'><input type='submit' value='交換する'></div>";
            }else{
                $this->comchange($hand,$playc);
            }
            echo "<input type='hidden' name='flag' value='1'>";
        }
        echo "</form>";
    }

    //結果を計算し画面に表示する
    public function result($playnum){
        $result = array();
        $judge = array();
        $win = 0;
        echo "<h1 class='pokertext'>結果</h1>";
        $i = 0;
        foreach($this->hands as $playc => $hand){
            echo "<h2 class='pokertext'>".$playc."</h2>";
            $result[$i] = array();
            $result[$i] = $this->pokerrole($this->hands[$playc]);
            echo "<h2 class='pokertext'>".$result[$i][0]."</h2>";
            $judge[$i] = array();
            echo "<div class='cards'>";
            foreach($hand as $number => $card){
                echo "<div class='card'>";
                echo "<img src='./image/".$card["number"]."of".$card["mark"].".png' alt='".$card["mark"]."の".$card["number"]."' height='".self::CARD_HEIGHT."' width='".self::CARD_WIDTH."'><br>";
                //echo $card["mark"]."の".$card["number"];
                echo "</div>";
            }
            echo "</div>";
            $i++;
        }
        $judge = $this->strengthrole($result,$playnum);
        for($i = 0;$i < $playnum;$i++){
            if($judge[$i][1] == 1){
                $win = $i;
            }
        }
        echo "<div class='result'><h2 class='pokertext'>勝者は".$this->playchar[$win]."！</h2></div>";
        $_SESSION = array();
    echo "<h3 class='submit'><a class='submit' href='poker.php'>戻る</a></h3>";
    }

    //ロイヤルストレートフラッシュ-ストレートフラッシュ-フォーカード-フルハウス-フラッシュ-ストレート-スリーカード-ツーペア-ワンペア-ノーペア
    //上記の役のいずれがそろっているかを調べる
    //戻り値は配列で役・判定に必要な数字・判定に必要なマークの3要素
    private function pokerrole($hand){
        //同じ数字があるかどうか調べる
        $numrolen = $this->numscrutiny($hand,1);
        //同じ数字があり、かつ複数ある場合
        if($numrolen[0] > 1 && $numrolen[1] > 0){
            //同じ数字の数が3つある場合
            if($numrolen[0] == 3){
                $result = array("フルハウス！",$numrolen[2],$numrolen[3]);
                return $result;
            }else{
                $result = array("ツーペア！",$numrolen[2],$numrolen[3]);
                return $result;
            }
        //同じ数字が4枚ある場合
        }elseif($numrolen[0] == 4){
            $result = array("フォーカード！",$numrolen[2],$numrolen[3]);
            return $result;
        //同じ数字が3枚ある場合
        }elseif($numrolen[0] == 3){
            $result = array("スリーカード！",$numrolen[2],$numrolen[3]);
            return $result;
        //同じ数字が2枚ある場合
        }elseif($numrolen[0] == 2){
            $result = array("ワンペア！",$numrolen[2],$numrolen[3]);
            return $result;
        }else{
            //ストレートになってるか調べる
            $numrole = $this->numscrutiny($hand,2);
            //ストレートになっている場合
            if($numrole[0] == 4){
                //フラッシュになってるか調べる
                $numrole = $this->numscrutiny($hand,3);
                //フラッシュだった場合
                if($numrole[0] == 5){
                    $min = 0;
                    $tmp = 0;
                    for($i = 0;$i < $this->phand;$i++){
                        if($hand[$i]["number"] == 1){
                            $tmp = 14;
                        }else{
                            $tmp = $hand[$i]["number"];
                        }
                        if($tmp < $min){
                            $min = $hand[$i]["number"];
                        }
                    }
                    //10・11・12・13・Aの並びだった場合
                    if($tmp == 10){
                        $result = array("ロイヤルストレートフラッシュ！！",$numrole[1],$numrole[2]);
                        return $result;
                    }else{
                        $result = array("ストレートフラッシュ！",$numrole[1],$numrole[2]);
                        return $result;
                    }
                }else{
                    $result = array("ストレート！",$numrole[1],$numrole[2]);
                    return $result;
                }
            }else{
                //フラッシュになってるか調べる
                $numrole = $this->numscrutiny($hand,3);
                //フラッシュだった場合
                if($numrole[0] == 5){
                    $result = array("フラッシュ！",$numrole[1],$numrole[2]);
                    return $result;
                //何も当てはまらない場合ノーペア
                }else{
                    $result = array("ノーペア",$numrole[1],$numrole[2]);
                    return $result;
                }
            }
        }
    }

    //$ifが1だと同じ数を探す、2だと連続した数字のカードの枚数を調べる、3だと最も多いマークの枚数調べる。
    //$ifが1の場合戻り値は[同じ数字の枚数][同じ数字が複数個あるか][数字][マーク]
    //$ifが2か3の場合戻り値は[2は並んでいる数字の数・3は最も多いマークの枚数][数字][マーク]
    private function numscrutiny($hand,$if){
        $strength = 0;
        //同じ数字を探す
        if($if == 1){
            //$sum[同じ数字のカードが最も多い数字の枚数][同じ数字のカードが複数あるか][数字][マーク]
            $sum = array(1,0,0,"");
            //1～13がそれぞれ何枚あるか調べる
            for($i = 1;$i <= $this->max_card;$i++){
                $tmp = 0;
                $tmpm = "";
                for($j = 0;$j < $this->phand;$j++){
                    //調べたい数字と手札の数字が同じなら$tmpの数を増やす
                    if($hand[$j]["number"] == $i){
                        $tmp++;
                        //$tmpmに何も入っていない場合現在のカードのマークを入れる
                        if($tmpm == ""){
                            $tmpm = $hand[$j]["mark"];
                        }
                    }
                }
                //状況ごとに$sumに数字を代入していく
                if($tmp > $sum[0] && $sum[0] > 1){
                    $sum[0] = $tmp;
                    $sum[1]++;
                    $sum[2] = $i;
                    $sum[3] = $tmpm;
                }elseif($tmp > 1 && $sum[0] > 1){
                    $sum[1]++;
                    
                    if($tmp == $sum[0]){
                        if($sum[2] != 1){
                            $sum[2] = $i;
                            $sum[3] = $tmpm;
                        }
                    }
                }elseif($tmp > $sum[0]){
                    $sum[0] = $tmp;
                    $sum[2] = $i;
                    $sum[3] = $tmpm;
                }
            }
            return $sum;
        //連続した数字のカードの枚数を調べる
        }elseif($if == 2){
            //$sum[連続した数字のカードの枚数][数字][マーク]
            $sum = array(0,0,"");
            $min = $this->max_card;
            $tmp = 0;
            $tmpn = 0;
            $tmpm = 0;
            for($i = 0;$i < $this->phand;$i++){
                //カードの中で最も数字の小さい数を調べ$minに格納
                if($hand[$i]["number"] < $min){
                    $min = $hand[$i]["number"];
                }
                //2と13が両方手札にあった場合ストレートはできないので判定する
                //ちなみに先に$if=1を実行し同じ数字がないことを確認していることを前提に動いているので、
                //同じ数字がある場合誤作動する可能性がある。
                if($hand[$i]["number"] == 2 || $hand[$i]["number"] == 13){
                    $tmp++;
                }
            }
            //2と13が両方あった場合ストレートにはならないので終了
            if($tmp >= 2){
                return $sum;
            }
            for($i = 1;$i < $this->phand;$i++){
                $bflag = isset($flag) ? $flag : 3;
                $flag = 0;
                for($j = 0;$j < $this->phand;$j++){
                    //前回の判定で$minより±$iした数字を持ってたかによって処理を変える
                    //0・なかったので即終了。1・上があったのでさらに上を調べる。
                    //2・下があったのでさらに下を調べる。3・上下両方あったのでさらに上下調べる。
                    switch($bflag){
                        case 0:
                        break;
                        case 1:
                        if($min+$i > $this->max_card){
                            $tmp = $min+$i - $this->max_card;
                        }else{
                            $tmp = $min+$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $sum[0]++;
                            $flag += 1;
                            $tmpn = $hand[$j]["number"];
                            $tmpm = $hand[$j]["mark"];
                        }
                        break;
                        case 2:
                        if($min-$i < 1){
                            $tmp = $min-$i + $this->max_card;
                        }else{
                            $tmp = $min-$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $sum[0]++;
                            $flag += 2;
                        }
                        break;
                        case 3:
                        if($min+$i > $this->max_card){
                            $tmp = $min+$i - $this->max_card;
                        }else{
                            $tmp = $min+$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $sum[0]++;
                            $flag += 1;
                            $tmpn = $hand[$j]["number"];
                            $tmpm = $hand[$j]["mark"];
                        }
                        if($min-$i < 1){
                            $tmp = $min-$i + $this->max_card;
                        }else{
                            $tmp = $min-$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $sum[0]++;
                            $flag += 2;
                        }
                        break;
                        default:
                    }
                }
            }
            $sum[1] = $tmpn;
            $sum[2] = $tmpm;
            $flag = NULL;
            return $sum;
        }elseif($if == 3){
            $sum = array(0,0,"");
            $tmpn = 0;
            $tmpm = "";
            foreach($this->marks as $mark){
                $tmp = 0;
                for($i = 0;$i < $this->phand;$i++){
                    if($hand[$i]["mark"] == $mark){
                        $tmp++;
                    }
                    if($hand[$i]["number"] > $tmpn && $tmpn != 1){
                        $tmpn = $hand[$i]["number"];
                        $tmpm = $hand[$i]["mark"];
                    }
                }
                if($sum[0] < $tmp){
                    $sum[0] = $tmp;
                }
            }
            $sum[1] = $tmpn;
            $sum[2] = $tmpm;
            return $sum;
        }
    }
    //勝敗と得点を付ける。
    protected function strengthrole($result,$playnum){
        $totals = array();
        $win = 0;
        $tmp = 0;
        for($i = 0;$i < $playnum;$i++){
            $total = array(0,0);
            switch($result[$i][0]){
                case "ロイヤルストレートフラッシュ！！":
                $total[0] += 50000;
                break;
                case "ストレートフラッシュ！":
                $total[0] += 10000;
                break;
                case "フォーカード！":
                $total[0] += 8000;
                break;
                case "フルハウス！":
                $total[0] += 5000;
                break;
                case "フラッシュ！":
                $total[0] += 4000;
                break;
                case "ストレート！":
                $total[0] += 3000;
                break;
                case "スリーカード！":
                $total[0] += 2000;
                break;
                case "ツーペア！":
                $total[0] += 1000;
                break;
                case "ワンペア！":
                $total[0] += 500;
                break;
                case "ノーペア":
                break;
            }
            if($result[$i][1] == 1){
                $total[0] += $this->max_card * 10;
            }else{
                $total[0] += ($result[$i][1] - 1) * 10;
            }
            foreach($this->marks as $num => $mark){
                if($result[$i][2] == $mark){
                    $total[0] += 4 - $num;
                }
            }
            $totals[$i] = array();
            $totals[$i] = $total;
        }
        for($i = 0;$i < $playnum;$i++){
            if($totals[$i][0] > $tmp){
                $tmp = $totals[$i][0];
                $win = $i;
            }
        }
        for($i = 0;$i < $playnum;$i++){
            if($i == $win){
                $totals[$i][1] = 1;
            }else{
                $totals[$i][1] = 0;
            }
        }
        return $totals;
    }

    //ストレートフラッシュ・フォーカード・フルハウス・フラッシュ・ストレートの場合交換しない
    //4枚同じマークの場合それらは交換しない→4つ並んだ数字の場合それらは交換しない→
    //ストレートリーチ(中抜け)の場合それらは交換しない→
    //3枚同じ数字の場合それらは交換しない→2枚同じ数字が2組の場合それらは交換しない→
    //2枚同じ数字があるときそれらは交換しない→3枚同じマークがあるときそれらは交換しない→
    //これらに当てはまらないときは全部交換
    private function comchange($hand,$playc){
        //同じ数字があるかどうか調べる
        $numrolen = $this->numscrutiny($hand,1);
        if($numrolen[0] > 1 && $numrolen[1] > 0){
            if($numrolen[0] == 3){
                return;
            }
        }elseif($numrolen[0] > 3){
            return;
        }else{
            //ストレートになってるか調べる
            $numrole = $this->numscrutiny($hand,2);
            if($numrole[0] == 4){
                return;
            }else{
                //フラッシュになってるか調べる
                $numrole = $this->numscrutiny($hand,3);
                if($numrole[0] == 5){
                    return;
                }
            }
        }
        //4枚同じマークの場合それらは交換しない
        foreach($this->marks as $mark){
            $cards = array();
            $tmp = 0;
            for($i = 0;$i < $this->phand;$i++){
                if($hand[$i]["mark"] == $mark){
                    $cards[$tmp] = $i;
                    $tmp++;
                }
            }
            if($tmp >= 4){
                for($i = 0;$i < $this->phand;$i++){
                    $flag = 0;
                    for($j = 0;$j < $tmp;$j++){
                        if($cards[$j] == $i){
                            $flag = 1;
                        }
                    }
                    if($flag == 0){
                        echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                    }
                }
                return;
            }
        }

        //4つ並んだ数字の場合それらは交換しない
        $min = $this->max_card;
        $max = 0;
        $tmp = 0;
        $cards = array(array(),array());
        for($i = 0;$i < $this->phand;$i++){
            if($hand[$i]["number"] < $min){
                $min = $hand[$i]["number"];
                $cards[0][0] = $i;
            }
            if($hand[$i]["number"] > $max){
                $max = $hand[$i]["number"];
                $cards[1][0] = $i;
            }
            if($hand[$i]["number"] == 2 || $hand[$i]["number"] == 13){
                $tmp++;
            }
        }
        $summin = 0;
        $summax = 0;
        if($tmp < 2){
            for($i = 1;$i < $this->phand-1;$i++){
                $bflagmin = isset($flagmin) ? $flagmin : 3;
                $bflagmax = isset($flagmax) ? $flagmax : 3;
                $flagmin = 0;
                $flagmax = 0;
                for($j = 0;$j < $this->phand;$j++){
                    switch($bflagmin){
                        case 0:
                        break;
                        case 1:
                        if($min+$i > $this->max_card){
                            $tmp = $min+$i - $this->max_card;
                        }else{
                            $tmp = $min+$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summin++;
                            $cards[0][$summin] = $j;
                            $flagmin += 1;
                        }
                        break;
                        case 2:
                        if($min-$i < 1){
                            $tmp = $min-$i + $this->max_card;
                        }else{
                            $tmp = $min-$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summin++;
                            $cards[0][$summin] = $j;
                            $flagmin += 2;
                        }
                        break;
                        case 3:
                        if($min+$i > $this->max_card){
                            $tmp = $min+$i - $this->max_card;
                        }else{
                            $tmp = $min+$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summin++;
                            $cards[0][$summin] = $j;
                            $flagmin += 1;
                        }
                        if($min-$i < 1){
                            $tmp = $min-$i + $this->max_card;
                        }else{
                            $tmp = $min-$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summin++;
                            $cards[0][$summin] = $j;
                            $flagmin += 2;
                        }
                        break;
                        default:
                    }
                    switch($bflagmax){
                        case 0:
                        break;
                        case 1:
                        if($max+$i > $this->max_card){
                            $tmp = $max+$i - $this->max_card;
                        }else{
                            $tmp = $max+$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summax++;
                            $cards[1][$summax] = $j;
                            $flagmax += 1;
                        }
                        break;
                        case 2:
                        if($max-$i < 1){
                            $tmp = $max-$i + $this->max_card;
                        }else{
                            $tmp = $max-$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summax++;
                            $cards[1][$summax] = $j;
                            $flagmax += 2;
                        }
                        break;
                        case 3:
                        if($max+$i > $this->max_card){
                            $tmp = $max+$i - $this->max_card;
                        }else{
                            $tmp = $max+$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summax++;
                            $cards[1][$summax] = $j;
                            $flagmax += 1;
                        }
                        if($max-$i < 1){
                            $tmp = $max-$i + $this->max_card;
                        }else{
                            $tmp = $max-$i;
                        }
                        if($hand[$j]["number"] == $tmp){
                            $summax++;
                            $cards[1][$summax] = $j;
                            $flagmax += 2;
                        }
                        break;
                        default:
                    }
                }
            }
            $flagmin = NULL;
            $flagmax = NULL;
            if($summin >= 3 || $summax >= 3){
                if($summin > $summax){
                    for($i = 0;$i < $this->phand;$i++){
                        $flag = 0;
                        for($j = 0;$j <= $summin;$j++){
                            if($cards[0][$j] == $i){
                                $flag = 1;
                            }
                        }
                        if($flag == 0){
                            echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                        }
                    }
                }else{
                    for($i = 0;$i < $this->phand;$i++){
                        $flag = 0;
                        for($j = 0;$j <= $summax;$j++){
                            if($cards[1][$j] == $i){
                                $flag = 1;
                            }
                        }
                        if($flag == 0){
                            echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                        }
                    }
                }
                return;
            }
        }

        //ストレートリーチ(中抜け)の場合それらは交換しない
        for($i = $this->max_card+1;$i >= 5;$i--){
            $cards = array();
            $sum = 0;
            for($j = $i;$j > $i-$this->phand;$j--){
                $flag = 0;
                for($k = 0;$k < $this->phand;$k++){
                    if($hand[$k]["number"] == $j || $hand[$k]["number"] == $j - $this->max_card){
                        $flag = 1;
                        $cards[$sum] = $k;
                    }
                }
                if($flag == 1){
                    $sum++;
                }
            }
            if($sum >= 4){
                for($i = 0;$i < $this->phand;$i++){
                    $flag = 0;
                    for($j = 0;$j < $sum;$j++){
                        if($cards[$j] == $i){
                            $flag = 1;
                        }
                    }
                    if($flag == 0){
                        echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                    }
                }
                return;
            }
        }

        //3枚同じ数字の場合それらは交換しない→2枚同じ数字が2組の場合それらは交換しない→
        //2枚同じ数字があるときそれらは交換しない
        $sum = 1;
        $cards = array();
        $two = 1;
        for($i = 1;$i <= $this->max_card;$i++){
            $tmp = 0;
            for($j = 0;$j < $this->phand;$j++){
                if($hand[$j]["number"] == $i && $sum < 2){
                    $cards[$tmp] = $j;
                    $tmp++;
                }elseif($hand[$j]["number"] == $i){
                    $cards[$tmp+$sum] = $j;
                    $tmp++;
                }
            }
            if($tmp > $sum){
                $sum = $tmp;
            }elseif($sum > 1 && $tmp > 1){
                $two++;
                break;
            }
        }
        if($sum >= 3){
            for($i = 0;$i < $this->phand;$i++){
                $flag = 0;
                for($j = 0;$j < $sum;$j++){
                    if($cards[$j] == $i){
                        $flag = 1;
                    }
                }
                if($flag == 0){
                    echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                }
            }
            return;
        }elseif($sum >= 2 && $two >= 2){
            for($i = 0;$i < $this->phand;$i++){
                $flag = 0;
                for($j = 0;$j < $sum+$two;$j++){
                    if($cards[$j] == $i){
                        $flag = 1;
                    }
                }
                if($flag == 0){
                    echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                }
            }
            return;
        }elseif($sum >= 2){
            for($i = 0;$i < $this->phand;$i++){
                $flag = 0;
                for($j = 0;$j < $sum;$j++){
                    if($cards[$j] == $i){
                        $flag = 1;
                    }
                }
                if($flag == 0){
                    echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                }
            }
            return;
        }

        //3枚同じマークがあるときそれらは交換しない
        foreach($this->marks as $mark){
            $cards = array();
            $tmp = 0;
            for($i = 0;$i < $this->phand;$i++){
                if($hand[$i]["mark"] == $mark){
                    $cards[$tmp] = $i;
                    $tmp++;
                }
            }
            if($tmp >= 3){
                for($i = 0;$i < $this->phand;$i++){
                    $flag = 0;
                    for($j = 0;$j < $tmp;$j++){
                        if($cards[$j] == $i){
                            $flag = 1;
                        }
                    }
                    if($flag == 0){
                        echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
                    }
                }
                return;
            }
        }

        //これらに当てはまらないときは全部交換
        for($i = 0;$i < $this->phand;$i++){
            echo "<input type='hidden' name='change".$playc."[]' value='".$i."'>";
        }
        return;
    }
}
?>