const riveMap = require('./helpers/riveMap');

class RiveObject extends Object {
  constructor(reader) {
    super();
    this._properties = {};
    this._initializeValues();
    this._registerPropertyHandlers();
    this._iterateProperties(reader);
  }

  _iterateProperties(reader) {
    while (!reader.isEOF()) {
      const value = reader.readVarUint();
      if (value === 0) {
        break;
      } else if (this._properties[value]) {
        const before = reader.readIndex;
        this._properties[value](reader);
        if (reader.readIndex === before) {
          const binaryType = riveMap[value];
          if (binaryType !== undefined) {
            reader.skipProperty(binaryType);
          }
        }
      } else {
        const binaryType = riveMap[value];
        if (binaryType !== undefined) {
          reader.skipProperty(binaryType);
        }
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _registerPropertyHandlers() {
  }

  // eslint-disable-next-line class-methods-use-this
  _initializeValues() {
  }

  get type() {
    return this.constructor.name;
  }
}

module.exports = RiveObject;
