// Package the existing DownloadLens PNG artwork into a multi-resolution ICO.
// No redrawing, recoloring or image-generation step.
const fs = require('fs');
const path = require('path');
const sizes = [16, 32, 48, 96, 128];
const frames = sizes.map(size => fs.readFileSync(path.join(__dirname, 'firefox-extension', 'icons', `icon-${size}.png`)));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
frames.forEach((png, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index]; header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
fs.writeFileSync(path.join(__dirname, 'assets', 'DownloadLens.ico'), Buffer.concat([header, ...frames]));
console.log('DownloadLens.ico: 16, 32, 48, 96, 128px PNG frames');
