"""
7-Segment Display with ESP32
This code is designed to work with an ESP32 microcontroller and a 7-segment display.
It uses the machine module to control GPIO pins and a timer for periodic updates.
"""

from machine import ADC


def update_bet_amount(x_axis, y_axis, lcd, bet_amount, user_balance):
    """
    Update the bet amount based on joystick input.
    Adjusts the bet amount based on joystick position and ensures it stays within user balance.
    """
    x = x_axis.read_u16()
    y = y_axis.read_u16()
    x_neutral_min = 45000
    x_neutral_max = 48000
    y_neutral_min = 48000
    y_neutral_max = 50000
    threshold = 65535 / 4
    if x_neutral_min < x < x_neutral_max and y_neutral_min < y < y_neutral_max:
        pass
    if x > x_neutral_max + threshold:
        bet_amount += 10
    elif x < x_neutral_min - threshold:
        bet_amount -= 10
    if y > y_neutral_max + threshold * 0.5:
        bet_amount -= 50
    elif y < y_neutral_min - threshold:
        bet_amount += 50
    if bet_amount > user_balance:
        bet_amount = user_balance
    if bet_amount < 0:
        bet_amount = 0
    lcd.clear()
    lcd.putstr(f"Bet: {bet_amount} EUR")
    return bet_amount
