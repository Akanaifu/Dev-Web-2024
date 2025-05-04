# import random
# from menteur.cards import M_As, M_Joker, M_King, M_Queen
# from menteur.cards.M_CardsSet import M_CardsSet
# from menteur.rules.M_Rules import M_Rules
# from menteur.rules.M_Board import M_Board
# from shared_games_cards.shared_cards.ACard import ACard

class M_Manager_Cards:
    
    def __init__(self, board: M_Board,rules: M_Rules):
        self.__created_cards = M_CardsSet
        self.__rules = M_Rules  
        self.__list_cards_per_player = [M_CardsSet]
    
    def create_cards(self):
        #création des cartes
        self.__created_cards.add_card(M_Joker.M_Joker(self.__rules.get_color()[0]))
        self.__created_cards.add_card(M_Joker.M_Joker(self.__rules.get_color()[0]))
        for k in range (len(self.__rules.get_max_Cards_per_player()+1)):
                self.__created_cards.add_card(M_As.M_As(self.__rules.get_color()[0]))
                self.__created_cards.add_card(M_King.M_King(self.__rules.get_color()[0]))
                self.__created_cards.add_card(M_Queen.M_Queen(self.__rules.get_color()[0])) 
        # return self.__created_cards

    def draft_cards(self) -> list[M_CardsSet]: 
        ## 1. Créer une liste de cartes pour chaque joueur
        # 2. Créer une liste de cartes pour le jeu
        
        list_cards=M_CardsSet
        
        #copie de la liste de carte pour ne pas la modifier
        copy_list_cards: M_CardsSet = self.__created_cards.copy_cardsSet()
        
        ##création de la liste de carte pour chaque joueur
        for i in range (self.__rules.get_nb_players()):
            for k in range (self.__rules.get_max_Cards_per_player()):
                random_number = random.randint(0, len(copy_list_cards)-1)
                list_cards.add_card(copy_list_cards[random_number]) 
                copy_list_cards.pop_card(random_number) #pop_card est une fonction de la classe M_CardsSet qui enlève la carte de la liste
            self.__list_cards_per_player.append(list_cards)
            list_cards.clear_cards()
        return self.__list_cards_per_player
    
    def redistribute(self)->None:
        #Supprimer les cartes de la liste de carte pour chaque joueur
        self.__list_cards_per_player.clear()        
        self.draft_cards()
    
    def get_list_cards_per_player(self)->list[M_CardsSet]:
        return self.__list_cards_per_player
    
    def get_created_cards(self)->M_CardsSet:
        return self.__created_cards