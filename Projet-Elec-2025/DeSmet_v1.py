from machine import Pin, Timer
import random
import time, sys

current_digit = 0
NUMBER_OF_DIGITS = 5
digits = [1, 2, 3, 4, 5]

# Define GPIO pins
segments_pins = [
    Pin(i, Pin.OUT) for i in [1, 0, 6, 5, 4, 2, 3, 7]
]  # GPIO 0 to 7 (wiring order)
display_select_pins = [Pin(i, Pin.OUT) for i in range(8, 13)]


def display_segments(value):
    global segments_pins
    # Ensure value is within 8-bit range
    value = value & 0xFF  # Mask to 8-bit
    # Write each bit to the corresponding pin
    for i in range(8):
        segments_pins[i].value((value >> i) & 1)


def select_display(value):
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
    global SEGMENT_MAP
    return SEGMENT_MAP[digit]


def write_displays(timer):
    global current_digit, digits

    select_display(0)
    display_segments(number_to_7segment(digits[current_digit]))
    select_display(1 << current_digit)
    current_digit += 1
    if current_digit == NUMBER_OF_DIGITS:
        current_digit = 0


timer1 = Timer()
timer1.init(freq=500, mode=Timer.PERIODIC, callback=write_displays)


def number_to_digits(number):
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
