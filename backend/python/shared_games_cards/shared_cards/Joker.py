from python.shared_games_cards.shared_cards.ACard import ACard

class Joker(ACard):
    def __init__(self, color: str, jeux: str):
        super().__init__(color, jeux)
        self.__value = 15

