#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

/**
 * Represents the command received from the server via heartbeat.
 * mode: "LISTENING" = normal scan mode
 *       "ENROLL"    = enrollment mode, scan and post result
 *       "UPDATE"    = update fingerprint, scan and post result
 */
struct PendingCommand {
    bool hasCommand;
    String mode;         // LISTENING | ENROLL | UPDATE
    String operationId;  // BiometricJob ID (when mode == ENROLL or UPDATE)
};

class ApiClient {
private:
    static String getMacAddress();
    static String apiUrl;

public:
    static void init(String url);

    /**
     * Send periodic heartbeat to server.
     * Returns parsed pendingCommand so the device can change mode.
     */
    static PendingCommand sendHeartbeat(bool fingerprintActive);

    /**
     * Post fingerprint scan result for a BiometricJob.
     * Called after successful enrollment scan.
     * @param jobId   The operationId from pendingCommand
     * @param fingerprintId  The slot ID on the R307 sensor
     */
    static bool sendJobResult(String jobId, int fingerprintId);

    /**
     * Send attendance scan result to server.
     * Returns raw JSON response string.
     */
    static String sendAttendanceScan(int fingerprintId);
};

#endif // API_CLIENT_H
