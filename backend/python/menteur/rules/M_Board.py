
from backend.python.menteur.cards import M_CardsStack
from backend.python.menteur.cards.M_CardsSet import M_CardsSet

from backend.python.menteur.player import M_APlayer
from backend.python.menteur.rules import M_Manager_Cards


class M_Board():
    """
    Class representing the game board.
    """
    def __init__(self):
        self.__cardsSet = [M_CardsSet]  # Placeholder for cards on the board
        self.__players = [M_APlayer]  # Placeholder for players on the board
        self.__cardsStack = [M_CardsStack]
        
    def check_life_players(self) -> bool:
        """       
        lauchn faire une boucle 
        tant que 2 joueur son vivant ça joue
        """
        for k in range(len(self.__players)):
            if self.__players[k].get_live() == 0:
                self.__players.pop(k)
                return False
        return True
    
    def check_cards_players(self)->bool:
        """
        Check if the players have cards to play.
        """
        for k in range(len(self.__players)):
            if len(self.__players[k].get_cardsSet()) == 0:
                self.__players.pop(k)
                return False
        return True
    
    def delete_cards(self)->None:
        """
        Delete a card from the board.
        """
        for k in range(len(self.__cardsSet)):
            self.__cardsSet[k].clear_cards()
        
    def board(self, listCard:list[M_CardsSet])-> None:
        self.__cardsSet = listCard
    
    def add_player(self, player)->None:
        self.__players.append(player)
    
    def set_cards(self, cards):
        self.__cards = cards

    def get_cards(self):
        return self.__cards

    def get_players(self):
        return self.__players
    
    