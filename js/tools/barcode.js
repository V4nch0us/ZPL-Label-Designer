if (!com)
	var com = {};
if (!com.logicpartners)
	com.logicpartners = {};
if (!com.logicpartners.designerTools)
	com.logicpartners.designerTools = {};

com.logicpartners.designerTools.barcode = function () {
	var self = this;
	this.counter = 1;
	this.button = $("<div></div>").addClass("designerToolbarBarcode designerToolbarButton").attr("title", "Barcode").append($("<div></div>"));
	this.object = function (x, y, width, height) {
		var width = 50;
		var canvasHolder = $("<canvas></canvas>").prop("width", "50").prop("height", "100");
		this.name = "Barcode " + self.counter++;
		this.text = "BARCODE";
		this.barcodeType = "code128"; // Default barcode type
		this.x = x;
		this.y = y;
		// this.width = width;
		this.height = 100;

		this.readonly = ["name", "height", "x", "y", "barcodeTypeToZPL"];

		// Map of bwip-js barcode types to ZPL commands
		this.barcodeTypeToZPL = {
			"code128": "B3", // Code 128
			"qrcode": "BQ", // QR Code
			"datamatrix": "BX" // Data Matrix
		};

		this.getZPLData = function () {
			return "";
		}

		this.toZPL = function (labelx, labely, labelwidth, labelheight) {
			var zplCode = "^FO" + (this.x - labelx) + "," + (this.y - labely);

			// Add barcode module width
			zplCode += "^BY2";

			// Get the ZPL barcode type
			var zplType = this.barcodeTypeToZPL[this.barcodeType] || "B3";

			// Add the barcode command based on type
			if (zplType === "BQ" || zplType === "BX") {
				// 2D barcodes have different parameters
				zplCode += "^" + zplType + "N," + Math.min(this.height, 500) / 10 + ",200" + "^FD" + this.text + "^FS";
			} else {
				// 1D barcodes
				zplCode += "^" + zplType + "N,N," + this.height + "N,N^FD" + this.text + "^FS";
			}

			return zplCode;
		}

		this.draw = function (context) {
			console.log(this.text);

			// Use bwip-js to generate the barcode
			try {
				// Clear the canvas first
				var ctx = canvasHolder[0].getContext('2d');
				ctx.clearRect(0, 0, canvasHolder[0].width, canvasHolder[0].height);

				// Set up bwip-js options
				var options = {
					bcid: this.barcodeType,  // Barcode type
					text: this.text,  // Text to encode
					scale: 2,         // 1x scaling factor
					height: 4,        // Bar height, in millimeters
					includetext: false, // Don't show text
					textxalign: 'center', // Text alignment
				};

				// Generate the barcode using bwip-js
				bwipjs.toCanvas(canvasHolder[0], options);

				// Get the width of the generated barcode
				var cwidth = canvasHolder[0].width;
				var cheight = canvasHolder[0].height;
				width = cwidth;

				// Get the image data
				var cData = ctx.getImageData(0, 0, cwidth, cheight);

				// Draw the barcode on the main canvas
				// Check if it's a 2D barcode (QR code or Data Matrix)
				if (this.barcodeType === "qrcode" || this.barcodeType === "datamatrix") {
					// For 2D barcodes, we need to iterate through both width and height
					var pixelSize = Math.min(Math.floor(this.height / cheight), 3); // Calculate pixel size based on height
					pixelSize = Math.max(pixelSize, 1); // Ensure minimum size of 1

					for (var y = 0; y < cheight; y++) {
						for (var x = 0; x < cwidth; x++) {
							// Calculate the index in the image data array
							var idx = (y * cwidth + x) * 4;
							if (cData.data[idx + 3] > 0 && cData.data[idx] === 0) { // Black pixel with alpha
								// Draw a square for each pixel in the 2D barcode
								context.fillRect(this.x + (x * pixelSize), this.y + (y * pixelSize), pixelSize, pixelSize);
							}
						}
					}
				} else {
					// For 1D barcodes, use the original linear approach
					for (var i = 0; i < cwidth; i++) {
						if (cData.data[i * 4 + 3] > 0 && cData.data[i * 4] === 0) { // Black (barcode = black or white)
							// Draw a black rectangle at this point
							context.fillRect(this.x + i, this.y, 1, this.height);
						}
					}
				}
			} catch (e) {
				console.error('Error generating barcode:', e);
				// Fallback: draw a placeholder rectangle if barcode generation fails
				context.fillRect(this.x, this.y, 100, this.height);
			}
		}

		this.setWidth = function (width) {
			// this.width = width;
		}

		this.getWidth = function () {
			return width;
		}

		this.setHeight = function (height) {
			this.height = height;
		}

		this.getHeight = function () {
			return this.height;
		}

		this.setHandle = function (coords) {
			this.handle = this.resizeZone(coords);
		}

		this.getHandle = function () {
			return this.handle;
		}

		this.drawActive = function (context) {
			// For 2D barcodes, calculate the actual width based on canvas dimensions and pixel size
			if (this.barcodeType === "qrcode" || this.barcodeType === "datamatrix") {
				var cwidth = canvasHolder[0].width;
				var cheight = canvasHolder[0].height;
				var pixelSize = Math.min(Math.floor(this.height / cheight), 3);
				pixelSize = Math.max(pixelSize, 1);
				var actualWidth = cwidth * pixelSize;
				context.dashedStroke(parseInt(this.x + 1), parseInt(this.y + 1), parseInt(this.x) + actualWidth - 1, parseInt(this.y) + parseInt(this.height) - 1, [2, 2]);
			} else {
				// For 1D barcodes, use the original width
				context.dashedStroke(parseInt(this.x + 1), parseInt(this.y + 1), parseInt(this.x) + parseInt(width) - 1, parseInt(this.y) + parseInt(this.height) - 1, [2, 2]);
			}
		}

		this.hitTest = function (coords) {
			// For 2D barcodes, calculate the actual width based on canvas dimensions and pixel size
			if (this.barcodeType === "qrcode" || this.barcodeType === "datamatrix") {
				var cwidth = canvasHolder[0].width;
				var cheight = canvasHolder[0].height;
				var pixelSize = Math.min(Math.floor(this.height / cheight), 3);
				pixelSize = Math.max(pixelSize, 1);
				var actualWidth = cwidth * pixelSize;
				return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + actualWidth && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height));
			} else {
				// For 1D barcodes, use the original width
				return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(width) && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height));
			}
		}

		// Get/Set barcode type
		this.getBarcodeType = function () {
			return this.barcodeType;
		}

		this.setBarcodeType = function (type) {
			if (typeof type === 'string') {
				this.barcodeType = type;
			}
		}

		// Get available barcode types
		this.getAvailableBarcodeTypes = function () {
			return Object.keys(this.barcodeTypeToZPL);
		}
	}
};