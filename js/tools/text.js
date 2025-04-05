if (!com)
	var com = {};
if (!com.logicpartners)
	com.logicpartners = {};
if (!com.logicpartners.designerTools)
	com.logicpartners.designerTools = {};

com.logicpartners.designerTools.text = function () {
	var self = this;
	this.counter = 1;
	this.button = $("<div></div>").addClass("designerToolbarText designerToolbarButton").attr("title", "Text").append($("<div></div>"));
	this.object = function (x, y, width, height) {
		this.name = "Textbox " + self.counter++;
		this.text = this.name;
		this.fontSize = 36;
		this.x = x;
		this.y = y;
		this.fontType = "Arial";
		this.width = 100;
		this.height = 0;
		this.angle = 0;

		this.readonly = ["width", "height", "name", "fontType", "x", "y"];

		this.getFontHeight = function () {
			var textMeasure = $("<div></div>").css({
				"font-size": this.fontSize + "px",
				"font-family": this.fontType,
				"opacity": 0,
			}).text("M").appendTo($("body"));

			var height = textMeasure.outerHeight();
			textMeasure.remove();
			return height;
		}

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

			// ^A command specifies font and rotation
			// Using 0 for font (default font) and the calculated rotation
			return "^FO" + (this.x - labelx) + "," + (this.y - labely) + "^A0" + zplRotation + "," + this.fontSize + "^FD" + this.text + "^FS\r\n";
		}

		this.draw = function (context) {
			context.font = this.fontSize + "px " + this.fontType;
			var oColor = context.fillStyle;
			context.fillStyle = "white";
			this.height = this.getFontHeight();
			var measuredText = context.measureText(this.text);
			this.width = measuredText.width;
			context.save();
			context.translate(this.x + this.width / 2, this.y + this.height / 2);
			context.rotate(this.angle * Math.PI / 180);
			context.globalCompositeOperation = "difference";
			context.fillText(this.text, -this.width / 2, this.height / 4);
			context.globalCompositeOperation = "source-over";
			context.restore();
			context.fillStyle = oColor;
			//context.fillRect(this.x, this.y, this.width, this.height);
		}

		this.setWidth = function (width) {
			//this.width = width;
		}

		this.getWidth = function () {
			return this.width;
		}

		this.setHeight = function (height) {
			//height = height;
		}

		this.getHeight = function () {
			return this.height * 0.75;
		}

		this.setHandle = function (coords) {
			this.handle = this.resizeZone(coords);
		}

		this.getHandle = function () {
			return this.handle;
		}

		this.drawActive = function (context) {
			context.save();
			context.translate(this.x + this.width / 2, this.y + this.height / 2);
			context.rotate(this.angle * Math.PI / 180);
			var halfWidth = this.width / 2;
			var halfHeight = (this.height * 0.9) / 2;
			context.dashedStroke(-halfWidth + 1, -halfHeight + 1, halfWidth - 1, halfHeight - 1, [2, 2]);
			context.restore();
		}

		this.hitTest = function (coords) {
			// If no rotation, use simple hit test
			if (this.angle === 0) {
				return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(this.width) &&
					coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height) * 0.75);
			}

			// For rotated text, transform the coordinates
			var centerX = this.x + this.width / 2;
			var centerY = this.y + this.height / 2;

			// Translate to origin
			var translatedX = coords.x - centerX;
			var translatedY = coords.y - centerY;

			// Rotate in the opposite direction
			var angleRad = -this.angle * Math.PI / 180;
			var rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
			var rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);

			// Check if the rotated point is within the bounds
			var halfWidth = this.width / 2;
			var halfHeight = (this.height * 0.75) / 2;

			return (rotatedX >= -halfWidth && rotatedX <= halfWidth &&
				rotatedY >= -halfHeight && rotatedY <= halfHeight);
		}
	}
}