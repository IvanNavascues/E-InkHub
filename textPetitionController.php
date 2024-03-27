<?php
    include './core/model.php';
    include './core/view.php';

    $printScreenModule = new PrintScreenModule();

    if (isset($_POST['numScreen']) && isset($_POST['textDisplay'])) {
        $printScreenModule->setScreenMessage($_POST['numScreen'],$_POST['textDisplay']);
        echo '<script type="text/javascript">alert("Mensaje cambiado con exito");</script>';
    }

    header("Refresh:1; URL=index.php");
    exit();
?>