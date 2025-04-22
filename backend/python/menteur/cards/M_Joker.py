from backend.python.shared_games_cards.shared_cards.Joker import Joker

class M_Joker(Joker):
    def __init__(self, color: str, ):
        self.__rank = 'Joker'
        self.__jeux = 'Menteur'
        self.__color = color
        super().__init__(self.__rank, self.__jeux, self.__color)


