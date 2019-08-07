const MAX_CARD = 52;    //トランプの総数
const MARKS = new Array("spade","clover","diamond","heart");    //トランプのマークの種類
const TABLE_HAND = 5;   //場のカードの枚数
const PLAYER_HAND = 2;  //プレイヤー達の手札の数
const ROLE_HAND = 5;    //役に使うカードの枚数
const TURN = 3; //場のカードが増える回数
const FIRST_POINT = 10000;  //初期ポイント
const STANDARD_BET = 100;  //ベッティングの基準値
const NUMBER_OF_PLAYER = 4; //プレイヤーの数
const HEADER_HEIGHT = 52 + 10;   //ヘッダーの高さ
const FONT_SIZE = 28;   //名前の高さ
const CARD_HEIGHT = 140;    //カードの高さ
const CARD_WIDTH = 90; //カードの幅
const BLOCK_HEIGHT = CARD_HEIGHT + FONT_SIZE * 3;    //カード+名前の高さ
const BLOCK_WIDTH = CARD_WIDTH + 20; //カード+余白の幅
const FACE_IMAGE_HEIGHT = 160;  //顔の画像の高さ
const FACE_IMAGE_WIDTH = 120;    //顔の画像の横幅
const MAX_NUM_MARK = MAX_CARD / MARKS.length;   //マークごとのカードの枚数
const ACTIONS = new Array("Bet","Call","Raise","Fold");   //ベットアクションの種類
const GAME = 4; //ゲーム数
const SET = 1;  //4ゲーム1セット
const PERSONALITY_TYPE1 = new Array("timid","nomal","aggressive");   //コンピュータの性格表(弱気,普通,強気)
const PERSONALITY_TYPE2 = new Array("honest","liar","whimsical")   //コンピュータの性格表(正直者,嘘つき,気まぐれ)

//phpでのissetを表現
function isset( data ){
	return ( typeof( data ) != 'undefined' );
}

//デッキを作る
function makeDeck(deck){
    for(var i = 0;i < MARKS.length;i++){
        for(var j = 1;j <= MAX_NUM_MARK;j++){
            deck.push({"mark":MARKS[i],"number":j});
        }
    }
}

//デッキを混ぜる
function shuffleDeck(deck){
    for(var i = 0;i < 10000;i++){
        let card1 = Math.floor(Math.random()*MAX_CARD);
        let card2 = Math.floor(Math.random()*MAX_CARD);
        let temp = new Array();
        temp = deck[card1];
        deck[card1] = deck[card2];
        deck[card2] = temp;
    }
}

//キャラクター名を入れる,各プレイヤーのスコアと初期ベットを入れる
//1ゲーム終了時の初期化で初期化しないものには初期値を渡し、初期化しないようにする
function makeCharaData(hands,bets,betActions,info,computerFace,players = new Array(),score = new Array(),personalityType = new Array()){
    var banker = new Array(info[0]-2,info[0]-1);
    //初期ベットの位置を調べる
    for(var i = 0;i < banker.length;i++){
        if(banker[i] < 0){
            banker[i] += NUMBER_OF_PLAYER;
        }
    }
    for(var i = 0;i <= NUMBER_OF_PLAYER;i++){
        if(i == NUMBER_OF_PLAYER){  //最後にテーブルの初期化
            hands["Table"] = new Array();
        }else if(i == NUMBER_OF_PLAYER-1){//テーブルの前にプレイヤーを初期化
            players[i] = "Player";
            hands["Player"] = new Array();
            score["Player"] = FIRST_POINT;
            if(i == banker[0]){
                bets["Player"] = STANDARD_BET/2;
                betActions[name] = "";
            }else if(i == banker[1]){
                bets["Player"] = STANDARD_BET;
                betActions["Player"] = ACTIONS[0];
            }else{
                bets["Player"] = 0;
                betActions[name] = "";
            }
        }else{  //それ以外はコンピューターを初期化
            let name = "Computer" + (i+1);
            players[i] = name;
            hands[name] = new Array();
            score[name] = FIRST_POINT;
            if(i == banker[0]){
                bets[name] = STANDARD_BET/2;
                betActions[name] = "";
            }else if(i == banker[1]){
                bets[name] = STANDARD_BET;
                betActions[name] = ACTIONS[0];
            }else{
                bets[name] = 0;
                betActions[name] = "";
            }
            personalityType[name] = new Array();
            personalityType[name][0] = PERSONALITY_TYPE1[Math.floor(Math.random()*3)];
            personalityType[name][1] = PERSONALITY_TYPE2[Math.floor(Math.random()*3)];
            computerFace[name] = new Array();
            computerFace[name][0] = PERSONALITY_TYPE1[1];
        }
    }
}

//カードを比較するための数値を与えるaction=0は通常のソート用action=1は強いカードを調べる用
function cardCompare(card,action){
    var sum = 0;
    if(action == 0){    //1<13で同じならs<c<d<hとする
        sum += card["number"] * 4;
        switch(card["mark"]){
            case "spade":
            sum -= 3;
            break;
            case "clover":
            sum -= 2;
            break;
            case "diamond":
            sum -= 1;
            break;
            case "heart":
            sum -= 0;
            break;
        }
        return sum;
    }else if(action == 1){  //2<13<1とし同じならh<d<c<sとする
        if(card["number"] != 1){
            sum += card["number"] * 4 - 4;
        }else{
            sum += MAX_NUM_MARK * 4;
        }
        switch(card["mark"]){
            case "spade":
            sum -= 0;
            break;
            case "clover":
            sum -= 1;
            break;
            case "diamond":
            sum -= 2;
            break;
            case "heart":
            sum -= 3;
            break;
        }
        return sum;
    }
}

//カードをソートする
function sortCard(hand){
    for(var i = 0;i < hand.length;i++){
        for(var j = i+1;j < hand.length;j++){
            let card1 = cardCompare(hand[i],0);
            let card2 = cardCompare(hand[j],0);
            if(card1 > card2){
                let tmp = hand[i];
                hand[i] = hand[j];
                hand[j] = tmp;
            }
        }
    }
}

//渡されたカードを強い順にソートする
function sortStrength(hand,start,leng){
    for(var i = start;i < start + leng;i++){
        for(var j = i+1;j < start + leng;j++){
            let card1 = cardCompare(hand[i],1);
            let card2 = cardCompare(hand[j],1);
            if(card1 < card2){
                let tmp = hand[i];
                hand[i] = hand[j];
                hand[j] = tmp;
            }
        }
    }
}

//手札の順番をひっくり返す
function turnOverCard(hand){
    for(var i = 0;i < hand.length/2;i++){
        let tmp = hand[i];
        hand[i] = hand[hand.length - i - 1];
        hand[hand.length - i - 1] = tmp;
    }
}

//初期手札を配る
function giveCard(hands,deck){
    for(chara in hands){
        if(chara == "Table"){
            for(var i = 0;i < TABLE_HAND;i++){
                var card = deck.shift();
                hands[chara].push(card);
            }
        }else{
            for(var i = 0;i < PLAYER_HAND;i++){
                var card = deck.shift();
                hands[chara].push(card);
            }
        }
    }
}

//ストレートやフラッシュがリーチの状態かどうか調べるリーチならTRUE違うならFALSE
function reachRole(hand){
    sortCard(hand);
    //フラッシュリーチかどうか調べる
    for(mark of MARKS){
        var sum = 0;
        for(var i = 0;i < hand.length;i++){
            if(hand[i]["mark"] == mark){
                sum++;
            }
        }
        if(sum >= 4){
            return true;
        }
    }

    //ストレートリーチかどうか調べる
    for(var i = 1;i < 10;i++){
        var sum = 0;
        for(var j = i;j < i + 5;j++){
            var flag = 0;
            for(var k = 0;k < hand.length;k++){
                if(hand[k] == j && flag == 0){
                    sum++;
                    flag = 1;
                }
            }
        }
        if(sum >= 4){
            return true;
        }
    }

    return false;
}

