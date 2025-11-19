define(["model/images"], function (Images) {
    var player = {
        name: "player1",
        sprite: Images.playerShip,
        width: 35,
        height: 46,
        frame: 0,
        score: 0,
        damage: 10,
        guns: 1,
        fireRate: 3,
		hasShot: false,
        hp: 100,
        lives: 3,
        pos: pos = {
            x: 40,
            y: 100
        }
    };
    var enemy = {
        scout: scout = {
            name: "scout",
            ship: Images.scout,
            width: 25,
            height: 28,
            hp: 10,
            alive: true,
            damage: 0,
            fireRate: 0,
            hasShot: false,
            score: 100,
            x: 0,
            y: 0,
            time: 0,
            speed: 6.0
        },
        fighter: fighter = {
            name: "fighter",
            ship: Images.fighter,
            width: 25,
            height: 31,
            hp: 30,
            alive: true,
            damage: 10,
            fireRate: 3,
            hasShot: false,
            score: 200,
            x: 100,
            y: 100,
            time: 0,
            speed: 4.5
        },
        interceptor: interceptor = {
            name: "interceptor",
            ship: Images.interceptor,
            width: 38,
            height: 46,
            hp: 30,
            alive: true,
            damage: 10,
            fireRate: 4,
            hasShot: false,
            score: 300,
            x: 100,
            y: 100,
            time: 0,
            speed: 5.0
        },
        tank: tank = {
            name: "tank",
            ship: Images.tank,
            width: 38,
            height: 37,
            hp: 60,
            alive: true,
            damage: 0,
            fireRate: 0,
            hasShot: false,
            score: 300,
            x: 100,
            y: 100,
            time: 0,
            speed: 3.5
        },
        transport: transport = {
            name: "transport",
            ship: Images.transport,
            width: 38,
            height: 44,
            hp: 30,
            alive: true,
            damage: 0,
            fireRate: 0,
            hasShot: false,
            score: 400,
            x: 100,
            y: 100,
            time: 0,
            speed: 4.0
        }

    };
    var ship = {
        enemy: enemy,
        player: player
    };
    var Character = {
        ship: ship
    };
    return Character;
});