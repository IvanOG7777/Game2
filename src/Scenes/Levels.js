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
        scoreNeeded: 350,
        rows: 5,
        cols: 5,
        movement: "groupDown",
        startX: 100,
        startY: -450,
        speedBoostScore: 500
    },
    {
        wave: 3,
        scoreNeeded: 950,
        enemyCount: 30,
        rows: 6,
        cols: 5,
        movement: "groupDown",
        startX: 100,
        startY: -550,
        speedBoostScore: 1100
    },
    {
        wave: 4,
        scoreNeeded: 1500,
        enemyCount: 15,
        movement: "zigzagANDGroup",
        rows: 7,
        cols: 5,
        startX: 100,
        startY: -600,
        speedBoostScore: 2000
    },
    {
        wave: 5,
        scoreNeeded: 2700,
        enemyCount: 20,
        movement: "zagzigANDGroup",
        rows: 6,
        cols: 5,
        startX: 100,
        startY: -600,
        speedBoostScore: 3000
    },
    {
        wave: 6,
        scoreNeeded: 3800,
        movement: "boss",
        enemyCount: 7,
        bossHealth: 10,
        speedBoostScore: 4200
    }
];

export default levels;