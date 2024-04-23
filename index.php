<?php
    include './core/model.php';
    include './core/view.php';

    session_start();

    if (isset($_GET['logout'])) {
        unset( $_SESSION['user'] );
        unset( $_GET['logout'] );
    }

    if (isset($_SESSION['user'])) {
        $printScreenModule = new PrintScreenModule();
        $screenList = $printScreenModule->getScreens($_SESSION['user']);

        $vista = new MainView($screenList);
        $vista->printMainPage();
    }
    else {
        $vista = new LoginView(false);
        $vista->printLoginPage();
    }
?>