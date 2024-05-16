<?php
class Model
{
    public function __construct(){
        require_once './core/DatabaseConnSingleton.php';
    }
}

class Screen {
    private $id;
    private $mac;
    private $name;
    private $width;
    private $height;
    private $color;
    private $lastUpdate;
    private $imageBase64;
    private $imageHex;
    private $imageRed;
    private $imageGreen;
    private $imageBlue;

    public function __construct($id,$mac,$name,$width,$height,$color,$lastUpdate,$imageBase64,$imageHex,$imageRed,$imageGreen,$imageBlue) {
        $this->id = $id;
        $this->mac = $mac;
        $this->name = $name;
        $this->width = $width;
        $this->height = $height;
        $this->color = $color;
        $this->lastUpdate = $lastUpdate;
        $this->imageBase64 = $imageBase64;
        $this->imageHex = $imageHex;
        $this->imageRed = $imageRed;
        $this->imageGreen = $imageGreen;
        $this->imageBlue = $imageBlue;
    }

    public function getId() {
        return $this->id;
    }

    public function getMac() {
        return $this->mac;
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

    public function getLastUpdate() {
        return $this->lastUpdate;
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

    /* SQL SERVER
    public function getScreens($idUser) {
        $conn = DatabaseConnSingleton::getConn();

        $screenList = array();
        $query = "SELECT screens.* FROM screens JOIN userscreens ON screens.id = userscreens.macScreen WHERE userscreens.idUser = ".$idUser;
        
        $getScreens = sqlsrv_query($conn, $query);
        if ($getScreens == FALSE) {
            return $screenList;
            //die(FormatErrors(sqlsrv_errors()));
        }

        while ($row = sqlsrv_fetch_array($getScreens, SQLSRV_FETCH_ASSOC)) {
            array_push($screenList, new Screen($row['id'],$row['name'],$row['width'],$row['height'],$row['color'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']));
        }
        sqlsrv_free_stmt($getScreens);
        sqlsrv_close($conn);

        return $screenList;
    }

    public function setScreenImage($numScreen,$imageBase64,$imageHex,$imageRed,$imageGreen,$imageBlue) {
        try {
            $conn = DatabaseConnSingleton::getConn();

            $query = "UPDATE screens SET imageBase64 = '".$imageBase64."',imageHex = '".$imageHex."',imageRed = '".$imageRed."',imageGreen = '".$imageGreen."',imageBlue = '".$imageBlue."' WHERE id = '".$numScreen."'";
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn);
            }
            else{
                sqlsrv_rollback($conn);
            }
            // Free statement and connection resources. 
            sqlsrv_free_stmt( $stmt);

        } catch (Exception $e){
            
        }
    }

    public function getScreenPrintable($numScreen) {
        try
        {
            $conn = DatabaseConnSingleton::getConn();
    
            $query = "SELECT * FROM screens WHERE id = '".$numScreen."'";
            $getScreen = sqlsrv_query($conn, $query);
            if ($getScreen == FALSE) {
                return null;
                //die(FormatErrors(sqlsrv_errors()));
            }
            
            $row = sqlsrv_fetch_array($getScreen, SQLSRV_FETCH_ASSOC);
            $screen = new Screen($row['id'],$row['name'],$row['width'],$row['height'],$row['color'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
            sqlsrv_free_stmt($getScreen);
            sqlsrv_close($conn);

            return $screen;
        }
        catch(Exception $e) {
            //echo("Error!");
        }
    }*/

    public function createScreenForUser($screen,$idUser) {
        $conn = DatabaseConnSingleton::getConn();
        $result = -1;

        $existingScreen = $this->getScreenPrintableByMac($screen->getMac());
        if ($existingScreen != null) {
            $result = 1;
            $idNewScreen = $existingScreen->getId();
        }
        else {
            $query = "INSERT INTO screens (MAC, name, width, height, color) 
                        VALUES ('".$screen->getMac()."', '".$screen->getName()."', '".$screen->getWidth()."','".$screen->getHeight()."','".$screen->getColor()."')";
            if ($conn->query("$query")) {
                $result = 0;
                $idNewScreen = $this->getScreenPrintableByMac($screen->getMac())->getId();
            }
        }

        $query = "INSERT INTO userscreens (idUser, idScreen) VALUES ('".$idUser."', '".$idNewScreen."')";
        $conn->query("$query");

        return $result;
    }

    public function getScreens($idUser) {
        $conn = DatabaseConnSingleton::getConn();

        $screenList = array();
        $query = "SELECT screens.* FROM screens JOIN userscreens ON screens.id = userscreens.idScreen WHERE userscreens.idUser = ".$idUser;

        if ($res = $conn->query("$query")) {
            while ($row = $res->fetch_assoc()) {
                array_push($screenList, new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']));
            }
            $res->free();
            return $screenList;
        }
    }

    public function checkUserIdScreen($idUser,$idScreen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT screens.id FROM screens JOIN userscreens ON screens.id = userscreens.idScreen WHERE userscreens.idUser = ".$idUser;

        if ($res = $conn->query("$query")) {
            $found = false;
            while ($row = $res->fetch_assoc()) {
                $found = $row['id'] == $idScreen;
                if ($found)
                    break;
            }
            $res->free();
            return $found;
        }
    }

    public function updateScreenOptions($screen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET name = '".$screen->getName()."',MAC = '".$screen->getMac()."',width = '".$screen->getWidth()."',height = '".$screen->getHeight()."',color = '".$screen->getColor()."' WHERE id = '".$screen->getId()."'";

        return $conn->query("$query");
    }

    public function setScreenImage($numScreen,$imageBase64,$imageHex,$imageRed,$imageGreen,$imageBlue) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET imageBase64 = '".$imageBase64."',imageHex = '".$imageHex."',imageRed = '".$imageRed."',imageGreen = '".$imageGreen."',imageBlue = '".$imageBlue."' WHERE id = '".$numScreen."'";

        return $conn->query("$query");
    }

    public function setLastUpdateDateByMac($mac) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET lastUpdate = now() WHERE MAC = '".$mac."'";

        return $conn->query("$query");
    }

    public function deleteScreen($numScreen) {
        $conn = DatabaseConnSingleton::getConn();
        $result = false;

        $query = "DELETE FROM userscreens WHERE idScreen = '".$numScreen."'";
        $result = $conn->query("$query");

        $query = "DELETE FROM screens WHERE id = '".$numScreen."'";
        $result = $conn->query("$query");

        return $result;
    }

    public function getScreenPrintableById($numScreen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT * FROM screens WHERE id = '".$numScreen."'";

        if ($res = $conn->query("$query")) {
            $row = $res->fetch_assoc(); 
            $res->free();
            if ($row != null)
                return new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
        }
        else
            return null;
    }

    public function getScreenPrintableByMac($macScreen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT * FROM screens WHERE MAC = '".$macScreen."'";

        if ($res = $conn->query("$query")) {
            $row = $res->fetch_assoc(); 
            $res->free();
            if ($row != null)
                return new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
        }
        else
            return null;
    }

    public function setScreenToUserByMac($mac,$idUser) {
        $conn = DatabaseConnSingleton::getConn();

        $screen = $this->getScreenPrintableByMac($mac);
        if($screen != null) {
            $query = "INSERT INTO userscreens (idUser, idScreen) VALUES ('".$idUser."', '".$screen->getId()."')";
            $conn->query("$query");
            return true;
        }

        return false;
    }
}

class LoginScreenModule extends Model {

    /* SQL SERVER
    public function checkLogin($username,$password) {
        try
        {
            $conn = DatabaseConnSingleton::getConn();
    
            $query = "SELECT * FROM users WHERE username = '".$username."' AND password = '".$password."'";
            $getUser = sqlsrv_query($conn, $query);
            if ($getUser == FALSE) {
                return null;
                //die(FormatErrors(sqlsrv_errors()));
            }
            
            $row = sqlsrv_fetch_array($getUser, SQLSRV_FETCH_ASSOC);
            $user = new User($row['id'],$row['username'],$row['password']);
            sqlsrv_free_stmt($getUser);
            sqlsrv_close($conn);

            return $user;
        }
        catch(Exception $e){
            //echo("Error!");
        }
    }*/

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
