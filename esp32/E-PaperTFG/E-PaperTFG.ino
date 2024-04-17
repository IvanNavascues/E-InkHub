// include library, include base class, make path known
#include <GxEPD.h>
#include <GxGDEM0213B74/GxGDEM0213B74.h>  // 2.13" b/w 128x250 SSD1680
//#include <GxGDEW0213Z16/GxGDEW0213Z16.h>  // 2.13" b/w/r
//#include <GxGDEH0213Z19/GxGDEH0213Z19.h>  // 2.13" b/w/r UC8151D

#include GxEPD_BitmapExamples

// FreeFonts from Adafruit_GFX
#include <Fonts/FreeMonoBold9pt7b.h>
#include <Fonts/FreeMonoBold12pt7b.h>
#include <Fonts/FreeMonoBold18pt7b.h>
#include <Fonts/FreeMonoBold24pt7b.h>

#include <GxIO/GxIO_SPI/GxIO_SPI.h>
#include <GxIO/GxIO.h>

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#include "base64.hpp"

#include "IMG_0001.h"

//Ports used
GxIO_Class io(SPI, SS, 22, 21); 
GxEPD_Class display(io, 16, 4); 

const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";

String HOST_NAME = ""; // change to your PC's IP address
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
        textPrinted = doc["message"].as<String>();
      }
      else if (printStatus == 1) {
        textPrinted = doc["image"].as<String>();
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

  if (printStatus == 0) 
    showMessage(textPrinted);
  
  else if (printStatus == 1) {

    const char *delimiter = ",";

    int str_len = textPrinted.length() + 1; 

    // Prepare the character array (the buffer) 
    char char_array[str_len];

    // Copy it over 
    textPrinted.toCharArray(char_array, str_len);

    showImage(gImage_pruebaPaint);
    
    /*char* token = strtok(char_array,delimiter);
    token = strtok(NULL,delimiter);

    unsigned char* binary;
    size_t decodedSize = decode_base64((unsigned char *)token,binary);
    //showImage(binary);
    Serial.printf("[%d, %d, %d, %d, %d, %d]\n",
       binary[0], binary[1], binary[2],
       binary[3], binary[4], binary[5]);*/
  }
  
  display.powerDown();
  
  //showImage();
  /*display.drawPixel(100,220, GxEPD_BLACK);
  display.update();*/
}

void loop()
{
  //showBitmapExample();
  //delay(2000);
  /*
  Serial.println("Mensaje a imprimir: ");
  while (!Serial.available()) {}
  String msg = Serial.readString();
  msg.trim();
  Serial.println(msg);
  showMessage(msg);
  */
  //drawCornerTest();
  //showFont("FreeMonoBold9pt7b", &FreeMonoBold9pt7b);
  //showFont("FreeMonoBold12pt7b", &FreeMonoBold12pt7b);
  //showFont("FreeMonoBold18pt7b", &FreeMonoBold18pt7b);
  //showFont("FreeMonoBold24pt7b", &FreeMonoBold24pt7b);
  
  //display.powerDown();
  //delay(10000);
}

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
}

void showImage(const uint8_t *bitmap) {
  Serial.println(display.width());
  Serial.println(display.height());
  uint16_t x = (display.width() - 250) / 2;
  uint16_t y = 0;
  display.fillScreen(GxEPD_WHITE);
  display.setRotation(3);
  display.setCursor(0, 0);
  display.drawBitmap(bitmap, 0, y, 250, 128, GxEPD_BLACK);
  //display.drawBitmap(bitmap, 1440, false);
  display.update();
  delay(500);
}

#if defined(_GxGDEW0213Z16_H_)
#define HAS_RED_COLOR
void showBitmapExample()
{
  display.drawPicture(BitmapWaveshare_black, BitmapWaveshare_red, sizeof(BitmapWaveshare_black), sizeof(BitmapWaveshare_red));
  delay(5000);
  display.drawExamplePicture(BitmapExample1, BitmapExample2, sizeof(BitmapExample1), sizeof(BitmapExample2));
  delay(5000);
#if !defined(__AVR)
  display.drawExamplePicture(BitmapExample3, BitmapExample4, sizeof(BitmapExample3), sizeof(BitmapExample4));
  delay(5000);
#endif
  display.drawExampleBitmap(BitmapWaveshare_black, sizeof(BitmapWaveshare_black));
  delay(2000);
  // example bitmaps for b/w/r are normal on b/w, but inverted on red
  display.drawExampleBitmap(BitmapExample1, sizeof(BitmapExample1));
  delay(2000);
  display.drawExampleBitmap(BitmapExample2, sizeof(BitmapExample2), GxEPD::bm_invert);
  delay(2000);
  display.drawExampleBitmap(BitmapExample1, 0, 0, GxEPD_WIDTH, GxEPD_HEIGHT, GxEPD_BLACK);
  display.update();
}
#endif

