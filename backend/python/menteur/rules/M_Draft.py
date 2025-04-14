import random
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.menteur.rules import M_Rules
from backend.python.menteur.rules.M_Board import M_Board
from backend.python.shared_games_cards.shared_cards.ACard import ACard

class M_Draft:
    
    def __init__(self, board: M_Board,rules: M_Rules):
        self.__created_cards = M_CardsSet
        self.__board = board
        self.__rules = M_Rules  
        self.__list_cards_per_player = [M_CardsSet]
       
    def create_cards(self):
        self.__created_cards.add_card(self.__created_cards,ACard(self.__created_cards,f"{0}",self.__rules.get_game_cards()[len(self.__rules.get_game_cards())-1],self.__rules.get_game_name()))
        for i in range (3):
            for k in range(5):
                self.__created_cards.add_card(self.cards,ACard(self.__created_cards,f"{k}",self.__rules.get_game_cards()[i],self.__rules.get_game_name()))

    def draft_cards(self, board: M_Board) -> list[M_CardsSet]: 
        list_cards=M_CardsSet
        self.create_cards()
        for i in range (self.__rules.get__nb_players()):
            for k in range (self.__rules.get_max_Cards_per_player()):
                random_number = random.randint(0, len(self.__created_cards.get_cardsSet())-1)
                list_cards.add_card(self.__created_cards.get_cardsSet()[random_number]) 
                self.__created_cards.pop_card(random_number) #pop_card est une fonction de la classe M_CardsSet qui enlève la carte de la liste
            self.__list_cards_per_player.append(list_cards)
        return self.__list_cards_per_player