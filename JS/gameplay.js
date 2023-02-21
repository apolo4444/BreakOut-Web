var BLOCKS=15*10;
var activate=false;
var gameOver=false;

GamePlayManager={

    init: function(){
        game.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally=true;
       game.scale.pageAlignVertically=true;

       this.score=0;
       this.x=0;
       this.y=40;
       this.lives=3;
       this.speed=100;
       this.ballX=this.speed*0.03;
       this.ballY=this.speed*0.03;
       this.break=BLOCKS;

    },

    preload:function(){
        game.load.image("ball","./SRC/IMAGES/bolita.png");
        game.load.image("block","./SRC/IMAGES/ladrillo.png");
        game.load.image("racket","./SRC/IMAGES/paleta.png");
        game.load.audio("audio","./SRC/SOUNDS/Audio_3_.mp3");
    },

    gamePanel:function(){
        var screen = game.add.bitmapData(game.width, game.height);
        screen.ctx.fillStyle = '#FF00FF';
        screen.ctx.fillRect(0,0,game.width, game.height);

        var bg = game.add.sprite(0,0,screen);
        bg.alpha = 1;

        return bg;
    },
    showFinalMessage:function(msg){
        
        var style = {
            font: 'bold 60pt Arial',
            fill: '#FFFFFF',
            align: 'center'
          }
        //Crea un bitmap con el texto
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0,0,game.width, game.height);
        bgAlpha.ctx.font="60px Arial";
        bgAlpha.ctx.fillStyle="#FFFFFF";
        bgAlpha.ctx.fillText(msg,game.width/4, game.height/2);
    
        //Crea un sprite con el bitmap
        var bg = game.add.sprite(0,0,bgAlpha);
        bg.alpha = 0.5;
       
        
       return bg;
  
    },
    onTap: function(){
        if(!activate){
            activate=true;
        }else{
            activate=false;
        }
    },
    create:function(){
        this.screen=this.gamePanel();
        this.racket=game.add.sprite(0,0,"racket");
        this.racket.anchor.setTo(0.5,0.5);
        this.racket.x=game.width/2;
        this.racket.y=game.height-this.racket.width/2;
        this.ball=game.add.sprite(0,0,"ball");
        this.ball.anchor.setTo(0.5,0.5);
        this.ball.x=this.racket.x;
        this.ball.y=this.racket.y-this.ball.height-10;

        this.blocks=[];

        for(let i=0;i<BLOCKS;i++){

            var block=game.add.sprite(this.x,this.y,"block");
            this.blocks[i]=block;
            if(this.x>=game.width-40){
                this.x=0;
                this.y+=20;
            }else{
                this.x+=40;
            }
        }
        game.input.onDown.add(this.onTap,this);

        this.loop=game.sound.add("audio");
        this.loop.play();

        //Texto del puntaje
        this.currentScore = 0;
        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
          }
        
        this.scoreText = game.add.text(game.width/2, 20, '0', style);
        this.scoreText.anchor.setTo(0.5);

        this.livesText=game.add.text(20,20,this.lives, style);
        this.livesText.anchor.setTo(0.5);

    },
    increaseScore:function(){
        //cambia el sprite del caballo cuando agarra un diamante durante un tiempo determinado
        this.currentScore+=100;
        this.scoreText.text = this.currentScore;

    },

    getBoundsBlock: function(currentDiamond){
        //Devuelve un rectangulo con las mismas dimenciones que los sprites
        return new Phaser.Rectangle(currentDiamond.left,currentDiamond.top,currentDiamond.width,currentDiamond.height);

    },

    isRectanglesOverlapping: function(rect1, rect2) {
        if(rect1.x> rect2.x+rect2.width || rect2.x> rect1.x+rect1.width){
            return false;
        }
        if(rect1.y> rect2.y+rect2.height || rect2.y> rect1.y+rect1.height){
            return false;
        }
        return true;
    },

    isOverlapingOtherBlock:function(index, rect2){
        for(var i=0; i<index; i++){
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },

    racketMove:function(){
        var pointerX=game.input.x;
        var distX=pointerX-this.racket.x;
        this.racket.x+=distX*0.03;
    },

    ballMove:function(ball){
        var rectBall=this.getBoundsBlock(ball);
        var rectRacket=this.getBoundsBlock(this.racket);
        var dx=game.rnd.integerInRange(0,100)*0.03;
        //this.ballY=this.ballY;
        
        if(this.isRectanglesOverlapping(rectBall,rectRacket)){
            this.ballY=-(this.ballY);
        }

        if (ball.x + this.ballX < 0){
            this.ballX=(game.rnd.integerInRange(50,100)*0.03);
            
        }
        if(ball.x +this.ballX > game.width-ball.width/2){
            this.ballX=-(game.rnd.integerInRange(50,100)*0.03);
            
        }
			    
		if (ball.y+this.ballY < 0){
            this.ballY=(game.rnd.integerInRange(50,100)*0.03);
            
        }

        if(ball.y+this.ballY> game.height-ball.height/2){
            this.lives-=1;
            this.livesText.text=this.lives;
            this.ball.x=this.racket.x;
            this.ball.y=this.racket.y-this.ball.height-10;
            activate=false;

            if(this.lives==0){
                gameOver=true;
                var GO=this.showFinalMessage("GAME OVER");
            }

            if(this.break==0){
                var win=this.showFinalMessage("CONGRATULATION");
            }
           
        }

        for(let i=0;i<BLOCKS;i++){
            let rectBlock=this.getBoundsBlock(this.blocks[i]);
            if(this.blocks[i].visible&&this.isRectanglesOverlapping(rectBall,rectBlock)){
                this.increaseScore();
                this.break--;
                this.blocks[i].visible=false;
                //this.ballY=-(game.rnd.integerInRange(50,100)*0.03);
                this.ballY=-(this.ballY);
                this.ballX=-(game.rnd.integerInRange(50,100)*0.03);
                

            }
            

        }
            

        ball.x+=this.ballX;
        ball.y+=this.ballY;

        ball.x+=this.ballX;
        ball.y+=this.ballY;
    },

    update:function(){
        if(!gameOver){
            if(activate){
                this.racketMove();
                this.ballMove(this.ball);

               
                
            }
        }
        
    }

}

var game= new Phaser.Game(600,600,Phaser.AUTO);
game.state.add("gameplay",GamePlayManager);
game.state.start("gameplay");