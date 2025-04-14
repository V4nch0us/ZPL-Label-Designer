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
		var width = 100;
		var canvasHolder = $("<canvas></canvas>");
		// Canvas size will be updated in draw function based on scale
		this.name = "Barcode " + self.counter++;
		this.text = "BARCODE";
		this.x = x;
		this.y = y;
		this.scale = 2; // Default scale
		this.height = this.scale * 50; // Height depends on scale

		this.readonly = ["height", "name", "x", "y"];

		this.getZPLData = function () {
			return "";
		}

		this.toZPL = function (labelx, labely, labelwidth, labelheight) {
			// Use ^BC for Code 128 barcode format
			// ^BY sets the module width (bar width) based on scale
			// ^BC parameters: orientation, height, interpretation line, check digit
			return "^FO" + (this.x - labelx) + "," + (this.y - labely) +
				"^BY" + this.scale +
				"^BCN," + this.height + ",N,N,N" +
				"^FD" + this.text + "^FS\r\n";
		}

		this.draw = function (context) {
			console.log(this.text);

			// Update height based on scale
			this.height = this.scale * 50;

			// Clear the canvas holder
			var canvas = canvasHolder[0];
			// Update canvas size based on scale
			canvas.width = this.scale * 50;
			canvas.height = this.scale * 50;
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Set up bwip-js options
			var options = {
				bcid: "code128",        // Barcode type (code128)
				text: this.text,        // Text to encode
				scale: this.scale,      // Scale factor
				height: 10,             // Bar height, in millimeters
				includetext: false, // Show human-readable text
				textxalign: 'center',   // Text alignment
			};

			try {
				// Use bwip-js to render the barcode to the canvas
				bwipjs.toCanvas(canvas, options);

				// Get the width of the rendered barcode
				var cwidth = canvas.width;
				var cheight = canvas.height;
				width = cwidth; // Update the width variable

				// Get the image data
				var cData = ctx.getImageData(0, 0, cwidth, cheight);


				// For 1D barcodes, use the original linear approach
				for (var i = 0; i < cwidth; i++) {
					if (cData.data[i * 4 + 3] > 0 && cData.data[i * 4] === 0) { // Black (barcode = black or white)
						// Draw a black rectangle at this point
						context.fillRect(this.x + i, this.y, 1, this.height);
					}
				}

			} catch (e) {
				console.error('Error rendering barcode:', e);
				// Fallback: draw a placeholder rectangle with scaled width
				var scaledWidth = this.scale * 50;
				context.strokeRect(this.x, this.y, scaledWidth, this.height);
				context.fillText('Invalid barcode: ' + this.text, this.x + 5, this.y + this.height / 2);
			}
		}

		// this.setWidth = function (width) {
		// 	//this.width = width;
		// }

		this.getWidth = function () {
			return this.scale * 50; // Return width based on scale
		}

		// this.setHeight = function (height) {
		// 	this.height = height;
		// }

		this.getHeight = function () {
			return this.height; // Return the calculated height
		}

		this.setHandle = function (coords) {
			this.handle = this.resizeZone(coords);
		}

		this.getHandle = function () {
			return this.handle;
		}

		this.drawActive = function (context) {
			var scaledWidth = this.scale * 50;
			context.dashedStroke(parseInt(this.x + 1), parseInt(this.y + 1), parseInt(this.x) + parseInt(width > 0 ? width : scaledWidth) - 1, parseInt(this.y) + parseInt(this.height) - 1, [2, 2]);
		}

		this.hitTest = function (coords) {
			var scaledWidth = this.scale * 50;
			return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(width > 0 ? width : scaledWidth) && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height));
		}
	}
};