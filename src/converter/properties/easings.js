const inOutEasing = (keyframe) => {
  if (keyframe.interpolationType === 1) {
    return {
      o: {
        x: 0.167,
        y: 0.167,
      },
      i: {
        x: 0.833,
        y: 0.833,
      },
    };
  }
  if (keyframe.interpolationType === 2) {
    const { interpolator } = keyframe;
    if (interpolator && typeof interpolator.x1 === 'number') {
      return {
        o: {
          x: interpolator.x1,
          y: interpolator.y1,
        },
        i: {
          x: interpolator.x2,
          y: interpolator.y2,
        },
      };
    }
  }
  return {
    o: {
      x: 0.167,
      y: 0.167,
    },
    i: {
      x: 0.833,
      y: 0.833,
    },
  };
};

const inOutOneDimensionEasing = (keyframe) => {
  if (keyframe.interpolationType === 1) {
    return {
      o: {
        x: [0.167],
        y: [0.167],
      },
      i: {
        x: [0.833],
        y: [0.833],
      },
    };
  }
  if (keyframe.interpolationType === 2) {
    const { interpolator } = keyframe;
    if (interpolator && typeof interpolator.x1 === 'number') {
      return {
        o: {
          x: [interpolator.x1],
          y: [interpolator.y1],
        },
        i: {
          x: [interpolator.x2],
          y: [interpolator.y2],
        },
      };
    }
  }
  return {
    o: {
      x: [0.167],
      y: [0.167],
    },
    i: {
      x: [0.833],
      y: [0.833],
    },
  };
};

module.exports = {
  inOutEasing,
  inOutOneDimensionEasing,
};
