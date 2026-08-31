#include "ApiClient.h"
#include "../config/deviceConfig.h"
#include <ArduinoJson.h>

String ApiClient::apiUrl = "";

void ApiClient::init(String url) {
    apiUrl = url;
    Serial.println("[ApiClient] Initialized. Base URL: " + apiUrl);
    Serial.println("[ApiClient] Device MAC (UID): " + getMacAddress());
}

String ApiClient::getMacAddress() {
    return WiFi.macAddress();
}

// ─── Heartbeat ────────────────────────────────────────────────────────────────
// Sends device telemetry every HEARTBEAT_INTERVAL_MS.
// Server responds with pendingCommand to tell device what mode to operate in:
//   mode = "LISTENING" → normal scan mode (default)
//   mode = "ENROLL"    → enrollment mode, operationId = biometricJob ID
//   mode = "UPDATE"    → update fingerprint, operationId = biometricJob ID
PendingCommand ApiClient::sendHeartbeat(bool fingerprintActive) {
    PendingCommand result;
    result.hasCommand = false;
    result.mode = "LISTENING";
    result.operationId = "";

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[Heartbeat] WiFi disconnected, skipping.");
        return result;
    }

    WiFiClient client;
    HTTPClient http;

    String endpoint = apiUrl + "/devices/heartbeat";
    http.begin(client, endpoint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", DEVICE_SECRET);

    long uptime = millis() / 1000;
    long rssi   = WiFi.RSSI();

    // Build JSON payload
    String payload = "{";
    payload += "\"uptime\":"          + String(uptime) + ",";
    payload += "\"wifiRssi\":"        + String(rssi)   + ",";
    payload += "\"firmwareVersion\":\"" FIRMWARE_VERSION "\",";
    payload += "\"activeSensors\":[";
    if (fingerprintActive) payload += "\"FINGERPRINT\"";
    payload += "]}";

    int code = http.POST(payload);

    if (code == 200 || code == 201) {
        String body = http.getString();
        Serial.println("[Heartbeat] OK. Response: " + body);

        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, body);
        if (!err && doc["pendingCommand"]) {
            String mode = doc["pendingCommand"]["mode"].as<String>();
            result.mode       = mode;
            result.operationId = doc["pendingCommand"]["operationId"] | "";
            result.hasCommand  = (mode != "LISTENING");

            if (result.hasCommand) {
                Serial.println("[Heartbeat] PendingCommand: mode=" + mode + " opId=" + result.operationId);
            }
        }
    } else {
        Serial.printf("[Heartbeat] Failed, HTTP %d\n", code);
    }

    http.end();
    return result;
}

// ─── Biometric Job Result ─────────────────────────────────────────────────────
// After the R307 sensor scans a finger during ENROLL/UPDATE mode,
// post the result to the BiometricJobs endpoint.
// Server will create/update the Biometric record and reset device to LISTENING.
bool ApiClient::sendJobResult(String jobId, int fingerprintId) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[JobResult] WiFi disconnected.");
        return false;
    }

    WiFiClient client;
    HTTPClient http;

    // POST /api/v1/biometric-jobs/:id/result
    String endpoint = apiUrl + "/biometric-jobs/" + jobId + "/result";
    http.begin(client, endpoint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", DEVICE_SECRET);

    String payload = "{";
    payload += "\"success\":true,";
    payload += "\"fingerprintId\":" + String(fingerprintId);
    payload += "}";

    Serial.println("[JobResult] POST → " + endpoint);
    Serial.println("[JobResult] Payload: " + payload);

    int code = http.POST(payload);
    bool ok  = (code == 200 || code == 201);

    if (ok) {
        Serial.println("[JobResult] Accepted by server. Job complete.");
    } else {
        String body = http.getString();
        Serial.printf("[JobResult] Rejected. HTTP %d: %s\n", code, body.c_str());

        // If server returns FINGERPRINT_DUPLICATE etc, report failure too
        // so server marks the job as FAILED
        if (code == 400 || code == 409) {
            WiFiClient client2;
            HTTPClient http2;
            http2.begin(client2, endpoint);
            http2.addHeader("Content-Type", "application/json");
            http2.addHeader("x-device-uid", getMacAddress());
            http2.addHeader("x-device-secret", DEVICE_SECRET);

            String failPayload = "{\"success\":false,\"error\":\"DEVICE_DUPLICATE\"}";
            http2.POST(failPayload);
            http2.end();
        }
    }

    http.end();
    return ok;
}

// ─── Attendance Scan ──────────────────────────────────────────────────────────
// Send fingerprint scan during LISTENING mode.
// Returns raw JSON string — caller parses it.
//
// Server response format:
// { "success": true,  "status": "PRESENT",
//   "student": { "name": "Imran Hossen" },
//   "course":  { "name": "CSE-101" },
//   "markedAt": "09:05" }
//
// { "success": false, "status": "UNKNOWN_FINGER" }
// { "success": false, "status": "NO_ACTIVE_SESSION" }
// { "success": false, "status": "ALREADY_MARKED" }
// { "success": false, "status": "TOO_EARLY" }
String ApiClient::sendAttendanceScan(int fingerprintId) {
    if (WiFi.status() != WL_CONNECTED) {
        return "{\"success\":false,\"status\":\"WIFI_ERROR\"}";
    }

    WiFiClient client;
    HTTPClient http;

    String endpoint = apiUrl + "/attendance/scan";
    http.begin(client, endpoint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", DEVICE_SECRET);

    JsonDocument doc;
    doc["deviceId"]     = getMacAddress();
    doc["fingerprintId"] = fingerprintId;

    String payload;
    serializeJson(doc, payload);

    Serial.println("[Scan] POST → " + endpoint);
    Serial.println("[Scan] Payload: " + payload);

    int code = http.POST(payload);
    String body = "{\"success\":false,\"status\":\"HTTP_ERROR\"}";

    if (code > 0) {
        body = http.getString();
        Serial.println("[Scan] Response (" + String(code) + "): " + body);
    } else {
        Serial.printf("[Scan] Error: %d\n", code);
    }

    http.end();
    return body;
}
