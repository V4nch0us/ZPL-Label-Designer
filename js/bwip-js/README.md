# bwip-js Integration

This directory contains the bwip-js library which has replaced the JsBarcode library in the ZPL Label Designer project.

## About bwip-js

bwip-js is a translation to JavaScript of the BWIPP (Barcode Writer in Pure PostScript) library by Terry Burton. It provides a comprehensive set of barcode encoders including:

- Linear barcodes: Code 128, Code 39, UPC/EAN, ITF, Codabar, etc.
- 2D barcodes: QR Code, Data Matrix, PDF417, etc.

## Implementation Details

The barcode.js file in the tools directory has been updated to use bwip-js instead of JsBarcode. The implementation:

1. Uses bwip-js to render barcodes to a canvas element
2. Reads the pixel data from the canvas
3. Draws the barcode on the main canvas
4. Generates appropriate ZPL code based on the barcode type

## Advantages Over JsBarcode

- Supports many more barcode formats (over 100 vs 7 in JsBarcode)
- Better maintained and more actively developed
- More accurate barcode generation
- Support for 2D barcodes like QR codes and Data Matrix

## Documentation

For more information about bwip-js, visit:
https://github.com/metafloor/bwip-js