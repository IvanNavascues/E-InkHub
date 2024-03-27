<?php
    include './core/model.php';
    include './core/view.php';

    $printScreenModule = new PrintScreenModule();

    if (isset($_GET['numScreen'])) {
        $screenText = $printScreenModule->getScreenMessage($_GET['numScreen']);
        if ($screenText != null)
            echo $screenText;
        else 
            echo '<script type="text/javascript">alert("Pantalla no encontrada");</script>';
    }

    //header("Refresh:1; URL=index.php");
    //exit();
?>