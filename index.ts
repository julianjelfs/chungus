import Phaser  from "phaser";


var config = {
    type: Phaser.AUTO,
    width: "100%",
    height: "100%",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
}

function create ()
{
}

function update ()
{
}