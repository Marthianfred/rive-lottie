class BinaryReader {
  constructor(buffer) {
    this.readIndex = 0;
    this.buffer = buffer;
  }

  isEOF() {
    return this.readIndex >= this.buffer.length;
  }

  readUint8() {
    const value = this.buffer.readUInt8(this.readIndex);
    this.readIndex += 1;
    return value;
  }

  readUint32() {
    const value = this.buffer.readUInt32LE(this.readIndex);
    this.readIndex += 4;
    return value;
  }

  readVarUint() {
    let result = 0;
    let shift = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-plusplus
      const byte = this.buffer.readUInt8(this.readIndex++) & 0xff;
      result |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    return result;
  }

  readFloat32() {
    const value = this.buffer.readFloatLE(this.readIndex);
    this.readIndex += 4;
    return value;
  }

  readString(explicitLength = true) {
    const length = explicitLength ? this.readVarUint() : (this.buffer.lengthInBytes || (this.buffer.length - this.readIndex));
    const str = this.buffer.toString('utf8', this.readIndex, this.readIndex + length);
    this.readIndex += length;
    return str;
  }

  readBytes() {
    const length = this.readVarUint();
    const bytes = new Uint8Array(this.buffer.subarray(this.readIndex, this.readIndex + length));
    this.readIndex += length;
    return bytes;
  }

  skipProperty(binaryType) {
    if (binaryType === 0) {
      this.readVarUint();
    } else if (binaryType === 1) {
      const length = this.readVarUint();
      this.readIndex += length;
    } else if (binaryType === 2) {
      this.readIndex += 4;
    } else if (binaryType === 3) {
      this.readIndex += 4;
    } else if (binaryType === 4) {
      this.readIndex += 1;
    }
  }
}

module.exports = BinaryReader;
