import { Database } from '@angular/fire/database';
import { NewGameService } from '../machine-a-sous/new-game.service';


export class RouletteNetComponentLogic{

    private bankValue = 1000;
    private currentBet = 0;
    private wager = 5;
    private lastWager = 0;
    private bet = [];
    private numbersBet = [];
    private previousNumbers = [];
    private numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    private wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

    public container = document.createElement('div');
    
    // createContainer();

    // startGame();

    private db: Database;
    private newGameService: NewGameService;

    constructor(db: Database, newGameService: NewGameService) {
        this.db = db;
        this.newGameService = newGameService;
    }

    public wheel = document.getElementsByClassName('wheel')[0];
    public ballTrack = document.getElementsByClassName('ballTrack')[0];

    createElement(this:any){
        this.container.setAttribute('id', 'container');
        this.document.body.append(this.container);  
    }

    resetGame(this: any){
        this.bankValue = 1000;
        this.currentBet = 0;
        this.wager = 5;
        this.bet = [];
        this.numbersBet = [];
        this.previousNumbers = [];

        this.document.getElementById('betting_board').remove();
        this.document.getElementById('notification').remove();
        (this as any).buildBettingBoard();
    }

    startGame(){
        this.buildWheel();
        this.buildBettingBoard();
    }

    gameOver(){
        let notification = document.createElement('div');
        notification.setAttribute('id', 'notification');
        let nSpan = document.createElement('span');
        nSpan.setAttribute('class', 'nSpan');
        nSpan.innerText = 'Bankrupt';
        notification.append(nSpan);

        let nBtn = document.createElement('div');
        nBtn.setAttribute('class', 'nBtn');
        nBtn.innerText = 'Play again';	
        nBtn.onclick = function(){
            (this as any).resetGame();
        };
        notification.append(nBtn);
        this.container.prepend(notification);
    }

    buildWheel(this:any){
        `/* le but est de creer la roule avec 
        les numéros et les compartiment pour la balle */`
        let wheel = document.createElement('div');
        wheel.setAttribute('class', 'wheel');

        let outerRim = document.createElement('div');
        outerRim.setAttribute('class', 'outerRim');
        wheel.append(outerRim);

        let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
        for(let i = 0; i < numbers.length; i++){
            let a = i + 1;
            let spanClass = (numbers[i] < 10)? 'single' : 'double';
            let sect = document.createElement('div');
            sect.setAttribute('id', 'sect'+a);
            sect.setAttribute('class', 'sect');
            let span = document.createElement('span');
            span.setAttribute('class', spanClass);
            span.innerText = numbers[i].toString();
            sect.append(span);
            let block = document.createElement('div');
            block.setAttribute('class', 'block');
            sect.append(block);
            wheel.append(sect);
        }

        let pocketsRim = document.createElement('div');
        pocketsRim.setAttribute('class', 'pocketsRim');
        wheel.append(pocketsRim);

        let ballTrack = document.createElement('div');
        ballTrack.setAttribute('class', 'ballTrack');
        let ball = document.createElement('div');
        ball.setAttribute('class', 'ball');
        ballTrack.append(ball);
        wheel.append(ballTrack);
        //ici
        let pockets = document.createElement('div');
        pockets.setAttribute('class', 'pockets');
        wheel.append(pockets);

        let cone = document.createElement('div');
        cone.setAttribute('class', 'cone');
        wheel.append(cone);

        let turret = document.createElement('div');
        turret.setAttribute('class', 'turret');
        wheel.append(turret);

        let turretHandle = document.createElement('div');
        turretHandle.setAttribute('class', 'turretHandle');
        let thendOne = document.createElement('div');
        thendOne.setAttribute('class', 'thendOne');
        turretHandle.append(thendOne);
        let thendTwo = document.createElement('div');
        thendTwo.setAttribute('class', 'thendTwo');
        turretHandle.append(thendTwo);
        wheel.append(turretHandle);

        this.container.append(wheel);
    }

