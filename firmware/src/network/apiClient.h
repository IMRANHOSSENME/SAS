#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

struct DeviceTask {
    bool pending;
    String action; // ENROLL, DELETE
    String userId;
    String sensorType;
    int fingerprintId; // for DELETE action
};

class ApiClient {
private:
    static String getMacAddress();
    static String getDeviceSecret();
    static String apiUrl;

public:
    static void init(String url);
    static bool sendHeartbeat(bool fingerprintActive, DeviceTask& task);
    static bool sendEnrollmentResult(String userId, int fingerprintId, String sensorType);
    static void sendEnrollmentStatus(String status, String message);
    static String sendAttendanceScan(int fingerprintId);
    static bool sendSyncResult(int* ids, int count);
};

#endif // API_CLIENT_H
