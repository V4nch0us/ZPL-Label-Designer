if (!com)
	var com = {};
if (!com.logicpartners)
	com.logicpartners = {};
if (!com.logicpartners.designerTools)
	com.logicpartners.designerTools = {};

com.logicpartners.designerTools.barcode = function () {

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
			this.barcodeType = "code128"; // Default barcode type
			this.x = x;
			this.y = y;
			this.scale = 2; // Default scale
			this.height = this.scale * 50; // Height depends on scale by default
			this.customHeight = null; // Custom height (when set, overrides scale-based height)
			this.angle = 0; // Default angle (no rotation)

			this.readonly = ["name", "x", "y", "customHeight"];

			this.getZPLData = function () {
				return "";
			}

			this.toZPL = function (labelx, labely, labelwidth, labelheight) {
				// Map arbitrary angle to ZPL rotation values (0, 90, 180, 270)
				var zplRotation = 'N'; // Default is 'N' (normal/0 degrees)

				// ZPL rotation codes: N=0°, R=90°, I=180°, B=270°
				if (this.angle > 45 && this.angle <= 135) {
					zplRotation = 'R'; // 90 degrees
				} else if (this.angle > 135 && this.angle <= 225) {
					zplRotation = 'I'; // 180 degrees
				} else if (this.angle > 225 && this.angle <= 315) {
					zplRotation = 'B'; // 270 degrees
				}

				// Use ^BC for Code 128 barcode format
				// ^BY sets the module width (bar width) based on scale
				// ^BC parameters: orientation, height, interpretation line, check digit
				return "^FO" + (this.x - labelx) + "," + (this.y - labely) +
					"^BY" + this.scale +
					"^BC" + zplRotation + "," + this.height + ",N,N,N" +
					"^FD" + this.text + "^FS\r\n";
			}

			this.draw = function (context) {
				this.draw = function (context) {
					console.log(this.text);

					// Update height based on scale only if customHeight is not set
					if (this.customHeight === null) {
						this.height = this.scale * 50;
					}

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

						// Save context state before rotation
						context.save();
						// Translate to the center of where the barcode should be
						context.translate(this.x + width / 2, this.y + this.height / 2);
						// Rotate by the specified angle
						context.rotate(this.angle * Math.PI / 180);

						// For 1D barcodes, use the original linear approach
						for (var i = 0; i < cwidth; i++) {
							if (cData.data[i * 4 + 3] > 0 && cData.data[i * 4] === 0) { // Black (barcode = black or white)
								// Draw a black rectangle at this point, adjusted for rotation around center
								context.fillRect(i - width / 2, -this.height / 2, 1, this.height);
							}
						}

						// Restore context to original state
						context.restore();

					} catch (e) {
						console.error('Error rendering barcode:', e);
						// Fallback: draw a placeholder rectangle with scaled width
						var scaledWidth = this.scale * 50;

						context.save();
						context.translate(this.x + scaledWidth / 2, this.y + this.height / 2);
						context.rotate(this.angle * Math.PI / 180);
						context.strokeRect(-scaledWidth / 2, -this.height / 2, scaledWidth, this.height);
						context.fillText('Invalid barcode: ' + this.text, -scaledWidth / 2 + 5, 0);
						context.restore();
					}
				}

				// this.setWidth = function (width) {
				// 	//this.width = width;
				// }

				this.getWidth = function () {
					return this.scale * 50; // Return width based on scale
				}

				this.setHeight = function (height) {
					if (height) {
						// Set custom height
						this.customHeight = height;
						this.height = height;
					} else {
						// Reset to scale-based height
						this.customHeight = null;
						this.height = this.scale * 50;
					}
				}

				this.getHeight = function () {
					return this.height; // Return the current height (custom or scale-based)
				}

				this.setHandle = function (coords) {
					this.setHandle = function (coords) {
						this.handle = this.resizeZone(coords);
					}

					this.getHandle = function () {
						this.getHandle = function () {
							return this.handle;
						}

						this.drawActive = function (context) {
							var scaledWidth = this.scale * 50;
							context.save();
							context.translate(this.x + (width > 0 ? width : scaledWidth) / 2, this.y + this.height / 2);
							context.rotate(this.angle * Math.PI / 180);
							var halfWidth = (width > 0 ? width : scaledWidth) / 2;
							var halfHeight = this.height / 2;
							context.dashedStroke(-halfWidth + 1, -halfHeight + 1, halfWidth - 1, halfHeight - 1, [2, 2]);
							context.restore();
						}

						this.hitTest = function (coords) {
							var scaledWidth = this.scale * 50;

							// If no rotation, use simple hit test
							if (this.angle === 0) {
								return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(width > 0 ? width : scaledWidth) &&
									coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height));
							}

							// For rotated barcode, transform the coordinates
							var centerX = this.x + (width > 0 ? width : scaledWidth) / 2;
							var centerY = this.y + this.height / 2;

							// Translate to origin
							var translatedX = coords.x - centerX;
							var translatedY = coords.y - centerY;

							// Rotate in the opposite direction
							var angleRad = -this.angle * Math.PI / 180;
							var rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
							var rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);

							// Check if the rotated point is within the bounds
							var halfWidth = (width > 0 ? width : scaledWidth) / 2;
							var halfHeight = this.height / 2;

							return (rotatedX >= -halfWidth && rotatedX <= halfWidth &&
								rotatedY >= -halfHeight && rotatedY <= halfHeight);
						}
					}
				};