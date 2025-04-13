
from backend.python.menteur.cards import CardsStack
from backend.python.menteur.cards.CardsSet import CardsSet
from backend.python.menteur.player.APlayer import APlayer
from backend.python.menteur.rules import Draft


class Board():
    """
    Class representing the game board.
    """
    def __init__(self):
        self.__cardsSet = [CardsSet]  # Placeholder for cards on the board
        self.__players = [APlayer]  # Placeholder for players on the board
        self.__cardsStack = [CardsStack]
        

        
    def board(self, Draft:Draft):
        pass
       
    def set_cards(self, cards):
        self.__cards = cards

    def get_cards(self):
        return self.__cards

    def add_player(self, player):
        self.__players.append(player)

    def get_players(self):
        return self.__players