//手札の最高役を調べる
//ストレートフラッシュ-フォーカード-フルハウス-フラッシュ-ストレート-スリーカード-ツーペア-ワンペア-ノーペア
function roleHand(hand){
    sortCard(hand); //カードをソートする
    var result = new Array("",new Array());   //役の名前、役に使ったカード
    //同じカードがないかを調べる
    var cardNumber = new Array(); //持ってるカードの数字の配列
    var positionRoleCard = 0;   //現在できている役から、次に入れるべきカードの位置を入れる
    for(cardnum of hand){
        cardNumber.push(cardnum["number"]);
    }
    for(var i = 0;i < cardNumber.length;i++){
        var roleCard = new Array(); //役に使ったカード
        let card = new Array(); //並べ替える際などに一時的にカードを格納するための変数
        var sum = 0;    //同じカードの数を格納する
        var positionCard = new Array(); //該当するカードの手札としての位置を格納する
        for(var j = 0;j < cardNumber.length;j++){
            if(j < i){
                if(cardNumber[i] == cardNumber[j]){ //以前に同じ数字を調べていたら次のカードに進む
                    break;
                }else{
                    continue;
                }
            }else{
                if(cardNumber[i] == cardNumber[j]){ //同じカードがあった場合
                    positionCard[sum] = j;
                    sum++;
                }
            }
        }
        if(sum >= 4){   //同じカードが4枚あった場合、それ以上強い手はあり得ないので結果を格納して返す
            for(var j = 0;j < positionCard.length;j++){
                roleCard[j] = hand[positionCard[j]];
            }
            result[0] = "フォーカード";
            result[1] = roleCard;
            sortStrength(result[1],0,4);
            return result;
        }else if(sum >= 3){ //同じカードが3枚の場合
            if(positionRoleCard >= 3){ //すでに3カードが格納されていた場合、フルハウスになりそれ以上強い手はあり得ないので結果を格納して返す
                //新しいカードの方が強かった場合
                if(result[1][0]["number"] < cardNumber[i] && result[1][0]["number"] != 1){
                    for(var j = 0;j < result[1].length-1;j++){
                        card.push(result[1][j]);
                    }
                    for(var j = 0;j < positionCard.length;j++){
                        roleCard[j] = hand[positionCard[j]];
                    }
                    for(var j = 0;j < card.length;j++){
                        roleCard[positionCard.length + j] = card[j];
                    }
                }else{
                    for(var j = 0;j < positionCard.length - 1;j++){
                        roleCard[positionCard.length + j] = hand[positionCard[j]];
                    }
                }
                result[0] = "フルハウス";
                result[1] = roleCard;
                sortStrength(result[1],0,3);
                sortStrength(result[1],3,2);
                return result;
            }else if(positionRoleCard >= 2){   //すでにワンペア以上あった場合
                if(result[1].length >= 4){ //ツーペアができていた場合
                    var pos = 0;
                    if(result[1][0] < result[1][positionRoleCard] && result[1][0] != 1){
                        pos = positionRoleCard;
                    }
                    for(var j = 0+pos;j < positionRoleCard+pos;j++){
                        card.push(result[1][j]);
                    }
                    for(var j = 0;j < positionCard.length;j++){
                        roleCard[j] = hand[positionCard[j]];
                    }
                    for(var j = 0;j < card.length;j++){
                        roleCard[positionCard.length + j] = card[j];
                    }
                    result[0] = "フルハウス";
                    result[1] = roleCard;
                    sortStrength(result[1],0,3);
                    sortStrength(result[1],3,2);
                    return result;
                }else{  //ワンペアだった場合
                    for(var j = 0;j < result[1].length;j++){
                        card.push(result[1][j]);
                    }
                    for(var j = 0;j < positionCard.length;j++){
                        roleCard[j] = hand[positionCard[j]];
                    }
                    for(var j = 0;j < card.length;j++){
                        roleCard[positionCard.length + j] = card[j];
                    }
                    result[0] = "フルハウス";
                    result[1] = roleCard;
                    sortStrength(result[1],0,3);
                    sortStrength(result[1],3,2);
                    positionRoleCard = 3;
                }
            }else{  //まだペアができてなかった場合
                for(var j = 0;j < positionCard.length;j++){
                    roleCard[j] = hand[positionCard[j]];
                }
                result[0] = "スリーカード";
                result[1] = roleCard;
                sortStrength(result[1],0,3);
                positionRoleCard = 3;
            }
        }else if(sum >= 2){ //同じカードが2枚だった場合
            if(positionRoleCard >= 3){ //すでにスリーカード以上があった場合
                if(result[1].length >= 5){  //すでにフルハウスができてた場合、これ以上強い手はあり得ないので結果を格納して返す
                    //新しいカードの方が強かった場合
                    if(result[1][positionRoleCard]["number"] < cardNumber[positionCard[0]] && result[1][positionRoleCard]["number"] != 1){
                        for(var j = 0;j < positionRoleCard;j++){
                            roleCard[j] = result[1][j];
                        }
                        for(var j = positionRoleCard;j < 5;j++){
                            roleCard[j] = hand[positionCard[j - positionRoleCard]];
                        }
                        result[1] = roleCard;
                    }
                    sortStrength(result[1],0,3);
                    sortStrength(result[1],3,2);
                    return result;
                }else{
                    for(var j = 0;j < positionRoleCard;j++){
                        roleCard[j] = result[1][j];
                    }
                    for(j = 0; j < positionCard.length;j++){
                        roleCard[positionRoleCard + j] = hand[positionCard[j]];
                    }
                    result[0] = "フルハウス";
                    result[1] = roleCard;
                    sortStrength(result[1],0,3);
                    sortStrength(result[1],3,2);
                }
            }else if(positionRoleCard >= 2){ //すでにワンペア以上があった場合
                if(result[1].length >= 4){  //すでにツーペアがあった場合、これ以上強い手はあり得ないので結果を格納して返す
                    //手札はソートされているので最初にできたペアが1以外なら最初のペアと交換そうでないなら2つ目のペアと交換
                    if(result[1][0]["number"] < result[1][positionRoleCard]["number"] && result[1][0]["number"] != 1){
                        for(var j = 0;j < positionCard.length;j++){
                            roleCard[j] = roleCard[positionRoleCard + j];
                            roleCard[positionRoleCard + j] = hand[positionCard[j]];
                        }
                    }else{
                        for(var j = 0;j < positionCard.length;j++){
                            roleCard[j] = result[1][j];
                            roleCard[positionRoleCard + j] = hand[positionCard[j]];
                        }
                    }
                    result[1] = roleCard;
                    sortStrength(result[1],0,4);
                    return result;
                }else{  //すでにワンペアあった場合
                    for(var j = 0;j < positionCard.length;j++){
                        roleCard[j] = result[1][j];
                        roleCard[positionRoleCard + j] = hand[positionCard[j]];
                    }
                    result[0] = "ツーペア";
                    result[1] = roleCard;
                    sortStrength(result[1],0,4);
                }
            }else{
                for(var j = 0;j < positionCard.length;j++){
                    roleCard[j] = hand[positionCard[j]];
                }
                result[0] = "ワンペア";
                result[1] = roleCard;
                sortStrength(result[1],0,2);
                positionRoleCard = 2;
            }
        }
    }
    //フルハウスができてた場合
    if(result[0] == "フルハウス"){
        return result;
    }

    //フラッシュができているかどうか判別
    for(mark of MARKS){
        var sum = 0;
        var flashPosition = new Array();
        for(var i = 0;i < hand.length;i++){ //マークごとに数を調べ、5枚以上見つけられたらひとまずフラッシュを格納する
            if(mark == hand[i]["mark"]){
                flashPosition[sum] = i;
                sum++;
            }
        }
        if(sum >= 5){
            result[0] = "フラッシュ";
            break;
        }
    }

    //ストレートができているかどうか判別
    if(result[0] == "フラッシュ"){   //フラッシュができてたらフラッシュに使うカードでストレートができているか判別
        for(var i = 1;i <= 10;i++){
            var sum = 0;
            roleCard = new Array();
            for(var j = i;j < i + 5;j++){
                var flag = 0;
                for(var k = 0;k < flashPosition.length;k++){
                    if((hand[flashPosition[k]]["number"] == j || hand[flashPosition[k]]["number"] + MAX_NUM_MARK == j) && !isset(roleCard[sum])){
                        flag = 1;
                        roleCard[sum] = hand[flashPosition[k]];
                    }
                }
                if(flag == 1){
                    sum++;
                }
            }
            if(sum >= 5){
                result[0] = "ストレートフラッシュ";
                result[1] = roleCard;
                turnOverCard(result[1]);
            }
        }
        if(result[0] == "フラッシュ" && flashPosition.length > 5){ //フラッシュのままだったら
            var count = 0;
            for(var i = flashPosition.length-1;i >= 0;i++){ //最も強いフラッシュの組み合わせを調べ格納
                if(count < 5 || hand[flashPosition[i]]["number"] == 1){
                    if(hand[flashPosition[i]]["number"] == 1){
                        roleCard[0] = hand[flashPosition[i]];
                    }else{
                        roleCard[4-count] = hand[flashPosition[i]];
                        count++;
                    }
                }
            }
            result[1] = roleCard;
            sortStrength(result[1]);
        }
        return result;
    }else{  //フラッシュでない場合手札全てからストレートができているか調べる
        for(var i = 1;i <= 10;i++){
            var sum = 0;
            roleCard = new Array();
            for(var j = i;j < i + 5;j++){
                var flag = 0;
                for(var k = 0;k < hand.length;k++){
                    if((hand[k]["number"] == j || hand[k]["number"] + MAX_NUM_MARK == j) && !isset(roleCard[sum])){
                        flag = 1;
                        roleCard[sum] = hand[k];
                    }
                }
                if(flag == 1){
                    sum++;
                }
            }
            if(sum >= 5){
                result[0] = "ストレート";
                result[1] = roleCard;
                turnOverCard(result[1]);
            }
        }
    }
    //何の役もできていなかった場合
    if(result[0] == ""){
        result[0] = "ノーペア";
        result[1] = new Array();
    }
    return result;
}

