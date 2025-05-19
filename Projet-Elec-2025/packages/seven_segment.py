from machine import Pin

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


class SevenSegmentDisplay:
    def __init__(self, segment_pins, display_select_pins, num_digits=3):
        self.segments_pins = [Pin(i, Pin.OUT) for i in segment_pins]
        self.display_select_pins = [Pin(i, Pin.OUT) for i in display_select_pins]
        self.num_digits = num_digits
        self.current_digit = 0
        self.digits = [0] * num_digits

    def display_segments(self, value):
        value = value & 0xFF
        for i in range(8):
            self.segments_pins[i].value((value >> i) & 1)

    def select_display(self, value):
        value = value & 0xFF
        for i in range(self.num_digits):
            self.display_select_pins[i].value((value >> i) & 1)

    def number_to_7segment(self, digit):
        return SEGMENT_MAP[digit]

    def write_displays(self, timer=None):
        self.select_display(0)
        self.display_segments(self.number_to_7segment(self.digits[self.current_digit]))
        self.select_display(1 << self.current_digit)
        self.current_digit += 1
        if self.current_digit == self.num_digits:
            self.current_digit = 0

    def number_to_digits(self, number):
        self.digits = [int(digit) for digit in str(number)]
        return self.digits
