const LottieAnimation = require('./LottieAnimation');
const LottieNull = require('./LottieNull');
const shapeFactory = require('./shapeFactory');
const nullFactory = require('./nullFactory');
const addAnimations = require('./animations/animations');
const LottiePreComp = require('./LottiePreComp');

const layerTypes = {
  SHAPE: 'Shape',
  NODE: 'Node',
};

const renderableElements = [
  layerTypes.SHAPE,
  layerTypes.NODE,
];
const getRootElements = (children) => children.filter(
  (child) => child.parentId === 0 && renderableElements.includes(child.type),
);

const createLottieAnimations = (artboard) => {
  const totalAnimations = Math.max(artboard.animations.length, 1);
  const animations = [];
  for (let i = 0; i < totalAnimations; i += 1) {
    const lottieAnimation = new LottieAnimation(artboard.width, artboard.height);
    if (artboard.animations[i]) {
      const anim = artboard.animations[i];
      lottieAnimation.frameRate = anim.fps;
      if (anim.enableWorkArea) {
        if (anim.workStart !== -1) {
          lottieAnimation.inPoint = anim.workStart;
        }
        lottieAnimation.outPoint = anim.workEnd === -1
          ? anim.duration
          : anim.workEnd;
      } else {
        lottieAnimation.inPoint = 0;
        lottieAnimation.outPoint = anim.duration;
      }
    }
    animations.push(lottieAnimation);
  }
  return animations;
};

const createNull = () => [new LottieNull()];

const layerCreators = {
  [layerTypes.SHAPE]: shapeFactory,
  [layerTypes.NODE]: nullFactory,
};

const createLayersFromElement = (element, width, height) => {
  if (layerCreators[element.type]) {
    return layerCreators[element.type](element, undefined, width, height);
  }

  return createNull(element);
};

const addElements = (lottieAnimations, artboard) => {
  const rootElements = getRootElements(artboard.children);
  lottieAnimations.forEach((lottie) => {
    let preCompId = 20000;
    rootElements.forEach((element) => {
      const preComp = new LottiePreComp(preCompId, artboard.width, artboard.height);
      preCompId += 1;
      lottie.addLayer(preComp);
      const layers = createLayersFromElement(element);
      layers
        .filter(Boolean)
        .forEach((layer) => {
          preComp.addLayer(layer);
        });
    });
  });
};

const createAnimationsFromArtboard = (artboard) => {
  LottiePreComp.refIdCount = 0;
  const lottieAnimations = createLottieAnimations(artboard);
  addElements(lottieAnimations, artboard);
  addAnimations(lottieAnimations, artboard);
  return lottieAnimations;
};

module.exports = createAnimationsFromArtboard;
