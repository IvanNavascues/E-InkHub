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
    private $latitude;
    private $longitude;
    private $lastUpdate;
    private $imageBase64;
    private $imageHex;
    private $imageRed;
    private $imageGreen;
    private $imageBlue;

    public function __construct($id,$mac,$name,$width,$height,$color,$latitude,$longitude,$lastUpdate,$imageBase64,$imageHex,$imageRed,$imageGreen,$imageBlue) {
        $this->id = $id;
        $this->mac = $mac;
        $this->name = $name;
        $this->width = $width;
        $this->height = $height;
        $this->color = $color;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
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

    public function getLatitude() {
        return $this->latitude;
    }

    public function getLongitude() {
        return $this->longitude;
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

    /* SQL SERVER */
    public function createScreenForUser($screen,$idUser) {
        $conn = DatabaseConnSingleton::getConn();
        $result = -1;

        $existingScreen = $this->getScreenPrintableByMac($screen->getMac());
        if ($existingScreen === null) {
            $query = "INSERT INTO screens (MAC, name, width, height, color) 
                    VALUES ('".$screen->getMac()."',
                            '".$screen->getName()."',
                            ".$screen->getWidth().",
                            ".$screen->getHeight().",
                            '".$screen->getColor()."')";
            $stmt1 = sqlsrv_query( $conn, $query);
            if($stmt1) {
                sqlsrv_commit($conn);
                $result = 0;
                $idNewScreen = $this->getScreenPrintableByMac($screen->getMac())->getId();
            }
            else{
                sqlsrv_rollback($conn);
            }
            // Free statement and connection resources. 
            sqlsrv_free_stmt( $stmt1);
        }
        else {
            $result = 1;
            $idNewScreen = $existingScreen->getId();
        }

        $query = "INSERT INTO userscreens (idUser, idScreen) VALUES ('".intval($idUser)."','".intval($idNewScreen)."')";
        $stmt2 = sqlsrv_query( $conn, $query);
        if($stmt2) {
            sqlsrv_commit($conn);
        }
        else{
            $result = -1;
            sqlsrv_rollback($conn);
        }
        // Free statement and connection resources. 
        sqlsrv_free_stmt( $stmt2);

        return $result;
    }

    public function getScreens($idUser) {
        $conn = DatabaseConnSingleton::getConn();

        $screenList = array();
        $query = "SELECT screens.* FROM screens JOIN userscreens ON screens.id = userscreens.idScreen WHERE userscreens.idUser = ".$idUser;
        
        $getScreens = sqlsrv_query($conn, $query);
        if ($getScreens == FALSE) {
            return $screenList;
            //die(FormatErrors(sqlsrv_errors()));
        }

        while ($row = sqlsrv_fetch_array($getScreens, SQLSRV_FETCH_ASSOC)) {
            array_push($screenList, new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['latitude'],$row['longitude'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']));
        }
        sqlsrv_free_stmt($getScreens);
        sqlsrv_close($conn);

        return $screenList;
    }

    public function checkUserIdScreen($idUser,$idScreen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "SELECT screens.id FROM screens JOIN userscreens ON screens.id = userscreens.idScreen WHERE userscreens.idUser = ".$idUser;

        $getScreensId = sqlsrv_query($conn, $query);
        if ($getScreensId == FALSE) {
            return false;
            //die(FormatErrors(sqlsrv_errors()));
        }

        $found = false;
        while ($row = sqlsrv_fetch_array($getScreensId, SQLSRV_FETCH_ASSOC)) {
            $found = $row['id'] == $idScreen;
            if ($found)
                break;
        }
        sqlsrv_free_stmt($getScreensId);
        sqlsrv_close($conn);

        return $found;
    }

    public function updateScreenOptions($screen) {
        try {
            $conn = DatabaseConnSingleton::getConn();

            $query = "UPDATE screens SET name = '".$screen->getName()."',MAC = '".$screen->getMac()."',width = '".$screen->getWidth()."',height = '".$screen->getHeight()."',color = '".$screen->getColor()."' WHERE id = '".$screen->getId()."'";
            
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn);
                sqlsrv_free_stmt( $stmt);
                return true;
            }
            else{
                sqlsrv_rollback($conn);
                sqlsrv_free_stmt( $stmt);
                return false;
            }
        } catch (Exception $e){
            
        }
    }

    public function updateScreenCoords($screen) {
        try {
            $conn = DatabaseConnSingleton::getConn();

            $query = "UPDATE screens SET latitude = '".$screen->getLatitude()."',longitude = '".$screen->getLongitude()."' WHERE id = '".$screen->getId()."'";
            
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn);
                sqlsrv_free_stmt( $stmt);
                return true;
            }
            else{
                sqlsrv_rollback($conn);
                sqlsrv_free_stmt( $stmt);
                return false;
            }
        } catch (Exception $e){
            
        }
    }

    public function setScreenImage($numScreen,$imageBase64,$imageHex,$imageRed,$imageGreen,$imageBlue) {
        try {
            $conn = DatabaseConnSingleton::getConn();

            $query = "UPDATE screens SET imageBase64 = '".$imageBase64."',imageHex = '".$imageHex."',imageRed = '".$imageRed."',imageGreen = '".$imageGreen."',imageBlue = '".$imageBlue."' WHERE id = '".$numScreen."'";
            echo $query;
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn);
            }
            else{
                sqlsrv_rollback($conn);
            }
            /* Free statement and connection resources. */
            sqlsrv_free_stmt( $stmt);

        } catch (Exception $e){
            
        }
    }

    public function setLastUpdateDateByMac($mac) {
        try {
            $conn = DatabaseConnSingleton::getConn();

            $query = "UPDATE screens SET lastUpdate = now() WHERE MAC = '".$mac."'";
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn); 
                sqlsrv_free_stmt( $stmt);
                return true;
            }
            else{
                sqlsrv_rollback($conn); 
                sqlsrv_free_stmt( $stmt);
                return false;
            }

        } catch (Exception $e){
            
        }
    }

    public function deleteScreen($numScreen) {
        try {
            $conn = DatabaseConnSingleton::getConn();
            $result = false;

            $query = "DELETE FROM userscreens WHERE idScreen = '".$numScreen."'";
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn); 
                $result = true;
            }
            else{
                sqlsrv_rollback($conn); 
                $result = false;
            }
            sqlsrv_free_stmt( $stmt);

            $query = "DELETE FROM screens WHERE id = '".$numScreen."'";
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn); 
                $result = true;
            }
            else{
                sqlsrv_rollback($conn); 
                $result = false;
            }
            sqlsrv_free_stmt( $stmt);

            return $result;

        } catch (Exception $e){
            
        }
    }

    public function getScreenPrintableById($numScreen) {
        try
        {
            $conn = DatabaseConnSingleton::getConn();
            $screen = null;
    
            $query = "SELECT * FROM screens WHERE id = '".$numScreen."'";
            $getScreen = sqlsrv_query($conn, $query);
            if ($getScreen !== null && $getScreen !== false) {
                $row = sqlsrv_fetch_array($getScreen, SQLSRV_FETCH_ASSOC);
                if ($row !== null && $row !== false)
                    $screen = new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['latitude'],$row['longitude'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
            }
            
            sqlsrv_free_stmt($getScreen);
            sqlsrv_close($conn);

            return $screen;
        }
        catch(Exception $e) {
            //echo("Error!");
        }
    }
    
    public function getScreenPrintableByMac($macScreen) {
        try
        {
            $conn = DatabaseConnSingleton::getConn();

            $screen = null;
    
            $query = "SELECT * FROM screens WHERE MAC = '".$macScreen."'";
            $getScreen = sqlsrv_query($conn, $query);
            if ($getScreen !== null && $getScreen !== false) {
                $row = sqlsrv_fetch_array($getScreen, SQLSRV_FETCH_ASSOC);
                if ($row !== null && $row !== false)
                    $screen = new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['latitude'],$row['longitude'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
            }
            sqlsrv_free_stmt($getScreen);
            sqlsrv_close($conn);

            return $screen;
        }
        catch(Exception $e) {
            echo("Error!");
            return null;
        }
    }

    public function setScreenToUserByMac($mac,$idUser) {
        $conn = DatabaseConnSingleton::getConn();

        $screen = $this->getScreenPrintableByMac($mac);
        if($screen != null) {
            $query = "INSERT INTO userscreens (idUser, idScreen) VALUES ('".$idUser."', '".$screen->getId()."')";
            $stmt = sqlsrv_query( $conn, $query);
            if($stmt) {
                sqlsrv_commit($conn);
            }
            else{
                sqlsrv_rollback($conn);
            }
            // Free statement and connection resources. 
            sqlsrv_free_stmt( $stmt);

            return true;
        }

        return false;
    }

    /*MySQL*/
    /*

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
                array_push($screenList, new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['latitude'],$row['longitude'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']));
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

    public function updateScreenCoords($screen) {
        $conn = DatabaseConnSingleton::getConn();

        $query = "UPDATE screens SET latitude = '".$screen->getLatitude()."',longitude = '".$screen->getLongitude()."' WHERE id = '".$screen->getId()."'";

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
                return new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['latitude'],$row['longitude'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
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
                return new Screen($row['id'],$row['MAC'],$row['name'],$row['width'],$row['height'],$row['color'],$row['latitude'],$row['longitude'],$row['lastUpdate'],$row['imageBase64'],$row['imageHex'],$row['imageRed'],$row['imageGreen'],$row['imageBlue']);
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
    */
}

class LoginScreenModule extends Model {

    /* SQL SERVER */
    public function checkLogin($username,$password) {
        try
        {
            $conn = DatabaseConnSingleton::getConn();

            $user = null;
    
            $query = "SELECT * FROM users WHERE username = '".$username."' AND password = '".$password."'";
            $getUser = sqlsrv_query($conn, $query);
            if ($getUser !== null && $getUser !== false) {
                $row = sqlsrv_fetch_array($getUser, SQLSRV_FETCH_ASSOC);
                if ($row !== null && $row !== false) 
                    $user = new User($row['id'],$row['username'],$row['password']);
            }
            sqlsrv_free_stmt($getUser);
            sqlsrv_close($conn);

            return $user;
        }
        catch(Exception $e){
            //echo("Error!");
        }
    }

    /*MySQL*/
    /*
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
    }*/
}

?>
