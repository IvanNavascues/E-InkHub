var bgcolor = 'white';
var options = ["Color: ","Herramienta: ","Formas: ","Grosor (- +): "];
var brushes = ["Pincel (P)","Aerografo (A)","Borrador (B)","Texto (T)"];
var shapes = ["Rectangulo","Triangulo","Circulo"];
var specialKeyCodes = [8,9,13,16,17,18,20,27,33,34,35,36,37,38,39,40,44,46,144];
var screenTypes = ["bw","r","g","b","rgb"];

var canvasPrinted = false;
var typingText = false;
var drawingShape = false;
var screenWidth;
var screenHeight;
var minBrushThick = 1;
var maxBrushThick = 40;
var headText = 0;
var typedText = "_";
var savedCanvas = null;
var shapeSelected = "";
var screenColor;
var firstClick = null;
var lastClick = null;

function screenSelected(){
	var selectValue = document.getElementById("selScreen").value;
	clearPage();
	canvasPrinted = false;
	
	if (selectValue != "") {
		//if (savedCanvas == null || (savedCanvas != null && confirm("Si?"))) {
			$.ajax({
				type: "GET",
				dataType: "json",
				url: "screenController.php?numScreen="+selectValue,

				success: function (res) {
					if (res.status == -1) {
						alert(res.error);
						console.error(res.error);
					}
					else {
						screenWidth = res.width;
						screenHeight = res.height;
						screenColor = res.color;
						savedCanvas = null;
						setupCanvas(res.imageBase64);
						canvasPrinted = true;
					}
				}
			});
		//}
	}
}

function clearPage() {
  var inputOption = document.getElementById("inputOption");
  inputOption.innerHTML = '';
}

///CANVAS HANDLER///

function setup() {
}

function setupCanvas(canvasImage) {
	noStroke();
  
	//CREATE ELEMENTS:
	$(function(){
		$("#inputOption").load("core/html/canvas.html",function(){
			//create canvas
			pixelDensity(1); 
			canvas = createCanvas(screenWidth, screenHeight);
			canvas.background(bgcolor);
			canvas.style('width','60%');
			canvas.style('height','100%');
			canvas.style('border','#64f1cb solid');

			canvas.parent('#canvasDiv');

			if (canvasImage != null) {
				var raw = new Image();
				raw.src = canvasImage;
				raw.onload = function() {
					let img = createImage(raw.width, raw.height);
					img.resize(screenWidth,screenHeight);
					img.drawingContext.drawImage(raw, 0, 0);
					image(img, 0, 0); // draw the image, etc here
				}	
			}
		}); 
	  });
}
  
