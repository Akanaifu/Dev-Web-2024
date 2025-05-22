"""
7-Segment Display with ESP32
This code is designed to work with an ESP32 microcontroller and a 7-segment display.
It uses the machine module to control GPIO pins and a timer for periodic updates.
"""

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
        """
        Initialise l'afficheur 7 segments.

        Args:
            segment_pins (list): Liste des broches GPIO pour les segments.
            display_select_pins (list): Liste des broches GPIO pour la sélection des afficheurs.
            num_digits (int): Nombre de chiffres à afficher.
        """
        self.segments_pins = [Pin(i, Pin.OUT) for i in segment_pins]
        self.display_select_pins = [Pin(i, Pin.OUT) for i in display_select_pins]
        self.num_digits = num_digits
        self.current_digit = 0
        self.digits = [0] * num_digits

    def display_segments(self, value):
        """
        Affiche la valeur binaire sur les segments du 7 segments.

        Args:
            value (int): Valeur binaire à afficher (8 bits).
        """
        value = value & 0xFF
        for i in range(8):
            self.segments_pins[i].value((value >> i) & 1)

    def select_display(self, value):
        """
        Sélectionne l'afficheur à activer.

        Args:
            value (int): Valeur binaire pour sélectionner l'afficheur.
        """
        # Allume un seul afficheur (0), les autres à 1, jamais tous à 1
        for i in range(self.num_digits):
            if value & (1 << i):
                self.display_select_pins[i].value(0)
            else:
                self.display_select_pins[i].value(1)

    def number_to_7segment(self, digit):
        """
        Convertit un chiffre en sa représentation binaire pour le 7 segments.

        Args:
            digit (int): Chiffre à convertir (0-9).

        Returns:
            int: Valeur binaire pour le 7 segments.
        """
        return SEGMENT_MAP[digit]

    def write_displays(self, timer):
        """
        Affiche cycliquement chaque chiffre sur l'afficheur 7 segments.

        Args:
            timer: Objet Timer appelant cette fonction périodiquement.
        """
        # Désactive tous les afficheurs
        self.select_display(0)
        # Affiche le chiffre courant sur les segments
        self.display_segments(self.number_to_7segment(self.digits[self.current_digit]))
        # Active l'afficheur correspondant
        self.select_display(1 << self.current_digit)
        self.current_digit += 1
        if self.current_digit == self.num_digits:
            self.current_digit = 0

    def number_to_digits(self, number):
        """
        Convertit un nombre en une liste de chiffres, complétée à gauche si besoin.

        Args:
            number (int): Nombre à convertir.

        Returns:
            list: Liste des chiffres composant le nombre.
        """
        self.digits = [int(digit) for digit in str(number)]
        return self.digits
