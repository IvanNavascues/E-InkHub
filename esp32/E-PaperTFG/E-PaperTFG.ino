// include library, include base class, make path known
#include <GxEPD.h>
#include <GxGDEM0213B74/GxGDEM0213B74.h>  // 2.13" b/w 128x250 SSD1680
//#include <GxGDEW0213Z16/GxGDEW0213Z16.h>  // 2.13" b/w/r
//#include <GxGDEH0213Z19/GxGDEH0213Z19.h>  // 2.13" b/w/r UC8151D

#include GxEPD_BitmapExamples

#include <GxIO/GxIO_SPI/GxIO_SPI.h>
#include <GxIO/GxIO.h>

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#include "base64.hpp"

#include <iostream>
#include <string>

//Ports used
GxIO_Class io(SPI, SS, 22, 21); 
GxEPD_Class display(io, 16, 4); 

const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";

String HOST_NAME = "http://192."; // change to your PC's IP address
String PATH_NAME   = "/InkScreen/screenController.php";
String queryString = "?numScreen=1";

void setup()
{
  Serial.begin(115200);
  String textPrinted = "";
  int printStatus = NULL;
  //Init display
  Serial.println();
  Serial.println("setup");

  display.init(115200); // enable diagnostic output on Serial

  Serial.println("setup done");

  display.fillScreen(GxEPD_WHITE);

  //Init WiFi connection
  Serial.print("Conectando a WiFi...");
  WiFi.begin(WIFI_SSID,WIFI_PASSWORD);
  while(WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Conectado con ip: "+WiFi.localIP());

  HTTPClient http;

  http.useHTTP10(true);
  http.begin(HOST_NAME + PATH_NAME + queryString); //HTTP
  int httpCode = http.GET();

  // httpCode will be negative on error
  if(httpCode > 0) {
    // file found at server
    if(httpCode == HTTP_CODE_OK) {
      DynamicJsonDocument doc(2048);
      deserializeJson(doc,http.getStream());
      //textPrinted = http.getString();

      //Serial.print (typeid(doc["image"]).name()); 
      printStatus = doc["status"].as<int>();

      if (printStatus == 0) {
        textPrinted = doc["imageHex"].as<String>();
      }
      else 
        textPrinted = doc["error"].as<String>();

      //Serial.println(textPrinted);
    } else {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] GET... code: %d\n", httpCode);
    }
  } else {
    Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  
  //Init display
  Serial.println();
  Serial.println("setup");

  display.init(115200); // enable diagnostic output on Serial

  Serial.println("setup done");

  display.fillScreen(GxEPD_WHITE);

  textPrinted.trim();

  
  if (printStatus == 0) {
    //std::string hexString = "0x7F";
    // Convertir el string hexadecimal a uint8_t
    //uint8_t hexValue = std::stoi(hexString, nullptr, 16);
    const char *newText = textPrinted.c_str();
    uint8_t imageHex[4096];
    int j = 0;
    for (int i = 0; i < strlen(newText); i=i+2){
        String hexString = "0x";
        hexString.concat(newText[i]);
        hexString.concat(newText[i+1]);
        uint8_t hexValue = std::stoi(hexString.c_str(), nullptr, 16);
        if (i < 32)
          Serial.println(hexValue,BIN);
        imageHex[j] = hexValue;
        j++;
    }
    //const uint8_t imageHexPrintable = 
    showImage(imageHex);
  }
  
  display.powerDown();
}

void loop(){}

/*
void showMessage(String message){
  display.fillScreen(GxEPD_WHITE);
  display.setTextColor(GxEPD_BLACK);
  display.setFont(&FreeMonoBold9pt7b);
  display.setRotation(3);
  display.setCursor(0, 0);
  display.println();
  display.println(message);
  display.update();
  delay(5000);
}*/

void showImage(const uint8_t *bitmap) {
  uint16_t x = (display.width() - 250) / 2;
  uint16_t y = 0;
  display.fillScreen(GxEPD_WHITE);
  display.setRotation(3);
  display.setCursor(0, 0);
  display.drawBitmap(bitmap, 0, y, 250, 128, GxEPD_BLACK);
  //display.drawBitmap(bitmap, 4000);
  display.update();
  delay(500);
}
