from machine import Pin, PWM
import time

# Définition des pins pour les buzzers
BUZZER_PINS = [14, 15]

# Fréquences typiques pour simuler une machine à sous
SLOT_MACHINE_NOTES = [1047, 1319, 1568, 2093, 0]  # C6  # E6  # G6  # C7


def play_note(pin_num, freq, duration_ms):
    if freq == 0:
        time.sleep_ms(duration_ms)
        return
    pwm = PWM(Pin(pin_num))
    pwm.freq(freq)
    pwm.duty_u16(32768 * 2)  # 50% duty cycle
    time.sleep_ms(duration_ms)
    pwm.deinit()


def play_slot_machine_sound():
    # Joue une séquence de notes sur les deux buzzers en alternance
    for i, freq in enumerate(SLOT_MACHINE_NOTES):
        play_note(BUZZER_PINS[i % 2], freq, 120)
        time.sleep_ms(30)


# Partie test indépendante
if __name__ == "__main__":
    print("Test des buzzers : bruit de machine à sous")
    for _ in range(3):
        play_slot_machine_sound()
        time.sleep(0.5)
