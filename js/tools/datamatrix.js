if (!com)
    var com = {};
if (!com.logicpartners)
    com.logicpartners = {};
if (!com.logicpartners.designerTools)
    com.logicpartners.designerTools = {};

com.logicpartners.designerTools.datamatrix = function () {
    var self = this;
    this.counter = 1;
    this.button = $("<div></div>").addClass("designerToolbarBarcode designerToolbarButton").attr("title", "DataMatrix").append($("<div></div>"));
    this.object = function (x, y, width, height) {
        var width = 100;
        var canvasHolder = $("<canvas></canvas>");
        // Canvas size will be updated in draw function based on scale
        this.name = "DataMatrix " + self.counter++;
        this.text = "DATAMATRIX";
        this.x = x;
        this.y = y;
        this.scale = 2; // Default scale
        this.height = this.scale * 50; // Height depends on scale
        this.squareSize = "22x22"; // Default square size (rows x columns)
        this.postfix = ""; // Custom postfix to append to the barcode in ZPL output
        this.angle = 0; // Default angle (no rotation)
        this.dynamic = false; // Dynamic property for variable data

        this.readonly = ["height", "name", "x", "y"];

        this.getZPLData = function () {
            return "";
        }

        this.toZPL = function (labelx, labely, labelwidth, labelheight) {
            // Use ^BX for DataMatrix format
            // ^BY sets the module width (bar width) based on scale
            // ^BX parameters: orientation, height (rows), width (columns), quality

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

            // Dynamic suffix for variable data
            var dynamicSuffix = this.dynamic ? '/u1d' : '';

            // Parse squareSize to get rows and columns
            var dimensions = this.squareSize.split('x');
            var rows = parseInt(dimensions[0]);
            var columns = parseInt(dimensions[1]);

            return "^FO" + (this.x - labelx) + "," + (this.y - labely) +
                "^BY" + this.scale +
                "^BX" + zplRotation + "," + ~~((this.scale * 10) / 3.5) + "," + 200 + "," + rows + "," + columns + ",," + this.postfix +
                "^FD" + dynamicSuffix + this.text + dynamicSuffix + "^FS\r\n";
        }

        // return "^FO" + (this.x - labelx) + "," + (this.y - labely) +
        //         "^BY" + this.scale +
        //         "^BXN," + ~~((this.scale * 10) / 3.5) + "," + 200 +
        //         "^FD" + this.text + "^FS\r\n";

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
                bcid: "datamatrix",    // Barcode type (datamatrix)
                text: this.text,        // Text to encode
                scale: this.scale,      // Scale factor
                height: 10,             // Module height, in millimeters
                width: 10,             // Module width, in millimeters
                includetext: false,     // Show human-readable text
                textxalign: 'center',   // Text alignment
            };

            try {
                // Use bwip-js to render the datamatrix to the canvas
                bwipjs.toCanvas(canvas, options);

                // Get the width of the rendered datamatrix
                var cwidth = canvas.width;
                var cheight = canvas.height;
                width = cwidth; // Update the width variable

                // Get the image data
                var cData = ctx.getImageData(0, 0, cwidth, cheight);

                // Save context state before rotation
                context.save();
                // Translate to the center of where the datamatrix should be
                context.translate(this.x + cwidth / 2, this.y + cheight / 2);
                // Rotate by the specified angle
                context.rotate(this.angle * Math.PI / 180);

                // For 2D datamatrix, we need to iterate through both dimensions
                for (var y = 0; y < cheight; y++) {
                    for (var x = 0; x < cwidth; x++) {
                        // Calculate the index in the pixel data array
                        var idx = (y * cwidth + x) * 4;
                        // Check if the pixel is black (part of the datamatrix)
                        if (cData.data[idx + 3] > 0 && cData.data[idx] === 0) {
                            // Draw a black rectangle for each module, adjusted for rotation around center
                            context.fillRect(x - cwidth / 2, y - cheight / 2, 1, 1);
                        }
                    }
                }

                // Restore context to original state
                context.restore();

            } catch (e) {
                console.error('Error rendering datamatrix:', e);
                // Fallback: draw a placeholder rectangle with scaled width
                var scaledWidth = this.scale * 50;

                context.save();
                context.translate(this.x + scaledWidth / 2, this.y + scaledWidth / 2);
                context.rotate(this.angle * Math.PI / 180);
                context.strokeRect(-scaledWidth / 2, -scaledWidth / 2, scaledWidth, scaledWidth);
                context.fillText('Invalid datamatrix: ' + this.text, -scaledWidth / 2 + 5, 0);
                context.restore();
            }
        }

        this.getWidth = function () {
            return this.scale * 50; // Return width based on scale
        }

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
            context.dashedStroke(parseInt(this.x + 1), parseInt(this.y + 1), parseInt(this.x) + parseInt(width > 0 ? width : scaledWidth) - 1, parseInt(this.y) + parseInt(this.height / 1.75) - 1, [2, 2]);
        }

        this.hitTest = function (coords) {
            var scaledWidth = this.scale * 50;
            return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(width > 0 ? width : scaledWidth) && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height));
        }
    }
};