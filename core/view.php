<?php
class View {
    public function getPatternPage(){
        return file_get_contents(__DIR__ . '/html/patternPage.html');
    }

    public function showAlert($message) {
        echo '<script>alert("'.$message.'");</script>';
    }

    public function reloadPage($page) {
        $location = "https://e-inkhub.azurewebsites.net".$page;
        echo '<script>window.location.replace("'.$location.'");</script>';
    }
}

class MainView extends View {
    
    private $colors = array("bw","r","g","b","rgb");
    private $colorsName = array("Blanco y negro","Rojo","Verde","Azul","Cualquier color");
    private $screenList;
    private $screenPatttern = '<a href="" onclick="return viewScreen(##id##)" class="list-group-item list-group-item-action" aria-current="true">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">##name##</h5>
                                        <small>Ultima vez visto: ##lastUpdate##</small>
                                    </div>
                                    <div class="d-flex w-100 justify-content-between">
                                        <p class="mb-1">##size##</p>
                                        ##pos##
                                    </div>
                                    <div class="d-flex w-100 justify-content-between">
                                        <small>Color: ##color##</small>
                                        <div class="d-flex w-100 justify-content-center">
                                            <a class="btn btn-primary " role="button" onclick="screenSelected(##id##)"><img src="core/assets/modify.svg" width="20px" height="20px" alt="add screen button" border="0" /></a>
                                            <a class="btn btn-secondary mx-2" role="button" onclick="addScreen(##id##)"><img src="core/assets/newLocation.svg" width="20px" height="20px" alt="add screen button" border="0" /></a>
                                            <a class="btn btn-danger me-1" href=newScreenController.php?delete=##id## onclick="return confirm(\'¡ATENCIÓN! Se eliminará la pantalla del sistema, ¿Quiere continuar?\');" role="button"><img src="core/assets/garbage.svg" width="20px" height="20px" alt="add screen button" border="0" /></a>
                                        </div>
                                    </div>
                                </a>';
    private $noScreens = '<p class="text-center fs-3 fw-bold">Sin pantallas disponibles</p>';

    public function __construct($screenList) {
        $this->screenList = $screenList;
    }

    public function printMainPage(){
        $page = $this->getPatternPage();

        $page = str_replace("##style##",'<link rel="stylesheet" href="core/css/mainStyle.css">',$page);

        $newPortion = file_get_contents(__DIR__ . '/html/mainPage.html');
        $page = str_replace("##content##",$newPortion,$page);

        $page = str_replace("##screens##",$this->getScreenOptions(),$page);

        $page = str_replace("##screenList##",$this->getScreenList(),$page);
        $page = str_replace("##coords##",$this->getScreenCoords(),$page);

        echo $page;
    }

    public function getScreenOptions() {
        $content = "";
        foreach ($this->screenList as $screen) {
            $content .= '<option value="'.$screen->getId().'">'.$screen->getName().'</option>';
        }

        return $content;
    }

    public function getScreenList() {
        $content = "";
        foreach ($this->screenList as $screen) {
            $newScreen = $this->screenPatttern;
            $newScreen = str_replace("##id##",$screen->getId(),$newScreen);
            $newScreen = str_replace("##name##",$screen->getName(),$newScreen);
            if ($screen->getLastUpdate() === null)
                $newScreen = str_replace("##lastUpdate##","Nunca",$newScreen);
            else
                $newScreen = str_replace("##lastUpdate##",$screen->getLastUpdate()->getTimestamp(),$newScreen);
            $newScreen = str_replace("##size##",$screen->getWidth().'x'.$screen->getHeight().' pixeles',$newScreen);
            $newScreen = str_replace("##color##",$this->colorsName[array_search($screen->getColor(), $this->colors)],$newScreen);
            if ($screen->getLatitude() === null || $screen->getLongitude() === null) {
                $newScreen = str_replace("##pos##","<small class='fw-bold'>SIN UBICACIÓN</small>",$newScreen);
            }
            else {
                $newScreen = str_replace("##pos##","",$newScreen);
            }
            $content .= $newScreen;
            //$content .= '<button type="button" class="list-group-item list-group-item-action" onclick="viewScreen('.$screen->getId().')">'.$screen->getName().'</button>';
        }
        if ($content == '')
            $content = $this->noScreens;
        
        return $content;
    }

    public function getScreenCoords() {
        $content = "";
        foreach ($this->screenList as $screen) {
            if ($screen->getLatitude() != null && $screen->getLongitude() != null) {
                $content .= 'screens.set('.$screen->getId().', ['.$screen->getLatitude().','.$screen->getLongitude().']);';
                $content .= 'screensName.set('.$screen->getId().', "'.$screen->getName().'");';
            }
        }

        return $content;
    }
}

class LoginView extends View { 
    private $loginFailed;

    public function __construct($loginFailed) {
        $this->loginFailed = $loginFailed;
    }

    public function printLoginPage(){
        $page = $this->getPatternPage();

        $page = str_replace("##style##",'',$page);
        
        $newPortion = file_get_contents(__DIR__ . '/html/loginPage.html');
        $page = str_replace("##content##",$newPortion,$page);
        if ($this->loginFailed) {
            echo '<script>alert("Login fallido");</script>';
        }

        echo $page;
    }
}

class NewScreenView extends View { 

    private $colors = array("bw","r","g","b","rgb");
    private $colorsName = array("Blanco y negro","Rojo","Verde","Azul","Cualquier color");
    private $screen;
    private $modification;

    public function __construct($screen) {
        if ($screen == null) {
            $this->screen = new Screen("","","","","","bw","","","",null,null,null,null,null);
            $this->modification = false;
        }
        else {
            $this->screen = $screen;
            $this->modification = true;
        }
    }

    public function printNewScreenPage(){
        $page = $this->getPatternPage();

        $page = str_replace("##style##",'',$page);
        
        $newPortion = file_get_contents(__DIR__ . '/html/newScreenPage.html');
        $newPortion = $this->loadScreen($newPortion);
        
        $page = str_replace("##content##",$newPortion,$page);

        echo $page;
    }

    private function loadScreen($page){
        if ($this->modification) {
            $page = str_replace("##opt##","?modify=".$this->screen->getId(),$page);
            $page = str_replace("##header##","Modificar pantalla",$page);
            $page = str_replace("##button##","Actualizar pantalla",$page);
        }
        else {
            $page = str_replace("##header##","Nueva pantalla",$page);
            $page = str_replace("##opt##","",$page);
            $page = str_replace("##button##","Crear pantalla",$page);
        }

        $page = str_replace("##name##",$this->screen->getName(),$page);
        $page = str_replace("##mac##",$this->screen->getMac(),$page);
        $page = str_replace("##height##",$this->screen->getHeight(),$page);
        $page = str_replace("##width##",$this->screen->getWidth(),$page);

        $colorOptions = "";
        for ($i=0;$i<count($this->colors);$i++) {
            if ($this->colors === $this->screen->getColor())
                $colorOptions .= " <option value=".$this->colors[$i]." selected>".$this->colorsName[$i]."</option>\n";
            else
                $colorOptions .= " <option value=".$this->colors[$i].">".$this->colorsName[$i]."</option>\n";
        }
        $page = str_replace("##colors##",$colorOptions,$page);

        return $page;
    }
}
?>
