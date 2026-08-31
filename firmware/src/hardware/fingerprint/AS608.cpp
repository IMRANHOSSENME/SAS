#include "AS608.h"
#include "../lcd/LcdDisplay.h"
#include "../../network/ApiClient.h"

// Define Pins for SoftwareSerial
// ESP8266 RX (D5 / GPIO14) goes to Sensor TX (Green/White wire usually)
// ESP8266 TX (D6 / GPIO12) goes to Sensor RX (Yellow/Blue wire usually)
SoftwareSerial AS608::mySerial(14, 12); 
Adafruit_Fingerprint AS608::finger(&mySerial);

bool AS608::init() {
    Serial.println("\nInitializing Fingerprint Sensor...");
    
    finger.begin(57600);
    delay(50);
    
    if (finger.verifyPassword()) {
        Serial.println("Found fingerprint sensor!");
        finger.getParameters();
        Serial.print("Sensor capacity: "); Serial.println(finger.capacity);
        Serial.print("Templates stored: "); Serial.println(finger.templateCount);
        return true;
    } else {
        Serial.println("Did not find fingerprint sensor :(");
        return false;
    }
}

// Returns -1 if no finger or error, otherwise returns the ID of the matched finger
int AS608::getFingerprintID() {
    uint8_t p = finger.getImage();
    if (p != FINGERPRINT_OK)  return -1;

    p = finger.image2Tz();
    if (p != FINGERPRINT_OK)  return -1;

    p = finger.fingerSearch();
    if (p != FINGERPRINT_OK)  return -1;

    Serial.print("Found ID #"); Serial.print(finger.fingerID); 
    Serial.print(" with confidence of "); Serial.println(finger.confidence);
    
    return finger.fingerID;
}

int AS608::getTemplateCount() {
    finger.getTemplateCount();
    return finger.templateCount;
}

/**
 * Enroll a fingerprint into slot `id` on the sensor.
 * The process requires placing the finger TWICE.
 * Returns the slot ID on success, -1 on failure.
 */
