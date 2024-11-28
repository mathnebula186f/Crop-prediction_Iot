#include <WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHTesp.h"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define OLED_RESET -1    // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

char ssid[] = "Wokwi-GUEST";
char pass[] = "";

// MQTT broker settings
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* mqttTopic = "crop/nutrition/data";

WiFiClient espClient;
PubSubClient client(espClient);

const int DHT_PIN = 27;
DHTesp dhtSensor;

const int pHSensorPin = 32;
// Calibration parameters (you need to calibrate your sensor)
const float acidVoltage = 2032.44;  // voltage at pH 4.0
const float neutralVoltage = 1500.0; // voltage at pH 7.0

// Potentiometer is connected to GPIO 34 (Analog ADC1_CH6) 
const int potPin = 34;

// variable for storing the potentiometer value
int potValue = 0;

#define ncom 3 //  number of commands.
char commar[ncom] = {0x1, 0x3, 0x5}; // Actual commands
// Response Strings can be stored like this
char respar[ncom][30] = {"Phosphorous value is: ", "Potassium value is: ", "Nitrogen value is: "};
uint8_t rtValue[ncom]; // Store the return values from the custom chip in here. you can use the same
//values to forward to the IOT part.

void displayTitle();
void displayTeamMembers();
void displayAllSensorReadings(unsigned long duration);
void displayThankYou();
void sendData();

void connectToWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void connectToMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(1000);
    }
  }
}

void sendDataToMQTT(float temperature, float humidity, float pHValue, int moisture, int nitrogen, int phosphorus, int potassium) {
  String payload = "{";
  payload += "\"temperature\": " + String(temperature, 2) + ",";  // Add temperature
  payload += "\"humidity\": " + String(humidity, 2) + ",";          // Add humidity
  payload += "\"pHValue\": " + String(pHValue, 2) + ",";            // Add pH value
  payload += "\"moisture\": " + String(moisture) + ",";              // Add moisture
  payload += "\"nitrogen\": " + String(nitrogen) + ",";              // Add nitrogen
  payload += "\"phosphorus\": " + String(phosphorus) + ",";          // Add phosphorus
  payload += "\"potassium\": " + String(potassium);                   // Add potassium
  payload += "}";

  Serial.print("Publishing data: ");
  Serial.println(payload);

  // Publish data to the MQTT broker
  if (client.publish(mqttTopic, payload.c_str())) {
    Serial.println("Data published successfully");
  } else {
    Serial.println("Failed to publish data");
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(15200, SERIAL_8N1, 16, 17); // Initialize custom chip communication

  dhtSensor.setup(DHT_PIN, DHTesp::DHT22);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.display();

  connectToWiFi();

  client.setServer(mqttServer, mqttPort);

  displayTitle();
  delay(5000);
  displayTeamMembers();
  delay(5000);
}

void displayTitle() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println("CROP NUTRITION MONITORING IOT");
  display.println("System Using IoT");
  display.display();
}

void displayTeamMembers() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println("Team Members:");
  display.println("Harsh Raj Srivastava");
  display.println("Gopal Bansal");
  display.println("Sneha Saku");
  display.println("Ayush Raj");
  display.display();
}

void displayAllSensorReadings(unsigned long duration) {
  float h = dhtSensor.getHumidity();
  float t = dhtSensor.getTemperature();
  int potValue = analogRead(potPin);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println("All Sensor Readings:");
  display.print("Temperature: ");
  display.println(t, 2);
  display.print("Humidity: ");
  display.println(h, 2);
  display.print("Soil Moisture: ");
  display.println(potValue);
  display.display();
  delay(duration);
}

void displayThankYou() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 20);
  display.println("Thank you!");
  display.display();
}

void sendData() {
  float t = dhtSensor.getTemperature();
  float h = dhtSensor.getHumidity();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("%\t");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.println(" °C");

  int analogValue = analogRead(pHSensorPin);

  // Convert the analog value to voltage for pH sensor
  float voltage = analogValue * (3.3 / 4095.0); // 3.3V reference, 12-bit ADC

  // Convert the voltage to pH value and moisture
  float pHValue = (voltage * 14.0) / 3.3; // Calculate pH value
  potValue = analogRead(potPin);          // Read soil moisture

  // Print sensor values for debugging
  Serial.println("Moisture: " + String(potValue));
  Serial.print("pH Value: ");
  Serial.println(pHValue, 1);

  // Variables to store nutrient levels
  int nitrogen = 0, phosphorus = 0, potassium = 0;
  
  // Communicate with the custom chip to get nutrient levels
  for (uint8_t i = 0; i < ncom; i++) {
    Serial2.print((char)commar[i]);  // Send command through Serial2
  
    if (Serial2.available()) { // If response from Serial2 is available
      rtValue[i] = Serial2.read(); // Read the response
      Serial2.flush();             // Flush the Serial2 buffer
  
      Serial.print(respar[i]);     // Print the nutrient type (Nitrogen, Phosphorus, Potassium)
      Serial.println(rtValue[i]);  // Print the corresponding value
  
      // Assign the value to the corresponding variable
      if (strcmp(respar[i], "Nitrogen value is: ") == 0) {
        nitrogen = rtValue[i];
      } else if (strcmp(respar[i], "Phosphorous value is: ") == 0) {
        phosphorus = rtValue[i];
      } else if (strcmp(respar[i], "Potassium value is: ") == 0) {
        potassium = rtValue[i];
      }
    }
  }

  // Send all the collected data to MQTT
  sendDataToMQTT(t, h, pHValue, potValue, nitrogen, phosphorus, potassium);
}

void loop() {
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();
  sendData();
  delay(500);
}