//コンピューターのベットアクションを決定する
//手が強いほど気が強いほどよくレイズし、フォールドしにくい。回数はある程度決まっているが多少のランダム要素を入れている
//最初のターンはワンペアで強気レイズ2回まで普通レイズ1回まで弱気コールのみ レイズ±1
//次のターンはフルハウス以上なら強気レイズ15回まで普通12回まで弱気10回まで レイズ±3
//ストレート以上なら強気レイズ10回まで普通8回まで弱気レイズ5回まで レイズ±3
//ツーペア以上なら強気レイズ5回まで普通レイズ3回まで弱気レイズ1回まで レイズ±1
//ワンペア揃っていたら強気レイズ3回まで普通レイズ1回までレイズ6回以上なら降りる弱気コールのみでレイズ4回以上なら降りる レイズ±2フォールド±1
//ワンペア揃ってなかったら強気コールのみ普通レイズ4回以上なら降りる弱気1回以上降りる。フォールド±1
//最終ターンはフルハウス以上なら強気20回まで普通16回まで弱気14回まで レイズ±4
//ストレート以上なら強気レイズ15回まで普通レイズ12回まで弱気10回まで レイズ±3
//スリーカードなら強気11回までレイズ15回以上で降りる普通9回までレイズ13回以上で降りる弱気5回までレイズ9回以上で降りる レイズ±2フォールド±2
//ツーペアなら強気9回までレイズ13回以上で降りる普通5回までレイズ9回以上で降りる弱気コールのみ7回以上で降りる レイズ±2フォールド±2
//ワンペアなら強気5回までレイズ9回以上で降りる普通コールのみ5回以上で降りる弱気降りる レイズ±2フォールド±2
//ノーペアなら強気コールのみ5回以上で降りる普通コールのみ3回以上で降りる弱気1回以上で降りる フォールド±2
function computerBetAction(texas,player){
    var raiseNum = 0;
    var foldNum = 100;
    if(texas.nowInfo[1] == 0){  //最初のターン
        if(texas.hands[player][0]["number"] == texas.hands[player][1]["number"]){   //手札がペアになっていた時の処理
            var rand = Math.floor(Math.random()*3) - 1;
            switch(texas.personalityType[player][0]){   //レイズ回数の設定と顔の設定を入れる
                case PERSONALITY_TYPE1[0]:
                raiseNum = 0 + rand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 1 + rand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 2 + rand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }

            //行動を返す
            if(texas.nowInfo[4] < raiseNum){
                texas.nowInfo[4]++;
                return ACTIONS[2];
            }else{
                return ACTIONS[1];
            }
        }else{  //揃っていなかった場合コール固定なので顔の設定のみ
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[1]:
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[2]:
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
            }
            return ACTIONS[1];
        }
    }else if(texas.nowInfo[1] == 1){    //場にカードが3枚あるターン
        //現在の役を調べる
        var num = 3;
        var allhands = new Array();
        for(var i = 0;i < num;i++){
            allhands.push(texas.hands["Table"][i]);
        }
        for(var i = 0;i < texas.hands[player].length;i++){
            allhands.push(texas.hands[player][i]);
        }
        var result = roleHand(allhands);
        var reach = 0;
        if(reachRole(allhands)){    //フラッシュかストレートにリーチの場合
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                reach = 3;
                break;
                case PERSONALITY_TYPE1[1]:
                reach = 5;
                break;
                case PERSONALITY_TYPE1[2]:
                reach = 8;
                break;
            }
        }
        
        switch(result[0]){  //揃ってる役にそってレイズフォールドの設定と顔の設定
            case "ストレートフラッシュ":
            case "フォーカード":
            case "フルハウス":
            var raiseRand = Math.floor(Math.random()*7) - 3;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 10 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 12 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 15 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }
            break;
            case "フラッシュ":
            case "ストレート":
            var raiseRand = Math.floor(Math.random()*7) - 3;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 5 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 8 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 10 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }
            break;
            case "スリーカード":
            case "ツーペア":
            var raiseRand = Math.floor(Math.random()*3) - 1;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 1 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 3 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 5 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }
            break;
            case "ワンペア":
            var raiseRand = Math.floor(Math.random()*5) - 2;
            var foldRand = Math.floor(Math.random()*3) - 1;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 0 + raiseRand + reach;
                foldNum = 4 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 1 + raiseRand + reach;
                foldNum = 6 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 3 + raiseRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
            }
            break;
            case "ノーペア":
            var foldRand = Math.floor(Math.random()*3) - 1;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 0 + reach;
                foldNum = 1 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 0 + reach;
                foldNum = 4 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 0 + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
            }
            break;
        }

        //自分が最初のターンかどうかを調べる
        var betFlag = 0;
        for(var i = 0;i < NUMBER_OF_PLAYER;i++){
            if(texas.betActions[texas.players[i]] == "" || texas.betActions[texas.players[i]] == ACTIONS[3]){
                betFlag++;
            }
        }

        //設定や状況にそって行動を返す
        if(foldNum < texas.nowInfo[4]){
            if(betFlag == NUMBER_OF_PLAYER){
                texas.nowInfo[4]++;
                return ACTIONS[0];
            }else{
                return ACTIONS[3];
            }
        }else if(texas.nowInfo[4] < raiseNum){
            if(betFlag == NUMBER_OF_PLAYER){
                texas.nowInfo[4]++;
                return ACTIONS[0];
            }else{
                texas.nowInfo[4]++;
                return ACTIONS[2];
            }
        }else{
            if(betFlag == NUMBER_OF_PLAYER){
                texas.nowInfo[4]++;
                return ACTIONS[0];
            }else{
                return ACTIONS[1];
            }
        }
    }else if(texas.nowInfo[1] == 2){    //場にカードが4枚ある最終ターン
        //現在の役を調べる
        var num = 4;
        var allhands = new Array();
        for(var i = 0;i < num;i++){
            allhands.push(texas.hands["Table"][i]);
        }
        for(var i = 0;i < texas.hands[player].length;i++){
            allhands.push(texas.hands[player][i]);
        }
        var result = roleHand(allhands);
        var reach = 0;
        if(reachRole(allhands)){    //フラッシュかストレートにリーチの場合
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                reach = 1;
                break;
                case PERSONALITY_TYPE1[1]:
                reach = 2;
                break;
                case PERSONALITY_TYPE1[2]:
                reach = 4;
                break;
            }
        }

        switch(result[0]){  //揃ってる役にそってレイズフォールドの設定と顔の設定
            case "ストレートフラッシュ":
            case "フォーカード":
            case "フルハウス":
            var raiseRand = Math.floor(Math.random()*9) - 4;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 14 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 16 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 20 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }
            break;
            case "フラッシュ":
            case "ストレート":
            var raiseRand = Math.floor(Math.random()*7) - 3;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 10 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 12 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 15 + raiseRand;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }
            break;
            case "スリーカード":
            var raiseRand = Math.floor(Math.random()*5) - 2;
            var foldRand = Math.floor(Math.random()*5) - 2;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 5 + raiseRand + reach;
                foldNum = 9 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 9 + raiseRand + reach;
                foldNum = 13 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 11 + raiseRand + reach;
                foldNum = 15 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }
            break;
            case "ツーペア":
            var raiseRand = Math.floor(Math.random()*5) - 2;
            var foldRand = Math.floor(Math.random()*5) - 2;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 0 + raiseRand + reach;
                foldNum = 7 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 5 + raiseRand + reach;
                foldNum = 9 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 9 + raiseRand + reach;
                foldNum = 13 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[2];
                break;
            }
            break;
            case "ワンペア":
            var raiseRand = Math.floor(Math.random()*5) - 2;
            var foldRand = Math.floor(Math.random()*5) - 2;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 0 + raiseRand + reach;
                foldNum = 0 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[1]:
                raiseNum = 1 + raiseRand + reach;
                foldNum = 5 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 5 + raiseRand + reach;
                foldNum = 9 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[1];
                break;
            }
            break;
            case "ノーペア":
            var foldRand = Math.floor(Math.random()*5) - 2;
            switch(texas.personalityType[player][0]){
                case PERSONALITY_TYPE1[0]:
                raiseNum = 0 + reach;
                foldNum = -1 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[1] + reach:
                raiseNum = 0 + reach;
                foldNum = 2 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
                case PERSONALITY_TYPE1[2]:
                raiseNum = 0 + reach;
                foldNum = 5 + foldRand + reach;
                texas.computerFace[player][0] = PERSONALITY_TYPE1[0];
                break;
            }
            break;
        }

        //自分が最初のターンかどうかを調べる
        var betFlag = 0;
        for(var i = 0;i < NUMBER_OF_PLAYER;i++){
            if(texas.betActions[texas.players[i]] == "" || texas.betActions[texas.players[i]] == ACTIONS[3]){
                betFlag++;
            }
        }

        //設定や状況にそって行動を返す
        if(foldNum < texas.nowInfo[4]){
            if(betFlag == NUMBER_OF_PLAYER){
                texas.nowInfo[4]++;
                return ACTIONS[0];
            }else{
                return ACTIONS[3];
            }
        }else if(texas.nowInfo[4] < raiseNum){
            if(betFlag == NUMBER_OF_PLAYER){
                texas.nowInfo[4]++;
                return ACTIONS[0];
            }else{
                texas.nowInfo[4]++;
                return ACTIONS[2];
            }
        }else{
            if(betFlag == NUMBER_OF_PLAYER){
                texas.nowInfo[4]++;
                return ACTIONS[0];
            }else{
                return ACTIONS[1];
            }
        }
    }
}

