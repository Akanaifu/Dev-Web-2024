"""
Module de gestion des LEDs pour le projet électronique.
Fournit des fonctions pour faire clignoter, allumer et éteindre les LEDs
connectées aux broches 18 à 21.
"""

from time import sleep
from machine import Pin, Timer

SET_LED = [Pin(i, Pin.OUT) for i in range(18, 22)]

LED_TIMER = None
LED_ACTIVE = 0


def _blink_led(timer):
    """
    Fonction de callback pour le Timer : fait clignoter les LEDs une à une.
    """
    global SET_LED, LED_ACTIVE
    # Turn off all LEDs
    for led in SET_LED:
        led.value(0)
    # Turn on the current LED
    SET_LED[LED_ACTIVE].value(1)
    LED_ACTIVE = (LED_ACTIVE + 1) % len(SET_LED)


def start_led_blinking():
    """
    Démarre le clignotement cyclique des LEDs à l'aide d'un Timer.
    """
    global LED_TIMER, LED_ACTIVE
    if LED_TIMER is None:
        LED_ACTIVE = 0
        LED_TIMER = Timer()
        LED_TIMER.init(period=200, mode=Timer.PERIODIC, callback=_blink_led)


def stop_led_blinking():
    """
    Arrête le clignotement des LEDs et les éteint toutes.
    """
    global LED_TIMER
    if LED_TIMER is not None:
        LED_TIMER.deinit()
        LED_TIMER = None
    eteindre_led()  # Turn off all LEDs


def allumer_eteindre_led():
    """
    Active les LEDs une par une en boucle pendant 10 cycles, avec une pause
    d'une seconde entre chaque.
    """
    global SET_LED, LED_ACTIVE
    cpt = 0
    SET_LED[LED_ACTIVE].value(1)
    sleep(1)
    while cpt < 10:
        SET_LED[LED_ACTIVE].value(0)
        LED_ACTIVE = (LED_ACTIVE + 1) % len(SET_LED)
        SET_LED[LED_ACTIVE].value(1)
        cpt += 1
        sleep(1)


def eteindre_led():
    """
    Éteint toutes les LEDs.
    """
    global SET_LED
    for led in SET_LED:
        led.value(0)
