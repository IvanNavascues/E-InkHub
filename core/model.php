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
    private $imageBase64;
    private $imageHex;
    private $isText;

    public function __construct($id,$name,$text,$imageBase64,$imageHex,$isText) {
        $this->id = $id;
        $this->name = $name;
        $this->text = $text;
        $this->imageBase64 = $imageBase64;
        $this->imageHex = $imageHex;
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
    public function getImageBase64() {
        return $this->imageBase64;
    }
    public function getImageHex() {
        return $this->imageHex;
    }
    public function isText() {
        return $this->isText;
    }
}

class User {
    private $id;
    private $username;
    private $password;

    public function __construct($id,$username,$password) {
        $this->id = $id;
        $this->username = $username;
        $this->password = $password;
    }

    public function getId() {
        return $this->id;
    }

    public function getUsername() {
        return $this->username;
    }

    public function getPassword() {
        return $this->password;
    }
}

class PrintScreenModule extends Model {
    public function getScreens($idUser) {
        $conn = DatabaseConnSingleton::getConn();

        $screenList = array();
        $query = "SELECT screens.* FROM screens JOIN userscreens ON screens.id = userscreens.idScreen WHERE userscreens.idUser = ".$idUser;

        if ($res = $conn->query("$query")) {
            while ($row = $res->fetch_assoc()) {
                array_push($screenList, new Screen($row['id'],$row['name'],$row['message'],$row['imageBase64'],$row['imageHex'],$row['isText']));
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

    public function setScreenImage($numScreen,$imageBase64,$imageHex) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET imageBase64 = '".$imageBase64."',imageHex = '".$imageHex."',isText = FALSE WHERE id = '".$numScreen."'";

        return $conn->query("$query");
    }

    public function getScreenPrintable($numScreen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT * FROM screens WHERE id = '".$numScreen."'";

        if ($res = $conn->query("$query")) {
            $row = $res->fetch_assoc(); 
            $res->free();
            return new Screen($row['id'],$row['name'],$row['message'],$row['imageBase64'],$row['imageHex'],$row['isText']);
        }
        else
            return null;
    }
}

class LoginScreenModule extends Model {
    public function checkLogin($username,$password) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT * FROM users WHERE username = '".$username."' AND password = '".$password."'";

        if ($res = $conn->query("$query")) {
            $row = $res->fetch_assoc(); 
            if (!empty($row)) {
                $res->free();
                return new User($row['id'],$row['username'],$row['password']);
            }
        }
        
        return null;
    }
}

?>
