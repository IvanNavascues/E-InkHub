<?php
    include './core/model.php';
    include './core/view.php';

    session_start();

    $vista = new View();
    if (isset($_POST['username']) && isset($_POST['password'])) {
        $loginScreenModule = new LoginScreenModule();
        $user = $loginScreenModule->checkLogin($_POST['username'], $_POST['password']);
        if ($user != null) {
            $_SESSION['user'] = $user->getId();
        }
        else {
            $vista->showAlert("Credenciales no válidas");
        }
    }
    
    $vista->reloadPage("");
    exit();
?>