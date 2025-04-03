from machine import Pin, Timer
import random
import time, sys

current_digit = 0
NUMBER_OF_DIGITS = 3
digits = [0, 1, 2]

# Variable globale pour stocker les chiffres pré-générés
pre_generated_digits = []

# Pins for binary output to the decoder (3, 4, 5, 6)
binary_pins = [3, 4, 5, 6]
binary_output_pins = [Pin(i, Pin.OUT) for i in binary_pins]

# Pins for display selection (transistors)
display_select_pins = [Pin(i, Pin.OUT) for i in range(0, 3)]  # GPIO 0, 1, 2

# bouton pour lancer l'affichage


def send_binary_to_decoder(value):
    """
    Send a binary representation of the value (0-9) to the decoder via pins 3, 4, 5, 6.
    """
    global binary_output_pins
    # Ensure value is within 4-bit range (0-15)
    value = value & 0xF  # Mask to 4-bit
    # Write each bit to the corresponding pin
    for i in range(4):
        binary_output_pins[i].value((value >> i) & 1)


def select_display(value):
    """
    Activate the appropriate display by setting the corresponding transistor pins.
    """
    global display_select_pins
    # Ensure value is within 3-bit range
    value = value & 0x7  # Mask to 3-bit
    # Write each bit to the corresponding pin
    for i in range(NUMBER_OF_DIGITS):
        display_select_pins[i].value((value >> i) & 1)


def write_displays(timer):
    """
    Update the displays by sending the current digit to the decoder and activating the corresponding display.
    """
    global current_digit, pre_generated_digits

    # Disable all displays first
    select_display(0)
    # Send the current digit to the decoder
    send_binary_to_decoder(pre_generated_digits[current_digit])
    # Enable the current display
    select_display(1 << current_digit)
    # Move to the next digit
    current_digit += 1
    if current_digit == NUMBER_OF_DIGITS:
        current_digit = 0


def number_to_digits(number):
    """
    Convert a number to an array of its digits.
    """
    # Convert number to string, extract digits and convert back to integers
    digits = [int(digit) for digit in str(number)]
    # Return the array of digits (as integers)
    return digits


def generate_digits():
    """
    Generate a new set of random digits for the displays.
    """
    global pre_generated_digits
    pre_generated_digits = [random.randint(0, 9) for _ in range(NUMBER_OF_DIGITS)]


# Initialisation du timer
timer1 = Timer()
timer1.init(freq=500, mode=Timer.PERIODIC, callback=write_displays)

# Boucle principale
while 1:
    try:
        time.sleep(4)
        # Générer de nouveaux chiffres pour les afficheurs
        generate_digits()
        print("Nouveaux chiffres générés :", pre_generated_digits)
    except KeyboardInterrupt:
        print("Goodbye")
        # Stop the timer and exit the program
        timer1.deinit()
        sys.exit()
