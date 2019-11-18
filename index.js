import Phaser from "phaser";
import sky from "./assets/sky.png";
import ground from "./assets/platform.png";
import star from "./assets/star.png";
import bomb from "./assets/bomb.png";
import dude from "./assets/dude.png";

let cursors;
let player;
let stars;
let platforms;
let score = 0;
let scoreText;
let bombs;
let gameOver = false;

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 350 },
      debug: false
    }
  }
});

function preload() {
  this.load.image("sky", sky);
  this.load.image("ground", ground);
  this.load.image("star", star);
  this.load.image("bomb", bomb);
  this.load.spritesheet("dude", dude, { frameWidth: 32, frameHeight: 48 });
}

function addBackground(scene) {
  const platforms = scene.physics.add.staticGroup();

  scene.add.image(400, 300, "sky");

  platforms
    .create(400, 568, "ground")
    .setScale(2)
    .refreshBody();

  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  return platforms;
}

function addPlayer(scene) {
  const player = scene.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  scene.physics.add.collider(player, platforms);

  scene.anims.create({
    key: "left",
    frames: scene.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20
  });

  scene.anims.create({
    key: "right",
    frames: scene.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  return player;
}

function addBombs(scene, platforms, player) {
  bombs = scene.physics.add.group();

  scene.physics.add.collider(bombs, platforms);

  scene.physics.add.collider(player, bombs, hitBomb(scene), null, scene);

  return bombs;
}

function collectStar(_, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText(`score: ${score}`);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(child => {
      child.enableBody(true, child.x, 0, true, true);
    });

    const x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    const bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(scene) {
  return (player, bomb) => {
    scene.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    gameOver = true;
  };
}

function addStars(scene, platforms, player) {
  const stars = scene.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  scene.physics.add.collider(stars, platforms);

  scene.physics.add.overlap(player, stars, collectStar, null, this);

  stars.children.iterate(child => {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  return stars;
}

function create() {
  platforms = addBackground(this);
  player = addPlayer(this, platforms);
  stars = addStars(this, platforms, player);
  bombs = addBombs(this, platforms, player);
  cursors = this.input.keyboard.createCursorKeys();
  scoreText = this.add.text(16, 16, `score: ${score}`, {
    fontSize: "32px",
    fill: "#000"
  });
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}
