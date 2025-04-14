from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.menteur.rules import M_Rules
from backend.python.menteur.rules.M_Board import M_Board
from backend.python.shared_games_cards.shared_cards.ACard import ACard

class M_Draft:
    
    def __init__(self, board: M_Board,rules: M_Rules):
        self.__cards = M_CardsSet
        self.__board = board
        self.__rules = M_Rules  
       
    def create_cards(self):
        self.__cards.add_card(self.__cards,ACard(self.cards,f"{0}",self.__game_cards[len(self.__rules.get_game_cards)-1],self.__rules))
        for i in range (3):
            for k in range(5):
                self.cards.add_card(self.cards,ACard(self.cards,f"{k}",self.__game_cards[i],self.__rules))

    def draft_cards(self, board: M_Board) -> M_CardsSet:
        for k in range (self.__rules.get_max_Cards_per_player()):
            for i in range (self.__rules.get__nb_players()):
                #random de la liste de la fonciton create_cards enlever l'element et l'ajouter
                
                
                return self.__cards.get_cardsSet()