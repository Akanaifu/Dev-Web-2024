
from python.menteur.cards.M_CardsStack import M_CardsStack
from python.menteur.cards.M_CardsSet import M_CardsSet

from python.menteur.player.M_APlayer import M_APlayer
from python.menteur.rules.M_Manager_Cards import M_Manager_Cards


class M_Board():
    """
    Class representing the game board.
    """
    def __init__(self):
        self.__cardsSet = [M_CardsSet]  # Placeholder for cards on the board
        self.__players = [M_APlayer]  # type: ignore # Placeholder for players on the board
        self.__cardsStack = [M_CardsStack]
        self.__cardsStack_played = [M_CardsStack]  # teste pour voir si ca foncitonne apartir d'un autre classe
        
    def check_life_players(self) -> bool:
        """       
        Permet de vérifier si les joueurs ont encore des vies.
        Si un joueur n'a plus de vie, il est retiré de la liste des joueurs.
        Si un seul joueur reste, la partie est terminée.
        """
        for k in range(len(self.__players)):
            if self.__players[k].get_life == 0:
                self.__players.pop(k)
        if len(self.__players) == 1:
            return False
        else: 
            return True
    
    def check_cards_players(self)->bool:
        """
        Permet de vérifier si les joueurs ont encore des cartes à jouer.
        Si un joueur n'a plus de cartes, il est retiré de la liste des joueurs.
        Si un seul joueur reste, la partie est terminée.
        """
        for k in range(len(self.__players)):
            if len(self.__players[k].get_cardsSet()) == 0:
                self.__players.pop(k)
        if len(self.__players) == 1:
            return False
        else: 
            return True
    
    def delete_cards(self)->None:
        """
        Supprime les cartes de la liste de carte pour chaque joueur.
        """
        for k in range(len(self.__cardsSet)):
            self.__cardsSet[k].clear_cards(self.__cardsSet[k])
        
    def set_cardsSet_board(self, listCard:list[M_CardsSet])-> None:
        self.__cardsSet = listCard
    
    def set_cardsStack_board(self, listCard:list[M_CardsStack])-> None:
        self.__cardsStack = listCard
    
    def add_player(self, player)->None:
        self.__players.append(player)
    
    def get_cardsSet_board(self)-> list[M_CardsSet]:
        return self.__cardsSet
    
    def get_cardsStack_board(self)-> list[M_CardsStack]:
        return self.__cardsStack

    def get_cardsStack_played(self)-> list[M_CardsStack]:
        return self.__cardsStack_played
    
    def set_cardsStack_played(self, cardsStack:M_CardsStack)-> None:
        self.__cardsStack_played.append(cardsStack)
    
    def get_players(self)-> list[M_APlayer]: # type: ignore
        return self.__players
    
    def get_player(self,k)-> M_APlayer:
        return self.__players[k]
    
    def pop_players(self, k:int)-> None:
        self.__players.pop(k)