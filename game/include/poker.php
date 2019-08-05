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
            $temp = $this->deck[$num1];
            $this->deck[$num1] = $this->deck[$num2];
            $this->deck[$num2] = $temp;
        }
    }

    //カードに強さを付ける。$patternが1だと数字>マークで2だとマーク>数字になる
    protected function comparecard($mk,$num,$pattern){
        $sum = 0;
        if($pattern == 1){
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
        }elseif($pattern == 2){
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

    //カードをソートする$patternを1にすると数字>マークで2にするとマーク>数字でソートする
    protected function sortcard($pattern){
        foreach($this->hands as $playc => $hand){
            for($i = 0;$i < $this->phand;$i++){
                for($j = $i+1;$j < $this->phand;$j++){
                    $card1 = $this->comparecard($this->hands[$playc][$i]["mark"],$this->hands[$playc][$i]["number"],$pattern);
                    $card2 = $this->comparecard($this->hands[$playc][$j]["mark"],$this->hands[$playc][$j]["number"],$pattern);
                    if($card1 < $card2){
                        $temp = $this->hands[$playc][$i]["mark"];
                        $this->hands[$playc][$i]["mark"] = $this->hands[$playc][$j]["mark"];
                        $this->hands[$playc][$j]["mark"] = $temp;
                        $temp = $this->hands[$playc][$i]["number"];
                        $this->hands[$playc][$i]["number"] = $this->hands[$playc][$j]["number"];
                        $this->hands[$playc][$j]["number"] = $temp;
                    }
                }
            }
        }
    }
    
    //ロイヤルストレートフラッシュ-ストレートフラッシュ-フォーカード-フルハウス-フラッシュ-ストレート-スリーカード-ツーペア-ワンペア-ノーペア
    //上記の役のいずれがそろっているかを調べる
    //戻り値は配列で役・判定に必要な数字・判定に必要なマークの3要素
    public function pokerrole($hand){
        //同じ数字があるかどうか調べる
        $handRolen = $this->numscrutiny($hand,1);
        //同じ数字があり、かつ複数ある場合
        if($handRolen[0] > 1 && $handRolen[1] > 0){
            //同じ数字の数が3つある場合
            if($handRolen[0] == 3){
                $resultInfo = array("フルハウス！",$handRolen[2],$handRolen[3]);
                return $resultInfo;
            }else{
                $resultInfo = array("ツーペア！",$handRolen[2],$handRolen[3]);
                return $resultInfo;
            }
        //同じ数字が4枚ある場合
        }elseif($handRolen[0] == 4){
            $resultInfo = array("フォーカード！",$handRolen[2],$handRolen[3]);
            return $resultInfo;
        //同じ数字が3枚ある場合
        }elseif($handRolen[0] == 3){
            $resultInfo = array("スリーカード！",$handRolen[2],$handRolen[3]);
            return $resultInfo;
        //同じ数字が2枚ある場合
        }elseif($handRolen[0] == 2){
            $resultInfo = array("ワンペア！",$handRolen[2],$handRolen[3]);
            return $resultInfo;
        }else{
            //ストレートになってるか調べる
            $handRole = $this->numscrutiny($hand,2);
            //ストレートになっている場合
            if($handRole[0] == 4){
                //フラッシュになってるか調べる
                $handRole = $this->numscrutiny($hand,3);
                //フラッシュだった場合
                if($handRole[0] == 5){
                    $min = 0;
                    $cardNumber = 0;
                    for($i = 0;$i < $this->phand;$i++){
                        if($hand[$i]["number"] == 1){
                            $cardNumber = 14;
                        }else{
                            $cardNumber = $hand[$i]["number"];
                        }
                        if($cardNumber < $min){
                            $min = $hand[$i]["number"];
                        }
                    }
                    //10・11・12・13・Aの並びだった場合
                    if($cardNumber == 10){
                        $resultInfo = array("ロイヤルストレートフラッシュ！！",$handRole[1],$handRole[2]);
                        return $resultInfo;
                    }else{
                        $resultInfo = array("ストレートフラッシュ！",$handRole[1],$handRole[2]);
                        return $resultInfo;
                    }
                }else{
                    $resultInfo = array("ストレート！",$handRole[1],$handRole[2]);
                    return $resultInfo;
                }
            }else{
                //フラッシュになってるか調べる
                $handRole = $this->numscrutiny($hand,3);
                //フラッシュだった場合
                if($handRole[0] == 5){
                    $resultInfo = array("フラッシュ！",$handRole[1],$handRole[2]);
                    return $resultInfo;
                //何も当てはまらない場合ノーペア
                }else{
                    $resultInfo = array("ノーペア",$handRole[1],$handRole[2]);
                    return $resultInfo;
                }
            }
        }
    }

    //$patternが1だと同じ数を探す、2だと連続した数字のカードの枚数を調べる、3だと最も多いマークの枚数調べる。
    //$patternが1の場合戻り値は[同じ数字の枚数][同じ数字が複数個あるか][数字][マーク]
    //$patternが2か3の場合戻り値は[2は並んでいる数字の数・3は最も多いマークの枚数][数字][マーク]
    private function numscrutiny($hand,$pattern){
        $strength = 0;
        //同じ数字を探す
        if($pattern == 1){
            //$info[同じ数字のカードが最も多い数字の枚数][同じ数字のカードが複数あるか][数字][マーク]
            $info = array(1,0,0,"");
            //1～13がそれぞれ何枚あるか調べる
            for($i = 1;$i <= $this->max_card;$i++){
                $numberOfCards = 0;
                $strongMark = "";
                for($j = 0;$j < $this->phand;$j++){
                    //調べたい数字と手札の数字が同じなら$numberOfCardsの数を増やす
                    if($hand[$j]["number"] == $i){
                        $numberOfCards++;
                        //$strongMarkに何も入っていない場合現在のカードのマークを入れる
                        if($strongMark == ""){
                            $strongMark = $hand[$j]["mark"];
                        }
                    }
                }
                //状況ごとに$infoに数字を代入していく
                if($numberOfCards > $info[0] && $info[0] > 1){
                    $info[0] = $numberOfCards;
                    $info[1]++;
                    $info[2] = $i;
                    $info[3] = $strongMark;
                }elseif($numberOfCards > 1 && $info[0] > 1){
                    $info[1]++;
                    
                    if($numberOfCards == $info[0]){
                        if($info[2] != 1){
                            $info[2] = $i;
                            $info[3] = $strongMark;
                        }
                    }
                }elseif($numberOfCards > $info[0]){
                    $info[0] = $numberOfCards;
                    $info[2] = $i;
                    $info[3] = $strongMark;
                }
            }
            return $info;
        //連続した数字のカードの枚数を調べる
        }elseif($pattern == 2){
            //$info[連続した数字のカードの枚数][数字][マーク]
            $info = array(0,0,"");
            $min = $this->max_card;
            $matchCard = 0;
            $strongNumber = 0;
            $strongMark = 0;
            for($i = 0;$i < $this->phand;$i++){
                //カードの中で最も数字の小さい数を調べ$minに格納
                if($hand[$i]["number"] < $min){
                    $min = $hand[$i]["number"];
                }
                //2と13が両方手札にあった場合ストレートはできないので判定する
                //ちなみに先に$pattern=1を実行し同じ数字がないことを確認していることを前提に動いているので、
                //同じ数字がある場合誤作動する可能性がある。
                if($hand[$i]["number"] == 2 || $hand[$i]["number"] == 13){
                    $matchCard++;
                }
            }
            //2と13が両方あった場合ストレートにはならないので終了
            if($matchCard >= 2){
                return $info;
            }
            for($i = 1;$i < $this->phand;$i++){
                $beforeFlag = isset($flag) ? $flag : 3;
                $flag = 0;
                for($j = 0;$j < $this->phand;$j++){
                    //前回の判定で$minより±$iした数字を持ってたかによって処理を変える
                    //0・なかったので即終了。1・上があったのでさらに上を調べる。
                    //2・下があったのでさらに下を調べる。3・上下両方あったのでさらに上下調べる。
                    switch($beforeFlag){
                        case 0:
                        break;
                        case 1:
                        if($min+$i > $this->max_card){
                            $matchCard = $min+$i - $this->max_card;
                        }else{
                            $matchCard = $min+$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $info[0]++;
                            $flag += 1;
                            $strongNumber = $hand[$j]["number"];
                            $strongMark = $hand[$j]["mark"];
                        }
                        break;
                        case 2:
                        if($min-$i < 1){
                            $matchCard = $min-$i + $this->max_card;
                        }else{
                            $matchCard = $min-$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $info[0]++;
                            $flag += 2;
                        }
                        break;
                        case 3:
                        if($min+$i > $this->max_card){
                            $matchCard = $min+$i - $this->max_card;
                        }else{
                            $matchCard = $min+$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $info[0]++;
                            $flag += 1;
                            $strongNumber = $hand[$j]["number"];
                            $strongMark = $hand[$j]["mark"];
                        }
                        if($min-$i < 1){
                            $matchCard = $min-$i + $this->max_card;
                        }else{
                            $matchCard = $min-$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $info[0]++;
                            $flag += 2;
                        }
                        break;
                        default:
                    }
                }
            }
            $info[1] = $strongNumber;
            $info[2] = $strongMark;
            $flag = NULL;
            return $info;
        }elseif($pattern == 3){
            $info = array(0,0,"");
            $strongNumber = 0;
            $strongMark = "";
            foreach($this->marks as $mark){
                $matchCardCount = 0;
                for($i = 0;$i < $this->phand;$i++){
                    if($hand[$i]["mark"] == $mark){
                        $matchCardCount++;
                    }
                    if($hand[$i]["number"] > $strongNumber && $strongNumber != 1){
                        $strongNumber = $hand[$i]["number"];
                        $strongMark = $hand[$i]["mark"];
                    }
                }
                if($info[0] < $matchCardCount){
                    $info[0] = $matchCardCount;
                }
            }
            $info[1] = $strongNumber;
            $info[2] = $strongMark;
            return $info;
        }
    }
    //勝敗と得点を付ける。
    public function strengthrole($resultInfo,$playnum){
        $totals = array();
        $win = 0;
        $highScore = 0;
        for($i = 0;$i < $playnum;$i++){
            $total = array(0,0);
            switch($resultInfo[$i][0]){
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
            if($resultInfo[$i][1] == 1){
                $total[0] += $this->max_card * 10;
            }else{
                $total[0] += ($resultInfo[$i][1] - 1) * 10;
            }
            foreach($this->marks as $num => $mark){
                if($resultInfo[$i][2] == $mark){
                    $total[0] += 4 - $num;
                }
            }
            $totals[$i] = array();
            $totals[$i] = $total;
            if($totals[$i][0] > $highScore){
                $highScore = $totals[$i][0];
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
    public function comchange($hand,$playc){
        //同じ数字があるかどうか調べる
        $handRolen = $this->numscrutiny($hand,1);
        if($handRolen[0] > 1 && $handRolen[1] > 0){
            if($handRolen[0] == 3){
                return;
            }
        }elseif($handRolen[0] > 3){
            return;
        }else{
            //ストレートになってるか調べる
            $handRole = $this->numscrutiny($hand,2);
            if($handRole[0] == 4){
                return;
            }else{
                //フラッシュになってるか調べる
                $handRole = $this->numscrutiny($hand,3);
                if($handRole[0] == 5){
                    return;
                }
            }
        }
        //4枚同じマークの場合それらは交換しない
        foreach($this->marks as $mark){
            $roleCards = array();
            $matchCard = 0;
            for($i = 0;$i < $this->phand;$i++){
                if($hand[$i]["mark"] == $mark){
                    $roleCards[$matchCard] = $i;
                    $matchCard++;
                }
            }
            if($matchCard >= 4){
                for($i = 0;$i < $this->phand;$i++){
                    $flag = 0;
                    for($j = 0;$j < $matchCard;$j++){
                        if($roleCards[$j] == $i){
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
        $matchCard = 0;
        $roleCards = array(array(),array());
        for($i = 0;$i < $this->phand;$i++){
            if($hand[$i]["number"] < $min){
                $min = $hand[$i]["number"];
                $roleCards[0][0] = $i;
            }
            if($hand[$i]["number"] > $max){
                $max = $hand[$i]["number"];
                $roleCards[1][0] = $i;
            }
            if($hand[$i]["number"] == 2 || $hand[$i]["number"] == 13){
                $matchCard++;
            }
        }
        $summin = 0;
        $summax = 0;
        if($matchCard < 2){
            for($i = 1;$i < $this->phand-1;$i++){
                $beforeFlagmin = isset($flagmin) ? $flagmin : 3;
                $beforeFlagmax = isset($flagmax) ? $flagmax : 3;
                $flagmin = 0;
                $flagmax = 0;
                for($j = 0;$j < $this->phand;$j++){
                    switch($beforeFlagmin){
                        case 0:
                        break;
                        case 1:
                        if($min+$i > $this->max_card){
                            $matchCard = $min+$i - $this->max_card;
                        }else{
                            $matchCard = $min+$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summin++;
                            $roleCards[0][$summin] = $j;
                            $flagmin += 1;
                        }
                        break;
                        case 2:
                        if($min-$i < 1){
                            $matchCard = $min-$i + $this->max_card;
                        }else{
                            $matchCard = $min-$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summin++;
                            $roleCards[0][$summin] = $j;
                            $flagmin += 2;
                        }
                        break;
                        case 3:
                        if($min+$i > $this->max_card){
                            $matchCard = $min+$i - $this->max_card;
                        }else{
                            $matchCard = $min+$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summin++;
                            $roleCards[0][$summin] = $j;
                            $flagmin += 1;
                        }
                        if($min-$i < 1){
                            $matchCard = $min-$i + $this->max_card;
                        }else{
                            $matchCard = $min-$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summin++;
                            $roleCards[0][$summin] = $j;
                            $flagmin += 2;
                        }
                        break;
                        default:
                    }
                    switch($beforeFlagmax){
                        case 0:
                        break;
                        case 1:
                        if($max+$i > $this->max_card){
                            $matchCard = $max+$i - $this->max_card;
                        }else{
                            $matchCard = $max+$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summax++;
                            $roleCards[1][$summax] = $j;
                            $flagmax += 1;
                        }
                        break;
                        case 2:
                        if($max-$i < 1){
                            $matchCard = $max-$i + $this->max_card;
                        }else{
                            $matchCard = $max-$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summax++;
                            $roleCards[1][$summax] = $j;
                            $flagmax += 2;
                        }
                        break;
                        case 3:
                        if($max+$i > $this->max_card){
                            $matchCard = $max+$i - $this->max_card;
                        }else{
                            $matchCard = $max+$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summax++;
                            $roleCards[1][$summax] = $j;
                            $flagmax += 1;
                        }
                        if($max-$i < 1){
                            $matchCard = $max-$i + $this->max_card;
                        }else{
                            $matchCard = $max-$i;
                        }
                        if($hand[$j]["number"] == $matchCard){
                            $summax++;
                            $roleCards[1][$summax] = $j;
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
                            if($roleCards[0][$j] == $i){
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
                            if($roleCards[1][$j] == $i){
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
            $roleCards = array();
            $sum = 0;
            for($j = $i;$j > $i-$this->phand;$j--){
                $flag = 0;
                for($k = 0;$k < $this->phand;$k++){
                    if($hand[$k]["number"] == $j || $hand[$k]["number"] == $j - $this->max_card){
                        $flag = 1;
                        $roleCards[$sum] = $k;
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
                        if($roleCards[$j] == $i){
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
        $roleCards = array();
        $two = 1;
        for($i = 1;$i <= $this->max_card;$i++){
            $matchCardCount = 0;
            for($j = 0;$j < $this->phand;$j++){
                if($hand[$j]["number"] == $i && $sum < 2){
                    $roleCards[$matchCardCount] = $j;
                    $matchCardCount++;
                }elseif($hand[$j]["number"] == $i){
                    $roleCards[$matchCardCount+$sum] = $j;
                    $matchCardCount++;
                }
            }
            if($matchCardCount > $sum){
                $sum = $matchCardCount;
            }elseif($sum > 1 && $matchCardCount > 1){
                $two++;
                break;
            }
        }
        if($sum >= 3){
            for($i = 0;$i < $this->phand;$i++){
                $flag = 0;
                for($j = 0;$j < $sum;$j++){
                    if($roleCards[$j] == $i){
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
                    if($roleCards[$j] == $i){
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
                    if($roleCards[$j] == $i){
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
            $roleCards = array();
            $MatchCardMark = 0;
            for($i = 0;$i < $this->phand;$i++){
                if($hand[$i]["mark"] == $mark){
                    $roleCards[$MatchCardMark] = $i;
                    $MatchCardMark++;
                }
            }
            if($MatchCardMark >= 3){
                for($i = 0;$i < $this->phand;$i++){
                    $flag = 0;
                    for($j = 0;$j < $MatchCardMark;$j++){
                        if($roleCards[$j] == $i){
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