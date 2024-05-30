var bgcolor = 'white';
var options = ["Color: ","Herramienta: ","Formas: ","Grosor (- +): "];
var brushes = ["Pincel (P)","Aerografo (A)","Borrador (B)","Texto (T)"];
var shapes = ["Rectangulo","Triangulo","Circulo"];
var specialKeyCodes = [8,9,13,16,17,18,20,27,33,34,35,36,37,38,39,40,44,46,144];
var screenTypes = ["bw","r","g","b","rgb"];

var canvasPrinted = false;
var typingText = false;
var drawingShape = false;
var lastScreen = '';
var currentScreen;
var screenWidth;
var screenHeight;
var minBrushThick = 1;
var maxBrushThick = 40;
var headText = 0;
var imageThreshold = 128;
var typedText = "_";
var savedCanvas = null;
var shapeSelected = "";
var toolSelected = brushes[0];
var screenColor;
var firstClick = null;
var lastClick = null;

function screenSelected(id){
	if (id != null)
		currentScreen = id;
	else
		currentScreen = document.getElementById("selScreen").value;
	clearPage();
	canvasPrinted = false;
	
	if (currentScreen != "") {
		if (lastScreen != '' && confirm("Se perderá todo el progreso, ¿Continuar?") || lastScreen === '') {
			lastScreen = currentScreen;
			$.ajax({
				type: "GET",
				dataType: "json",
				url: "screenController.php?numScreen="+currentScreen,

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
						/*var imageHexBase64 = res.imageBase64;
						hexToBase64(imageHexBase64);*/
						setupCanvas(res.imageBase64,res.lastUpdate);
						canvasPrinted = true;
					}
				}
			});
		}
	}
}

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
      str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}

function clearPage() {
	var inputOption = document.getElementById("inputOption");
	inputOption.innerHTML = '';
	var modifyLi = document.getElementById("modifyLi");
	modifyLi.innerHTML = '';
	var deleteLi = document.getElementById("deleteLi");
	deleteLi.innerHTML = '';
	var lastUpdateLi = document.getElementById("lastUpdateLi");
	lastUpdateLi.innerHTML = '';
	var mapArea = document.getElementById("mapArea");
	mapArea.innerHTML = '';
}

///CANVAS HANDLER///

function setup() {
}