function draw() {
	var sel = select("#brushSel");
	var colorPicker = select("#colorPicker");
	var slider = select("#thickSlider");
	if (canvasPrinted) {
		noStroke();

		if (mouseIsPressed && mouseInCanvas() && !typingText && focused && !drawingShape) {
			if (sel.value() == brushes[0]) {
				//normal paint brush
		
				//draw a line with the correct color
				stroke(colorPicker.value());
				strokeWeight(slider.value());
				line(pmouseX, pmouseY, mouseX, mouseY);
			}
			if (sel.value() == brushes[1]) {
				//splatter brush
		
				//draw ellipses with the correct thickness at random locations a random amount of times
		
				for (i = 0; i < random(1, 10); i++) {
				//draw the ellipse
				noStroke();
		
				fill(colorPicker.value());
		
				ellipse(mouseX + random(-width/slider.value(), width/slider.value()), mouseY + random(-height/slider.value(), height/slider.value()), slider.value()/5, slider.value()/5);
				}
			}
			if (sel.value() == brushes[2]) {
				//eraser
		
				//draw a line in background color
				stroke(bgcolor);
				strokeWeight(slider.value());
				line(pmouseX, pmouseY, mouseX, mouseY);
			}
		}
		else if (mouseInCanvas() && typingText && !drawingShape) {
			//stopTyping();
			image(savedCanvas,0,0);
  			textSize(slider.value());
			fill(colorPicker.value());
    		text(typedText, mouseX, mouseY);
			stroke(colorPicker.value());
			strokeWeight(1);
			//let charSize = map(slider.value(),minBrushThick,maxBrushThick,1,21);
			//line(mouseX+charSize*headText,mouseY,mouseX+charSize+charSize*headText,mouseY);
		}
		else if (mouseInCanvas() && drawingShape) {
			image(savedCanvas,0,0);
			if (firstClick !== null) {
				if (shapeSelected == shapes[0]) { //RECTANGLE
					fill(colorPicker.value());
					rect(firstClick.x,firstClick.y,mouseX-firstClick.x,mouseY-firstClick.y);
				}
				else if (shapeSelected == shapes[1]) { //TRIANGLE
					fill(colorPicker.value());
					let triHeight = firstClick.y-mouseY;
					let triSize = 2*triHeight / Math.sqrt(3);
					triangle(firstClick.x,firstClick.y,firstClick.x-triSize / 2,mouseY,firstClick.x + triSize / 2,mouseY);
				}
				else if (shapeSelected == shapes[2]) { //CIRCLE
					fill(colorPicker.value());
					circle(firstClick.x,firstClick.y,2*firstClick.distanceTo(new Coordinates(mouseX,mouseY)));
				}
			}
		}
	}
}

function mousePressed() {
	var sel = select("#brushSel");
	if (canvasPrinted && focused && mouseButton === LEFT) {
		if (sel.value() == brushes[3] && !typingText && mouseInCanvas()) {
			startTyping();
		}
		else if (typingText) {
			stopTyping();
		}

		if (drawingShape && mouseInCanvas()) {
			if (firstClick === null) {
				startShape();
			}
			else if (lastClick === null) {
				stopShape();
			}
		}
	}
	else if (mouseButton === RIGHT) {
		//alert("hola");
	}
}

function startTyping() {
	savedCanvas = get(0, 0, width, height);
	typingText = true;
	typedText = "_";
	headText = 0;
}

function stopTyping() {
	var slider = select("#thickSlider");
	var colorPicker = select("#colorPicker");
	image(savedCanvas,0,0);
	textSize(slider.value());
	fill(colorPicker.value());
	let finalText = typedText.substring(0, headText) + typedText.substring(headText+1,typedText.length);
	text(finalText, mouseX, mouseY);
	typingText = false;
	typedText = "_";
	headText = 0;
}

function startShape() {
	savedCanvas = get(0, 0, width, height);
	drawingShape = true;
	typingText = false;
	firstClick = new Coordinates(mouseX,mouseY);
	lastClick = null;
}

function stopShape() {
	var colorPicker = select("#colorPicker");
	image(savedCanvas,0,0);
	fill(colorPicker.value());
	lastClick = new Coordinates(mouseX,mouseY);
	if (shapeSelected != "") {
		if (shapeSelected == shapes[0]) { //RECTANGLE
			fill(colorPicker.value());
			rect(firstClick.x,firstClick.y,lastClick.x-firstClick.x,lastClick.y-firstClick.y);
		}
		else if (shapeSelected == shapes[1]) { //TRIANGLE
			fill(colorPicker.value());
			let triHeight = firstClick.y-lastClick.y;
			let triSize = 2*triHeight / Math.sqrt(3);
			triangle(firstClick.x,firstClick.y,firstClick.x-triSize / 2,lastClick.y,firstClick.x + triSize / 2,lastClick.y);
		}
		else if (shapeSelected == shapes[2]) { //CIRCLE
			fill(colorPicker.value());
			circle(firstClick.x,firstClick.y,2*firstClick.distanceTo(lastClick));
		}
	}
	savedCanvas = get(0, 0, width, height);
	firstClick = null;
	lastClick = null;
	headText = 0;
}

