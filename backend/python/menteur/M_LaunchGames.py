"""
Fonction pour lancer le jeu Menteur.
Le jeu se joue entre 1 et 4 joueurs.
"""
# from typing import List, Dict, Any
# from abc import ABC, abstractmethod
# import random
# from random import randint
# from EnterValue import EnterValue
# from shared_games_cards.shared_cards.ACard import ACard
# from shared_games_cards.shared_players.APlayer import APlayer
# from shared_games_cards.shared_cards.As import As
# from shared_games_cards.shared_cards.Joker import Joker
# from shared_games_cards.shared_cards.King import King
# from shared_games_cards.shared_cards.Queen import Queen

from menteur.cards.M_CardsSet import M_CardsSet
from menteur.rules.M_Board import M_Board
from menteur.rules.M_Manager_Cards import M_Manager_Cards
from menteur.rules.M_Rules import M_Rules
from menteur.player.M_IA import M_IA
from menteur.player.M_Player import M_Player


# from common_imports import EnterValue,M_CardsSet,M_Rules,M_Board,M_Manager_Cards,M_IA,M_Player
class M_LaunchGames:
    """
    Class to launch the game.
    """
    def __init__(self):
        self.__game_name = "Menteur"
        self.__game = M_LaunchGames
        self.__nb_player = 0
        self.__bet = 0
        self.__solde = 0
        self.__cardsSet = M_CardsSet()
        self.__board = M_Board()
        self.__rules= M_Rules()
        self.__manager_cards = M_Manager_Cards(self.__board,self.__rules)
        self.__pseudo = [str]
        self.__list_color = ['rose','black','blue','green']
        
    def get_game_name(self):
        return self.__game_name
    
    def get_game(self):
        return self.__game
    
    def prepare(self)->None:
         # Initialize the game rules and players
        print("Veuillez choisir le nombre de joueurs (1-4) :")
        self.__nb_player=EnterValue.EnterValue(self.__nb_player,1,4)
        # self.__bet=EnterValue.EnterValue(self.__bet,1,1000) 
        color=[str]
        for k in range(4):
            if k < self.__nb_player:
                self.__pseudo.append(input(f"Entrez le pseudo du joueur {k+1} : "))
                print(f"Choisissez une couleur parmi {self.__list_color} :")   
                nb_color = EnterValue.EnterValue(nb_color,1,4)
                color.append(self.__list_color.pop(nb_color-1))
            else:
                self.__pseudo.append(f"IA_{k+1}")
                color.append(self.__list_color.pop(0))
        self.__list_color.clear()
        self.__list_color=color.copy()

    def loby(self)->None:
        self.__manager_cards.create_cards(self.__manager_cards)
        
        # Create the board and set the cards

        self.__board.set_cardsSet_board(self.__manager_cards.get_created_cards(self.__manager_cards))
        liste_hand_card=self.__manager_cards.draft_cards(self.__manager_cards)
        for k in range(4):
            if k < self.__nb_player:
                player = M_Player(k,self.__pseudo[k],self.__list_color[k],self.__bet,self.__solde,self.__manager_cards.get_list_cards_per_player(self.__manager_cards)[k])
            else :
                player = M_IA(k,self.__pseudo[k],self.__list_color[k],self.__bet,self.__solde,self.__manager_cards.get_list_cards_per_player(self.__manager_cards)[k])
            self.__board.add_player(player) 

    def play(self)-> None:
        while self.__board.check_life_players(self.__board) and self.__board.check_cards_players(self.__board):
            for player in self.__board.get_players():
                player.my_turn_to_play(player)
        if self.__board.check_life_players(self.__board) == False:
            print("Fin de la partie")
            print(f'le gaganant '+self.__board.get_player(0))
        else:
            self.regame(self)
        
    def regame(self)->None:
        self.__manager_cards.redistribute(self.__manager_cards)
        for k in range (len(self.__board.get_players(self.__board))):
            self.__board.get_player(k).set_cardsSet(self.__manager_cards.get_list_cards_per_player(self.__manager_cards)[k])
        self.play(self)
# def run()->None:
#     game = M_LaunchGames()
#     game.prepare(game)
#     game.loby(game)
#     game.play(game)
# # if __name__ == "__main__":
# #     run()

