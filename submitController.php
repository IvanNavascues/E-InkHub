<?php
    include './core/model.php';
    include './core/view.php';

    $printScreenModule = new PrintScreenModule();
    $aResult = array();

    if (isset($_POST['numScreen'])) {
        if (isset($_POST['textDisplay'])) {
            $printScreenModule->setScreenMessage($_POST['numScreen'],$_POST['textDisplay']);
            $aResult['status'] = 0;
            //echo '<script type="text/javascript">alert("Pantalla actualizada");</script>';
        }
        else if (isset($_POST['imageDisplay'])) { 
            $printScreenModule->setScreenImage($_POST['numScreen'],$_POST['imageDisplay']);
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