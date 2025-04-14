
from backend.python.menteur.cards import M_CardsStack
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.shared_games_cards.shared_players.APlayer import APlayer
from backend.python.menteur.rules import M_Draft


class M_Board():
    """
    Class representing the game board.
    """
    def __init__(self):
        self.__cardsSet = [M_CardsSet]  # Placeholder for cards on the board
        self.__players = [APlayer]  # Placeholder for players on the board
        self.__cardsStack = [M_CardsStack]
        

        
    def board(self, Draft:M_Draft):
        pass
       
    def set_cards(self, cards):
        self.__cards = cards


    def get_cards(self):
        return self.__cards

    def add_player(self, player):
        self.__players.append(player)

    def get_players(self):
        return self.__players