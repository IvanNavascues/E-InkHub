<?php
class View {
    public function getMainPage(){
        return file_get_contents(__DIR__ . '/html/mainPage.html');
    }
}

class MainView extends View {
    private $screenList;

    public function __construct($screenList) {
        $this->screenList = $screenList;
    }

    public function printMainPage(){
        $page = $this->getMainPage();

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
?>
