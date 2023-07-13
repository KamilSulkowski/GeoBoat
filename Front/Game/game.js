window.onload = function(){
    var settings = {
    }
    
    var config = {
        width: 1280,
        height: 1024,
        backgroundColor: '#87CEEB',

        scale: {
            //fit to window
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [Scene1, Scene2]
    };

    var game = new Phaser.Game(config);
}
