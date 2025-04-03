from machine import Pin
import utime


class LCD1602:
    def __init__(self, rs, e, d0, d1, d2, d3, d4, d5, d6, d7, rw=None):
        self.rs = rs
        self.e = e
        self.rw = rw
        self.data_pins = [d0, d1, d2, d3, d4, d5, d6, d7]
        self.init_display()

    def init_display(self):
        utime.sleep_ms(50)
        self.rs.value(0)
        self.write_cmd(0x38)  # 8-bit mode, 2 lines, 5x8 font
        self.write_cmd(0x0C)  # Display ON, cursor OFF
        self.write_cmd(0x06)  # Auto increment cursor
        self.write_cmd(0x01)  # Clear display
        utime.sleep_ms(2)

    def write_cmd(self, cmd):
        self.rs.value(0)
        self.write_byte(cmd)
        utime.sleep_ms(2)

    def write_data(self, data):
        self.rs.value(1)
        self.write_byte(data)
        utime.sleep_us(50)

    def write_byte(self, byte):
        for i in range(8):
            self.data_pins[i].value((byte >> i) & 1)
        self.pulse_enable()

    def pulse_enable(self):
        self.e.value(0)
        utime.sleep_us(1)
        self.e.value(1)
        utime.sleep_us(1)
        self.e.value(0)
        utime.sleep_us(100)

    def clear(self):
        self.write_cmd(0x01)
        utime.sleep_ms(2)

    def move_to(self, col, row):
        row_offsets = [0x00, 0x40]
        self.write_cmd(0x80 | (row_offsets[row] + col))

    def putstr(self, string):
        for char in string:
            self.write_data(ord(char))
