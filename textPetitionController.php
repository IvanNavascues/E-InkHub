<?php
    include './core/model.php';
    include './core/view.php';

    $printScreenModule = new PrintScreenModule();

    if (isset($_POST['numScreen'])) {
        echo "hola";
        echo '<script type="text/javascript">alert("Mensaje cambiado con exito");</sctript>';
    }

    header("Refresh:1; URL=index.php");
    exit();
?>