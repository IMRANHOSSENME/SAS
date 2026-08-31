#include "LcdDisplay.h"

// Initialize LCD address to 0x27 for a 16 chars and 2 line display
// If nothing shows on display, you may need to change 0x27 to 0x3F
LiquidCrystal_I2C LcdDisplay::lcd(0x27, 16, 2); 

void LcdDisplay::init() {
    // Note: Standard ESP8266 I2C pins are SDA=D2 (GPIO4), SCL=D1 (GPIO5)
    Wire.begin(); 
    lcd.init();
    lcd.backlight();
    
    // Boot message
    printMessage("SmartBio System", "Initializing...");
    Serial.println("LCD Initialized.");
}

void LcdDisplay::printMessage(String line1, String line2) {
    lcd.clear();
    
    // Print first line
    lcd.setCursor(0, 0);
    lcd.print(line1);
    
    // Print second line if provided
    if (line2.length() > 0) {
        lcd.setCursor(0, 1);
        lcd.print(line2);
    }
}

void LcdDisplay::clear() {
    lcd.clear();
}
