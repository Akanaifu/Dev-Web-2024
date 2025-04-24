# from python.shared_games_cards.shared_cards.As import As

class M_As(As):
    def __init__(self, color: str, ):
        self.__rank = 'As'
        self.__jeux = 'Menteur'
        self.__color = color
        super().__init__(self.__rank, self.__jeux, self.__color)
            
            
    # if self.__jeux=='blackjack':
    #     def __init__(self, color: str, jeux: str):
    #         super().__init__(color, 'As', jeux)
    #         self.__value = 11
    #       def setValue(value):
    #         self.__value = value