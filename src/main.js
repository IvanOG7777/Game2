"use strict"
import GalleryShooter from "./Scenes/Scene.js";
// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 700,
    height: 1000,
    scene: [GalleryShooter]
}

let my = {sprite:{}};

const game = new Phaser.Game(config);