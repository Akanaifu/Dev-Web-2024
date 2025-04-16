import os

COUNTER_FILE = "id_counter.txt"


def load_counter():
    """
    Load the counter value from a file. If the file does not exist, initialize it to 0.
    """
    if os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, "r") as file:
            return int(file.read().strip())
    return 0


def save_counter(counter):
    """
    Save the counter value to a file.
    """
    with open(COUNTER_FILE, "w") as file:
        file.write(str(counter))


def increment_counter():
    """
    Increment the counter, save it, and return the new value.
    """
    counter = load_counter()
    counter += 1
    save_counter(counter)
    return counter
