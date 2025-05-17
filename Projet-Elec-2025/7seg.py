from machine import Pin, Timer


# Pins for display selection (transistors)
display_select_pins = [Pin(i, Pin.OUT) for i in range(0, 3)]  # GPIO 0, 1, 2

# Global variables
CURRENT_DIGIT = 0
NUMBER_OF_DIGITS = 3
digits = [1, 2, 3]

###################### Simulation du décodeur ######################
# GPIOs utilisés pour simuler le décodeur
decoder_pins = [Pin(i, Pin.OUT) for i in range(3, 10)]


def simulate_decoder(value):
    """
    Simule un décodeur en activant les GPIOs correspondants.
    """
    decoder_values = [
        [0, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 0],
        [1, 0, 1, 1, 0, 1, 1],
        [1, 0, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1, 0],
        [1, 1, 0, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 0, 1],
        [0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1],
    ][value][::-1]
    print(f"Simulating decoder for value {value}: {decoder_values}")
    # Write each bit to the corresponding pin
    for i, pin in enumerate(decoder_pins):
        pin.value(decoder_values[i])


def select_display(value):
    """
    Activate the appropriate display by setting the corresponding transistor pins.
    """
    global display_select_pins
    # Ensure value is within 3-bit range
    value = value & 0xFF  # Mask to 3-bit
    # Write each bit to the corresponding pin
    for i in range(NUMBER_OF_DIGITS):
        display_select_pins[i].value((value >> i) & 1)


def write_displays(timer):
    """
    Update the displays by sending the current digit to the decoder
    and activating the corresponding display.
    """
    global CURRENT_DIGIT, digits, NUMBER_OF_DIGITS

    # Disable all displays first
    select_display(0)
    # Send the current digit to the 7seg
    simulate_decoder(digits[CURRENT_DIGIT])

    # Enable the current display
    select_display(1 << CURRENT_DIGIT)
    # Move to the next digit
    CURRENT_DIGIT += 1
    if CURRENT_DIGIT == NUMBER_OF_DIGITS:
        CURRENT_DIGIT = 0


def number_to_digits(number):
    """
    Convert a number to an array of its digits.
    """
    # Convert number to string, extract digits and convert back to integers
    nb_str = [int(digit) for digit in str(number)]
    # Return the array of digits (as integers)
    return nb_str


if __name__ == "__main__":
    # for i in range(29):
    #     Pin(i, Pin.OUT).value(0)  # Set all GPIO pins to low
    # Initialize the timer to call write_displays every 0.01 seconds
    timer = Timer()
    timer.init(freq=90, mode=Timer.PERIODIC, callback=write_displays)
    print(decoder_pins)
    # Keep the program running
    try:
        while True:
            pass  # Main loop does nothing, just keeps the program alive
    except KeyboardInterrupt:
        # Stop the timer and clean up GPIO pins on exit
        timer.deinit()
        for gpio in decoder_pins + display_select_pins:
            gpio.value(0)  # Set all pins to low
        print("Program terminated. GPIO pins cleaned up.")
    except Exception as e:
        # Handle any other exceptions
        print(f"An error occurred: {e}")
        timer.deinit()
        for gpio in decoder_pins + display_select_pins:
            gpio.value(0)
