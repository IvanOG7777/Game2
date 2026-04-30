"use strict"
import GalleryShooter from "./Scenes/Scene.js";
import Init from "./Scenes/Init.js";
// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 700,
    height: 900,
    scene: [Init, GalleryShooter]
}

let my = {sprite:{}};

const game = new Phaser.Game(config);