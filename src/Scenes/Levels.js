const levels = [
    {
        wave: 1,
        scoreNeeded: 0,
        enemyCount: 15,
        enemyType: "basic",
        movement: "groupDown"
    },
    {
        wave: 2,
        scoreNeeded: 300,
        enemyCount: 25,
        enemyType: "basic",
        movement: "groupDown"
    },
    {
        wave: 3,
        scoreNeeded: 500,
        enemyCount: 25,
        enemyType: "basic",
        movement: "groupDown"
    },
    {
        wave: 4,
        scoreNeeded: 700,
        enemyCount: 15,
        enemyType: "path",
        movement: "zigzag"
    },
    {
        wave: 5,
        scoreNeeded: 900,
        enemyCount: 20,
        enemyType: "path",
        movement: "zagzig"
    },
    {
        wave: 6,
        scoreNeeded: 1100,
        enemyCount: 45, // 20 path and 25 basic
        enemyType: "mix",
        movement: "groupDownZigzag"
    },
    {
        wave: 7,
        scoreNeeded: 1300,
        enemyCount: 51,
        enemyType: "mixBoss", // 25 path 25 basic 1 mothership
        movement: "boss"
    }
];

export default levels;