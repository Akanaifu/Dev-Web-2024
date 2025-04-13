from backend.python.ACard import ACard

class King(ACard):
    def __init__(self, color: str, jeux: str):
        super().__init__(color, jeux)
        self.__value = 13