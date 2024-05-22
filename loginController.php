<?php
    include './core/model.php';
    include './core/view.php';

    session_start();

    if (isset($_POST['username']) && isset($_POST['password'])) {
        $loginScreenModule = new LoginScreenModule();
        $user = $loginScreenModule->checkLogin($_POST['username'], $_POST['password']);
        if ($user != null) {
            $_SESSION['user'] = $user->getId();
        }
        else {
            $vista = new View();
            $vista->showAlert("Credenciales no válidas");
        }
    }
    
    header("Refresh: 1; URL=index.php");
    exit();
?>