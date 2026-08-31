#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "network/NetworkSetup.h"
#include "network/ApiClient.h"
#include "hardware/lcd/LcdDisplay.h"
#include "hardware/fingerprint/AS608.h"
#include <ArduinoJson.h>

unsigned long lastStatusUpdate = 0;
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 10000; // 10 seconds (shorter = faster enrollment pickup)

bool isFingerprintActive = false;
int lcdScrollState = 0; // 0: IP, 1: Date/Ready, 2: Students Count

const String API_URL = "http://192.168.0.2:3000/api/v1";

// -----------------------------------------------
// Performs the full enrollment process:
// 1. Gets next available slot on sensor
// 2. Scans finger twice
// 3. Reports result to server
// -----------------------------------------------
void performEnrollment(DeviceTask& task) {
    // Get next available slot ID on the sensor
    int slotId = AS608::getTemplateCount() + 1;
    
    Serial.println("[Enrollment] Starting enrollment for user: " + task.userId);
    Serial.println("[Enrollment] Target slot: " + String(slotId));

    // --- LCD feedback: Scan 1 ---
    LcdDisplay::printMessage("Place Finger", "Scan 1...");

    int enrolledId = AS608::enrollFingerprint(slotId);

    if (enrolledId == -2) {
        Serial.println("[Enrollment] Failed: Duplicate finger.");
        // LCD and server status already sent by AS608.cpp
        delay(3000);
        lastStatusUpdate = 0;
        return;
    } else if (enrolledId == -1) {
        Serial.println("[Enrollment] Failed.");
        LcdDisplay::printMessage("Enroll Failed!", "Try Again");
        ApiClient::sendEnrollmentStatus("FAILED", "Enrollment failed on device.");
        delay(3000);
        lastStatusUpdate = 0;
        return;
    }

    // --- Success: send result to server ---
    LcdDisplay::printMessage("Sending Data...", "Please Wait");

    bool sent = ApiClient::sendEnrollmentResult(task.userId, enrolledId, task.sensorType);

    if (sent) {
        Serial.println("[Enrollment] Successfully reported to server.");
        LcdDisplay::printMessage("Enrolled OK!", "ID: " + String(enrolledId));
    } else {
        // Server rejected (maybe duplicate finger). Remove from sensor to keep in sync.
        Serial.println("[Enrollment] Server rejected result. Rolling back sensor storage.");
        // Note: Adafruit library uses deleteModel(id) to remove
        // finger.deleteModel(enrolledId); -- called via AS608 if needed
        LcdDisplay::printMessage("Server Error!", "Rolled Back");
    }

    delay(3000);
    lastStatusUpdate = 0;
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n--- SmartBio Device Initializing ---");

    LcdDisplay::init();
    delay(2000);

    LcdDisplay::printMessage("Connecting WiFi", "SmartBio_Setup");

    NetworkSetup::setupWiFi();
    
    LcdDisplay::printMessage("Fingerprint", "Initializing...");
    if (AS608::init()) {
        LcdDisplay::printMessage("Sensor Ready", "Waiting...");
        isFingerprintActive = true;
    } else {
        LcdDisplay::printMessage("Sensor Error!", "Check Wiring");
        isFingerprintActive = false;
        delay(3000);
    }
    
    LcdDisplay::printMessage("WiFi Connected!", WiFi.localIP().toString());
    Serial.println("System setup complete. Device is ready.");
    
    ApiClient::init(API_URL);
    
    lastStatusUpdate = millis();
}

