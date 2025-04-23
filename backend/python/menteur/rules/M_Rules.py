import random
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.menteur.player.M_APlayer import M_APlayer
from backend.python.menteur.rules.M_Board import M_Board
from backend.python.shared_games_cards.shared_cards.ACard import ACard


class M_Rules:
    
    def __init__(self) -> None:
        self.__max_players = 4
        self.__max_Cards_per_player = 5
        self.__max_Cards_per_game = 20
        self.__max_Cards_played = 3
        self.__master_cards : str
        self.__min_players =2
        self.__nb_players : int
        self.__game_cards =["As","King","Queen","Jack","10","9","8","7","6","5","4","3","2","Joker"]
        self.__game_name= "Menteur"
        self.__card_joker = "Joker"
        self.__board=M_Board 
        self.__color=["black","red"]
    
    def card_asked(self):
        self.__master_cards = self.__game_cards[random.randint(0,2)]
        
 
    
    def check_master_cards(self,card_player:ACard) -> bool:
        if self.__master_cards == card_player.get_rank() or self.__card_joker == card_player.get_rank():
            return True
        else:
            return False
        
    def get_max_Cards_played(self):
        return self.__max_Cards_played
    
    def get_master_cards(self):
        return self.__master_cards
        
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

    def get_game_name(self):
        return self.__game_name
    
    def get_color(self):
        return self.__color

   # def check_life_players(self) -> bool:
    #     """       
    #     lauchn faire une boucle 
    #     tant que 2 joueur son vivant ça joue
    #     """
    #     for k in range(len(self.__board.get_players())):
    #         if self.__board.get_player(k) == 0:
    #             self.__board.pop_players(k)
    #             return False
    #     return True   
    
    # def check_cards_players(self)->bool:
    #     """
    #     Check if the players have cards to play.
    #     """
    #     for k in range(len(self.__players)):
    #         if len(self.__board.get_players[k].get_cardsSet()) == 0:
    #             self.__players.pop(k)
    #             return False
    #     return True 
    
    #  def create_cards(self):
    #     self.__cards_for_the_game.add_card(self.__cards_for_the_game,ACard(self.__cards_for_the_game,f"{0}",self.__game_cards[len(self.__game_cards)-1],self.__rules))
    #     for i in range (3):
    #         for k in range(5):
    #             self.__cards_for_the_game.add_card(self.__cards_for_the_game,ACard(self.__cards_for_the_game,f"{k}",self.__game_cards[i],self.__rules))
