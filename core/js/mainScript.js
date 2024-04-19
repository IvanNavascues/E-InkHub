const base64ImageStart = "data:image/png;base64,";

function screenSelected(isText){
  var selectValue = document.getElementById("selScreen").value;
  clearPage();
  
  	$.ajax({
		type: "GET",
		dataType: "json",
		url: "screenController.php?numScreen="+selectValue,

		success: function (res) {
			if (selectValue != "") {
				if (res.status == -1) {
					alert(res.error);
					console.log(res.error);
				}
				else {
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
						createDrawingArea(selectValue,res.image);
					}
				}
				
			}
		}
  });
}

function clearPage() {
  var inputOption = document.getElementById("inputOption");
  inputOption.innerHTML = '';
}

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

  var inputOption = document.getElementById("inputOption");
  inputOption.append(labelText);
  inputOption.append(document.createElement("br"));
  inputOption.append(labelImage);
  inputOption.append(document.createElement("br"));
}

function createTextArea(screenNumber,textScreen) {
	var labelForm = document.createElement("label");
	labelForm.innerHTML = "Introduce tu frase:";

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
			
			location.reload();
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

function createDrawingArea(screenNumber,imageScreen) {
	var brushes = document.createElement("div");
	brushes.setAttribute("class","brushes");
	for(let i=1;i<6;i++){
		var button = document.createElement("button");
		button.setAttribute("type","button");
		button.setAttribute("value",i.toString);
		brushes.append(button);
	}
	
	var clearButton = document.createElement("button");
	clearButton.setAttribute("type","button");
	clearButton.setAttribute("id","clear");
	clearButton.innerHTML = "Borrar";
	var saveButton = document.createElement("button");
	saveButton.setAttribute("type","button");
	saveButton.setAttribute("id","save");
	saveButton.innerHTML = "Guardar";
	var buttons = document.createElement("div");
	brushes.append(clearButton);
	brushes.append(saveButton);

	var leftBlock = document.createElement("div");
	leftBlock.setAttribute("class", "left-block");
	leftBlock.append(brushes);
	leftBlock.append(buttons);

	var canvas = document.createElement("canvas");
	canvas.setAttribute("id","paint-canvas");
	canvas.setAttribute("width","256");
	canvas.setAttribute("height","128");
	var img = new Image;
	img.onload = function(){
		canvas.getContext("2d").drawImage(img,0,0); 
	};
	img.src = imageScreen;

	var rigthBlock = document.createElement("div");
	rigthBlock.setAttribute("class","right-block");
	rigthBlock.append(canvas);

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


  // Handle Colors
  /*var colors = document.getElementsByClassName('colors')[0];

  colors.addEventListener('click', function(event) {
    context.strokeStyle = event.target.value || 'black';
  });*/

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
	
   /* var imageName = prompt('Please enter image name');
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || 'drawing';
    a.click();*/
  });

}

// Función para convertir una imagen base64 a una matriz de píxeles en blanco y negro
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

        // Convertir los datos de píxeles a blanco y negro
        var blackWhiteArray = [];
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            var grayscaleValue = (r + g + b) / 3 +data[i+3]; 
            var pixelValue = grayscaleValue > 128 ? 1 : 0; 
            blackWhiteArray.push(pixelValue);
        }
		var a = document.createElement('a');
		const file = new Blob(blackWhiteArray, { type: 'text/plain' });
		a.href = URL.createObjectURL(file);
		a.download = 'bitArray.txt';
		a.click();
		URL.revokeObjectURL(a.href);

        var hexArray = bitsToHex(blackWhiteArray);
		a.href = 'data:attachment/text,' + encodeURI(hexArray);
		a.target = '_blank';
		a.download = 'hexArray.txt';
		a.click();
		URL.revokeObjectURL(a.href);
		callback(hexArray);
    };
}

// Función para convertir un array de bits a un array de hexadecimal de 8 en 8
function bitsToHex(bitsArray) {
    var hexArray = "";
    for (var i = 0; i < bitsArray.length; i += 8) {
        var byte = bitsArray.slice(i, i + 8).join(''); 
        var hexValue = parseInt(byte, 2).toString(16).toUpperCase().padStart(2, '0'); 
        hexArray += hexValue; 
    }
    return hexArray;
}