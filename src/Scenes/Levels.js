const levels = [
    {
        wave: 1,
        scoreNeeded: 0,
        rows: 3,
        cols: 5,
        enemyType: "basic",
        movement: "groupDown",
        startX: 100,
        startY: -240,
        speedBoostScore: 200 
    },
    {
        wave: 2,
        scoreNeeded: 325,
        rows: 5,
        cols: 5,
        enemyType: "basic",
        movement: "groupDown",
        startX: 100,
        startY: -450,
        speedBoostScore: 520 
    },
    {
        wave: 3,
        scoreNeeded: 800,
        enemyCount: 30,
        rows: 6,
        cols: 5,
        enemyType: "basic",
        movement: "groupDown",
        startX: 100,
        startY: -550,
        speedBoostScore: 1000 
    },
    {
        wave: 4,
        scoreNeeded: 1500,
        enemyCount: 15,
        enemyType: "path",
        movement: "zigzagANDGroup",
        rows: 6,
        cols: 5,
        startX: 100,
        startY: -550,
    },
    {
        wave: 5,
        scoreNeeded: 2000,
        enemyCount: 20,
        enemyType: "path",
        movement: "zagzigANDGroup",
        rows: 6,
        cols: 5,
        startX: 100,
        startY: -550,
    },
    {
        wave: 6,
        scoreNeeded: 2500,
        enemyCount: 45, // 20 path and 25 basic
        enemyType: "mix",
        movement: "groupDownZigzag",
    },
    {
        wave: 7,
        scoreNeeded: 3000,
        enemyCount: 51,
        enemyType: "mixBoss", // 25 path 25 basic 1 mothership
        movement: "boss",
    }
];

export default levels;