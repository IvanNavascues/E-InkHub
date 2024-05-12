<?php
    include './core/model.php';
    include './core/view.php';

    $printScreenModule = new PrintScreenModule();
    $aResult = array();

    if (isset($_POST['numScreen'])) {
        if (isset($_POST['imageBase64']) && isset($_POST['imageHex']) && isset($_POST['imageRed']) && isset($_POST['imageGreen']) && isset($_POST['imageBlue'])) { 
            $printScreenModule->setScreenImage($_POST['numScreen'],$_POST['imageBase64'],$_POST['imageHex'],$_POST['imageRed'],$_POST['imageGreen'],$_POST['imageBlue']);
            $aResult['status'] = 1;
            //echo '<script type="text/javascript">alert("Pantalla actualizada");</script>';
        }
        else {
            $aResult['status'] = -1;
            $aResult['error'] = "ERROR: Nada que actualizar";
            //echo '<script type="text/javascript">alert("Error al actualizar");</script>';
        }
    }
    else {
        $aResult['status'] = -1;
        $aResult['error'] = "ERROR: Pantalla no seleccionada";
    }

    echo json_encode($aResult);

    //header("Refresh:1; URL=index.php");
    //exit();
?>