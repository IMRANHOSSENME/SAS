#ifndef NETWORK_SETUP_H
#define NETWORK_SETUP_H

#include <Arduino.h>

class NetworkSetup {
public:
    static void setupWiFi();
    static void resetSettings();
};

#endif // NETWORK_SETUP_H