    buildBettingBoard(this:any){
        let bettingBoard = document.createElement('div');
        bettingBoard.setAttribute('id', 'betting_board');

        let wl = document.createElement('div');
        wl.setAttribute('class', 'winning_lines');
        
        var wlttb = document.createElement('div');
        wlttb.setAttribute('id', 'wlttb_top');
        wlttb.setAttribute('class', 'wlttb');
        for(let i = 0; i < 11; i++){
            let j = i;
            var ttbbetblock = document.createElement('div');
            ttbbetblock.setAttribute('class', 'ttbbetblock');
            var numA = (1 + (3 * j));
            var numB = (2 + (3 * j));
            var numC = (3 + (3 * j));
            var numD = (4 + (3 * j));
            var numE = (5 + (3 * j));
            var numF = (6 + (3 * j));
            let num = numA + ', ' + numB + ', ' + numC + ', ' + numD + ', ' + numE + ', ' + numF;
            var objType = 'double_street';
            ttbbetblock.onclick = function(){
                (this as any).setBet(this, num, objType, 5);
            };
            ttbbetblock.oncontextmenu = function(e){
                e.preventDefault();
                (this as any).removeBet(this, num, objType, 5);
            };
            wlttb.append(ttbbetblock);
        }
        wl.append(wlttb);

        for(let c =  1; c < 4; c++){
            let d = c;
            var wlttb = document.createElement('div');
            wlttb.setAttribute('id', 'wlttb_'+c);
            wlttb.setAttribute('class', 'wlttb');
            for(let i = 0; i < 12; i++){
                let j = i;
                var ttbbetblock = document.createElement('div');
                ttbbetblock.setAttribute('class', 'ttbbetblock');
                ttbbetblock.onclick = function(){
                    if(d == 1 || d == 2){
                        var numA = ((2 - (d - 1)) + (3 * j));
                        var numB = ((3 - (d - 1)) + (3 * j));
                        var num = numA + ', ' + numB;
                    }
                    else{
                        var numA = (1 + (3 * j));
                        var numB = (2 + (3 * j));
                        var numC = (3 + (3 * j));
                        var num = numA + ', ' + numB + ', ' + numC;
                    }
                    var objType = (d == 3)? 'street' : 'split';
                    var odd = (d == 3)? 11 : 17;
                    (this as any).setBet(this, num, objType, odd);
                };
                ttbbetblock.oncontextmenu = function(e){
                    e.preventDefault();
                    if(d == 1 || d == 2){
                        var numA = ((2 - (d - 1)) + (3 * j));
                        var numB = ((3 - (d - 1)) + (3 * j));
                        var num = numA + ', ' + numB;
                    }
                    else{
                        var numA = (1 + (3 * j));
                        var numB = (2 + (3 * j));
                        var numC = (3 + (3 * j));
                        var num = numA + ', ' + numB + ', ' + numC;
                    }
                    var objType = (d == 3)? 'street' : 'split';
                    var odd = (d == 3)? 11 : 17;
                    (this as any).removeBet(this, num, objType, odd);
                };
                wlttb.append(ttbbetblock);
            }
            wl.append(wlttb);
        }

        for(let c = 1; c < 12; c++){
            let d = c;
            var wlrtl = document.createElement('div');
            wlrtl.setAttribute('id', 'wlrtl_'+c);
            wlrtl.setAttribute('class', 'wlrtl');
            for(let i = 1; i < 4; i++){
                let j = i;
                var rtlbb = document.createElement('div');
                rtlbb.setAttribute('class', 'rtlbb'+i);
                var numA = (3 + (3 * (d - 1))) - (j - 1);
                var numB = (6 + (3 * (d - 1))) - (j - 1);
                let num = numA + ', ' + numB;
                rtlbb.onclick = function(){
                    (this as any).setBet(this, num, 'split', 17);
                };
                rtlbb.oncontextmenu = function(e){
                    e.preventDefault();
                    (this as any).removeBet(this, num, 'split', 17);
                };
                wlrtl.append(rtlbb);
            }
            wl.append(wlrtl);
        }
        
        for(let c = 1; c < 3; c++){
            var wlcb = document.createElement('div');
            wlcb.setAttribute('id', 'wlcb_'+c);
            wlcb.setAttribute('class', 'wlcb');
            for(let i = 1; i < 12; i++){
                let count = (c == 1)? i : i + 11;
                var cbbb = document.createElement('div');
                cbbb.setAttribute('id', 'cbbb_'+count);
                cbbb.setAttribute('class', 'cbbb');
                let numA ="2";
                let numB = '3';
                let numC = '5';
                let numD = '6';
                let num = (count >= 1 && count < 12)? 
                (parseInt(numA) + ((count - 1) * 3)) + ', ' 
                + (parseInt(numB)+((count - 1) * 3)) + ', ' 
                + (parseInt(numC)+((count - 1) * 3)) + ', ' 
                + (parseInt(numD)+((count - 1) * 3)) 
                : ((parseInt(numA) - 1) + ((count - 12) * 3)) + ', ' 
                + ((parseInt(numB) - 1)+((count - 12) * 3)) + ', ' 
                + ((parseInt(numC) - 1)+((count - 12) * 3)) + ', ' 
                + ((parseInt(numD) - 1)+((count - 12) * 3));

                var objType = 'corner_bet';
                cbbb.onclick = function(){
                    (this as any).setBet(this, num, objType, 8);
                };
                cbbb.oncontextmenu = function(e){
                    e.preventDefault();
                    (this as any).removeBet(this, num, objType, 8);
                };
                wlcb.append(cbbb);
            }
            wl.append(wlcb);
        }

        bettingBoard.append(wl);

        let bbtop = document.createElement('div');
        bbtop.setAttribute('class', 'bbtop');
        let bbtopBlocks = ['1 to 18', '19 to 36'];
        for(let i = 0; i < bbtopBlocks.length; i++){
            let f = i;
            var bbtoptwo = document.createElement('div');
            bbtoptwo.setAttribute('class', 'bbtoptwo');
            let num = (f == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' 
            : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
            var objType = (f == 0)? 'outside_low' : 'outside_high';
            bbtoptwo.onclick = function(){
                (this as any).setBet(this, num, objType, 1);
            };
            bbtoptwo.oncontextmenu = function(e){
                e.preventDefault();
                (this as any).removeBet(this, num, objType, 1);
            };
            bbtoptwo.innerText = bbtopBlocks[i];
            bbtop.append(bbtoptwo);
        }
        bettingBoard.append(bbtop);

        let numberBoard = document.createElement('div');
        numberBoard.setAttribute('class', 'number_board');

        let zero = document.createElement('div');
        zero.setAttribute('class', 'number_0');
        var objType = 'zero';
        var odds = 35;
        zero.onclick = function(){
            (this as any).setBet(this, '0', objType, odds);
        };
        zero.oncontextmenu = function(e){
            e.preventDefault();
            (this as any).removeBet(this, '0', objType, odds);
        };
        let nbnz = document.createElement('div');
        nbnz.setAttribute('class', 'nbn');
        nbnz.innerText = '0';
        zero.append(nbnz);
        numberBoard.append(zero);
        
        var numberBlocks = ["3", "6", "9", "12", "15", "18", "21", "24", "27", "30", "33", "36", '2 to 1',
            "2", "5", "8", "11", "14", "17", "20", "23", "26", "29", "32", '35', '2 to 1',
            "1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "31", "34", '2 to 1'];
        var redBlocks = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        for(let i = 0; i < numberBlocks.length; i++){
            let a = i;
            var nbClass = (numberBlocks[i] == '2 to 1')? 'tt1_block' : 'number_block';
            var colourClass = (redBlocks.includes(parseInt(numberBlocks[i])))? ' redNum' : ((nbClass == 'number_block')? ' blackNum' : '');
            var numberBlock = document.createElement('div');
            numberBlock.setAttribute('class', nbClass + colourClass);
            
            numberBlock.onclick = function(){
                if(numberBlocks[a] != '2 to 1'){
                    (this as any).setBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
                }else{
                    let num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : 
                    ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
                    (this as any).setBet(this, num, 'outside_column', 2);
                }
            };
            numberBlock.oncontextmenu = function(e){
                e.preventDefault();
                if(numberBlocks[a] != '2 to 1'){
                    (this as any).removeBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
                }else{
                    let num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : 
                    ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
                    (this as any).removeBet(this, num, 'outside_column', 2);
                }
            };
            var nbn = document.createElement('div');
            nbn.setAttribute('class', 'nbn');
            nbn.innerText = numberBlocks[i];
            numberBlock.append(nbn);
            numberBoard.append(numberBlock);
        }
        bettingBoard.append(numberBoard);

        let bo3Board = document.createElement('div');
        bo3Board.setAttribute('class', 'bo3_board');	
        let bo3Blocks = ['1 to 12', '13 to 24', '25 to 36'];
        for(let i = 0; i < bo3Blocks.length; i++){
            let b = i;
            var bo3Block = document.createElement('div');
            bo3Block.setAttribute('class', 'bo3_block');
            bo3Block.onclick = function(){
                let num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : 
                ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
                (this as any).setBet(this, num, 'outside_dozen', 2);
            };
            bo3Block.oncontextmenu = function(e){
                e.preventDefault();
                let num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : 
                ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
                (this as any).removeBet(this, num, 'outside_dozen', 2);
            };
            bo3Block.innerText = bo3Blocks[i];
            bo3Board.append(bo3Block);
        }

        bettingBoard.append(bo3Board);

        let otoBoard = document.createElement('div');
        otoBoard.setAttribute('class', 'oto_board');	
        let otoBlocks = ['EVEN', 'RED', 'BLACK', 'ODD'];
        for(let i = 0; i < otoBlocks.length; i++){
            let d = i;
            var colourClass = (otoBlocks[i] == 'RED')? ' redNum' : ((otoBlocks[i] == 'BLACK')? ' blackNum' : '');
            var otoBlock = document.createElement('div');
            otoBlock.setAttribute('class', 'oto_block' + colourClass);
            otoBlock.onclick = function(){
                let num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : 
                ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' :
                ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' :
                '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
                (this as any).setBet(this, num, 'outside_oerb', 1);
            };
            otoBlock.oncontextmenu = function(e){
                let num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : 
                ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' :
                ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' :
                '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
                e.preventDefault();
                (this as any).removeBet(this, num, 'outside_oerb', 1);
            };
            otoBlock.innerText = otoBlocks[i];
            otoBoard.append(otoBlock);
        }
        bettingBoard.append(otoBoard);

        let chipDeck = document.createElement('div');
        chipDeck.setAttribute('class', 'chipDeck');
        let chipValues = ["1", "5", "10", "100", 'clear'];

        for(let i = 0; i < chipValues.length; i++){
            let cvi = i;
            let chipColour = (i == 0)? 'red' : ((i == 1)? 'blue cdChipActive' :
            ((i == 2)? 'orange' : ((i == 3)? 'gold' : 'clearBet')));
            
            let chip = document.createElement('div');
            chip.setAttribute('class', 'cdChip ' + chipColour);
            chip.onclick = function(this:any){
                if(cvi !== 4){
                    let cdChipActive = document.getElementsByClassName('cdChipActive');
                    for(i = 0; i < cdChipActive.length; i++){
                        cdChipActive[i].classList.remove('cdChipActive');
                    }
                    const curClass = (this as HTMLElement).getAttribute('class');
                    if (!curClass || !curClass.includes('cdChipActive')) {
                        (this as HTMLElement).setAttribute('class', (curClass ?? '') + ' cdChipActive');
                    }

                    let wager = parseInt((chip.childNodes[0] as HTMLElement).innerText);
                }else{
                    (this as any).setBankValue();
                    
                    this.document.getElementById('bankSpan').innerText = '' + this.bankValue.toLocaleString("en-GB") + '';
                    this.document.getElementById('betSpan').innerText = '' + this.currentBet.toLocaleString("en-GB") + '';
                    (this as any).clearBet();
                    (this as any).removeChips();
                }
            };
            let chipSpan = document.createElement('span');
            chipSpan.setAttribute('class', 'cdChipSpan');
            chipSpan.innerText = chipValues[i];
            chip.append(chipSpan);
            chipDeck.append(chip);
        }
        bettingBoard.append(chipDeck);

        let bankContainer = document.createElement('div');
        bankContainer.setAttribute('class', 'bankContainer');

        let bank = document.createElement('div');
        bank.setAttribute('class', 'bank');

        let bankSpan = document.createElement('span');
        bankSpan.setAttribute('id', 'bankSpan');
        bankSpan.innerText = '' + this.bankValue.toLocaleString("en-GB") + '';
        bank.append(bankSpan);
        bankContainer.append(bank);

        let bet = document.createElement('div');
        bet.setAttribute('class', 'bet');
        let betSpan = document.createElement('span');
        betSpan.setAttribute('id', 'betSpan');
        betSpan.innerText = '' + this.currentBet.toLocaleString("en-GB") + '';
        bet.append(betSpan);
        bankContainer.append(bet);	
        bettingBoard.append(bankContainer);

        let pnBlock = document.createElement('div');
        pnBlock.setAttribute('class', 'pnBlock');

        let pnContent = document.createElement('div');
        pnContent.setAttribute('id', 'pnContent');
        pnContent.onwheel = function(e){
            e.preventDefault();
            pnContent.scrollLeft += e.deltaY;
        };

        pnBlock.append(pnContent);	
        bettingBoard.append(pnBlock);
        
        this.container.append(bettingBoard);
    }

    clearBet(){
        this.bet = [];
        this.numbersBet = [];
    }

    setBet(this:any,e:any, n:string, t:string, o:number){
        this.lastWager = this.wager;
        this.wager = (this.bankValue < this.wager)? this.bankValue : this.wager;
        if(this.wager > 0){
            if(!this.container.querySelector('.spinBtn')){
                let spinBtn = document.createElement('div');
                spinBtn.setAttribute('class', 'spinBtn');
                spinBtn.innerText = 'spin';
                spinBtn.onclick = function(){
                    (this as any).remove();
                    (this as any).spin();
                };
                this.container.append(spinBtn);
            }
            this.bankValue = this.bankValue - this.wager;
            this.currentBet = this.currentBet + this.wager;
            this.document.getElementById('bankSpan').innerText = '' + this.bankValue.toLocaleString("en-GB") + '';
            this.document.getElementById('betSpan').innerText = '' + this.currentBet.toLocaleString("en-GB") + '';
            for(let i = 0; i < this.bet.length; i++){
                if( this.bet[i].numbers == n && this.bet[i].type == t){
                    this.bet[i].amt = this.bet[i].amt + this.wager;
                    let chipColour = (this.bet[i].amt < 5)? 'red' : 
                    ((this.bet[i].amt < 10)? 'blue' : 
                    ((this.bet[i].amt < 100)? 'orange' : 'gold'));
                    e.querySelector('.chip').style.cssText = '';
                    e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
                    let chipSpan = e.querySelector('.chipSpan');
                    chipSpan.innerText = this.bet[i].amt;
                    return;
                }
            }
            var obj = {
                amt: this.wager,
                type: t,
                odds: o,
                numbers: n
            };
            this.bet.push(obj);
            
            let numArray = n.split(',').map(Number);
            for(let i = 0; i < numArray.length; i++){
                if(!this.numbersBet.includes(numArray[i])){
                    this.numbersBet.push(numArray[i]);
                }
            }

            if(!e.querySelector('.chip')){
                let chipColour = (this.wager < 5)? 'red' :
                ((this.wager < 10)? 'blue' : ((this.wager < 100)? 'orange' :
                'gold'));
                let chip = document.createElement('div');
                chip.setAttribute('class', 'chip ' + chipColour);
                let chipSpan = document.createElement('span');
                chipSpan.setAttribute('class', 'chipSpan');
                chipSpan.innerText = this.wager;
                chip.append(chipSpan);
                e.append(chip);
            }
        }
    }

    spin(this:any){
        var winningSpin : number= Math.floor(Math.random() * 36);
        this.spinWheel(winningSpin);
        setTimeout(function(this:any){
            if(this.numbersBet.includes(winningSpin)){
                let winValue = 0;
                let betTotal = 0;
                for(let i = 0; i < this.bet.length; i++){
                    var numArray = this.bet[i].numbers.split(',').map(Number);
                    if(numArray.includes(winningSpin)){
                        this.bankValue = (this.bankValue + (this.bet[i].odds * this.bet[i].amt) + this.bet[i].amt);
                        winValue = winValue + (this.bet[i].odds * this.bet[i].amt);
                        betTotal = betTotal + this.bet[i].amt;
                    }
                }
                this.win(winningSpin, winValue, betTotal);
            }

            this.currentBet = 0;
            this.document.getElementById('bankSpan').innerText = '' + this.bankValue.toLocaleString("en-GB") + '';
            this.document.getElementById('betSpan').innerText = '' + this.currentBet.toLocaleString("en-GB") + '';
            
            let pnClass = (this.numRed.includes(winningSpin))? 'pnRed' : ((winningSpin == 0)? 'pnGreen' : 'pnBlack');
            let pnContent = document.getElementById('pnContent');
            let pnSpan = document.createElement('span');
            pnSpan.setAttribute('class', pnClass);
            pnSpan.innerText = winningSpin.toString();
            if (pnContent) {
                pnContent.append(pnSpan);
                pnContent.scrollLeft = pnContent.scrollWidth;
            }
            
            this.bet = [];
            this.numbersBet = [];
            this.removeChips();
            this.wager = this.lastWager;
            if(this.bankValue == 0 && this.currentBet == 0){
                this.gameOver();
            }
        }, 10000);
    }

    win(winningSpin:number, winValue:number, betTotal:number){
        if(winValue > 0){
            let notification = document.createElement('div');
            notification.setAttribute('id', 'notification');
                let nSpan = document.createElement('div');
                nSpan.setAttribute('class', 'nSpan');
                    let nsnumber = document.createElement('span');
                    nsnumber.setAttribute('class', 'nsnumber');
                    nsnumber.style.cssText = (this.numRed.includes(winningSpin))? 
                    'color:red' : 'color:black';
                    nsnumber.innerText = winningSpin.toString();
                    nSpan.append(nsnumber);

                    let nsTxt = document.createElement('span');
                    nsTxt.innerText = ' Win';
                    nSpan.append(nsTxt);

                    let nsWin = document.createElement('div');

                    nsWin.setAttribute('class', 'nsWin');
                        let nsWinBlock = document.createElement('div');
                        nsWinBlock.setAttribute('class', 'nsWinBlock');
                        nsWinBlock.innerText = 'Bet: ' + betTotal;
                        nSpan.append(nsWinBlock);
                        nsWin.append(nsWinBlock);
                        nsWinBlock = document.createElement('div');
                        nsWinBlock.setAttribute('class', 'nsWinBlock');
                        nsWinBlock.innerText = 'Win: ' + winValue;
                        nSpan.append(nsWinBlock);
                        nsWin.append(nsWinBlock);
                        nsWinBlock = document.createElement('div');
                        nsWinBlock.setAttribute('class', 'nsWinBlock');
                        nsWinBlock.innerText = 'Payout: ' + (winValue + betTotal);
                        nsWin.append(nsWinBlock);
                    nSpan.append(nsWin);
                notification.append(nSpan);
                
            this.container.prepend(notification);
            setTimeout(function(){
                notification.style.cssText = 'opacity:0';
            }, 3000);
            setTimeout(function(){
                notification.remove();
            }, 4000);
        }
    }

    removeBet(this:any,e:any, n:string, t:string, o:number){
        this.wager = (this.wager == 0)? 100 : this.wager;
        for(let i = 0; i < this.bet.length; i++){
            if(this.bet[i].numbers == n && this.bet[i].type == t){
                if(this.bet[i].amt != 0){
                    this.wager = (this.bet[i].amt > this.wager)? 
                    this.wager : this.bet[i].amt;
                    this.bet[i].amt = this.bet[i].amt - this.wager;
                    this.bankValue = this.bankValue + this.wager;
                    this.currentBet = this.currentBet - this.wager;
                    this.document.getElementById('bankSpan').innerText = '' + this.bankValue.toLocaleString("en-GB") + '';
                    this.document.getElementById('betSpan').innerText = '' + this.currentBet.toLocaleString("en-GB") + '';
                    if(this.bet[i].amt == 0){
                        e.querySelector('.chip').style.cssText = 'display:none';
                    }else{
                        let chipColour = (this.bet[i].amt < 5)? 'red' :
                        ((this.bet[i].amt < 10)? 'blue' :
                        ((this.bet[i].amt < 100)? 'orange' : 'gold'));
                        e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
                        let chipSpan = e.querySelector('.chipSpan');
                        chipSpan.innerText = this.bet[i].amt;
                    }
                }
            }
        }

        if(this.currentBet == 0 && this.container.querySelector('.spinBtn')){
            document.getElementsByClassName('spinBtn')[0].remove();
        }
    }

    spinWheel(winningSpin:number){
        for(let i = 0; i < this.wheelnumbersAC.length; i++){
            if(this.wheelnumbersAC[i] == winningSpin){
                var degree = (i * 9.73) + 362;
            }
        }
        (this.wheel as HTMLElement).style.cssText = 'animation: wheelRotate 5s linear infinite;';
        (this.ballTrack as HTMLElement).style.cssText = 'animation: ballRotate 1s linear infinite;';

        setTimeout(function(this:any){
            this.ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
            let style = document.createElement('style');
            style.type = 'text/css';
            style.innerText = '@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-'+degree+'deg);}}';
            document.head.appendChild(style);
        }, 2000);
        setTimeout(function(this:any){
            this.ballTrack.style.cssText = 'animation: ballStop 3s linear;';
        }, 6000);
        setTimeout(function(this:any){
            this.ballTrack.style.cssText = 'transform: rotate(-'+degree+'deg);';
        }, 9000);
        setTimeout(function(this:any){
            this.wheel.style.cssText = '';
            this.style.remove();
        }, 10000);
    }

    removeChips(this:any){
        var chips = document.getElementsByClassName('chip');
        if(chips.length > 0){
            for(let i = 0; i < chips.length; i++){
                chips[i].remove();
            }
            this.removeChips();
        }
    }

    setbankValue(this:any){
        this.bankValue = this.bankValue + this.currentBet;
        this.currentBet = 0;
    }
}

// function setBankValue() {
//     throw new Error("Function not implemented.");
// }
