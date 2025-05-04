# from backend.shared_games_cards.shared_cards.Queen import Queen
class M_Queen(Queen):
    def __init__(self, color: str, ):
        self.__rank = 'Queen'
        self.__jeux = 'Menteur'
        self.__color = color
        super().__init__(self.__rank, self.__jeux, self.__color)
