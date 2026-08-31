#include "NetworkSetup.h"
#include <WiFiManager.h> 

void NetworkSetup::setupWiFi() {
    // WiFiManager provides a captive portal for WiFi configuration
    WiFiManager wm;
    
    // Uncomment if you want to reset settings for testing
    // wm.resetSettings();

    // Set custom IP for the access point (optional)
    // wm.setAPStaticIPConfig(IPAddress(192,168,4,1), IPAddress(192,168,4,1), IPAddress(255,255,255,0));

    Serial.println("Starting SmartBio AP. Connect to 'SmartBio_Setup' to configure WiFi.");
    
    // Automatically connect using saved credentials,
    // if connection fails, it starts an access point with the specified name
    // and goes into a blocking loop awaiting configuration.
    bool res = wm.autoConnect("SmartBio_Setup", "12345678"); // AP Name and Password
    
    if(!res) {
        Serial.println("Failed to connect or hit timeout");
        // ESP.restart();
    } 
    else {
        // if you get here you have connected to the WiFi    
        Serial.println("Connected to WiFi successfully!");
        Serial.print("Local IP: ");
        Serial.println(WiFi.localIP());
    }
}

void NetworkSetup::resetSettings() {
    WiFiManager wm;
    wm.resetSettings();
    Serial.println("WiFi settings erased. Please restart to reconfigure.");
}
