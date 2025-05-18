from machine import Pin, Timer
from time import sleep

SET_LED = [Pin(i, Pin.OUT) for i in range(18, 22)]

led_timer = None
led_active = 0


def _blink_led(timer):
    global SET_LED, led_active
    # Turn off all LEDs
    for led in SET_LED:
        led.value(0)
    # Turn on the current LED
    SET_LED[led_active].value(1)
    led_active = (led_active + 1) % len(SET_LED)


def start_led_blinking():
    global led_timer, led_active
    if led_timer is None:
        led_active = 0
        led_timer = Timer()
        led_timer.init(period=200, mode=Timer.PERIODIC, callback=_blink_led)


def stop_led_blinking():
    global led_timer
    if led_timer is not None:
        led_timer.deinit()
        led_timer = None
    eteindre_led()  # Turn off all LEDs


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
