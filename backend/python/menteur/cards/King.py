from backend.python.menteur.cards.ACard import ACards

class King(ACards):
    def __init__(self, color: str, jeux: str):
        super().__init__(color, jeux)
        self.__value = 13