<?php

class DatabaseConnSingleton {
/* SQL SERVER */
/*
    private static $conn = null;
    
    public static function getConn(){
        try {
            self::$conn = new PDO("sqlsrv:server = tcp:einkhub.database.windows.net,1433; Database = epaper", "CloudSAbf8ff150", "N0m3c0br315.");
            self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        catch (PDOException $e) {
            print("Error connecting to SQL Server.");
            die(print_r($e));
        }

        // SQL Server Extension Sample Code:
        $connectionInfo = array("UID" => "CloudSAbf8ff150", "pwd" => "N0m3c0br315.", "Database" => "epaper", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
        $serverName = "tcp:einkhub.database.windows.net,1433";
        self::$conn = sqlsrv_connect($serverName, $connectionInfo);
        if (null === self:: $conn ){
            self::$conn = new sqlsrv_connect(self::$dbservername, self::$connectionInfo) or die("Connect failed: %s\n". self::$conn -> error);
            //echo 'created new DB connection';
        }else{
            //echo 'DB connection already existed';
        }
        return self::$conn;
    }
    public static function closeConn()
    {
        sqlsrv_close(self::$conn);
    }*/

    /*MySQL*/
    
    private static $dbhost = "localhost";
    private static $dbuser = "root";
    private static $dbpass = "";
    private static $db = "epaper";
    private static $conn = null;
    
    public static function getConn(){
        if (null === self:: $conn ){
            self::$conn = new mysqli(self::$dbhost, self::$dbuser, self::$dbpass, self::$db) or die("Connect failed: %s\n". self::$conn -> error);
            //echo 'created new DB connection';
        }else{
            //echo 'DB connection already existed';
        }
        return self::$conn;
    }
    public static function closeConn()
    {
        self::$conn->close();
    }
}
?>
