<?php

function generate_image($width, $height) {
    // Creamos una imagen en blanco y negro
    $image = imagecreatetruecolor($width, $height);
    $white = imagecolorallocate($image, 255, 255, 255);
    $black = imagecolorallocate($image, 0, 0, 0);
    imagefill($image, 0, 0, $white);

    // Convertimos la imagen en blanco y negro a char[]
    $char_array = '';
    for ($y = 0; $y < $height; $y++) {
        for ($x = 0; $x < $width; $x++) {
            $color_index = imagecolorat($image, $x, $y);
            $color = imagecolorsforindex($image, $color_index);
            $brightness = ($color['red'] + $color['green'] + $color['blue']) / 3;
            $char_array .= $brightness < 128 ? chr(0) : chr(255);
        }
    }

    // Liberamos la memoria de la imagen
    imagedestroy($image);

    return $char_array;
}

// Definimos las dimensiones de la imagen
$width = 250;
$height = 122;

// Generamos la imagen
$image_data = generate_image($width, $height);

// Imprimimos la imagen como un char array
echo $image_data;
?>