function setupCanvas(canvasImage,lastUpdateDate) {
	noStroke();
  
	//CREATE ELEMENTS:
	$(function(){
		$("#inputOption").load("core/html/canvas.html",function(){
			//create mod and del options
			var modifyLi = document.getElementById("modifyLi");
			modifyLi.innerHTML = '<a class="nav-link active fs-4 fw-semibold ms-2" aria-current="page" href=newScreenController.php?modify='+currentScreen+'>Modificar pantalla</a>';
			var deleteLi = document.getElementById("deleteLi");
			deleteLi.innerHTML = '<a class="nav-link active fs-4 fw-medium ms-2" aria-current="page" href=newScreenController.php?delete='+currentScreen+' onclick="return confirm(\'¡ATENCIÓN! Se eliminará la pantalla del sistema, ¿Quiere continuar?\');">Eliminar pantalla</a>';
			var lastUpdateLi = document.getElementById("lastUpdateLi");
			//alert(Object.keys(lastUpdateDate));
			if (lastUpdateDate === null)
				lastUpdateLi.innerHTML = '<text class="text-center text-light fw-medium ms-4 p-1">Ultima vez visto: Nunca</text>';
			else
				lastUpdateLi.innerHTML = '<text class="text-center text-light fw-medium ms-4 p-1">Ultima vez visto: '+lastUpdateDate+'</text>';
			//create canvas
			pixelDensity(1); 
			canvas = createCanvas(screenWidth, screenHeight);
			canvas.background(bgcolor);
			canvas.style('width','60%');
			canvas.style('height','100%');	
			canvas.style('border','#64f1cb solid');

			canvas.parent('#canvasDiv');
				
  			inputFile = createFileInput(handleFile);
			inputFile.class("form-control");
			inputFile.attribute("type","file");
			inputFile.attribute("accept","image/*");
			inputFile.id("inputFile");

			inputFile.parent("#fileInputDiv");

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
	//var sel = select("#brushSel");
	var colorPicker = select("#colorPicker");
	var slider = select("#thickSlider");
	if (canvasPrinted) {
		noStroke();

		if (mouseIsPressed && mouseInCanvas() && !typingText && focused && !drawingShape) {
			if (toolSelected == brushes[0]) {
				//normal paint brush
		
				//draw a line with the correct color
				stroke(colorPicker.value());
				strokeWeight(slider.value());
				line(pmouseX, pmouseY, mouseX, mouseY);
			}
			if (toolSelected == brushes[1]) {
				//splatter brush
		
				//draw ellipses with the correct thickness at random locations a random amount of times
		
				for (i = 0; i < random(1, 10); i++) {
				//draw the ellipse
				noStroke();
		
				fill(colorPicker.value());
		
				ellipse(mouseX + random(-width/slider.value(), width/slider.value()), mouseY + random(-height/slider.value(), height/slider.value()), slider.value()/5, slider.value()/5);
				}
			}
			if (toolSelected == brushes[2]) {
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
	//var sel = select("#brushSel");
	if (canvasPrinted && focused && mouseButton === LEFT) {
		if (toolSelected == brushes[3] && !typingText && mouseInCanvas()) {
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
		changeTool('');
		savedCanvas = get(0, 0, width, height);
		drawingShape = true;
	}
	else {
		drawingShape = false;
	}
	shapeSelected = shape;
}

function changeTool(tool) {
	if (tool !== "") {
		changeShape('');
		toolSelected = brushes[tool];
	}
	else {
		toolSelected = '';
	}
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
			let newColor = grayscaleValue > imageThreshold ? 255 : 0;
			let err = grayscaleValue - newColor;
			
			//imgBW.set(x,y,grayscaleValue > 128 ? 255 : 0);
			var auxPixel = [newColor,newColor,newColor,255];
			imgBW.set(x,y,auxPixel);
			imgBW.updatePixels();

			distributeError(imgBW, x + 1, y, err * 7 / 16);
			distributeError(imgBW, x - 1, y + 1, err * 3 / 16);
			distributeError(imgBW, x, y + 1, err * 5 / 16);
			distributeError(imgBW, x + 1, y + 1, err * 1 / 16);

			var newPixel = imgBW.get(x,y);
			let newGrayScale = (newPixel[0]+newPixel[1]+newPixel[2])/3;
			
			blackWhiteArray.push(newColor > imageThreshold ? 0 : 1);

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
			$.post("submitController.php", 
				{
					numScreen: currentScreen, 
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
				"json");
		}
		else {
			image(savedCanvas,0,0);
		}
	},1);
}
  
function distributeError(actualImage, x, y, err) {
	if (x >= 0 && x < actualImage.width && y >= 0 && y < actualImage.height) {
		let index = (x + y * img.width) * 4;
		actualImage.pixels[index] += err;
		actualImage.pixels[index + 1] += err;
		actualImage.pixels[index + 2] += err;
	}
}

//check for key press
function keyPressed() {
	var slider = select("#thickSlider");
	//var sel = select("#brushSel");
	if (canvasPrinted && focused) {
		if(!typingText) {
			//check for the correct key
			if (key == 'p' || key == 'P') {
			//change brush type to normal brush
			toolSelected = brushes[0];
			} else if (key == 'a' || key == 'A') {
			//change bbrush type to splatter brush
			toolSelected = brushes[1];
			} else if (key == 'b' || key == 'B') {
			//change brush type to eraser
			toolSelected = brushes[2];
			} else if (key == 't'|| key == 'T'){
			//switch brush type to text
			toolSelected = brushes[3];
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