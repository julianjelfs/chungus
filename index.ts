import Phaser from "phaser";
import sky from "./assets/sky.png";
import ground from "./assets/platform.png";
import star from "./assets/star.png";
import bomb from "./assets/bomb.png";
import dude from "./assets/dude.png";

class Scene1 extends Phaser.Scene {
  constructor(
    private score: number,
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    private scoreText: Phaser.GameObjects.Text,
    private player: Phaser.Physics.Arcade.Sprite,
    private platforms: Phaser.Physics.Arcade.StaticGroup,
    private bombs: Phaser.Physics.Arcade.Group,
    private stars: Phaser.Physics.Arcade.Group,
    private gameOver: boolean = false
  ) {
    super("main");
    this.score = 0;
  }

  preload() {
    this.load.image("sky", sky);
    this.load.image("ground", ground);
    this.load.image("star", star);
    this.load.image("bomb", bomb);
    this.load.spritesheet("dude", dude, { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    this.addBackground();
    this.addPlayer();
    this.addStars();
    this.addBombs();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.scoreText = this.add.text(16, 16, `score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000"
    });
  }

  update() {
    if (
      this.cursors &&
      this.cursors.left &&
      this.cursors.right &&
      this.cursors.up &&
      this.cursors.down &&
      this.player
    ) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
        this.player.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
        this.player.anims.play("right", true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play("turn");
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }
    }
  }

  addBackground() {
    this.platforms = this.physics.add.staticGroup();

    this.add.image(400, 300, "sky");

    this.platforms
      .create(400, 568, "ground")
      .setScale(2)
      .refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");
  }

  addPlayer() {
    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.platforms);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
  }

  addBombs() {
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      undefined,
      this
    );
  }

  collectStar(_: unknown, star: Phaser.GameObjects.GameObject) {
    (star as Phaser.Physics.Arcade.Image).disableBody(true, true);
    this.score += 10;
    this.scoreText.setText(`score: ${this.score}`);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate(child => {
        const c = child as Phaser.Physics.Arcade.Image;
        c.enableBody(true, c.x, 0, true, true);
      });

      const x =
        this.player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  hitBomb() {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.anims.play("turn");
    this.gameOver = true;
  }

  addStars() {
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.physics.add.collider(this.stars, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    );

    this.stars.children.iterate(child => {
      const c = child as Phaser.Physics.Arcade.Image;
      c.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [Scene1],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 350 },
      debug: false
    }
  }
});
