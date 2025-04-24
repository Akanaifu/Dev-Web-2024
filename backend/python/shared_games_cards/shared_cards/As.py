# The line `from python.shared_games_cards.shared_cards.ACard import ACard` is importing the `ACard`
# class from the specified module in the Python package structure. This allows the current module to
# use the `ACard` class defined in the `ACard.py` file within the `shared_cards` package under the
# `shared_games_cards` package in the project.
from python.shared_games_cards.shared_cards.ACard import ACard
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