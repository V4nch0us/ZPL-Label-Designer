if (!com)
	var com = {};
if (!com.logicpartners)
	com.logicpartners = {};

com.logicpartners.propertyInspector = function (designer, canvas) {
	this.canvas = canvas;
	this.canvasElement = $(canvas);
	this.labelDesigner = designer;
	this.activeElement = null;
	this.propertyNodes = {};
	this.boundingBox = null;
	var self = this;

	// Create the property window.
	this.propertyInspector = $('<div></div>')
		.addClass("designerUtilityWindow")
		.css({
			"left": this.canvas.getBoundingClientRect().right + 5,
			"top": this.canvas.getBoundingClientRect().top,
			"width": "250px",
		})
		//.draggable({handle: "div.designerPropertyTitle"})
		.insertAfter(this.canvasElement);

	this.updatePosition = function (xchange) {
		this.propertyInspector.css("left", parseInt(this.propertyInspector.css("left")) + xchange);
		this.boundingBox = this.propertyInspector[0].getBoundingClientRect();
	}


	this.propertyViewContainer = $('<div></div>')
		.addClass("designerPropertyContainer")
		.resizable({
			resize: function (event, ui) {
				ui.size.width = ui.originalSize.width;
			}
		})
		.appendTo(this.propertyInspector);

	this.titleBar = $('<div>Property Inspector</div>')
		.addClass("designerPropertyTitle")
		.prependTo(this.propertyInspector)
		.on("dblclick", function () {
			self.propertyViewContainer.toggle();
		});

	this.propertyView = $('<div></div>')
		.addClass("designerPropertyContent")
		.appendTo(this.propertyViewContainer);

	this.update = function (activeElement) {
		var self = this;
		var getType = {};
		var keys = [];

		if (this.activeElement == activeElement) {
			for (var key in activeElement) {
				if (!activeElement.readonly || key != "readonly" && $.inArray(key, activeElement.readonly) == -1) {
					if (getType.toString.call(activeElement[key]) != '[object Function]') {
						this.propertyNodes[key].val(activeElement[key]);
					}
				}
			}
		}
		else {
			this.activeElement = activeElement;
			this.propertyView.html('');

			for (var key in activeElement) {
				if (!keys[key]) {
					keys[key] = true;

					// Skip readonly properties and functions
					if (key != "readonly" && getType.toString.call(activeElement[key]) != '[object Function]' &&
						(!activeElement.readonly || $.inArray(key, activeElement.readonly) == -1)) {

						var elementKey = $('<div>' + key + '</div>')
							.css({
								"width": "70px",
								"height": "20px",
								"border": "1px solid #AAAAAA",
								"float": "left",
								"font-size": "12px",
								"line-height": "20px",
								"text-align": "left",
								"padding-left": "5px",
								"margin-left": "5px",
								"margin-right": "5px"
							});

						var elementValue;
						switch (key) {
							case "barcodeType":
								elementValue = $('<select name="' + key + '">')
									.css({
										"width": "145px",
										"height": "22px",
										"float": "left",
										"margin-right": "5px"
									})
									.on("change", function () {
										activeElement.barcodeType = $(this).val();
										self.labelDesigner.updateCanvas();
									});

								["code128", "qrcode", "datamatrix"].forEach(function (type) {
									$('<option></option>')
										.val(type)
										.text(type)
										.prop('selected', activeElement[key] === type)
										.appendTo(elementValue);
								});
								break;

							case "dynamic":
								elementValue = $('<input type="checkbox" name="' + key + '" value="' + activeElement[key] + '">')
									.css({
										"width": "145px",
										"height": "20px",
										"float": "left",
										"margin-left": "5px",
										"margin-right": "5px"
									})
									.on("click", function () {
										activeElement.setDynamic(!activeElement.dynamic);
										self.labelDesigner.updateCanvas();
									});
								break;

							case "angle":
								elementValue = $('<div></div>')
									.css({
										"float": "left",
										"height": "22px",
										"display": "flex",
										"justify-content": "space-between",
									});

								[0, 90, 180, 270].forEach(function (angle) {
									var button = $('<button>' + angle + '</button>')
										.css({
											"flex": "1",
											"margin": "0 2px",
											"cursor": "pointer"
										})
										.on("click", function () {
											activeElement.angle = angle;
											self.labelDesigner.updateCanvas();
										});
									elementValue.append(button);
								});
								break;

							case "squareSize":
								elementValue = $('<select name="' + key + '">')
									.css({
										"width": "145px",
										"float": "left",
										"height": "22px",
										"line-height": "20px",
										"padding-left": "5px"
									});

								// Add all the square size options
								var squareSizes = [
									"10x10", "12x12", "14x14", "16x16", "18x18", "20x20", "22x22",
									"24x24", "26x26", "32x32", "36x36", "40x40", "44x44", "48x48",
									"52x52", "64x64", "72x72", "80x80", "88x88", "96x96",
									"104x104", "120x120", "132x132", "144x144"
								];

								squareSizes.forEach(function (size) {
									var option = $('<option value="' + size + '">' + size + '</option>');
									if (size === activeElement[key]) {
										option.attr('selected', 'selected');
									}
									elementValue.append(option);
								});

								elementValue.on("change", function () {
									activeElement.squareSize = $(this).val();
									self.labelDesigner.updateCanvas();
								});
								break;

							case "angle":
								elementValue = $('<div></div>')
									.css({
										"float": "left",
										"height": "22px",
										"display": "flex",
										"justify-content": "space-between",
									});

								[0, 90, 180, 270].forEach(function (angle) {
									var button = $('<button>' + angle + '</button>')
										.css({
											"flex": "1",
											"margin": "0 2px",
											"cursor": "pointer"
										})
										.on("click", function () {
											activeElement.angle = angle;
											self.labelDesigner.updateCanvas();
										});
									elementValue.append(button);
								});
								break;

							default:
								elementValue = $('<input type="text" name="' + key + '" value="' + activeElement[key] + '">')
									.css({
										"width": "145px",
										"float": "left",
										"height": "22px",
										"line-height": "20px",
										"padding-left": "5px"
									});
								break;
						}


						if (!activeElement.readonly || $.inArray(key, activeElement.readonly) == -1) {
							elementValue.on("keyup", { "objectProperty": key }, function (event) {
								var data = self.activeElement[event.data.objectProperty];
								self.activeElement[event.data.objectProperty] = (data === parseInt(data, 10)) ? parseInt($(this).val()) : $(this).val();
								self.labelDesigner.updateCanvas();
							});
						}
						else {
							// Draw readonly textbox.
							elementValue.prop("readonly", true).css({ "background-color": "#DDDDDD", border: "1px solid #AAAAAA" });
						}

						this.propertyNodes[key] = elementValue;

						var elementContainer = $('<div></div>')
							.css({
								"clear": "both",
								"padding-top": "2px"
							})
							.append(elementKey).append(elementValue);
						this.propertyView.append(elementContainer);
					}
				}
			}
		}
	}

	this.updatePosition(0);
}