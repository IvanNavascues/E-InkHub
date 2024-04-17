<?php
class Model
{
    public function __construct(){
        require_once './core/DatabaseConnSingleton.php';
    }
}

class Screen {
    private $id;
    private $name;
    private $text;
    private $image;
    private $isText;

    public function __construct($id,$name,$text,$image,$isText) {
        $this->id = $id;
        $this->name = $name;
        $this->text = $text;
        $this->image = $image;
        $this->isText = $isText;
    }

    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getText() {
        return $this->text;
    }
    public function getImage() {
        return $this->image;
    }
    public function isText() {
        return $this->isText;
    }
}

class PrintScreenModule extends Model {
    public function getScreens() {
        $conn = DatabaseConnSingleton::getConn();

        $screenList = array();
        $query = "SELECT * FROM screens";

        if ($res = $conn->query("$query")) {
            while ($row = $res->fetch_assoc()) {
                array_push($screenList, new Screen($row['id'],$row['name'],$row['message'],$row['bitMap'],$row['isText']));
            }
            $res->free();
            return $screenList;
        }
    }

    public function setScreenMessage($numScreen,$message) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET message = '".$message."',isText = TRUE WHERE id = '".$numScreen."'";

        return $conn->query("$query");
    }

    public function setScreenImage($numScreen,$bitMap) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET bitMap = '".$bitMap."',isText = FALSE WHERE id = '".$numScreen."'";

        return $conn->query("$query");
    }

    public function getScreenPrintable($numScreen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT * FROM screens WHERE id = '".$numScreen."'";

        if ($res = $conn->query("$query")) {
            $row = $res->fetch_assoc(); 
            $res->free();
            return new Screen($row['id'],$row['name'],$row['message'],$row['bitMap'],$row['isText']);
        }
        else
            return null;
    }
}

?>