//プレイヤーの押したボタンに対する処理
function playerAction(action,texas){
    //現在の最高額の掛け金を調べる
    var maxbet = 0;
    for(name of texas.players){
        if(maxbet < texas.bets[name]){
            maxbet = texas.bets[name];
        }
    }
    switch(action){
        case ACTIONS[0]:    //bet
        texas.betActions["Player"] = ACTIONS[0];
        texas.bets["Player"] += STANDARD_BET;
        break;
        case ACTIONS[1]:    //call
        texas.betActions["Player"] = ACTIONS[1];
        texas.bets["Player"] = maxbet;
        break;
        case ACTIONS[2]:    //raise
        texas.betActions["Player"] = ACTIONS[2];
        texas.bets["Player"] = maxbet + STANDARD_BET;
        texas.nowInfo[4]++;
        break;
        case ACTIONS[3]:    //fold
        texas.betActions["Player"] = ACTIONS[3];
        break;
    }

    //終了判定
    maxbet = 0;
    let maxbetFlag = 0;
    let finFlag = 0;
    for(var i = 0;i < NUMBER_OF_PLAYER;i++){
        if(maxbetFlag == 0 && texas.betActions[texas.players[i]] != ACTIONS[3]){
            maxbet = texas.bets[texas.players[i]];
            maxbetFlag = 1;
            finFlag++;
        }else if(texas.bets[texas.players[i]] == maxbet || texas.betActions[texas.players[i]] == ACTIONS[3]){
            finFlag++;
        }
        if(texas.betActions[texas.players[i]] != ""){
            finFlag++;
        }
    }

    //ターンが終了していたら
    if(finFlag >= NUMBER_OF_PLAYER * 2){
        texas.nowInfo[1]++; //現在のターンをプラスする
        for(var i = 0;i < NUMBER_OF_PLAYER;i++){    //フォールドした人以外のベットアクションを初期化
            if(texas.betActions[texas.players[i]] != ACTIONS[3]){
                texas.betActions[texas.players[i]] = "";
            }
        }
        //ゲームが終わるターンなら結果を表示する
        if(texas.nowInfo[1] >= TURN){
            resultDraw(texas);
        }else{
            computerFaceDecision(texas);
            for(chara in texas.hands){
                if(chara != "Table" && chara != "Player"){
                    drawFace(texas,chara);
                }
            }
            updateGraph(texas);
            betAction(texas);
        }
    }else{
        updateGraph(texas);
        betAction(texas);
    }
}

//役に使ったカードが5枚に満たない場合最も強いカードを持ってきて5枚の手札を作る
function makeFiveHand(hand,allhand){
    sortStrength(allhand,0,allhand.length);
    for(var i = 0;i < allhand.length;i++){
        var Flag = 0;
        if(hand.length > 0){
            for(var j = 0;j < hand.length;j++){
                if(allhand[i]["number"] == hand[j]["number"] && allhand[i]["mark"] == hand[j]["mark"]){
                    Flag = 1;
                }
            }
        }
        if(Flag == 0){
            hand.push(allhand[i]);
        }
        if(hand.length >= 5){
            break;
        }
    }
}

