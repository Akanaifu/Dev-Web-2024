from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.shared_games_cards.shared_cards.ACard import ACard


class M_Rules:
    
    def __init__(self,rules : str) -> None:
        self.__max_players = 4
        self.__max_Cards_per_player = 5
        self.__max_Cards_per_game = 20
        self.__max_Cards_played = 3
        self.__master_cards = str
        self.__min_players =2
        self.__nb_players : int
        self.__cards_for_the_game = M_CardsSet
        self.__game_cards =["As","King","Queen","Jack","10","9","8","7","6","5","4","3","2","Joker"]
        self.__rules= rules
        
def get_game_cards(self):
    return self.__game_cards

def get_max_players(self):
    return self.__max_players

def get_max_Cards_per_player(self):
    return self.__max_Cards_per_player

def get_max_Cards_per_game(self):
    return self.__max_Cards_per_game

def get_nb_players(self):
    return self.__nb_players

    #  def create_cards(self):
    #     self.__cards_for_the_game.add_card(self.__cards_for_the_game,ACard(self.__cards_for_the_game,f"{0}",self.__game_cards[len(self.__game_cards)-1],self.__rules))
    #     for i in range (3):
    #         for k in range(5):
    #             self.__cards_for_the_game.add_card(self.__cards_for_the_game,ACard(self.__cards_for_the_game,f"{k}",self.__game_cards[i],self.__rules))
