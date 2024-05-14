<?php
class View {
    public function getPatternPage(){
        return file_get_contents(__DIR__ . '/html/patternPage.html');
    }

    public function showAlert($message) {
        echo '<script>alert("'.$message.'");</script>';
    }
}

class MainView extends View {
    private $screenList;

    public function __construct($screenList) {
        $this->screenList = $screenList;
    }

    public function printMainPage(){
        $page = $this->getPatternPage();

        $page = str_replace("##style##",'<link rel="stylesheet" href="core/css/mainStyle.css">',$page);

        $newPortion = file_get_contents(__DIR__ . '/html/mainPage.html');
        $page = str_replace("##content##",$newPortion,$page);

        $page = str_replace("##screens##",$this->getScreenOptions(),$page);

        echo $page;
    }

    public function getScreenOptions() {
        $content = "";
        foreach ($this->screenList as $screen) {
            $content .= '<option value="'.$screen->getId().'">'.$screen->getName().'</option>';
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
            $this->screen = new Screen("","","","","","","bw",null,null,null,null);
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
