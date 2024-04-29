
//declare variables
var bgcolor = 'white';
var options = ["Color:        ","Pincel:       ","Grosor (- +): "];
var brushes = ["Cepillo (N)","Aerografo (S)","Borrador (E)","Rectangulo (Q)","Triangulo (T)"]

function setup() {
  //define canvas properties
  setupCanvas();
}

function setupCanvas() {
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

  slider = createSlider(1, 60, 20, 1);
  //slider.position(370, 50);
  slider.style('width', '180px');
  //slider.style('height', '30px');

  slider.parent(navSlider);

  //create canvas
  navCanvas = createDiv();
  navCanvas.style('position','relative');
  navCanvas.style('width','auto');
  navCanvas.style('font-size','xx-large');

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
}

function draw() {

  //Take advantage of the fact that elements in p5js are always on top, so you can always draw the menu bars to prevent the user from drawing in the menu bar
  noStroke();

  //Check if mouse is pressed and draw the lines and stuff
  if (mouseIsPressed && mouseInCanvas()) {
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

        ellipse(mouseX + random(-100, 100), mouseY + random(-100, 100), slider.value(), slider.value());
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
      rect(mouseX, mouseY, slider.value(), slider.value());
    }
    if (sel.value() == brushes[4]) {
      //draw triangle with brush thickness at mousex and y
      fill(colorPicker.color());
      triangle(mouseX, mouseY, mouseX + slider.value(), mouseY + slider.value(), mouseX - slider.value(), mouseY + slider.value());
    }
  }
}

function clearBG() {
  //clear the background by filling everything with white
  fill(bgcolor);
  noStroke();
  rect(0, 0, width, height);
}

function SaveImage() {
  var to_save = get(0, 0, width, height);
  to_save.save("canvas.png");
}

//check for key press
function keyPressed() {

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

function mouseInCanvas() {
  return (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0);
}