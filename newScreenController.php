<?php
    include './core/model.php';
    include './core/view.php';

    session_start();

    if (isset($_SESSION['user'])) {        
        $printScreenModule = new PrintScreenModule();
        if (isset($_GET['modify'])) {
            if ($printScreenModule->checkUserIdScreen($_SESSION['user'],$_GET['modify'])) {
                if (isset($_POST['name']) && isset($_POST['MAC']) && isset($_POST['height']) && isset($_POST['width']) && isset($_POST['color'])) { 
                    $screen = new Screen($_GET['modify'],$_POST['MAC'],$_POST['name'],$_POST['width'],$_POST['height'],$_POST['color'],null,null,null,null,null,null,null,null);
                    $vista = new View();
                    if ($printScreenModule->updateScreenOptions($screen)) {
                        $vista->showAlert("Pantalla modificada con exito");
                        header('Location: index.php');
                        exit();
                    }
                    else {
                        $vista->showAlert("Error al modificar pantalla");
                        header('Location: ');
                        exit();
                    }
                }
                else if (isset($_POST['latitude']) && isset($_POST['longitude'])) { 
                    $screen = new Screen($_GET['modify'],null,null,null,null,null,$_POST['latitude'],$_POST['longitude'],null,null,null,null,null,null);
                    $vista = new View();
                    if ($printScreenModule->updateScreenCoords($screen)) {
                        $vista->showAlert("Pantalla modificada con exito");
                        header('Location: index.php');
                        exit();
                    }
                    else {
                        $vista->showAlert("Error al modificar pantalla");
                        header('Location: ');
                        exit();
                    }
                }
                else {
                    $screen = $printScreenModule->getScreenPrintableById($_GET['modify']);
                    $vista = new NewScreenView($screen);
                    $vista->printNewScreenPage();
                }
            }
            else {
                $vista = new View();
                $vista->showAlert("Acceso denegado a pantalla");
                header('Location: index.php');
                exit();
            }
        }
        else if (isset($_GET['delete'])) {
            $vista = new View();
            if ($printScreenModule->checkUserIdScreen($_SESSION['user'],$_GET['delete'])){
                if ($printScreenModule->deleteScreen($_GET['delete'])) {
                    $vista->showAlert("Pantalla eliminada con exito");
                }
                else {
                    $vista->showAlert("Error al eliminar pantalla");
                }
            }
            else {
                $vista->showAlert("Acceso denegado a pantalla");
            }
            header('Location: index.php');
            exit();
        }
        else if (isset($_GET['mac'])) {
            $vista = new View();
            if ($printScreenModule->setScreenToUserByMac($_GET['mac'],$_SESSION['user'])) {
                $vista->showAlert("Pantalla añadida con exito");
            }
            else {
                $vista->showAlert("No existe una pantalla con ese MAC");
            }
            header('Location: index.php');
            exit();
        }
        else {
            if (isset($_POST['name']) && isset($_POST['MAC']) && isset($_POST['height']) && isset($_POST['width']) && isset($_POST['color'])) { 
                $screen = new Screen(0,strval($_POST['MAC']),strval($_POST['name']),$_POST['width'],$_POST['height'],$_POST['color'],null,null,null,null,null,null,null,null);
                $vista = new View();
                $res = $printScreenModule->createScreenForUser($screen,$_SESSION['user']);
                if ($res === 0) {
                    $vista->showAlert("Pantalla añadida con exito");
                    header("Refresh: 4; URL=index.php");
                    exit();
                }
                else if ($res === 1) {
                    $vista->showAlert("Ya exite una pantalla con ese MAC, ha sido añadida a tu usuario");
                    header('Location: index.php');
                    exit();
                }
                else {
                    $vista->showAlert("Error al añadir pantalla");
                    header('Location: ');
                    exit();
                }
            }
            else {
                $vista = new NewScreenView(null);
                $vista->printNewScreenPage();
            }
        }
    }
    else {
        $vista = new LoginView(false);
        $vista->printLoginPage();
    }
?>