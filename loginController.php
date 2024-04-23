<?php
    include './core/model.php';
    include './core/view.php';

    session_start();

    if (isset($_POST['username']) && isset($_POST['password'])) {
        $loginScreenModule = new LoginScreenModule();
        $user = $loginScreenModule->checkLogin($_POST['username'], $_POST['password']);
        if ($user != null) {
            $_SESSION['user'] = $user->getId();
            
            $printScreenModule = new PrintScreenModule();
            $screenList = $printScreenModule->getScreens($user->getId());
        
            $vista = new MainView($screenList);
            $vista->printMainPage();
        }
        else {
            $vista = new LoginView(false);
            $vista->printLoginPage();
        }
    }

?>