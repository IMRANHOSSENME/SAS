#ifndef LCD_DISPLAY_H
#define LCD_DISPLAY_H

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Arduino.h>

class LcdDisplay {
private:
    static LiquidCrystal_I2C lcd;

public:
    static void init();
    static void printMessage(String line1, String line2 = "");
    static void clear();
};

#endif // LCD_DISPLAY_H