#if defined(_GxGDEH0213Z19_H_)
#define HAS_RED_COLOR
void showBitmapExample()
{
  display.drawExamplePicture(BitmapExample1_black, BitmapExample1_red, sizeof(BitmapExample1_black), sizeof(BitmapExample1_red));
  delay(5000);
#if !defined(__AVR)
  display.drawExamplePicture(BitmapExample2_black, BitmapExample2_red, sizeof(BitmapExample2_black), sizeof(BitmapExample2_red));
  delay(5000);
#endif
}
#endif

#if defined(_GxGDEM0213B74_H_)
void showBitmapExample()
{
  display.drawExampleBitmap(BitmapExample1, sizeof(BitmapExample1));
  delay(2000);
  display.drawExampleBitmap(BitmapExample2, sizeof(BitmapExample2));
  delay(5000);
#if !defined(__AVR)
  display.drawExampleBitmap(BitmapExample3, sizeof(BitmapExample3));
  delay(5000);
  display.drawExampleBitmap(logo, sizeof(logo));
  delay(5000);
  display.drawExampleBitmap(first, sizeof(first));
  delay(5000);
  display.drawExampleBitmap(second, sizeof(second));
  delay(5000);
  display.drawExampleBitmap(third, sizeof(third));
  delay(5000);
#endif
  display.fillScreen(GxEPD_WHITE);
  display.drawExampleBitmap(BitmapExample1, 0, 0, GxEPD_WIDTH, GxEPD_HEIGHT, GxEPD_BLACK);
  display.update();
  delay(5000);
  showBoat();
}
#endif


void drawCornerTest()
{
  display.drawCornerTest();
  delay(5000);
  uint8_t rotation = display.getRotation();
  for (uint16_t r = 0; r < 4; r++)
  {
    display.setRotation(r);
    display.fillScreen(GxEPD_WHITE);
    display.fillRect(0, 0, 8, 8, GxEPD_BLACK);
    display.fillRect(display.width() - 18, 0, 16, 16, GxEPD_BLACK);
    display.fillRect(display.width() - 25, display.height() - 25, 24, 24, GxEPD_BLACK);
    display.fillRect(0, display.height() - 33, 32, 32, GxEPD_BLACK);
    display.update();
    delay(5000);
  }
  display.setRotation(rotation); // restore
}


#include "IMG_0001.h"
void showBoat()
{
  // thanks to bytecrusher: http://forum.arduino.cc/index.php?topic=487007.msg3367378#msg3367378
  uint16_t x = (display.width() - 64) / 2;
  uint16_t y = 5;
  display.fillScreen(GxEPD_WHITE);
  display.drawExampleBitmap(gImage_IMG_0001, x, y, 64, 180, GxEPD_BLACK);
  display.update();
  delay(500);
  uint16_t forward = GxEPD::bm_invert | GxEPD::bm_flip_x;
  uint16_t reverse = GxEPD::bm_invert | GxEPD::bm_flip_x | GxEPD::bm_flip_y;
  for (; y + 180 + 5 <= display.height(); y += 5)
  {
    display.fillScreen(GxEPD_WHITE);
    display.drawExampleBitmap(gImage_IMG_0001, x, y, 64, 180, GxEPD_BLACK, forward);
    display.updateWindow(0, 0, display.width(), display.height());
    delay(500);
  }
  delay(1000);
  for (; y >= 5; y -= 5)
  {
    display.fillScreen(GxEPD_WHITE);
    display.drawExampleBitmap(gImage_IMG_0001, x, y, 64, 180, GxEPD_BLACK, reverse);
    display.updateWindow(0, 0, display.width(), display.height());
    delay(1000);
  }
  display.update();
  delay(1000);
}
