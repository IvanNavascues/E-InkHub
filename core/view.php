<?php
class View {
    public function getPatternPage(){
        return file_get_contents(__DIR__ . '/html/patternPage.html');
    }
}

class MainView extends View {
    private $screenList;

    public function __construct($screenList) {
        $this->screenList = $screenList;
    }

    public function printMainPage(){
        $page = $this->getPatternPage();

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

        $newPortion = file_get_contents(__DIR__ . '/html/loginPage.html');
        $page = str_replace("##content##",$newPortion,$page);
        if ($this->loginFailed) {
            echo '<script>alert("Login fallido");</script>';
        }

        echo $page;
    }
}
?>
