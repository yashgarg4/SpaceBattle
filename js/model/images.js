define([""], function () {
    var Images = {};
    var sources, src;
    sources = {
        //menu
        bigLogo: "images/logo/logo_large.png",
        blueMetal: "images/menu/backdrop/blueMetalSheet.jpg",
        pauseScreen: "images/menu/backdrop/helpScreen.png",
        start0: "images/menu/button/startGame0.png",
        start1: "images/menu/button/startGame1.png",
        options0: "images/menu/button/options0.png",
        options1: "images/menu/button/options1.png",
        stats0: "images/menu/button/stats0.png",
        stats1: "images/menu/button/stats1.png",
        about0: "images/menu/button/about0.png",
        about1: "images/menu/button/about1.png",
        restart0: "images/menu/button/restart0.png",
        restart1: "images/menu/button/restart1.png",
        mainMenu0: "images/menu/button/mainMenu0.png",
        mainMenu1: "images/menu/button/mainMenu1.png",
        help0: "images/menu/button/help0.png",
        help1: "images/menu/button/help1.png",
        muteSFX0: "images/menu/button/muteSFX0.png",
        muteSFX1: "images/menu/button/muteSFX1.png",
        muteMusic0: "images/menu/button/muteMusic0.png",
        muteMusic1: "images/menu/button/muteMusic1.png",
        resetStats0: "images/menu/button/resetStats0.png",
        resetStats1: "images/menu/button/resetStats1.png",
        //SHIPS - Modern SpaceShooter Redux Collection
        //playership - orange heavy assault fighter
        playerShip: "images/SpaceShooterRedux/PNG/playerShip3_orange.png",
        //enemy ships - varied modern enemy fleet
        scout: "images/SpaceShooterRedux/PNG/Enemies/enemyGreen1.png",
        fighter: "images/SpaceShooterRedux/PNG/Enemies/enemyRed2.png",
        interceptor: "images/SpaceShooterRedux/PNG/Enemies/enemyBlue3.png",
        tank: "images/SpaceShooterRedux/PNG/Enemies/enemyRed4.png",
        transport: "images/SpaceShooterRedux/PNG/Enemies/enemyGreen5.png",
        //guns - modern beam weapons
        gun0: "images/SpaceShooterRedux/PNG/Effects/fire08.png",
        //bullets - modern energy beams
        blueLaser1: "images/SpaceShooterRedux/PNG/Parts/beam0.png",
        redLaser1: "images/SpaceShooterRedux/PNG/Parts/beam2.png",
        //pickups - modern power-ups
        pickUpHealth: "images/SpaceShooterRedux/PNG/Power-ups/pill_green.png",
        pickUpDamage: "images/SpaceShooterRedux/PNG/Power-ups/bolt_gold.png",
        pickUpFireRate: "images/SpaceShooterRedux/PNG/Power-ups/powerupRed_bolt.png",
		//misc
		explosion: "images/misc/explosion/explosion.png"
    };
    for (src in sources) {
        Images[src] = new Image();
        Images[src].src = sources[src];
    }

    return Images;
});