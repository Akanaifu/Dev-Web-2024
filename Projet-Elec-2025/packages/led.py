from machine import Pin
from time import sleep

SET_LED = [Pin(i, Pin.OUT) for i in range(18, 22)]


def allumer_eteindre_led():
    """
    activate led one after one
    """
    global SET_LED
    cpt = 0
    led_active = 0
    SET_LED[led_active].value(1)
    sleep(1)
    while cpt < 10:
        SET_LED[led_active].value(0)
        led_active = (led_active + 1) % len(SET_LED)
        SET_LED[led_active].value(1)
        cpt += 1
        sleep(1)


def eteindre_led():
    """
    turn off all leds
    """
    global SET_LED
    for led in SET_LED:
        led.value(0)