//ベットアクション周りの動作
function betAction(texas){
    var betActionTimer = function(){
        var texas_id = document.getElementById("texas");
        while(texas.nowInfo[0] >= NUMBER_OF_PLAYER){
            texas.nowInfo[0] -= NUMBER_OF_PLAYER;
        }
        //プレイヤーのターンの場合
        if(texas.nowInfo[0] == NUMBER_OF_PLAYER-1){
            var field_id = document.getElementById("Playerfield");
            if(texas.betActions[texas.players[texas.nowInfo[0]]] != ACTIONS[3]){    //フォールドしていないかの判定
                updateGraph(texas);
                let betFlag = 0;
                for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                    if(texas.betActions[texas.players[i]] == "" || texas.betActions[texas.players[i]] == ACTIONS[3]){
                        betFlag++;
                    }
                }
                if(betFlag >= NUMBER_OF_PLAYER){
                    //誰もベットしていない場合
                    field_id.insertAdjacentHTML("beforeend","<div id='actionbutton'><input id='Bet' type='submit' value='ベット'><input id='Fold' type='submit' value='フォールド'></div>");
                    document.getElementById("actionbutton").style.position = "relative";
                    document.getElementById("actionbutton").style.top = (BLOCK_HEIGHT * (-0.5)) + "px";
                    document.getElementById("actionbutton").style.left = (BLOCK_WIDTH * 2.5) + "px";
                    document.getElementById("Bet").onclick = function(){
                        playerAction(ACTIONS[0],texas);
                        field_id.removeChild(document.getElementById("actionbutton"));
                    }
                    document.getElementById("Fold").onclick = function(){
                        playerAction(ACTIONS[3],texas);
                        field_id.removeChild(document.getElementById("actionbutton"));
                    }
                    document.getElementById("Fold").style.position = "relative";
                    document.getElementById("Fold").style.left = 20 + "px";
                }else{
                    //すでに誰かがベットした後の場合
                    field_id.insertAdjacentHTML("beforeend","<div id='actionbutton'><input id='Call' type='submit' value='コール'><input id='Raise' type='submit' value='レイズ'><input id='Fold' type='submit' value='フォールド'></div>");
                    document.getElementById("actionbutton").style.position = "relative";
                    document.getElementById("actionbutton").style.top = (BLOCK_HEIGHT * (-0.5)) + "px";
                    document.getElementById("actionbutton").style.left = (BLOCK_WIDTH * 2.5) + "px";
                    document.getElementById("Call").onclick = function(){
                        playerAction(ACTIONS[1],texas);
                        field_id.removeChild(document.getElementById("actionbutton"));
                    }
                    document.getElementById("Raise").onclick = function(){
                        playerAction(ACTIONS[2],texas);
                        field_id.removeChild(document.getElementById("actionbutton"));
                    }
                    document.getElementById("Fold").onclick = function(){
                        playerAction(ACTIONS[3],texas);
                        field_id.removeChild(document.getElementById("actionbutton"));
                    }
                    document.getElementById("Raise").style.position = "relative";
                    document.getElementById("Fold").style.position = "relative";
                    document.getElementById("Raise").style.left = 20 + "px";
                    document.getElementById("Fold").style.left = 40 + "px";
                }
                texas.nowInfo[0]++; //ターンを進める
                while(texas.nowInfo[0] >= NUMBER_OF_PLAYER){
                    texas.nowInfo[0] -= NUMBER_OF_PLAYER;
                }
            }else{
                texas.nowInfo[0]++; //ターンを進める
                //終了判定
                let sbetFlag = 0;
                let finFlag = 0;
                for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                    if(sbetFlag == 0 && texas.betActions[texas.players[i]] != ACTIONS[3]){
                        var sbet = texas.bets[texas.players[i]];
                        sbetFlag = 1;
                        finFlag++;
                    }else if(texas.bets[texas.players[i]] == sbet || texas.betActions[texas.players[i]] == ACTIONS[3]){
                        finFlag++;
                    }
                    if(texas.betActions[texas.players[i]] != ""){
                        finFlag++;
                    }
                }

                //ターンが終了していたら
                if(finFlag >= NUMBER_OF_PLAYER * 2){
                    texas.nowInfo[1]++; //現在のターンをプラスする
                    for(var i = 0;i < NUMBER_OF_PLAYER;i++){    //フォールドした人以外のベットアクションを初期化
                        if(texas.betActions[texas.players[i]] != ACTIONS[3]){
                            texas.betActions[texas.players[i]] = "";
                        }
                    }
                    let banker = texas.nowInfo[0];  //最後にアクションした次の人が親になるので代入
                    if(texas.nowInfo[0] < NUMBER_OF_PLAYER){
                        texas.nowInfo[0] = banker;
                    }else{
                        texas.nowInfo[0] = banker - NUMBER_OF_PLAYER;
                    }
                    //ゲームが終わるターンなら結果を表示する
                    if(texas.nowInfo[1] >= texas.nowInfo[0]){
                        resultDraw(texas);
                    }else{
                        computerFaceDecision(texas);
                        for(chara in texas.hands){
                            if(chara != "Table" && chara != "Player"){
                                drawFace(texas,chara);
                            }
                        }
                        updateGraph(texas);
                        betAction(texas);
                    }
                }else{
                    betAction(texas);
                }
            }
        }else{  //コンピュータのターンの場合
            if(texas.betActions[texas.players[texas.nowInfo[0]]] != ACTIONS[3]){    //フォールドしていないかの判定
                let bet = 0;
                //アクションを判定格納し、対応したアクションを実行する
                switch(texas.betActions[texas.players[texas.nowInfo[0]]] = computerBetAction(texas,texas.players[texas.nowInfo[0]])){
                    case ACTIONS[0]:    //bet
                    texas.bets[texas.players[texas.nowInfo[0]]] += STANDARD_BET;
                    break;
                    case ACTIONS[1]:    //call
                    for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                        if(bet < texas.bets[texas.players[i]]){
                            bet = texas.bets[texas.players[i]];
                        }
                    }
                    texas.bets[texas.players[texas.nowInfo[0]]] = bet;
                    break;
                    case ACTIONS[2]:    //raise
                    for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                        if(bet < texas.bets[texas.players[i]]){
                            bet = texas.bets[texas.players[i]];
                        }
                    }
                    texas.bets[texas.players[texas.nowInfo[0]]] = bet + STANDARD_BET;
                    break;
                }
            }
            texas.nowInfo[0]++; //ターンを進める
            updateGraph(texas);
            //終了判定
            let sbetFlag = 0;
            let finFlag = 0;
            for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                if(sbetFlag == 0 && texas.betActions[texas.players[i]] != ACTIONS[3]){
                    var sbet = texas.bets[texas.players[i]];
                    sbetFlag = 1;
                    finFlag++;
                }else if(texas.bets[texas.players[i]] == sbet || texas.betActions[texas.players[i]] == ACTIONS[3]){
                    finFlag++;
                }
                if(texas.betActions[texas.players[i]] != ""){
                    finFlag++;
                }
            }

            //ターンが終了していたら
            if(finFlag >= NUMBER_OF_PLAYER * 2){
                texas.nowInfo[1]++; //現在のターンをプラスする
                for(var i = 0;i < NUMBER_OF_PLAYER;i++){    //フォールドした人以外のベットアクションを初期化
                    if(texas.betActions[texas.players[i]] != ACTIONS[3]){
                        texas.betActions[texas.players[i]] = "";
                    }
                }
                let banker = texas.nowInfo[0];  //最後にアクションした次の人が親になるので代入
                if(texas.nowInfo[0] < NUMBER_OF_PLAYER){
                    texas.nowInfo[0] = banker;
                }else{
                    texas.nowInfo[0] = banker - NUMBER_OF_PLAYER;
                }
                //ゲームが終わるターンなら結果を表示する
                if(texas.nowInfo[1] >= TURN){
                    resultDraw(texas);
                }else{
                    computerFaceDecision(texas);
                    for(chara in texas.hands){
                        if(chara != "Table" && chara != "Player"){
                            drawFace(texas,chara);
                        }
                    }
                    updateGraph(texas);
                    betAction(texas);
                }
            }else{
                betAction(texas);
            }
        }
    }
    if(texas.betActions[texas.players[texas.nowInfo[0]]] != ACTIONS[3]){
        //フォールドしていない場合1000m秒のインターバルを入れる
        var action = setTimeout(betActionTimer,1000);
    }else{
        //フォールドしている場合100m秒のインターバルを入れる
        var action = setTimeout(betActionTimer,100);
    }
}

