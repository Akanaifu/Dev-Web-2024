from machine import Pin, PWM
import time

BUZZER_PINS = [14, 15]

NOTES = {
    "C5": 523,
    "D5": 587,
    "E5": 659,
    "F5": 698,
    "G5": 784,
    "A5": 880,
    "B5": 988,
    "C6": 1047,
    "D6": 1175,
    "E6": 1319,
    "F6": 1397,
    "G6": 1568,
    "A6": 1760,
    "B6": 1976,
    "C7": 2093,
    "REST": 0,
    "G4": 392,
    "A4": 440,
    "B4": 494,
    "C4": 262,
    "D4": 294,
    "E4": 330,
    "F4": 349,
}

VICTORY_FANFARE_POLY = [
    # (melody, bass, duration)
    ("G5", "C5", 120),
    ("C6", "E5", 120),
    ("E6", "G5", 120),
    ("G6", "C6", 180),
    ("REST", "REST", 60),
    ("G5", "C5", 120),
    ("C6", "E5", 120),
    ("E6", "G5", 120),
    ("G6", "C6", 180),
    ("REST", "REST", 60),
    ("G6", "E5", 90),
    ("A6", "F5", 90),
    ("G6", "E5", 90),
    ("E6", "C5", 90),
    ("C6", "G4", 120),
    ("E6", "C5", 120),
    ("G6", "E5", 240),
    ("REST", "REST", 120),
    ("C6", "A4", 90),
    ("D6", "B4", 90),
    ("E6", "C5", 90),
    ("F6", "D5", 90),
    ("G6", "E5", 180),
    ("REST", "REST", 60),
    ("G6", "E5", 90),
    ("A6", "F5", 90),
    ("G6", "E5", 90),
    ("E6", "C5", 90),
    ("C6", "G4", 120),
    ("E6", "C5", 120),
    ("G6", "E5", 240),
]


class VictoryFanfarePlayer:
    def __init__(self):
        self.sequence = VICTORY_FANFARE_POLY
        self.index = 0
        self.time_left = 0
        self.active = False
        self.pwms = [None, None]

    def start(self):
        self.index = 0
        self.time_left = 0
        self.active = True

    def stop(self):
        self.active = False
        self._stop_pwms()

    def _stop_pwms(self):
        for i in range(2):
            if self.pwms[i]:
                self.pwms[i].deinit()
                self.pwms[i] = None

    def tick(self, ms_step=20):
        if not self.active or self.index >= len(self.sequence):
            self.stop()
            return
        if self.time_left <= 0:
            # Nouvelle note
            self._stop_pwms()
            melody, bass, duration = self.sequence[self.index]
            freq1 = NOTES.get(melody, 0)
            freq2 = NOTES.get(bass, 0)
            if freq1:
                self.pwms[0] = PWM(Pin(BUZZER_PINS[0]))
                self.pwms[0].freq(freq1)
                self.pwms[0].duty_u16(32768)
            if freq2:
                self.pwms[1] = PWM(Pin(BUZZER_PINS[1]))
                self.pwms[1].freq(freq2)
                self.pwms[1].duty_u16(32768)
            self.time_left = duration
            self.index += 1
        self.time_left -= ms_step
        if self.time_left <= 0:
            self._stop_pwms()


# Pour compatibilité, on garde une version "slot machine" non bloquante
class SlotMachineSoundPlayer:
    def __init__(self):
        self.sequence = VICTORY_FANFARE_POLY[:8]
        self.index = 0
        self.time_left = 0
        self.active = False
        self.pwms = [None, None]

    def start(self):
        self.index = 0
        self.time_left = 0
        self.active = True

    def stop(self):
        self.active = False
        self._stop_pwms()

    def _stop_pwms(self):
        for i in range(2):
            if self.pwms[i]:
                self.pwms[i].deinit()
                self.pwms[i] = None

    def tick(self, ms_step=20):
        if not self.active or self.index >= len(self.sequence):
            self.stop()
            return
        if self.time_left <= 0:
            self._stop_pwms()
            melody, bass, duration = self.sequence[self.index]
            freq1 = NOTES.get(melody, 0)
            freq2 = NOTES.get(bass, 0)
            if freq1:
                self.pwms[0] = PWM(Pin(BUZZER_PINS[0]))
                self.pwms[0].freq(freq1)
                self.pwms[0].duty_u16(32768)
            if freq2:
                self.pwms[1] = PWM(Pin(BUZZER_PINS[1]))
                self.pwms[1].freq(freq2)
                self.pwms[1].duty_u16(32768)
            self.time_left = duration
            self.index += 1
        self.time_left -= ms_step
        if self.time_left <= 0:
            self._stop_pwms()


# Partie test indépendante
if __name__ == "__main__":
    print("Test Victory Fanfare non bloquant")
    player = VictoryFanfarePlayer()
    player.start()
    while player.active:
        player.tick()
        time.sleep_ms(20)
    print("Test Slot Machine Sound non bloquant")
    slot = SlotMachineSoundPlayer()
    slot.start()
    while slot.active:
        slot.tick()
        time.sleep_ms(20)
