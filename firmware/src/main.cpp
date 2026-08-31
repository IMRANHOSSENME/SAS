#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "config/deviceConfig.h"
#include "network/NetworkSetup.h"
#include "network/ApiClient.h"
#include "hardware/lcd/LcdDisplay.h"
#include "hardware/fingerprint/AS608.h"
#include <ArduinoJson.h>

// ─── Timing ───────────────────────────────────────────────────────────────────
unsigned long lastStatusUpdate = 0;
unsigned long lastHeartbeat    = 0;

// ─── State ────────────────────────────────────────────────────────────────────
bool isFingerprintActive = false;
int  lcdScrollState      = 0;  // 0: IP, 1: Ready, 2: FingerCount

// Current mode from server (updated on each heartbeat)
String currentMode      = "LISTENING";
String currentOperationId = "";

// ─── Forward declarations ─────────────────────────────────────────────────────
void handleAttendanceScan();
void handleEnrollment(String jobId);
void handleHeartbeat();
void updateLcdIdle();

// =============================================================================
// ENROLLMENT
// Called when heartbeat returns mode == "ENROLL" or "UPDATE"
// 1. Activates sensor for a single scan
// 2. Posts result to POST /biometric-jobs/:jobId/result
// 3. Server resets device mode back to LISTENING
// =============================================================================
void handleEnrollment(String jobId) {
    Serial.println("[Enrollment] Starting. JobId: " + jobId);
    LcdDisplay::printMessage("Place Finger", "Enrolling...");

    int slotId     = AS608::getTemplateCount() + 1;
    int enrolledId = AS608::enrollFingerprint(slotId);

    if (enrolledId == -2) {
        // Duplicate finger detected by sensor
        Serial.println("[Enrollment] Duplicate finger on sensor.");
        LcdDisplay::printMessage("Duplicate!", "Try Again");

        // Notify server — job will be marked FAILED
        ApiClient::sendJobResult(jobId, -1);  // -1 = failure signal (server checks success:false)
        // Actually send a proper failure:
        // The sendJobResult already handles the failure payload fallback via 400 response.
        // But we want to explicitly mark failure here:
        WiFiClient client;
        HTTPClient http;
        String endpoint = String(SMARTBIO_API_URL) + "/biometric-jobs/" + jobId + "/result";
        http.begin(client, endpoint);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-device-uid", WiFi.macAddress());
        http.addHeader("x-device-secret", DEVICE_SECRET);
        http.POST("{\"success\":false,\"error\":\"SENSOR_DUPLICATE\"}");
        http.end();

        delay(3000);
        lastStatusUpdate = 0;
        return;
    }

    if (enrolledId == -1) {
        // Enrollment process failed
        Serial.println("[Enrollment] Failed on sensor.");
        LcdDisplay::printMessage("Scan Failed!", "Try Again");

        WiFiClient client;
        HTTPClient http;
        String endpoint = String(SMARTBIO_API_URL) + "/biometric-jobs/" + jobId + "/result";
        http.begin(client, endpoint);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-device-uid", WiFi.macAddress());
        http.addHeader("x-device-secret", DEVICE_SECRET);
        http.POST("{\"success\":false,\"error\":\"SCAN_FAILED\"}");
        http.end();

        delay(3000);
        lastStatusUpdate = 0;
        return;
    }

    // ── Success: send to server ──────────────────────────────────────────────
    Serial.println("[Enrollment] Scan OK. Slot: " + String(enrolledId));
    LcdDisplay::printMessage("Sending...", "Please Wait");

    bool accepted = ApiClient::sendJobResult(jobId, enrolledId);

    if (accepted) {
        LcdDisplay::printMessage("Enrolled OK!", "ID: " + String(enrolledId));
        Serial.println("[Enrollment] Server accepted. Job complete.");
    } else {
        // Server rejected (duplicate in DB, etc.) — remove from sensor to stay in sync
        Serial.println("[Enrollment] Server rejected. Rolling back sensor.");
        AS608::deleteFingerprint(enrolledId);
        LcdDisplay::printMessage("Server Reject", "Rolled Back");
    }

    delay(3000);
    lastStatusUpdate = 0;

    // Mode will be reset by server to LISTENING after the job completes.
    // Next heartbeat will confirm mode = LISTENING.
    currentMode       = "LISTENING";
    currentOperationId = "";
}

