from backend.python.menteur.cards.ACard import ACards
class As(ACards):
    if self.__jeux=='menteur':
        def __init__(self, color: str, jeux: str):
            super().__init__(color, jeux)
            self.__value = 14
            
            
    # if self.__jeux=='blackjack':
    #     def __init__(self, color: str, jeux: str):
    #         super().__init__(color, 'As', jeux)
    #         self.__value = 11
    #       def setValue(value):
    #         self.__value = value