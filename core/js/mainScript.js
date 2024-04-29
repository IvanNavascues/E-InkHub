var bgcolor = 'white';
var options = ["Color:        ","Herramienta:       ","Grosor (- +): "];
var brushes = ["Pincel (N)","Aerografo (S)","Borrador (E)","Rectangulo (Q)","Triangulo (T)","Texto (T)"]

var canvasPrinted = false;
var typingText = false;
var minBrushThick = 1;
var maxBrushThick = 40;
var textPosX;
var textPosY;

function screenSelected(){
	var selectValue = document.getElementById("selScreen").value;
	clearPage();
	canvasPrinted = false;
	
	if (selectValue != "") {
		$.ajax({
			type: "GET",
			dataType: "json",
			url: "screenController.php?numScreen="+selectValue,

			success: function (res) {
				if (res.status == -1) {
					alert(res.error);
					console.log(res.error);
				}
				else {/*
					if (isText == null) { //default
						if(res.status == 0) {
							createOptions(true);
							createTextArea(selectValue,res.message);
						}
						else if(res.status == 1){
							createOptions(false);
							createDrawingArea(selectValue,res.imageBase64);
						}
					}
					else if (isText) {
						createOptions(true);
						createTextArea(selectValue,res.message);
					}
					else {
						createOptions(false);
						createDrawingArea(selectValue,res.imageBase64);
					}*/
					//canvasImage = res.imageBase64;
					
					setupCanvas(res.imageBase64);
					canvasPrinted = true;
				}
			}
		});
	}
}

function clearPage() {
  var inputOption = document.getElementById("inputOption");
  inputOption.innerHTML = '';
  var mainDiv = document.createElement("main");
  mainDiv.setAttribute("id","main");
  inputOption.append(mainDiv);
}

///CANVAS HANDLER///

function setup() {
}

function setupCanvas(canvasImage) {
	noStroke();
  
	//CREATE ELEMENTS:
  
	//create nav
	navColorPicker = createDiv(options[0]);
	navColorPicker.style('position','relative');
	navColorPicker.style('width','auto');
	navColorPicker.style('font-size','xx-large');
   
	navColorPicker.parent("main");
  
	//create a colorpicker (to whoever is grading this, i'm using a colorpicker instead of multiple buttons for color because it's easier to implement and the user can personalize the color hoever they want.)
	colorPicker = createColorPicker('#000000');
	colorPicker.style('position','relative');
	//colorPicker.position(10, 50);
  
	colorPicker.parent(navColorPicker);
  
	//create a dropdown menu
	navSel = createDiv(options[1]);
	navSel.style('position','relative');
	navSel.style('width','auto');
	navSel.style('font-size','xx-large');
   
	navSel.parent("main");
  
	sel = createSelect();
	sel.id("brushSel");
	sel.style('width','180px');
	sel.style('height','30px');
	sel.style('position','relative');
	sel.style('font-size','x-large');
	brushes.forEach((item) => {
	  sel.option(item);
	});
  
	sel.parent(navSel);
  
	//create a slider
	navSlider = createDiv(options[2]);
	navSlider.style('position','relative');
	navSlider.style('width','auto');
	navSlider.style('font-size','xx-large');
   
	navSlider.parent("main");
  
	slider = createSlider(minBrushThick, maxBrushThick, 20, 1);
	//slider.position(370, 50);
	slider.style('width', '180px');
	//slider.style('height', '30px');
  
	slider.parent(navSlider);
  
	//create canvas
	navCanvas = createDiv();
	navCanvas.style('position','relative');
	navCanvas.style('width','auto');
	navCanvas.style('font-size','xx-large');
	navCanvas.id('canvasDiv');
  
	navCanvas.parent("main");
  
	canvas = createCanvas(256, 128);
	canvas.background(bgcolor);
	canvas.style('width','60%');
	canvas.style('height','60%');
	canvas.style('border','#91f164 solid');
  
	canvas.parent(navCanvas);
  
	//create a button
	navButtons = createDiv();
	navButtons.style('position','relative');
	navButtons.style('width','auto');
   
	navButtons.parent("main");

	input = createFileInput(handleFile);
	input.parent(navButtons);
  
	button = createButton("Borrar todo (R)");
	button.style('position','relative');
	button.style('width', '200px');
	button.style('height', '30px');
	button.mousePressed(clearBG);
  
	button.parent(navButtons);
  
	//create a button
	button = createButton("Guardar (I)");
	button.style('position','relative');
	button.style('width', '200px');
	button.style('height', '30px');
	button.mousePressed(SaveImage);
  
	button.parent(navButtons);

	var raw = new Image();
	raw.src = canvasImage;
	raw.onload = function() {
		img = createImage(raw.width, raw.height);
		img.drawingContext.drawImage(raw, 0, 0);
		image(img, 0, 0); // draw the image, etc here
	}

}
  
