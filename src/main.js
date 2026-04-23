"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 700,
    height: 1000,
    scene: [OneD]
}

let my = {sprite:{}};

const game = new Phaser.Game(config);