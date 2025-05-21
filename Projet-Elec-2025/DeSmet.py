"""
7-Segment Display with ESP32
This code is designed to work with an ESP32 microcontroller and a 7-segment display.
It uses the machine module to control GPIO pins and a timer for periodic updates.
"""

import random
import time
import sys
from machine import Pin, Timer

CURRENT_DIGIT = 0
NUMBER_OF_DIGITS = 3
digits = [1, 2, 3]

# Define GPIO pins
segments_pins = [
    Pin(i, Pin.OUT) for i in [9, 8, 7, 6, 5, 4, 3, 10]
]  # GPIO 0 to 7 (wiring order)
display_select_pins = [Pin(i, Pin.OUT) for i in range(8, 13)]


def display_segments(value):
    """
    Write the value to the 7-segment display.
    Each bit of the value corresponds to a segment of the display.
    """
    global segments_pins
    # Ensure value is within 8-bit range
    value = value & 0xFF  # Mask to 8-bit
    # Write each bit to the corresponding pin
    for i in range(8):
        segments_pins[i].value((value >> i) & 1)


def select_display(value):
    """
    Select the display to be activated.
    Each bit of the value corresponds to a display.
    """
    global display_select_pins
    # Ensure value is within 8-bit range
    value = value & 0xFF  # Mask to 8-bit
    # Write each bit to the corresponding pin
    for i in range(NUMBER_OF_DIGITS):
        display_select_pins[i].value((value >> i) & 1)


SEGMENT_MAP = [
    0b0111111,
    0b0000110,
    0b1011011,
    0b1001111,
    0b1100110,
    0b1101101,
    0b1111101,
    0b0000111,
    0b1111111,
    0b1101111,
]


def number_to_7segment(digit):
    """
    Convert a digit to its corresponding 7-segment display value.
    The digit is expected to be between 0 and 9.
    """
    global SEGMENT_MAP
    return SEGMENT_MAP[digit]  # Reverse the bits for correct display


def write_displays(timer):
    """
    Write the current digit to the display and cycle through the digits.
    This function is called periodically by the timer.
    """
    global CURRENT_DIGIT, digits

    select_display(0)
    display_segments(number_to_7segment(digits[CURRENT_DIGIT]))
    select_display(1 << CURRENT_DIGIT)
    CURRENT_DIGIT += 1
    if CURRENT_DIGIT == NUMBER_OF_DIGITS:
        CURRENT_DIGIT = 0


timer1 = Timer()
timer1.init(freq=500, mode=Timer.PERIODIC, callback=write_displays)


def number_to_digits(number):
    """
    Convert a number to an array of its digits."""
    # Convert number to string, extract digits and convert back to integers
    digits = [int(digit) for digit in str(number)]
    # Return the array of digits (as integers)
    return digits


while 1:
    try:
        time.sleep(4)
        random_num = random.randrange(
            10 ** (NUMBER_OF_DIGITS - 1), 10**NUMBER_OF_DIGITS
        )
        print(random_num)
        digits = number_to_digits(random_num)
    except KeyboardInterrupt:
        print("Goodbye")
        stop_timer = True
        time.sleep(0.01)
        timer1.deinit()
        sys.exit()
