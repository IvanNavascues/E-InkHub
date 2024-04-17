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
							createDrawingArea(selectValue,res.image);
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
	canvas.setAttribute("width","250");
	canvas.setAttribute("heigth","128");
	var img = new Image;
	img.onload = function(){
		canvas.getContext("2d").drawImage(img,0,0); 
	};
	var imageBase64 = base64ImageStart+hexToBase64(imageScreen);
	img.src = imageBase64;

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
	//var imageData = context.getImageData(canvas.left, canvas.top, canvas.width, canvas.height).data;
    var canvasDataURL = canvas.toDataURL();
	var canvasBitMap = base64ToUint8Array(canvasDataURL);
	var canvasHex = hexEncode(canvasDataURL);
	$.post("submitController.php", 
	{
		numScreen: screenNumber, 
		imageDisplay: canvasHex
	},
	function(res) {
		if (res.status != -1) {
			alert("Imagen actualizada con exito");
			//alert(canvasHex);
		}	
		else
			alert(res.error);
		
		location.reload();
	},
	"json");
    /*var imageName = prompt('Please enter image name');
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || 'drawing';
    a.click();*/
  });

}

function base64ToUint8Array(base64String) {
    // Decodificar la cadena en base64 a una cadena binaria
    const binaryString = atob(base64String.split(',')[1]);
    
    // Crear un array de bytes a partir de la cadena binaria
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return uint8Array;
}

function hexEncode(base64String) {
	const raw = atob(base64String.split(',')[1]);
	let result = '';
	for (let i = 0; i < raw.length; i++) {
		const hex = raw.charCodeAt(i).toString(16);
		result += (hex.length === 2 ? hex : '0' + hex);
	}
	return result.toUpperCase();
}

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
      str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}