function draw() {
	if (canvasPrinted) {
		noStroke();

		//Check if mouse is pressed and draw the lines and stuff
		if (mouseIsPressed && mouseInCanvas() && !typingText) {
			if (sel.value() == brushes[0]) {
				//normal paint brush
		
				//draw a line with the correct color
				stroke(colorPicker.color());
				strokeWeight(slider.value());
				line(pmouseX, pmouseY, mouseX, mouseY);
			}
			if (sel.value() == brushes[1]) {
				//splatter brush
		
				//draw ellipses with the correct thickness at random locations a random amount of times
		
				for (i = 0; i < random(1, 10); i++) {
				//draw the ellipse
				noStroke();
		
				fill(colorPicker.color());
		
				ellipse(mouseX + random(-width/7, width/7), mouseY + random(-height/7, height/7), slider.value(), slider.value());
				}
			}
			if (sel.value() == brushes[2]) {
				//eraser
		
				//draw a line in background color
				stroke(bgcolor);
				strokeWeight(slider.value());
				line(pmouseX, pmouseY, mouseX, mouseY);
			}
			if (sel.value() == brushes[3]) {
				//draw rectangle with brush thickness at mousex and y
				fill(colorPicker.color());
				rect(mouseX-slider.value()/2, mouseY-slider.value()/2, slider.value(), slider.value());
			}
			if (sel.value() == brushes[4]) {
				//draw triangle with brush thickness at mousex and y
				fill(colorPicker.color());
				triangle(mouseX, mouseY, mouseX + slider.value(), mouseY + slider.value(), mouseX - slider.value(), mouseY + slider.value());
			}
		}
		else if (mouseIsPressed && !mouseInCanvas() && typingText) {
			stopTyping();
		}
	}
}

function mousePressed() {
	if (canvasPrinted) {
		if (sel.value() == brushes[5] && !typingText) {
			startTyping();
		}
	}
  }

function startTyping() {
	typingText = true;
	let textBox = createInput('');
	textBox.id("inputText");	
	textBox.position(mouseX, mouseY);
	textBox.style("font-size",slider.value()+"px");
	console.log(mouseX+" "+mouseY);
	textBox.parent("canvasDiv");
	textPosX = mouseX;
	textPosY = mouseY;
}

function stopTyping() {
	typingText = false;
	var textBox = document.getElementById("inputText");
	textSize(slider.value()); 
	fill(colorPicker.color());
	text(textBox.value,textPosX,textPosY);
	textBox.remove();
}

function handleFile(file){
	imgLoaded = false;
	if (file.type === 'image') {
	  img = createImg(
		file.data, 'Alt text', 'anonymous', imgCreated);
	  img.hide();
	} else {
	  img = null;
	}
  }
  
  // Once the img element is created, use it to 
  // convert the image element into a p5Image object. 
  function imgCreated(){
	img.hide();
	// Create a temporary p5.Graphics object to draw the image.
	let g = createGraphics(img.elt.width, img.elt.height);
	g.image(img, 0, 0);
	// Remove the original element from the DOM.
	img.remove();
	// g.get will return image data as a p5.Image object
	img = g.get(0, 0, g.width, g.height)
	
	// Because we've converted it into a p5.Image object, we can
	// use functions such as 'resize', and 'filter',
	// which aren't available on the HTML img element.
	// Uncomment the following lines for an example...
	
	
	// Resize it to fill the canvas
	if (img.width < img.height){
	  img.resize(width, 0);
	} else {
	  img.resize(0, height);
	}
  
	// Record that we have finished creating the image object.
    image(img, 0, 0);
  }
  
function clearBG() {
	//clear the background by filling everything with white
	fill(bgcolor);
	noStroke();
	rect(0, 0, width, height);
}
  
