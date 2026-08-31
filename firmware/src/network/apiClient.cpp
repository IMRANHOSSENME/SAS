#include "ApiClient.h"
#include <ArduinoJson.h>

String ApiClient::apiUrl = "";

void ApiClient::init(String url) {
    apiUrl = url;
    Serial.println("ApiClient initialized. URL: " + apiUrl);
    Serial.println("Device MAC (UID): " + getMacAddress());
}

String ApiClient::getMacAddress() {
    return WiFi.macAddress();
}

String ApiClient::getDeviceSecret() {
    return "secret123";
}

bool ApiClient::sendHeartbeat(bool fingerprintActive, DeviceTask& task) {
    task.pending = false;
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Cannot send heartbeat: WiFi disconnected.");
        return false;
    }

    WiFiClient client;
    HTTPClient http;
    
    String endpoint = apiUrl + "/devices/heartbeat";
    http.begin(client, endpoint);
    
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", getDeviceSecret());
    
    long uptime = millis() / 1000;
    long rssi = WiFi.RSSI();
    
    String payload = "{";
    payload += "\"status\":\"ACTIVE\",";
    payload += "\"uptime\":" + String(uptime) + ",";
    payload += "\"wifiRssi\":" + String(rssi) + ",";
    payload += "\"firmwareVersion\":\"v0.2.0\",";
    payload += "\"activeSensors\":[";
    if (fingerprintActive) {
        payload += "\"FINGERPRINT\"";
    }
    payload += "]";
    payload += "}";
    
    int httpResponseCode = http.POST(payload);
    
    bool success = false;
    if (httpResponseCode > 0) {
        if (httpResponseCode == 200 || httpResponseCode == 201) {
            Serial.println("Heartbeat sent successfully.");
            String response = http.getString();
            
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, response);
            if (!error) {
                if (doc["deviceTask"]) {
                    task.pending = true;
                    task.action = doc["deviceTask"]["action"].as<String>();
                    if (task.action == "ENROLL") {
                        task.sensorType = doc["deviceTask"]["sensorType"].as<String>();
                        task.userId = doc["deviceTask"]["userId"].as<String>();
                        Serial.println("Received ENROLL Task for User: " + task.userId);
                    } else if (task.action == "DELETE") {
                        task.fingerprintId = doc["deviceTask"]["fingerprintId"].as<int>();
                        Serial.println("Received DELETE Task for Fingerprint ID: " + String(task.fingerprintId));
                    }
                }
            }
            
            success = true;
        } else {
            Serial.print("Heartbeat failed, code: ");
            Serial.println(httpResponseCode);
            String response = http.getString();
            Serial.println(response);
        }
    } else {
        Serial.print("Error sending heartbeat: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
    return success;
}

bool ApiClient::sendEnrollmentResult(String userId, int fingerprintId, String sensorType) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Cannot send enrollment result: WiFi disconnected.");
        return false;
    }

    WiFiClient client;
    HTTPClient http;

    String endpoint = apiUrl + "/devices/enroll-result";
    http.begin(client, endpoint);

    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", getDeviceSecret());

    String payload = "{";
    payload += "\"userId\":\"" + userId + "\",";
    payload += "\"fingerprintId\":" + String(fingerprintId) + ",";
    payload += "\"sensorType\":\"" + sensorType + "\"";
    payload += "}";

    Serial.println("Sending enrollment result: " + payload);
    int httpResponseCode = http.POST(payload);

    bool success = false;
    if (httpResponseCode == 200 || httpResponseCode == 201) {
        String response = http.getString();
        Serial.println("Enrollment result accepted by server: " + response);
        success = true;
    } else {
        Serial.print("Enrollment result rejected, code: ");
        Serial.println(httpResponseCode);
        Serial.println(http.getString());
    }

    http.end();
    return success;
}

void ApiClient::sendEnrollmentStatus(String status, String message) {
    if (WiFi.status() != WL_CONNECTED) return;

    WiFiClient client;
    HTTPClient http;

    String endpoint = apiUrl + "/devices/heartbeat";
    http.begin(client, endpoint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", getDeviceSecret());

    String payload = "{";
    payload += "\"enrollmentStatus\":{";
    payload += "\"status\":\"" + status + "\",";
    payload += "\"message\":\"" + message + "\"";
    payload += "}";
    payload += "}";

    http.POST(payload);
    http.end();
}

String ApiClient::sendAttendanceScan(int fingerprintId) {
    if (WiFi.status() != WL_CONNECTED) return "{\"success\":false,\"result\":\"WIFI_ERROR\"}";

    WiFiClient client;
    HTTPClient http;

    String endpoint = apiUrl + "/attendance/scan";
    http.begin(client, endpoint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", getDeviceSecret());

    JsonDocument doc;
    doc["deviceId"] = getMacAddress();
    doc["fingerprintId"] = fingerprintId;
    doc["eventId"] = String(millis());

    String payload;
    serializeJson(doc, payload);

    Serial.println("[API] Sending POST to " + endpoint);
    Serial.println("[API] Payload: " + payload);

    int httpResponseCode = http.POST(payload);
    String responseBody = "{\"success\":false,\"result\":\"HTTP_ERROR\"}";

    Serial.print("[API] HTTP Response Code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {
        responseBody = http.getString();
    } else {
        Serial.print("Error sending attendance scan: ");
        Serial.println(httpResponseCode);
    }

    http.end();
    return responseBody;
}

bool ApiClient::sendSyncResult(int* ids, int count) {
    if (WiFi.status() != WL_CONNECTED) {
        return false;
    }

    WiFiClient client;
    HTTPClient http;
    
    String endpoint = apiUrl + "/devices/sync";
    http.begin(client, endpoint);
    
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-uid", getMacAddress());
    http.addHeader("x-device-secret", getDeviceSecret());
    
    // Manual JSON construction to avoid huge memory allocs
    String payload = "{\"fingerprintIds\":[";
    for(int i = 0; i < count; i++) {
        payload += String(ids[i]);
        if (i < count - 1) payload += ",";
    }
    payload += "]}";
    
    int httpCode = http.POST(payload);
    bool success = (httpCode == 200 || httpCode == 201);
    
    http.end();
    return success;
}
