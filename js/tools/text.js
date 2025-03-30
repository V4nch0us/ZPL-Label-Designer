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
		this.x = x;
		this.y = y;
		this.fontSize = 36;
		this.fontType = "Arial";
		this.width = 100;
		this.height = 0;
		this.angle = 0;

		this.readonly = ["width", "height"];

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
			return "^FO" + (this.x - labelx) + "," + (this.y - labely) + "^FD" + this.text + "^FS";
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
			return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x) + parseInt(this.width) && coords.y >= parseInt(this.y) && coords.y <= parseInt(this.y) + parseInt(this.height) * 0.75);
		}
	}
}