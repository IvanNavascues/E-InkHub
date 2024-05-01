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
    private $width;
    private $height;
    private $color;
    private $imageBase64;
    private $imageHex;
    private $imageRed;
    private $imageGreen;
    private $imageBlue;

    public function __construct($id,$name,$width,$height,$color,$imageBase64,$imageHex,$imageRed,$imageGreen,$imageBlue) {
        $this->id = $id;
        $this->name = $name;
        $this->width = $width;
        $this->height = $height;
        $this->color = $color;
        $this->imageBase64 = $imageBase64;
        $this->imageHex = $imageHex;
        $this->imageRed = $imageRed;
        $this->imageGreen = $imageGreen;
        $this->imageBlue = $imageBlue;
    }

    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getWidth() {
        return $this->width;
    }

    public function getHeight() {
        return $this->height;
    }

    public function getColor() {
        return $this->color;
    }

    public function getImageBase64() {
        return $this->imageBase64;
    }
    public function getImageHex() {
        return $this->imageHex;
    }
    public function getImageRed() {
        return $this->imageRed;
    }
    public function getImageGreen() {
        return $this->imageGreen;
    }
    public function getImageBlue() {
        return $this->imageBlue;
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
                array_push($screenList, new Screen($row['id'],$row['name'],$row['width'],$row['height'],$row['color'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']));
            }
            $res->free();
            return $screenList;
        }
    }

    public function setScreenImage($numScreen,$imageBase64,$imageHex,$imageRed,$imageGreen,$imageBlue) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET imageBase64 = '".$imageBase64."',imageHex = '".$imageHex."',imageRed = '".$imageRed."',imageGreen = '".$imageGreen."',imageBlue = '".$imageBlue."' WHERE id = '".$numScreen."'";

        return $conn->query("$query");
    }

    public function getScreenPrintable($numScreen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT * FROM screens WHERE id = '".$numScreen."'";

        if ($res = $conn->query("$query")) {
            $row = $res->fetch_assoc(); 
            $res->free();
            return new Screen($row['id'],$row['name'],$row['width'],$row['height'],$row['color'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
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
