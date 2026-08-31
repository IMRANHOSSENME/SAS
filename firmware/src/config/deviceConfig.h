/**
 * SmartBio Device Configuration
 * Edit this file with your local settings before flashing.
 */

#ifndef DEVICE_CONFIG_H
#define DEVICE_CONFIG_H

// ─── API Server ────────────────────────────────────────────────────────────
// Your PC/server IP where the NestJS API is running
// Find your IP: ipconfig (Windows) or ifconfig (Linux/Mac)
#define SMARTBIO_API_URL "http://192.168.0.100:3000/api/v1"

// ─── Device Secret ─────────────────────────────────────────────────────────
// Must match what the server auto-registered or what you set in DB
// The ESP8266 MAC address is used as the deviceUid automatically
#define DEVICE_SECRET "secret123"

// ─── Firmware Version ──────────────────────────────────────────────────────
#define FIRMWARE_VERSION "v1.0.0"

// ─── Heartbeat Interval (milliseconds) ────────────────────────────────────
#define HEARTBEAT_INTERVAL_MS 10000  // 10 seconds

// ─── WiFi AP Setup (used by WiFiManager) ──────────────────────────────────
#define WIFI_AP_NAME      "SmartBio_Setup"
#define WIFI_AP_PASSWORD  "12345678"

#endif // DEVICE_CONFIG_H