int AS608::enrollFingerprint(int id) {
    Serial.println("Waiting for valid finger (scan 1)...");
    LcdDisplay::printMessage("Enroll Step 1", "Place Finger...");
    ApiClient::sendEnrollmentStatus("WAITING_FINGER_1", "Place your finger on the sensor");
    
    // --- SCAN 1 ---
    uint8_t p = -1;
    unsigned long startTime = millis();
    while (p != FINGERPRINT_OK) {
        if (millis() - startTime > 15000) {  // 15 second timeout
            Serial.println("Enrollment timeout on scan 1.");
            LcdDisplay::printMessage("Timeout!", "Try Again Later");
            return -1;
        }
        p = finger.getImage();
        if (p == FINGERPRINT_NOFINGER) {
            delay(100);
            continue;
        }
        if (p != FINGERPRINT_OK) {
            Serial.println("Image error (scan 1).");
            LcdDisplay::printMessage("Bad Scan!", "Try Again...");
            delay(1000);
            LcdDisplay::printMessage("Enroll Step 1", "Place Finger...");
            startTime = millis(); // Reset timeout after bad scan
        }
    }

    p = finger.image2Tz(1);
    if (p != FINGERPRINT_OK) {
        Serial.println("image2Tz failed (scan 1).");
        LcdDisplay::printMessage("Processing Err", "Try Again");
        return -1;
    }

    // --- CHECK FOR DUPLICATE FINGER ---
    // Search if this finger is already enrolled in the sensor
    p = finger.fingerSearch();
    if (p == FINGERPRINT_OK) {
        // Finger already exists!
        Serial.print("Duplicate finger detected! Already stored in slot #");
        Serial.println(finger.fingerID);
        LcdDisplay::printMessage("Duplicate!", "Already Enrolled");
        ApiClient::sendEnrollmentStatus("FAILED", "This fingerprint is already enrolled!");
        delay(3000);
        return -2; // Return -2 to indicate duplicate
    }
    // If not FINGERPRINT_OK (e.g. FINGERPRINT_NOTFOUND), we proceed normally.

    Serial.println("Scan 1 OK. Remove finger...");
    LcdDisplay::printMessage("Scan 1 OK!", "Remove Finger");
    ApiClient::sendEnrollmentStatus("FINGER_1_OK", "Scan 1 complete — remove your finger");
    delay(2000);
    
    // Wait until finger is removed
    while (finger.getImage() != FINGERPRINT_NOFINGER) { 
        LcdDisplay::printMessage("Please Remove", "Your Finger!");
        delay(500); 
    }

    // --- SCAN 2 ---
    Serial.println("Place same finger again (scan 2)...");
    LcdDisplay::printMessage("Enroll Step 2", "Place SAME Finger");
    ApiClient::sendEnrollmentStatus("WAITING_FINGER_2", "Place the SAME finger again for confirmation");
    p = -1;
    startTime = millis();
    while (p != FINGERPRINT_OK) {
        if (millis() - startTime > 15000) {
            Serial.println("Enrollment timeout on scan 2.");
            LcdDisplay::printMessage("Timeout!", "Try Again Later");
            return -1;
        }
        p = finger.getImage();
        if (p == FINGERPRINT_NOFINGER) {
            delay(100);
            continue;
        }
        if (p != FINGERPRINT_OK) {
            Serial.println("Image error (scan 2).");
            LcdDisplay::printMessage("Bad Scan!", "Try Again...");
            delay(1000);
            LcdDisplay::printMessage("Enroll Step 2", "Place SAME Finger");
            startTime = millis(); // Reset timeout
        }
    }

    p = finger.image2Tz(2);
    if (p != FINGERPRINT_OK) {
        Serial.println("image2Tz failed (scan 2).");
        LcdDisplay::printMessage("Processing Err", "Try Again");
        return -1;
    }

    // Create model from both scans
    LcdDisplay::printMessage("Processing...", "Creating Match");
    ApiClient::sendEnrollmentStatus("PROCESSING", "Creating fingerprint model...");
    p = finger.createModel();
    if (p == FINGERPRINT_ENROLLMISMATCH) {
        Serial.println("Fingers did not match! Try again.");
        LcdDisplay::printMessage("Mismatch Error!", "Not same finger");
        return -1;
    }
    if (p != FINGERPRINT_OK) {
        Serial.println("createModel failed.");
        LcdDisplay::printMessage("Model Error", "Try Again");
        return -1;
    }

    // Store model into sensor flash
    p = finger.storeModel(id);
    if (p != FINGERPRINT_OK) {
        Serial.println("storeModel failed.");
        LcdDisplay::printMessage("Save Error", "Memory Full?");
        return -1;
    }

    Serial.print("Fingerprint enrolled successfully in slot #");
    Serial.println(id);
    LcdDisplay::printMessage("Success!", "Finger Saved");
    delay(1000);
    return id;
}

bool AS608::deleteFingerprint(int id) {
    if (id < 1 || id > finger.capacity) {
        return false;
    }
    uint8_t p = finger.deleteModel(id);
    if (p == FINGERPRINT_OK) {
        Serial.print("Deleted fingerprint ID #");
        Serial.println(id);
        return true;
    } else {
        Serial.print("Failed to delete fingerprint ID #");
        Serial.println(id);
        return false;
    }
}

int AS608::getOccupiedIDs(int* buffer, int maxCount) {
    int count = 0;
    // Iterate through all possible IDs based on sensor capacity
    for (int id = 1; id <= finger.capacity; id++) {
        // Break if we reach the max capacity of the provided buffer
        if (count >= maxCount) {
            break;
        }
        
        // Load model from flash to char buffer 1
        uint8_t p = finger.loadModel(id);
        
        // If FINGERPRINT_OK, the ID has a template
        if (p == FINGERPRINT_OK) {
            buffer[count] = id;
            count++;
        }
    }
    return count;
}