//勝敗を決め、ポイントを移動させる
function judgment(texas,result){
    var victoryPoints = Array();    //それぞれのプレイヤーの役を評価した点数を格納する
    var victory = "";   //勝利したプレイヤーの名前を格納する
    var victoryText = "";   //最後のアラートの内容を格納する
    var victoryPoint = 0;   //勝ったプレイヤーがもらえるポイントを格納する
    var victoryNum = new Array();   //勝ったプレイヤーの位置を格納する
    for(var i = 0;i < NUMBER_OF_PLAYER;i++){
        victoryPoints[i] = 0;
        //フォールドしていないプレイヤーのみ評価する
        if(texas.betActions[texas.players[i]] != ACTIONS[3]){
            switch(result[texas.players[i]][0]){
                case "ストレートフラッシュ":
                victoryPoints[i] += 8000;
                break;
                case "フォーカード":
                victoryPoints[i] += 7000;
                break;
                case "フルハウス":
                victoryPoints[i] += 6000;
                break;
                case "フラッシュ":
                victoryPoints[i] += 5000;
                break;
                case "ストレート":
                victoryPoints[i] += 4000;
                break;
                case "スリーカード":
                victoryPoints[i] += 3000;
                break;
                case "ツーペア":
                victoryPoints[i] += 2000;
                break;
                case "ワンペア":
                victoryPoints[i] += 1000;
                break;
                case "ノーペア":
                victoryPoints[i] += 1;
                break;
            }
        }else{
            //フォールドしている場合-1を格納しておく
            victoryPoints[i] = -1;
        }
    }
    //ポイントを比較し、勝者が複数いるかなどを調べる
    var max = 0;
    var victoryFlag = 0;
    for(var i = 0;i < NUMBER_OF_PLAYER;i++){
        if(max < victoryPoints[i]){
            victoryNum = new Array();
            max = victoryPoints[i];
            victory = texas.players[i];
            victoryNum.push(i);
            victoryFlag = 0;
        }else if(max == victoryPoints[i]){
            victoryFlag = 1;
            victoryNum.push(i);
        }
    }
    //勝者が一人だった場合アラートで結果を知らせ勝者を返す
    if(victoryFlag == 0){
        var victorys = new Array(victory);
        alert("勝者は" + victory + "！");
        for(var i = 0;i < NUMBER_OF_PLAYER;i++){
            victoryPoint += texas.bets[texas.players[i]];
        }
        for(var i = 0;i < NUMBER_OF_PLAYER;i++){
            texas.score[texas.players[i]] -= texas.bets[texas.players[i]];
            if(texas.players[i] != victory){
                victoryText += texas.players[i] + " : -$" + texas.bets[texas.players[i]] + "\n";
            }else{
                victoryText += texas.players[i] + " : +$" + victoryPoint + "\n";
                texas.score[texas.players[i]] += victoryPoint;
            }
        }
        alert(victoryText);
        return victorys;
    }else{  //複数人いた場合役に使ったカードを比較し勝負を決める
        var cardStrength = new Array();
        for(var i = 0;i < ROLE_HAND;i++){
            max = 0;
            victoryFlag = 0;
            for(var j = 0;j < victoryNum.length;j++){
                cardStrength[j] = cardCompare(result[texas.players[victoryNum[j]]][1][i],1);
                if(max < cardStrength[j]){
                    max = cardStrength[j];
                    victory = texas.players[victoryNum[j]];
                    victoryFlag = 0;
                }else if(max == cardStrength[j]){
                    victoryFlag = 1;
                }
            }
            for(var j = victoryNum.length-1;j >= 0;j--){
                if(max > cardCompare(result[texas.players[victoryNum[j]]][1][i],1)){
                    //3人以上いてこの段階で負けたプレイヤーを除外
                    victoryNum.splice(j, 1);
                }
            }
            //カードの強さが違った場合アラートで結果を知らせ勝者を返す
            if(victoryFlag == 0){
                var victorys = new Array(victory);
                alert("勝者は" + victory + "！");
                for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                    victoryPoint += texas.bets[texas.players[i]];
                }
                for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                    texas.score[texas.players[i]] -= texas.bets[texas.players[i]];
                    if(texas.players[i] != victory){
                        victoryText += texas.players[i] + " : -$" + texas.bets[texas.players[i]] + "\n";
                    }else{
                        victoryText += texas.players[i] + " : +$" + victoryPoint + "\n";
                        texas.score[texas.players[i]] += victoryPoint;
                    }
                }
                alert(victoryText);
                return victorys;
            }
        }
        //決着がつかなかった場合
        if(victoryNum.length < NUMBER_OF_PLAYER){  //同着がプレイヤー数未満だった場合同着全員を勝者とし勝ち点を均等に分ける
            var victorys = new Array();
            victoryText += "勝者は";
            for(var i = 0;i < victoryNum.length;i++){
                victorys[i] = texas.players[victoryNum[i]];
                victoryText += texas.players[victoryNum[i]];
                if(i != victoryNum.length - 1){
                    victoryText += "と";
                }else{
                    victoryText += "！";
                }
            }
            alert(victoryText);
            victoryText = "";
            for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                victoryPoint += texas.bets[texas.players[i]];
            }
            victoryPoint /= victoryNum.length;
            for(var i = 0;i < NUMBER_OF_PLAYER;i++){
                victoryFlag = 0;
                for(var j = 0;j < victoryNum.length;j++){
                    if(victoryNum[j] == i){
                        victoryFlag = 1;
                    }
                }
                texas.score[texas.players[i]] -= texas.bets[texas.players[i]];
                if(victoryFlag == 0){
                    victoryText += texas.players[i] + " : -$" + texas.bets[texas.players[i]] + "\n";
                }else{
                    victoryText += texas.players[i] + " : +$" + victoryPoint + "\n";
                    texas.score[texas.players[i]] += victoryPoint;
                }
            }
            alert(victoryText);
            return victorys;
        }else{  //全員同着の場合引き分けでポイントの移動は無し
            var victorys = new Array("NONE");
            alert("ノーゲーム！\nポイントの移動はありませんでした！");
            return victorys;
        }
    }
}

//全セットが終わったら最も稼いだ人とそれぞれのスコアをアラートする
function judgmentGame(score,texas){
    var victory = new Array();  //勝者の名前を入れる
    var victoryScore = 0;   //勝者を判別するためのスコアを入れる
    var victoryText ="";    //最後のアラートの内容を格納する
    for(chara in score){
        if(victoryScore < score[chara]){
            victory = new Array();
            victory.push(chara);
            victoryScore = score[chara];
        }else if(victoryScore == score[chara]){
            victory.push(chara);
        }
    }
    //勝者の名前をvictoryTextに入れる。同着がいた場合を考え複数いた場合名前の間に"と"を入れる
    for(var i = 0;i < victory.length;i++){
        victoryText += victory[i];
        if(i != victory.length - 1){
            victoryText += "と";
        }
    }
    alert("最も稼いだのは" + victoryText + "です！");

    victoryText = "最終結果\n";
    for(chara in score){
        victoryText += chara + ":$" + score[chara] + "\n";
    }
    alert(victoryText);

    for(chara in score){
        if(chara != "Table" && chara != "Player"){
            drawFace(texas,chara,victory);
        }
    }
}