// =============================================================================
// ATTENDANCE SCAN
// Called during normal LISTENING mode when a finger is detected.
// Server response: { success, status, student.name, course.name, markedAt }
// =============================================================================
void handleAttendanceScan() {
    int fingerID = AS608::getFingerprintID();
    if (fingerID == -1) return;  // No finger or no match

    LcdDisplay::printMessage("Processing...", "Please Wait");
    Serial.println("[Scan] Finger matched slot: " + String(fingerID));

    String responseStr = ApiClient::sendAttendanceScan(fingerID);
    Serial.println("[Scan] Response: " + responseStr);

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, responseStr);

    if (error) {
        Serial.println("[Scan] JSON parse error.");
        LcdDisplay::printMessage("Server Error", "Parse Failed");
    } else {
        bool   success = doc["success"] | false;
        String status  = doc["status"]  | "ERROR";

        if (success) {
            String studentName = doc["student"]["name"] | "Student";
            String courseName  = doc["course"]["name"]  | "";
            String markedAt    = doc["markedAt"]        | "";

            if (status == "PRESENT") {
                LcdDisplay::printMessage("Welcome!", studentName);
            } else if (status == "LATE") {
                LcdDisplay::printMessage("LATE Check-In", studentName);
            }
            Serial.println("[Scan] " + status + ": " + studentName + " @ " + markedAt);

        } else {
            if (status == "UNKNOWN_FINGER") {
                LcdDisplay::printMessage("Unknown Finger", "Not Registered");
            } else if (status == "ALREADY_MARKED") {
                LcdDisplay::printMessage("Already Marked", "Try Later");
            } else if (status == "NO_ACTIVE_SESSION") {
                LcdDisplay::printMessage("No Session", "Class not open");
            } else if (status == "TOO_EARLY") {
                LcdDisplay::printMessage("Too Early!", "Wait for class");
            } else if (status == "DEVICE_NOT_IN_LISTENING_MODE") {
                LcdDisplay::printMessage("Busy!", "Try Later");
            } else {
                LcdDisplay::printMessage("Scan Failed", status.substring(0, 16));
            }
            Serial.println("[Scan] Failed: " + status);
        }
    }

    delay(3000);
    lastStatusUpdate = 0;
}

// =============================================================================
// HEARTBEAT
// Sends telemetry every HEARTBEAT_INTERVAL_MS.
// Server may respond with pendingCommand to change mode.
// =============================================================================
void handleHeartbeat() {
    PendingCommand cmd = ApiClient::sendHeartbeat(isFingerprintActive);
    lastHeartbeat = millis();

    currentMode        = cmd.mode;
    currentOperationId = cmd.operationId;

    if (cmd.hasCommand) {
        Serial.println("[Heartbeat] Mode change: " + currentMode + " OpId: " + currentOperationId);
    }
}

// =============================================================================
// LCD IDLE SCROLL
// Cycles through 3 screens every 3 seconds when device is idle.
// =============================================================================
void updateLcdIdle() {
    unsigned long idle = millis() - lastStatusUpdate;

    if (idle > 3000 && idle <= 6000) {
        if (lcdScrollState != 0) {
            String modeStr = (currentMode == "LISTENING") ? "Listening..." : currentMode;
            LcdDisplay::printMessage("Place Finger", WiFi.localIP().toString());
            lcdScrollState = 0;
        }
    } else if (idle > 6000 && idle <= 9000) {
        if (lcdScrollState != 1) {
            String modeLabel = "Mode: " + currentMode;
            LcdDisplay::printMessage("System Ready", modeLabel.substring(0, 16));
            lcdScrollState = 1;
        }
    } else if (idle > 9000) {
        if (lcdScrollState != 2) {
            int count = AS608::getTemplateCount();
            LcdDisplay::printMessage("Fingers Saved:", String(count));
            lcdScrollState = 2;
        }
        if (idle > 12000) {
            lastStatusUpdate = millis();  // Reset cycle
        }
    }
}

// =============================================================================
// SETUP
// =============================================================================
void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n--- SmartBio v1.0.0 Device Initializing ---");

    LcdDisplay::init();
    delay(500);

    LcdDisplay::printMessage("SmartBio v1.0", "Connecting...");
    NetworkSetup::setupWiFi();

    LcdDisplay::printMessage("Fingerprint", "Initializing...");
    if (AS608::init()) {
        LcdDisplay::printMessage("Sensor Ready", "Listening...");
        isFingerprintActive = true;
    } else {
        LcdDisplay::printMessage("Sensor Error!", "Check Wiring");
        isFingerprintActive = false;
        delay(3000);
    }

    LcdDisplay::printMessage("WiFi OK", WiFi.localIP().toString());
    Serial.println("[Setup] Complete. IP: " + WiFi.localIP().toString());

    ApiClient::init(SMARTBIO_API_URL);

    lastStatusUpdate = millis();
    lastHeartbeat    = 0;  // Force immediate first heartbeat
}

// =============================================================================
// LOOP
// Priority:
//   1. Fingerprint scan (only in LISTENING mode)
//   2. Heartbeat (every HEARTBEAT_INTERVAL_MS)
//   3. If mode changed to ENROLL/UPDATE → run enrollment
//   4. LCD idle scroll
// =============================================================================
void loop() {

    // ── 1. Fingerprint scan — only in LISTENING mode ──────────────────────
    if (currentMode == "LISTENING" && isFingerprintActive) {
        handleAttendanceScan();
    }

    // ── 2. Heartbeat ──────────────────────────────────────────────────────
    if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL_MS) {
        handleHeartbeat();

        // ── 3. Act on mode change right after heartbeat ────────────────
        if (currentMode == "ENROLL" || currentMode == "UPDATE") {
            if (isFingerprintActive) {
                String modeLabel = currentMode + " mode";
                LcdDisplay::printMessage(modeLabel.c_str(), "Ready to scan");
                delay(1000);
                handleEnrollment(currentOperationId);
            } else {
                Serial.println("[Mode] Sensor inactive, cannot enroll.");
                LcdDisplay::printMessage("Sensor Error", "Cannot Enroll");
            }
        }
    }

    // ── 4. LCD idle scroll ─────────────────────────────────────────────────
    if (millis() - lastStatusUpdate > 3000) {
        updateLcdIdle();
    }

    delay(50);
}
