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

    public function __construct($id,$name,$text) {
        $this->id = $id;
        $this->name = $name;
        $this->text = $text;
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
}

class PrintScreenModule extends Model {
    public function getScreens() {
        $conn = DatabaseConnSingleton::getConn();

        $screenList = array();
        $query = "SELECT * FROM screens";

        if ($res = $conn->query("$query")) {
            while ($row = $res->fetch_assoc()) {
                array_push($screenList, new Screen($row['id'],$row['name'],$row['message']));
            }
            $res->free();
            return $screenList;
        }
    }

    public function setScreenMessage($numScreen,$message) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET message = '".$message."' WHERE id = '".$numScreen."'";

        return $conn->query("$query");
    }
}

?>