//コンピューターの顔グラの決定
function computerFaceDecision(texas){
    for(chara of texas.players){
        if(chara != "Player" && chara != "Table"){
            switch(texas.personalityType[chara][1]){
                case PERSONALITY_TYPE2[0]:  //honestはそのまま顔を描写する
                texas.computerFace[chara][1] = texas.computerFace[chara][0];
                break;
                case PERSONALITY_TYPE2[1]:  //liarは逆の顔をする
                if(texas.computerFace[chara][0] == PERSONALITY_TYPE1[0]){
                    texas.computerFace[chara][1] = PERSONALITY_TYPE1[2];
                }else if(texas.computerFace[chara] == PERSONALITY_TYPE1[2]){
                    texas.computerFace[chara][1] = PERSONALITY_TYPE1[0];
                }else{
                    texas.computerFace[chara][1] = PERSONALITY_TYPE1[1];
                }
                break;
                case PERSONALITY_TYPE2[2]:  //whimsicalはランダムで顔を変える
                texas.computerFace[chara][1] = PERSONALITY_TYPE1[Math.floor(Math.random()*3)];
                break;
            }
        }
    }
}

//コンピューターの顔グラの描写
function drawFace(texas,chara,end = ""){
    var image = new Image(FACE_IMAGE_WIDTH,FACE_IMAGE_HEIGHT);
    image.src = "./image/face.png";
    var winFlag = 0;
        if(end == ""){
            image.src = "./image/" + texas.computerFace[chara][1] + ".png";
            image.alt = texas.computerFace[chara][1];
        }else{
            for(var i = 0;i < end.length;i++){
                if(end[i] == chara){
                    image.src = "./image/winface.png";
                    image.alt = "Win";
                    winFlag = 1;
                }else if(end[i] != chara && winFlag == 0){
                    image.src = "./image/loseface.png";
                    image.alt = "Lose";
                }
            }
        }
    image.className = "face";
    while(document.getElementById(chara + "face").firstChild){
        document.getElementById(chara + "face").removeChild(document.getElementById(chara + "face").firstChild);
    }
    document.getElementById(chara + "face").appendChild(image);
}

function drawCard(texas, chara, number, id, frontback = "front"){
    var image = new Image(CARD_WIDTH,CARD_HEIGHT);
    if(frontback == "front"){
        image.src = "./image/" + texas.hands[chara][number]["number"] + "of" + texas.hands[chara][number]["mark"] + ".png";
    }else if(frontback == "back"){
        image.src = "./image/backcard.png";
    }
    image.className = "card";
    id.appendChild(image);
}

function updateGraph(texas){
    for(var chara in texas.hands){
        if(chara != "Table"){
            document.getElementById(chara + "betaction").innerText = chara + " $" + (texas.score[chara] - texas.bets[chara]) + "\nBet:$" + texas.bets[chara] + " " + texas.betActions[chara];
        }else{
            var num = 0;
            switch(texas.nowInfo[1]){
                case 0:
                num = 0;
                break;
                case 1:
                num = 3;
                break;
                case 2:
                num = 4;
                break;
            }
            while(document.getElementById(chara + "field").firstChild){
                document.getElementById(chara + "field").removeChild(document.getElementById(chara + "field").firstChild);
            }
            document.getElementById(chara + "field").insertAdjacentHTML("beforeend","<h3 class='texastext'>" + chara +"</h3>");
            for(var i = 0;i < num;i++){
                // document.getElementById(chara + "field").insertAdjacentHTML("beforeend","<div class='card'>" + texas.hands[chara][i]["mark"] + "の" + texas.hands[chara][i]["number"] + "</div>");
                drawCard(texas,chara,i,document.getElementById(chara + "field"));
            }
        }
    }
}

//描写処理
function drawGraph(texas){
    var texas_id = document.getElementById("texas");
    texas_id.textContent = null;
    for(var chara in texas.hands){
        if(chara == "Table"){
            document.getElementById("Playerfield").insertAdjacentHTML("beforebegin","<div id='" + chara + "field'><h3 class='texastext'>" + chara +"</h3></div>");
        }else if(chara == "Player"){
            texas_id.insertAdjacentHTML("beforeend","<div id='" + chara + "field'><h3 id='" + chara + "betaction' class='texastext'>" + chara + " $" + (texas.score[chara] - texas.bets[chara]) + "<br>Bet:$" + texas.bets[chara] + " " + texas.betActions[chara] + "</h3></div>");
        }else{
            texas_id.insertAdjacentHTML("beforeend","<div id='" + chara + "field'><div id='" + chara +"face' style='display :inline-block; vertical-align :top;'></div><div id='" + chara + "action' style='vertical-align :top'><h3 id='" + chara + "betaction' class='texastext'>" + chara + " $" + (texas.score[chara] - texas.bets[chara]) + "<br>Bet:$" + texas.bets[chara] + " " + texas.betActions[chara] + "</h3></div></div>");
            document.getElementById(chara + "action").style.display = "inline-block";
            document.getElementById(chara + "action").style.width = (BLOCK_WIDTH * 2) + "px";
            document.getElementById(chara + "action").style.height = BLOCK_HEIGHT + "px";
        }
        if(chara == "Player"){
            for(var i = 0;i < PLAYER_HAND;i++){
                // document.getElementById(chara + "field").insertAdjacentHTML("beforeend","<div class='card'>" + texas.hands[chara][i]["mark"] + "の" + texas.hands[chara][i]["number"] + "</div>");
                drawCard(texas,chara,i,document.getElementById(chara + "field"));
            }
        }else if(chara != "Table"){
            drawFace(texas,chara);
            for(var i = 0;i < PLAYER_HAND;i++){
                drawCard(texas,chara,i,document.getElementById(chara + "action"),"back");
            }
        }
        var element_id = document.getElementById(chara + "field");
        switch(chara){
            case "Computer1":
            case "Computer2":
            case "Computer3":
            element_id.style.display = "inline-block";
            element_id.style.marginTop = "10px";
            element_id.style.height = BLOCK_HEIGHT + "px";
            element_id.style.width = (BLOCK_WIDTH * 2 + FACE_IMAGE_WIDTH) + "px";
            break;
            case "Player":
            element_id.style.margin = "10px auto";
            element_id.style.height = BLOCK_HEIGHT + "px";
            element_id.style.width = (BLOCK_WIDTH * 2) + "px";
            break;
            case "Table":
            element_id.style.margin = "10px auto";
            element_id.style.height = BLOCK_HEIGHT + "px";
            element_id.style.width = (BLOCK_WIDTH * 5) + "px";
            break;
        }
    }
}