function changeShape(shape) {
	if (shape != "") {
		savedCanvas = get(0, 0, width, height);
		drawingShape = true;
	}
	else {
		drawingShape = false;
	}
	shapeSelected = shape;
}

function handleFile(file){
	if (file.type === 'image') {
		img = createImg(file.data, 'Alt text', 'anonymous', imgCreated);
		img.hide();
	} else {
		img = null;
	}
  }
  
function imgCreated(){
	img.hide();
	let g = createGraphics(img.elt.width, img.elt.height);
	g.image(img, 0, 0);
	img.remove();
	img = g.get(0, 0, g.width, g.height)

	if (img.width < img.height){
		img.resize(width, 0);
	} else {
		img.resize(0, height);
	}

	image(img, 0, 0);
	g.remove();
}
  
function clearBG() {
	if (confirm("Se borrará todo el progreso")) {
		typingText = false;
		drawingShape = false;
		typedText = "";
		shapeSelected = "";
		firstClick = null;
		lastClick = null;
		fill(bgcolor);
		noStroke();
		rect(0, 0, width, height);
	} 
}
  
function saveImage() {
	var screenNumber = document.getElementById("selScreen").value;
	//var canvas = document.getElementById("defaultCanvas0");
	savedCanvas = get(0, 0, width, height);
	var img = get(0, 0, width, height);
	img.loadPixels();
	var imgRed = createImage(screenWidth, screenHeight);
	imgRed.loadPixels();
	var imgGreen = createImage(screenWidth, screenHeight);
	imgGreen.loadPixels();
	var imgBlue = createImage(screenWidth, screenHeight);
	imgBlue.loadPixels();
	var imgBW = createImage(screenWidth, screenHeight);
	imgBW.loadPixels();
	var blackWhiteArray = [];
	const d = pixelDensity();
	for (let y = 0; y < img.height; y++) {
		for (let x = 0; x < img.width; x++) {
			pixel = img.get(x,y);
			var grayscaleValue = pixel[0]*0.3 + pixel[1]*0.59 + pixel[2]*0.11; //Metodo luminico
			blackWhiteArray.push(grayscaleValue > 128 ? 0 : 1);
			
			imgBW.set(x,y,grayscaleValue > 128 ? 255 : 0);
			var pixelRed = [pixel[0],0,0,pixel[3]];
			imgRed.set(x,y,pixelRed);
			var pixelGreen = [0,pixel[1],0,pixel[3]];
			imgGreen.set(x,y,pixelGreen);
			var pixelBlue = [0,0,pixel[2],pixel[3]];
			imgBlue.set(x,y,pixelBlue);
		}
	}
	var hexArray = bitsToHex(blackWhiteArray);
	imgBW.updatePixels();
	imgRed.updatePixels();
	imgGreen.updatePixels();
	imgBlue.updatePixels();

	if (screenColor === screenTypes[0]) 
		image(imgBW,0,0);
	else if (screenColor === screenTypes[1])
		image(imgRed,0,0);
	else if (screenColor === screenTypes[2])
		image(imgGreen,0,0);
	else if (screenColor === screenTypes[3])
		image(imgBlue,0,0);

	setTimeout(function(){
		if (confirm("Así se verá en pantalla, ¿Desea continuar?")) {
			image(savedCanvas,0,0);
			var canvasDataURL = img.canvas.toDataURL();
			var canvasDataURLRed = imgRed.canvas.toDataURL();
			var canvasDataURLGreen = imgGreen.canvas.toDataURL();
			var canvasDataURLBlue = imgBlue.canvas.toDataURL();
			/*$.post("submitController.php", 
				{
					numScreen: screenNumber, 
					imageBase64: canvasDataURL,
					imageHex: hexArray,
					imageRed: canvasDataURLRed,
					imageGreen: canvasDataURLGreen,
					imageBlue: canvasDataURLBlue
				},
				function(res) {
					if (res.status != -1) {
						alert("Imagen actualizada con exito");
					}	
					else
						alert(res.error);
				},
				"json");*/
			fetch("submitController.php", {
				method: 'post',
				body: {
					numScreen: screenNumber, 
					imageBase64: canvasDataURL,
					imageHex: hexArray,
					imageRed: canvasDataURLRed,
					imageGreen: canvasDataURLGreen,
					imageBlue: canvasDataURLBlue
				},
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			}).then((response) => {
				return response.json()
			}).then((res) => {
				if (res.status != -1) {
					alert("Imagen actualizada con exito");
				}	
				else
					alert(res.error);
			}).catch((error) => {
				console.log(error)
			})
		}
		else {
			image(savedCanvas,0,0);
		}
	},1);
}
  
