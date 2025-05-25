from machine import Pin
import utime


class LCD1602:
    """
    Classe pour contrôler un écran LCD 1602 en mode 8 bits avec MicroPython.
    """

    def __init__(self, rs, e, d0, d1, d2, d3, d4, d5, d6, d7, rw=None):
        """
        Initialise l'écran LCD1602 avec les broches données.
        :param rs: Pin RS
        :param e: Pin E
        :param d0-d7: Pins de données D0 à D7
        :param rw: Pin RW (optionnelle)
        """
        self.rs = rs
        self.e = e
        self.rw = rw
        self.data_pins = [d0, d1, d2, d3, d4, d5, d6, d7]
        self.init_display()

    def init_display(self):
        """
        Initialise l'afficheur LCD (configuration, effacement, etc.).
        """
        utime.sleep_ms(50)
        self.rs.value(0)
        self.write_cmd(0x38)  # 8-bit mode, 2 lines, 5x8 font
        self.write_cmd(0x0C)  # Display ON, cursor OFF
        self.write_cmd(0x06)  # Auto increment cursor
        self.write_cmd(0x01)  # Clear display
        utime.sleep_ms(2)

    def write_cmd(self, cmd):
        """
        Envoie une commande à l'écran LCD.
        :param cmd: Commande à envoyer (entier)
        """
        self.rs.value(0)
        self.write_byte(cmd)
        utime.sleep_ms(2)

    def write_data(self, data):
        """
        Envoie une donnée (caractère) à l'écran LCD.
        :param data: Donnée à envoyer (entier)
        """
        self.rs.value(1)
        self.write_byte(data)
        utime.sleep_us(50)

    def write_byte(self, byte):
        """
        Envoie un octet sur les broches de données.
        :param byte: Octet à envoyer (entier)
        """
        for i in range(8):
            self.data_pins[i].value((byte >> i) & 1)
        self.pulse_enable()

    def pulse_enable(self):
        """
        Génère une impulsion sur la broche E pour valider la donnée.
        """
        self.e.value(0)
        utime.sleep_us(1)
        self.e.value(1)
        utime.sleep_us(1)
        self.e.value(0)
        utime.sleep_us(100)

    def clear(self):
        """
        Efface l'écran LCD.
        """
        self.write_cmd(0x01)
        utime.sleep_ms(2)

    def move_to(self, col, row):
        """
        Déplace le curseur à la position spécifiée.
        :param col: Colonne (0-15)
        :param row: Ligne (0 ou 1)
        """
        row_offsets = [0x00, 0x40]
        self.write_cmd(0x80 | (row_offsets[row] + col))

    def putstr(self, string):
        """
        Affiche une chaîne de caractères à la position courante.
        :param string: Chaîne à afficher
        """
        for char in string:
            self.write_data(ord(char))