//ゲーム結果描写
function resultDraw(texas){
    var result = new Array();
    sortCard(texas.hands["Table"]);
    for(var chara of texas.players){
        var allhands = new Array();
        for(var i = 0;i < texas.hands["Table"].length;i++){
            allhands.push(texas.hands["Table"][i]);
        }
        for(var i = 0;i < texas.hands[chara].length;i++){
            allhands.push(texas.hands[chara][i]);
        }
        result[chara] = roleHand(allhands);
        if(result[chara][1].length < 5){
            makeFiveHand(result[chara][1],allhands);
        }
    }
    var victory = judgment(texas,result);
    var texas_id = document.getElementById("texas");
    texas_id.textContent = null;
    for(var chara in texas.hands){
        if(chara == "Table"){
            document.getElementById("Playerfield").insertAdjacentHTML("beforebegin","<div id='" + chara + "field'><h3 class='texastext'>" + chara +"</h3></div>");
        }else if(chara == "Player"){
            texas_id.insertAdjacentHTML("beforeend","<div id='" + chara + "field'><h3 class='texastext'>" + chara + " $" + texas.score[chara] + "</h3><h3 class='texastext'>Bet:$" + texas.bets[chara] + " " + result[chara][0] + "</h3></div>");
        }else{
            texas_id.insertAdjacentHTML("beforeend","<div id='" + chara + "field'><div id='" + chara +"face' style='display :inline-block; vertical-align :top;'></div><div id='" + chara + "action' style='vertical-align :top'><h3 class='texastext'>" + chara + " $" + texas.score[chara] + "</h3><h3 class='texastext' id='" + chara + "action'>Bet:$" + texas.bets[chara] + " " + result[chara][0] + "</h3></div></div>");
            document.getElementById(chara + "action").style.display = "inline-block";
            document.getElementById(chara + "action").style.width = (BLOCK_WIDTH * 2) + "px";
            document.getElementById(chara + "action").style.height = BLOCK_HEIGHT + "px";
        }
        if(chara == "Table"){
            for(var i = 0;i < TABLE_HAND;i++){
                // document.getElementById(chara + "field").insertAdjacentHTML("beforeend","<div class='card'>" + texas.hands[chara][i]["mark"] + "の" + texas.hands[chara][i]["number"] + "</div>");
                drawCard(texas,chara,i,document.getElementById(chara + "field"));
            }
        }else{
            if(chara != "Player"){
                drawFace(texas,chara,victory);
                 for(var i = 0;i < PLAYER_HAND;i++){
                    // document.getElementById(chara + "action").insertAdjacentHTML("beforeend","<div class='card'>" + texas.hands[chara][i]["mark"] + "の" + texas.hands[chara][i]["number"] + "</div>");
                drawCard(texas,chara,i,document.getElementById(chara + "action"));
                 }
            }else{
                for(var i = 0;i < PLAYER_HAND;i++){
                    // document.getElementById(chara + "field").insertAdjacentHTML("beforeend","<div class='card'>" + texas.hands[chara][i]["mark"] + "の" + texas.hands[chara][i]["number"] + "</div>");
                drawCard(texas,chara,i,document.getElementById(chara + "field"));
                }
            }
        }
        var element_id = document.getElementById(chara + "field");
        switch(chara){
            case "Computer1":
            case "Computer2":
            case "Computer3":
            element_id.style.display = "inline-block";
            element_id.style.marginTop = "10px";
            element_id.style.height = BLOCK_HEIGHT + "px";
            element_id.style.width = (BLOCK_WIDTH * 2 + FACE_IMAGE_WIDTH) + "px";
            break;
            case "Player":
            element_id.style.margin = "10px auto";
            element_id.style.height = BLOCK_HEIGHT + "px";
            element_id.style.width = (BLOCK_WIDTH * 2) + "px";
            break;
            case "Table":
            element_id.style.margin = "10px auto";
            element_id.style.height = BLOCK_HEIGHT + "px";
            element_id.style.width = (BLOCK_WIDTH * 5) + "px";
            break;
        }
    }
    texas.nowInfo[2]++;
    if(texas.nowInfo[2] < GAME){
        texas_id.insertAdjacentHTML("beforeend","<a id='nextGame' href='#texas'><h2>次のゲームへ</h2></a>");
        document.getElementById("nextGame").style.top = (BLOCK_HEIGHT * 2.5 + HEADER_HEIGHT - FONT_SIZE) + "px";
        document.getElementById("nextGame").style.left = (BLOCK_WIDTH * 7) + "px";
        document.getElementById("nextGame").onclick = function(){
            gameInitialize(texas);
            betAction(texas);
        }
    }else{
        texas.nowInfo[3]++;
        if(texas.nowInfo[3] >= SET){
            texas_id.insertAdjacentHTML("beforeend","<a id='nextSet' href='#texas'><h2>結果発表！</h2></a>");
            document.getElementById("nextSet").style.top = (BLOCK_HEIGHT * 2.5 + HEADER_HEIGHT - FONT_SIZE) + "px";
            document.getElementById("nextSet").style.left = (BLOCK_WIDTH * 7) + "px";
            document.getElementById("nextSet").onclick = function(){
                judgmentGame(texas.score,texas);
                texas_id.removeChild(document.getElementById("nextSet"));
                texas_id.insertAdjacentHTML("beforeend","<a id='nextSet' href='texasholedem.php'><h2>もう一度遊ぶ</h2></a>");
                document.getElementById("nextSet").style.top = (BLOCK_HEIGHT * 2.5 + HEADER_HEIGHT - FONT_SIZE) + "px";
                document.getElementById("nextSet").style.left = (BLOCK_WIDTH * 7) + "px";
            }
        }else{
            texas.nowInfo[2] = 0;
            texas_id.insertAdjacentHTML("beforeend","<a id='nextGame' href='#texas'><h2>次のゲームへ</h2></a>");
            document.getElementById("nextGame").style.top = (BLOCK_HEIGHT * 2.5 + HEADER_HEIGHT - FONT_SIZE) + "px";
            document.getElementById("nextGame").style.left = (BLOCK_WIDTH * 7) + "px";
            document.getElementById("nextGame").onclick = function(){
                gameInitialize(texas);
                betAction(texas);
            }
        }
    }
}

//ゲーム間の初期化処理
function gameInitialize(texas){
    texas.nowInfo[0] = texas.nowInfo[2];
    texas.nowInfo[1] = 0;
    texas.nowInfo[4] = 0;
    texas.deck = new Array();
    texas.hands = new Array();
    texas.bets = new Array();
    texas.betActions = new Array();

    //デッキを作る
    makeDeck(texas.deck);

    //デッキをシャッフルする
    shuffleDeck(texas.deck);

    //必要な情報のみ初期化
    makeCharaData(texas.hands,texas.bets,texas.betActions,texas.nowInfo,texas.computerFace);

    //それぞれ必要なだけ手札を配る
    giveCard(texas.hands,texas.deck);

    //カードをソートする(数字の小さい順で同じ数字の場合s-c-d-hの順)
    for(chara in texas.hands){
        if(chara != "Table"){
            sortCard(texas.hands[chara]);
        }
    }

    //コンピューターの顔の決定
    computerFaceDecision(texas);
    //画面の描写
    drawGraph(texas);
    
}

//初期化処理
function texasInitialize(){
    this.deck = new Array(); //デッキの配列
    this.players = new Array();    //プレイヤーの名前の配列
    this.hands = new Array();    //プレイヤーとプレイヤーごとの手札を入れる配列
    this.score = new Array();    //それぞれのポイントを入れる配列
    this.bets = new Array();  //それぞれのベット額を入れる配列
    this.betActions = new Array();   //それぞれのベットアクションを入れる配列
    this.computerFace = new Array();    //コンピューターの顔グラを指定する配列
    var banker = 0; //親の位置を示す 0:com1,1:com2,2:com3,4:player
    var nowTurn = 0;    //現在のターン数を示す
    var nowGame = 0;    //現在のゲーム数を示す
    var nowSet = 0; //現在のセット数を示す
    var raiseCount = 0; //現在のレイズの回数を示す
    this.nowInfo = new Array(banker,nowTurn,nowGame,nowSet,raiseCount);   //現在の情報をまとめた配列
    this.personalityType = new Array(); //コンピューターごとの性格を入れる配列
    
    //デッキを作る
    makeDeck(this.deck);

    //デッキをシャッフルする
    shuffleDeck(this.deck);

    //各配列にキャラクター名を入れ、初期化
    makeCharaData(this.hands,this.bets,this.betActions,this.nowInfo,this.computerFace,this.players,this.score,this.personalityType);

    //それぞれ必要なだけ手札を配る
    giveCard(this.hands,this.deck);

    //カードをソートする(数字の小さい順で同じ数字の場合s-c-d-hの順)
    for(chara in this.hands){
        if(chara != "Table"){
            sortCard(this.hands[chara]);
        }
    }
}

window.onload = function texasStart(){
    var texas = new texasInitialize();

    //コンピューターの顔の決定
    computerFaceDecision(texas);
    //画面の描写
    drawGraph(texas);

    //ベットする為それぞれアクションを起こす。
    betAction(texas);
}