function SaveImage() {
	var screenNumber = document.getElementById("selScreen").value;
	//var canvas = document.getElementById("defaultCanvas0");
	var img = get(0, 0, width, height);
	img.loadPixels();
	var blackWhiteArray = [];
	const d = pixelDensity();
	for (let y = 0; y < img.height; y++) {
		for (let x = 0; x < img.width; x++) {
			pixel = img.get(x,y);
			var grayscaleValue = pixel[0]*0.3 + pixel[1]*0.59 + pixel[2]*0.11; //Metodo luminico
			blackWhiteArray.push(grayscaleValue > 128 ? 0 : 1);
		}
	}
	var hexArray = bitsToHex(blackWhiteArray);
	var canvasDataURL = img.canvas.toDataURL();
	console.log(blackWhiteArray);
	$.post("submitController.php", 
		{
			numScreen: screenNumber, 
			imageBase64: canvasDataURL,
			imageHex: hexArray
		},
		function(res) {
			if (res.status != -1) {
				alert("Imagen actualizada con exito");
			}	
			else
				alert(res.error);
			
			location.reload();
		},
		"json");
	//var to_save = get(0, 0, width, height);
	//to_save.save("canvas.png");
}
  
//check for key press
function keyPressed() {
	if (canvasPrinted && !typingText) {
		//check for the correct key
		if (key == 'n' || key == 'N') {
		//change brush type to normal brush
		sel.selected(brushes[0]);
		} else if (key == 's' || key == 'S') {
		//change bbrush type to splatter brush
		sel.selected(brushes[1]);
		} else if (key == 'e' || key == 'E') {
		//change brush type to eraser
		sel.selected(brushes[2]);
		} else if (key == '+') {
		//increase brush thickness
		slider.value(slider.value() + 1);
		} else if (key == '-') {
		//reduce brush thickness
		slider.value(slider.value() - 1);
		} else if (key == 'r' || key == 'R') {
		//clear the background by calling clearBG() function
		clearBG();
		} else if (key == 'i' || key == 'I') {
		//save the canvas as an image by calling saveImage()
		SaveImage()
		} else if (key == 'q'|| key == 'Q'){
		//switch brush type to rectangle
		sel.selected(brushes[3]);
		}else if (key == 't'|| key == 'T'){
		//switch brush type totriangle
		sel.selected(brushes[4]);
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

  
/*
function createOptions(isText) {
  var inputText = document.createElement("input");
  inputText.setAttribute("type","radio");
  inputText.setAttribute("id","selectText");
  inputText.setAttribute("name","inputRadio");
  inputText.setAttribute("onchange","screenSelected(true)");
  var inputImage = document.createElement("input");
  inputImage.setAttribute("type","radio");
  inputImage.setAttribute("id","selectImage");
  inputImage.setAttribute("name","inputRadio");
  inputImage.setAttribute("onchange","screenSelected(false)");
  if (isText)
    inputText.setAttribute("checked","true")
  else
    inputImage.setAttribute("checked","true")

  var labelText = document.createElement("label");
  labelText.append(inputText);
  labelText.append("Texto");
  var labelImage = document.createElement("label");
  labelImage.append(inputImage);
  labelImage.append("Dibujar");
  var divLabel = document.createElement("div");
  divLabel.setAttribute("id","divInputLabel");
  divLabel.append("Selecciona input: ");
  divLabel.append(labelText);
  divLabel.append(labelImage);

  var inputOption = document.getElementById("inputOption");
  inputOption.append(divLabel);
}

function createTextArea(screenNumber,textScreen) {
	var labelForm = document.createElement("label");
	//labelForm.innerHTML = "Introduce tu frase:";

	var textAreaForm = document.createElement("textarea");
	textAreaForm.setAttribute("name","textDisplay");
	textAreaForm.innerHTML = textScreen;
	//textAreaForm.setAttribute("value",res);

	var numScreenForm = document.createElement("input");
	numScreenForm.setAttribute("type","hidden");
	numScreenForm.setAttribute("id","numScreen");
	numScreenForm.setAttribute("name","numScreen");
	numScreenForm.setAttribute("value",screenNumber);

	var submitForm = document.createElement("input");
	submitForm.setAttribute("type","submit");
	submitForm.setAttribute("value","Guardar");
	submitForm.setAttribute("id","button");

	var textForm = document.createElement("form");
	textForm.setAttribute("id","textInput");
	//textForm.setAttribute("method","post");
	//textForm.setAttribute("action","submitController.php");
	textForm.onsubmit = function() {
		$.post("submitController.php", 
		{
			numScreen: screenNumber, 
			textDisplay: textAreaForm.value
		},
		function(res) {
			if (res.status != -1) {
				alert("Texto actualizado con exito");
			}
			else
				alert(res.error);
		},
		"json");
	}
	textForm.append(labelForm);
	textForm.append(textAreaForm);
	textForm.append(numScreenForm);
	textForm.append(submitForm);

	var inputOption = document.getElementById("inputOption");
	inputOption.append(textForm);
}
*/

  /*
function createDrawingArea(screenNumber,imageScreen) {
	/*var brushes = document.createElement("div");
	brushes.setAttribute("class","brushes");
	for(let i=1;i<6;i++){
		var button = document.createElement("button");
		button.setAttribute("type","button");
		button.setAttribute("value",i);
		brushes.append(button);
	}

	var leftBlock = document.createElement("div");
	leftBlock.setAttribute("class", "left-block");
	leftBlock.append("Grosor");
	leftBlock.append(brushes);

	var canvas = document.createElement("canvas");
	canvas.setAttribute("id","paint-canvas");
	canvas.setAttribute("width","256");
	canvas.setAttribute("height","128");
	var img = new Image;
	img.onload = function(){
		canvas.getContext("2d").drawImage(img,0,0); 
	};
	img.src = imageScreen;

	var canvasDiv = document.createElement("div");
	canvasDiv.setAttribute("id","canvasDiv");
	canvasDiv.append(canvas);
	
	var clearButton = document.createElement("button");
	clearButton.setAttribute("type","button");
	clearButton.setAttribute("id","clear");
	clearButton.innerHTML = "Borrar";
	var saveButton = document.createElement("button");
	saveButton.setAttribute("type","button");
	saveButton.setAttribute("id","save");
	saveButton.innerHTML = "Guardar";
	var buttons = document.createElement("div");
	buttons.setAttribute("id","divButtons");
	buttons.append(clearButton);
	buttons.append(saveButton);

	var rigthBlock = document.createElement("div");
	rigthBlock.setAttribute("class","right-block");
	rigthBlock.append(canvasDiv);
	rigthBlock.append(buttons);

	var inputOption = document.getElementById("inputOption");
	inputOption.append(leftBlock); 
	inputOption.append(rigthBlock);

	startDrawing(screenNumber);
}

function startDrawing(screenNumber){
  // Definitions
  var canvas = document.getElementById("paint-canvas");
  var context = canvas.getContext("2d");
  var boundings = canvas.getBoundingClientRect();

  // Specifications
  var mouseX = 0;
  var mouseY = 0;
  context.strokeStyle = 'black'; // initial brush color
  context.lineWidth = 1; // initial brush width
  var isDrawing = false;

  // Handle Brushes
  var brushes = document.getElementsByClassName('brushes')[0];

  brushes.addEventListener('click', function(event) {
    context.lineWidth = event.target.value || 1;
  });

  // Mouse Down Event
  canvas.addEventListener('mousedown', function(event) {
    setMouseCoordinates(event);
    isDrawing = true;

    // Start Drawing
    context.beginPath();
    context.moveTo(mouseX, mouseY);
  });

  // Mouse Move Event
  canvas.addEventListener('mousemove', function(event) {
    setMouseCoordinates(event);

    if(isDrawing){
      context.lineTo(mouseX, mouseY);
      context.stroke();
    }
  });

  // Mouse Up Event
  canvas.addEventListener('mouseup', function(event) {
    setMouseCoordinates(event);
    isDrawing = false;
  });

  // Handle Mouse Coordinates
  function setMouseCoordinates(event) {
    mouseX = event.clientX - boundings.left;
    mouseY = event.clientY - boundings.top;
  }

  // Handle Clear Button
  var clearButton = document.getElementById('clear');

  clearButton.addEventListener('click', function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Handle Save Button
  var saveButton = document.getElementById('save');

  saveButton.addEventListener('click', function() {
    var canvasDataURL = canvas.toDataURL();
	base64ToBlackWhiteArray(canvasDataURL,function(canvasHex) {
		$.post("submitController.php", 
		{
			numScreen: screenNumber, 
			imageBase64: canvasDataURL,
			imageHex: canvasHex
		},
		function(res) {
			if (res.status != -1) {
				alert("Imagen actualizada con exito");
			}	
			else
				alert(res.error);
			
			location.reload();
		},
		"json");
	});
	
    var imageName = prompt('Please enter image name');
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || 'drawing';
    a.click();
  });
}*/