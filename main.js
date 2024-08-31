import { Application, Spritesheet, AnimatedSprite, Texture, Assets, Container, Sprite, Ticker } from 'pixi.js';
import { create } from 'zustand';

const bees = []

const scaleMode = {
  scaleMode: 'nearest' // Use PIXI.SCALE_MODES.LINEAR for smooth scaling
};

const WIDTH = 11
const SIZE = 11

const atlasData = {
  frames: {
    bee1: {
      frame: { x: 0, y:0, w:SIZE, h:SIZE },
      sourceSize: { w: SIZE, h: SIZE },
      spriteSourceSize: { x: 0, y: 0, w: SIZE, h: SIZE }
    },
    bee2: {
      frame: { x: SIZE, y:0, w:SIZE, h:SIZE },
      sourceSize: { w: SIZE, h: SIZE },
      spriteSourceSize: { x: 0, y: 0, w: SIZE, h: SIZE }
    },
    bee3: {
      frame: { x: 0, y:11, w:11, h:11 },
      sourceSize: { w: 11, h: 11 },
      spriteSourceSize: { x: 0, y: 0, w: 11, h: 11 }
    },
    bee4: {
      frame: { x: 11, y:11, w:11, h:11 },
      sourceSize: { w: 11, h: 11 },
      spriteSourceSize: { x: 0, y: 0, w: 11, h: 11 }
    },
  },
  meta: {
    image: 'images/spritesheet.png',
    format: 'RGBA8888',
    size: { w: 100, h: 100 },
    scale: 1
  },
  animations: {
    flying: ['bee1','bee2'],
    idle: ['bee3','bee4'],
  }
};

(async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    //settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // Use PIXI.SCALE_MODES.LINEAR for smooth scaling

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Create and add a container to the stage
    //const container = new Container();

    //app.stage.addChild(container);

    app.stage.scale.set(4,4)

    await Assets.load('images/spritesheet.png');
    
    const spritesheet = new Spritesheet(
      Texture.from(atlasData.meta.image),
      atlasData
    );

    //spritesheet.texture.scaleMode = 'nearest';

    await spritesheet.parse();

    createBee(app.stage, spritesheet)

    const ticker = new Ticker();

    ticker.add((delta) => {
        bees.forEach(bee => bee.getState().tick())
    });

    ticker.start();
})();

function createBee(stage, spritesheet) {

  const beeSpriteIdle = new AnimatedSprite(spritesheet.animations.idle);
  const beeSpriteFlying = new AnimatedSprite(spritesheet.animations.flying);

  const store = create((set, get) => ({
    state: 'idle',
    delay: 100,
    x: 50,
    y: 50,
    dx: 50,
    dy: 100,
    tick: () => {
      const { state, delay, x, y, dx, dy } = get()
      beeSpriteIdle.position.x = x
      beeSpriteIdle.position.y = y
      beeSpriteFlying.position.x = x
      beeSpriteFlying.position.y = y
      beeSpriteIdle.visible = state === 'idle'
      beeSpriteFlying.visible = state === 'flying'
      
      if (state === 'idle') {
        if (delay > 0) {
          set(state => ({delay: delay-1}))
          return
        }
        set(state => ({state: 'flying', dx: Math.random()*200, dy: Math.random()*200}))
        return
      }
      if (state === 'flying') {
        if (Math.abs(dx-x) < 2 && Math.abs(dy-y) < 2) {
          set(state => ({state: 'idle', delay: 50}))
        }
        let velocityVector = createVector({x,y},{x:dx,y:dy})
        velocityVector = capVector(velocityVector, 1)

        set(state => ({x: x+velocityVector.x, y: y+velocityVector.y}))
        return
      }
    }
  }));


  beeSpriteIdle.animationSpeed = 0.025;
  beeSpriteIdle.play();
  beeSpriteIdle.visible = false
  stage.addChild(beeSpriteIdle);

  beeSpriteFlying.animationSpeed = 0.2;
  beeSpriteFlying.play();
  beeSpriteFlying.visible = false
  stage.addChild(beeSpriteFlying);

  bees.push(store)
}

function createVector(point1, point2) {
    return {
        x: point2.x - point1.x,
        y: point2.y - point1.y
    };
}

function vectorMagnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function normalizeVector(vector) {
    const magnitude = vectorMagnitude(vector);
    if (magnitude === 0) {
        return { x: 0, y: 0 }; // Avoid division by zero
    }
    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude
    };
}

function capVector(vector, maxLength) {
    const magnitude = vectorMagnitude(vector);
    if (magnitude > maxLength) {
        const normalizedVector = normalizeVector(vector);
        return {
            x: normalizedVector.x * maxLength,
            y: normalizedVector.y * maxLength
        };
    }
    return vector;
}

