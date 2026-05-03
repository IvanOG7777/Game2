const levels = [
    {
        wave: 1,
        scoreNeeded: 0,
        rows: 3,
        cols: 5,
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
        movement: "groupDown",
        startX: 100,
        startY: -550,
        speedBoostScore: 1000
    },
    {
        wave: 4,
        scoreNeeded: 1500,
        enemyCount: 15,
        movement: "zigzagANDGroup",
        rows: 6,
        cols: 5,
        startX: 100,
        startY: -550,
        speedBoostScore: 1700
    },
    {
        wave: 5,
        scoreNeeded: 2000,
        enemyCount: 20,
        movement: "zagzigANDGroup",
        rows: 6,
        cols: 5,
        startX: 100,
        startY: -550,
        speedBoostScore: 2300
    },
    {
        wave: 6,
        scoreNeeded: 9000,
        enemyCount: 51,
        movement: "boss",
        speedBoostScore: 1000
    }
];

export default levels;