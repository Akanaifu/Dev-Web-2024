from machine import Pin, Timer, I2C, ADC
from pico_i2c_lcd import I2cLcd  # Assurez-vous d'avoir installé cette bibliothèque

Pin(28, Pin.OUT).value(1)  # allumer décodeur
pin_transistor = [19, 20, 21]  # GPIO 19, 20, 21 pour les transistors
