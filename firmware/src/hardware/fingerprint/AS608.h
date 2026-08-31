#ifndef AS608_H
#define AS608_H

#include <Arduino.h>
#include <Adafruit_Fingerprint.h>
#include <SoftwareSerial.h>

class AS608 {
private:
    static SoftwareSerial mySerial;
    static Adafruit_Fingerprint finger;

public:
    static bool init();
    static int getFingerprintID();
    static int enrollFingerprint(int id);  // Returns assigned fingerprint slot ID, or -1 on failure
    static bool deleteFingerprint(int id); // Deletes fingerprint template
    static int getTemplateCount();          // Returns number of stored templates
    static int getOccupiedIDs(int* buffer, int maxCount); // Fills buffer with occupied IDs, returns count
};

#endif // AS608_H
