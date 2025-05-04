
from shared_games_cards.shared_cards.ACard import ACard
class As(ACard):
    def __init__(self, color: str, jeux: str):
        self.__value = 14
        super().__init__(color, jeux)
        
            
            
    # if self.__jeux=='blackjack':
    #     def __init__(self, color: str, jeux: str):
    #         super().__init__(color, 'As', jeux)
    #         self.__value = 11
    #       def setValue(value):
    #         self.__value = value