void loop() {
    // --- Attendance: Read fingerprint in normal mode ---
    int fingerID = AS608::getFingerprintID();
    
    if (fingerID != -1) {
        LcdDisplay::printMessage("Processing...", "Please Wait");
        Serial.println("Finger matched: " + String(fingerID));
        
        // Send attendance request to API
        String responseStr = ApiClient::sendAttendanceScan(fingerID);
        
        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, responseStr);
        
        Serial.println("[API] Response: " + responseStr);
        
        if (error) {
            Serial.println("Failed to parse attendance response");
            LcdDisplay::printMessage("Server Error", "Parse Failed");
        } else {
            bool success = doc["success"];
            String result = doc["result"].as<String>();
            
            if (success) {
                String userName = doc["user"]["name"].as<String>();
                if (result == "CHECK_IN") {
                    LcdDisplay::printMessage("Welcome!", userName);
                } else if (result == "CHECK_OUT") {
                    LcdDisplay::printMessage("Goodbye!", userName);
                }
            } else {
                if (result == "NOT_FOUND") {
                    LcdDisplay::printMessage("Unknown Finger", "Not Registered");
                } else if (result == "DUPLICATE_SCAN" || result == "ALREADY_COMPLETED") {
                    LcdDisplay::printMessage("Already Scanned", "Try Later");
                } else {
                    LcdDisplay::printMessage("Scan Failed", result);
                }
            }
        }
        
        delay(3000);
        lastStatusUpdate = 0;
    }
    
    // Return to default status display after 3 seconds of inactivity
    if (millis() - lastStatusUpdate > 3000) {
        // Implement LCD Scrolling Message
        if (millis() - lastStatusUpdate > 3000 && millis() - lastStatusUpdate <= 6000) {
            if (lcdScrollState != 0) {
                LcdDisplay::printMessage("Place Finger...", WiFi.localIP().toString());
                lcdScrollState = 0;
            }
        } else if (millis() - lastStatusUpdate > 6000 && millis() - lastStatusUpdate <= 9000) {
            if (lcdScrollState != 1) {
                LcdDisplay::printMessage("System Ready", "Listening...");
                lcdScrollState = 1;
            }
        } else if (millis() - lastStatusUpdate > 9000) {
            if (lcdScrollState != 2) {
                int count = AS608::getTemplateCount();
                LcdDisplay::printMessage("Fingers Saved:", String(count));
                lcdScrollState = 2;
            }
            if (millis() - lastStatusUpdate > 12000) {
                lastStatusUpdate = millis(); // Reset cycle
            }
        }
    }
    
    // --- Heartbeat & Device Task Check ---
    if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL) {
        DeviceTask task;
        task.pending = false;
        ApiClient::sendHeartbeat(isFingerprintActive, task);
        lastHeartbeat = millis();
        
        if (task.pending) {
            if (task.action == "ENROLL") {
                if (task.sensorType == "FINGERPRINT" && isFingerprintActive) {
                    performEnrollment(task);
                } else if (task.sensorType == "RFID") {
                    LcdDisplay::printMessage("Scan RFID Card", "");
                    Serial.println("RFID enrollment not yet implemented.");
                    delay(3000);
                } else {
                    Serial.println("[Enrollment] Unknown sensor type or sensor not active: " + task.sensorType);
                }
            } else if (task.action == "DELETE") {
                if (isFingerprintActive) {
                    Serial.println("[Task] Deleting Fingerprint ID: " + String(task.fingerprintId));
                    LcdDisplay::printMessage("Deleting...", "ID: " + String(task.fingerprintId));
                    bool deleted = AS608::deleteFingerprint(task.fingerprintId);
                    if (deleted) {
                        LcdDisplay::printMessage("Deleted OK!", "ID: " + String(task.fingerprintId));
                    } else {
                        LcdDisplay::printMessage("Delete Failed", "Not Found");
                    }
                    delay(2000);
                    lastStatusUpdate = 0;
                }
            } else if (task.action == "SYNC") {
                if (isFingerprintActive) {
                    Serial.println("[Task] Syncing Sensor Database...");
                    LcdDisplay::printMessage("Syncing...", "Scanning Sensor");
                    
                    int buffer[1000];
                    int maxCount = 1000;
                    int occupiedCount = AS608::getOccupiedIDs(buffer, maxCount);
                    
                    Serial.println("[Sync] Found " + String(occupiedCount) + " fingerprints");
                    LcdDisplay::printMessage("Found: " + String(occupiedCount), "Sending to DB...");
                    
                    bool success = ApiClient::sendSyncResult(buffer, occupiedCount);
                    if (success) {
                        LcdDisplay::printMessage("Sync Complete", "");
                        Serial.println("[Sync] Successfully sent to server.");
                    } else {
                        LcdDisplay::printMessage("Sync Failed", "Server Error");
                        Serial.println("[Sync] Failed to send to server.");
                    }
                    delay(2000);
                    lastStatusUpdate = 0;
                }
            }
        }
    }
    
    delay(50);
}