//check for key press
function keyPressed() {
	var slider = select("#thickSlider");
	var sel = select("#brushSel");
	if (canvasPrinted && focused) {
		if(!typingText) {
			//check for the correct key
			if (key == 'p' || key == 'P') {
			//change brush type to normal brush
			sel.selected(brushes[0]);
			} else if (key == 'a' || key == 'A') {
			//change bbrush type to splatter brush
			sel.selected(brushes[1]);
			} else if (key == 'b' || key == 'B') {
			//change brush type to eraser
			sel.selected(brushes[2]);
			} else if (key == 't'|| key == 'T'){
			//switch brush type to text
			sel.selected(brushes[3]);
			}else if (key == '+') {
			//increase brush thickness
			slider.value(slider.value() + 1);
			} else if (key == '-') {
			//reduce brush thickness
			slider.value(slider.value() - 1);
			} 
		}
		else {
			if (!specialKeyCodes.includes(keyCode)) {
				let str1 = typedText.substring(0,headText)+key;
				let str2 = typedText.substring(headText,typedText.length);
				typedText = str1+str2;
				headText += 1;
			} else if (keyCode == BACKSPACE) {
				let str1 = typedText.substring(0,headText-1);
				let str2 = typedText.substring(headText,typedText.length);
				typedText = str1+str2;
				if (typedText.length > 0)
					headText -= 1;
			} else if (keyCode == ENTER) {
				stopTyping();
			} else if (keyCode == 37) { //ARROWLEFT
				if (headText > 0) {
					typedText = typedText.replaceAt(headText,typedText[headText-1]);
					typedText = typedText.replaceAt(headText-1,'_')
					headText -= 1;
				}
			} else if (keyCode == 39) { //ARROWRIGHT
				if (headText < typedText.length-1) {
					typedText = typedText.replaceAt(headText,typedText[headText+1]);
					typedText = typedText.replaceAt(headText+1,'_')
					headText += 1;
				}
			} else if (keyCode == 46) { //SUPR
				if (headText < typedText.length-1) {
					let str1 = typedText.substring(0,headText+1);
					let str2 = typedText.substring(headText+2,typedText.length);
					typedText = str1+str2;
				}
			}
		}
	}
}
  
function mouseInCanvas() {
	return (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0);
}

///IMAGE HANDLER///

function base64ToBlackWhiteArray(base64Image,callback) {
    var img = new Image();
    img.src = base64Image;

    img.onload = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        var blackWhiteArray = [];
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            var grayscaleValue = (r + g + b) / 3 +data[i+3]; 
            var pixelValue = grayscaleValue > 128 ? 1 : 0; 
            blackWhiteArray.push(pixelValue);
        }

        var hexArray = bitsToHex(blackWhiteArray);
		callback(hexArray);
    };
}

function bitsToHex(bitsArray) {
    var hexArray = "";
    for (var i = 0; i < bitsArray.length; i += 8) {
        var byte = bitsArray.slice(i, i + 8).join(''); 
        var hexValue = parseInt(byte, 2).toString(16).toUpperCase().padStart(2, '0'); 
        hexArray += hexValue; 
    }
    return hexArray;
}

class Coordinates {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	distanceTo(coord) {
		return Math.sqrt((this.x-coord.x)**2+(this.y-coord.y)**2)
	}
}
  
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}