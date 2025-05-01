if (!com)
	var com = {};
if (!com.logicpartners)
	com.logicpartners = {};
if (!com.logicpartners.labelControl)
	com.logicpartners.labelControl = {};

com.logicpartners.labelControl.size = function (designer) {
	var self = this;
	this.designer = designer;
	this.workspace = $("<div></div>").addClass("designerLabelControl").attr("title", "Label Size");

	// Convert between mm and inches
	this.mmToInches = function (mm) {
		return mm / 25.4;
	}

	this.inchesToMm = function (inches) {
		return inches * 25.4;
	}

	this.widthContainer = $("<div>Width (mm): </div>").addClass("designerLabelControlContainer").appendTo(this.workspace);
	this.widthController = $("<input type=\"text\" />").addClass("designerLabelControlElement").css({
		width: "50px"

	})
		.val(this.inchesToMm(this.designer.labelWidth / this.designer.dpi))
		.appendTo(this.widthContainer)
		.on("blur", function () {
			self.updateDesigner();
		})
		.on("keypress", function (e) {
			if (e.which == 13) {
				e.preventDefault();
				self.updateDesigner();
			}
		});

	this.heightContainer = $("<div>Height (mm): </div>").addClass("designerLabelControlContainer").appendTo(this.workspace);
	this.heightController = $("<input type=\"text\" />").addClass("designerLabelControlElement").css({
		width: "50px"

	})
		.val(this.inchesToMm(this.designer.labelHeight / this.designer.dpi))
		.appendTo(this.heightContainer)
		.on("blur", function () {
			self.updateDesigner();
		})
		.on("keypress", function (e) {
			if (e.which == 13) {
				e.preventDefault();
				self.updateDesigner();
			}
		});

	this.dpiContainer = $("<div>DPI: </div>").addClass("designerLabelControlContainer").appendTo(this.workspace);
	this.dpiController = $("<input type=\"text\" />")
		.addClass("designerLabelControlElement")
		.css({
			width: "50px"
		})
		.val(this.designer.dpi)
		.appendTo(this.dpiContainer)
		.on("blur", function () {

			self.updateDesigner();
		})
		.on("keypress", function (e) {
			if (e.which == 13) {
				e.preventDefault();
				self.updateDesigner();
			}
		});

	this.updateDesigner = function () {
		var dpi = this.designer.dpi;

		if (!isNaN(this.dpiController.val())) dpi = this.dpiController.val();
		this.designer.dpi = dpi;

		var width = this.inchesToMm(this.designer.labelWidth / this.designer.dpi);
		var height = this.inchesToMm(this.designer.labelHeight / this.designer.dpi);

		if (!isNaN(this.widthController.val())) width = this.widthController.val();
		if (!isNaN(this.heightController.val())) height = this.heightController.val();

		// Convert mm to inches for the designer
		this.designer.updateLabelSize(this.mmToInches(width), this.mmToInches(height));
		this.widthController.val(width);
		this.heightController.val(height);
	}

	this.update = function () {
		this.widthController.val(this.inchesToMm(this.designer.labelWidth / this.designer.dpi));
		this.heightController.val(this.inchesToMm(this.designer.labelHeight / this.designer.dpi));
	}
}