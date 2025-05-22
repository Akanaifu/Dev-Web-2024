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

# Séquence polyphonique simplifiée (melody, bass) pour Victory Fanfare FFX
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


def play_note(pin_num, freq, duration_ms):
    if freq == 0:
        time.sleep_ms(duration_ms)
        return
    pwm = PWM(Pin(pin_num))
    pwm.freq(freq)
    pwm.duty_u16(32768)
    time.sleep_ms(duration_ms)
    pwm.deinit()


def play_victory_fanfare():
    for melody, bass, duration in VICTORY_FANFARE_POLY:
        freq1 = NOTES.get(melody, 0)
        freq2 = NOTES.get(bass, 0)
        # Jouer les deux notes en même temps
        pwm1 = PWM(Pin(BUZZER_PINS[0])) if freq1 else None
        pwm2 = PWM(Pin(BUZZER_PINS[1])) if freq2 else None
        if pwm1:
            pwm1.freq(freq1)
            pwm1.duty_u16(32768)
        if pwm2:
            pwm2.freq(freq2)
            pwm2.duty_u16(32768)
        time.sleep_ms(duration)
        if pwm1:
            pwm1.deinit()
        if pwm2:
            pwm2.deinit()
        time.sleep_ms(20)


def play_slot_machine_sound():
    # Pour compatibilité, joue juste le début du Victory Fanfare polyphonique
    for i in range(8):
        melody, bass, duration = VICTORY_FANFARE_POLY[i]
        freq1 = NOTES.get(melody, 0)
        freq2 = NOTES.get(bass, 0)
        pwm1 = PWM(Pin(BUZZER_PINS[0])) if freq1 else None
        pwm2 = PWM(Pin(BUZZER_PINS[1])) if freq2 else None
        if pwm1:
            pwm1.freq(freq1)
            pwm1.duty_u16(32768)
        if pwm2:
            pwm2.freq(freq2)
            pwm2.duty_u16(32768)
        time.sleep_ms(duration)
        if pwm1:
            pwm1.deinit()
        if pwm2:
            pwm2.deinit()
        time.sleep_ms(20)


# Partie test indépendante
if __name__ == "__main__":
    print("Test des buzzers : Victory Fanfare FFX 8-bit polyphonique")
    play_victory_fanfare()
    time.sleep(1)
    print("Slot machine sound (début du Victory Fanfare polyphonique)")
    play_slot_machine_sound()
