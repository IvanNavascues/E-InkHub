<?php
    include './core/model.php';
    include './core/view.php';

    $printScreenModule = new PrintScreenModule();
    $aResult = array();

    if (isset($_GET['numScreen'])) {
        $screen = $printScreenModule->getScreenPrintable($_GET['numScreen']);
        if ($screen != null) {
            $aResult['message'] = $screen->getText();
            $aResult['image'] = $screen->getImage();
            if ($screen->isText()) 
                $aResult['status'] = 0;
            else 
                $aResult['status'] = 1;
        }
        else {
            $aResult['error'] = "ERROR: La pantalla seleccionada no existe";
            $aResult['status'] = -1;
        }
    }
    else {
        $aResult['error'] = "ERROR: Pantalla no seleccionada";
        $aResult['status'] = -1;
        //echo '<script type="text/javascript">alert("Pantalla no encontrada");</script>';
    }

    echo json_encode($aResult);

    //header("Refresh:1; URL=index.php");
    //exit();
?>