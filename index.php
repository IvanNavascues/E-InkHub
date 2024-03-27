<?php
    include './core/model.php';
    include './core/view.php';

    $printScreenModule = new PrintScreenModule();

    $screenList = $printScreenModule->getScreens();

    $vista = new MainView($screenList);
    $vista->printMainPage();
?>