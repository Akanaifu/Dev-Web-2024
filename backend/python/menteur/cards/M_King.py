# from backend.python.shared_games_cards.shared_cards.King import King

class M_King(King):
    def __init__(self, color: str, ):
        self.__rank = 'King'
        self.__jeux = 'Menteur'
        self.__color = color
        super().__init__(self.__rank, self.__jeux, self.__color)

