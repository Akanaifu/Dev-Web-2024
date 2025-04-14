from backend.python.shared_games_cards.shared_cards.As import As

class M_As(As):
    # if self.__jeux=='menteur':
    def __init__(self, color: str, jeux: str):
        super().__init__(color, jeux)
            
            
    # if self.__jeux=='blackjack':
    #     def __init__(self, color: str, jeux: str):
    #         super().__init__(color, 'As', jeux)
    #         self.__value = 11
    #       def setValue(value):
    #         self.__value = value