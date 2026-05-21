const fastCompare = (val1, val2) => {
  if (val1 === val2) return true;
  if (val1 === null || val2 === null || typeof val1 !== 'object' || typeof val2 !== 'object') {
    return false;
  }
  if (Array.isArray(val1)) {
    if (!Array.isArray(val2) || val1.length !== val2.length) return false;
    for (let i = 0; i < val1.length; i += 1) {
      if (!fastCompare(val1[i], val2[i])) return false;
    }
    return true;
  }
  if (Array.isArray(val2)) return false;
  const keys1 = Object.keys(val1);
  const keys2 = Object.keys(val2);
  if (keys1.length !== keys2.length) return false;
  for (let i = 0; i < keys1.length; i += 1) {
    const key = keys1[i];
    if (!Object.prototype.hasOwnProperty.call(val2, key) || !fastCompare(val1[key], val2[key])) {
      return false;
    }
  }
  return true;
};

const findInterpolatingProperty = (ranges, keyframeNumbers, currentRangeIndex, propertyIndex) => {
  let lowerIndex = currentRangeIndex;
  let upperIndex = currentRangeIndex + 1;
  let lowerKeyframeValue;
  let upperKeyframeValue;
  while (lowerIndex >= 0) {
    const keyframe = keyframeNumbers[ranges[lowerIndex]];
    const prop = keyframe.find((propCandidate) => propCandidate.propertyIndex === propertyIndex);
    if (prop) {
      lowerKeyframeValue = prop;
      break;
    }
    lowerIndex -= 1;
  }
  while (upperIndex <= ranges.length - 1) {
    const keyframe = keyframeNumbers[ranges[upperIndex]];
    const prop = keyframe.find((propCandidate) => propCandidate.propertyIndex === propertyIndex);
    if (prop) {
      upperKeyframeValue = prop;
      break;
    }
    upperIndex += 1;
  }
  if (!lowerKeyframeValue || !upperKeyframeValue) {
    return false;
  }

  return !fastCompare(lowerKeyframeValue.keyframe.s, upperKeyframeValue.keyframe.s);
};

const findMissingIndexes = (initKeyframeData, endKeyframeData, totalProperties) => Array
  .from(Array(totalProperties), (x, i) => i)
  .filter((index) => !(initKeyframeData.find((keyframeData) => keyframeData.propertyIndex === index)
                && endKeyframeData.find((keyframeData) => keyframeData.propertyIndex === index)));

const findInterpolatingProperties = (
  ranges,
  keyframeNumbers,
  currentRangeIndex,
  totalProperties,
) => {
  const initFrame = parseInt(ranges[currentRangeIndex], 10);
  const endFrame = parseInt(ranges[currentRangeIndex + 1], 10);
  const initKeyframeData = keyframeNumbers[initFrame];
  const endKeyframeData = keyframeNumbers[endFrame];
  const missingProperties = findMissingIndexes(initKeyframeData, endKeyframeData, totalProperties);
  for (let i = 0; i < missingProperties.length; i += 1) {
    if (findInterpolatingProperty(
      ranges,
      keyframeNumbers,
      currentRangeIndex,
      missingProperties[i],
    )) {
      return true;
    }
  }

  return false;
};

const areInterpolationsEqual = (properties) => {
  const firstI = properties[0].keyframe.i;
  const firstO = properties[0].keyframe.o;
  for (let i = 1; i < properties.length; i += 1) {
    if (!fastCompare(firstI, properties[i].keyframe.i)
         || !fastCompare(firstO, properties[i].keyframe.o)
    ) {
      return false;
    }
  }
  return true;
};

const findRangesOnKeyframes = (properties, withEqualEasing = false) => {
  const keyframeNumbers = {};
  properties.forEach((propertyKeyframes, propertyIndex) => {
    for (let i = 0; i < propertyKeyframes.length; i += 1) {
      const keyframe = propertyKeyframes[i];
      if (!keyframeNumbers[keyframe.t]) {
        keyframeNumbers[keyframe.t] = [];
      }
      keyframeNumbers[keyframe.t].push({
        propertyIndex,
        keyframe,
      });
    }
  });
  const totalProperties = properties.length;
  const ranges = Object.keys(keyframeNumbers)
    .sort((a, b) => a - b);
  const finalFrames = new Set();
  for (let i = 0; i < ranges.length - 1; i += 1) {
    const initFrame = parseInt(ranges[i], 10);
    const endFrame = parseInt(ranges[i + 1], 10);
    let isValidRange = false;
    if (!withEqualEasing || areInterpolationsEqual(keyframeNumbers[initFrame])) {
      if (keyframeNumbers[initFrame].length === keyframeNumbers[endFrame].length
                && keyframeNumbers[initFrame].length === totalProperties) {
        finalFrames.add(initFrame);
        finalFrames.add(endFrame);
        isValidRange = true;
      } else if (!findInterpolatingProperties(ranges, keyframeNumbers, i, totalProperties)) {
        finalFrames.add(initFrame);
        finalFrames.add(endFrame);
        isValidRange = true;
      }
    }
    if (!isValidRange) {
      let count = initFrame;
      while (count <= endFrame) {
        finalFrames.add(count);
        count += 1;
      }
    }
  }
  return finalFrames;
};

const rangeFinder = (properties, withEqualEasing = false) => {
  const keyframedProperties = properties
    .filter((property) => property.a === 1)
    .map((property) => property.k);
  return Array.from(findRangesOnKeyframes(keyframedProperties, withEqualEasing));
};

module.exports = rangeFinder;
