<?php
    include './core/model.php';
    include './core/view.php';

    session_start();

    $printScreenModule = new PrintScreenModule();
    $aResult = array();
    $screen = null;

    if (isset($_GET['numScreen'])) {
        if (isset($_SESSION['user'])) {
            if ($printScreenModule->checkUserIdScreen($_SESSION['user'],$_GET['numScreen']))
                $screen = $printScreenModule->getScreenPrintableById($_GET['numScreen']);
            else {
                $aResult['error'] = "ERROR: Acceso denegado";
                $aResult['status'] = -1;
                echo json_encode($aResult);
                exit(-1);
            }
        }
        else {
            $aResult['error'] = "ERROR: Acceso denegado";
            $aResult['status'] = -1;
            echo json_encode($aResult);
            exit(-1);
        }
    }
    else if (isset($_GET['macScreen'])) {
        $screen = $printScreenModule->getScreenPrintableByMac($_GET['macScreen']);
    }
    else {
        $aResult['error'] = "ERROR: Pantalla no seleccionada";
        $aResult['status'] = -1;
        echo json_encode($aResult);
        exit(-1);
        //echo '<script type="text/javascript">alert("Pantalla no encontrada");</script>';
    }
    
    if ($screen != null) {
        $aResult['width'] = $screen->getWidth();
        $aResult['height'] = $screen->getHeight();
        $aResult['color'] = $screen->getColor();
        $aResult['imageBase64'] = $screen->getImageBase64();
        $aResult['imageHex'] = $screen->getImageHex();
        $aResult['imageRed'] = $screen->getImageRed();
        $aResult['imageGreen'] = $screen->getImageGreen();
        $aResult['imageBlue'] = $screen->getImageBlue();
        $aResult['status'] = 0;
    }
    else {
        $aResult['error'] = "ERROR: La pantalla seleccionada no existe";
        $aResult['status'] = -1;
    }

    echo json_encode($aResult);

    //header("Refresh:1; URL=index.php");
    //exit();
?>