

# from random import randint
# from python.menteur.cards.M_CardsSet import M_CardsSet
# from python.menteur.player.M_APlayer import M_APlayer
# from python.menteur.rules.M_Rules import M_Rules


class M_IA(M_APlayer):
    def __init__(self,id:int, pseudo: str, color: str, bet:int,solde:int,cardsSet: M_CardsSet):
        self.__id = id
        self.__pseudo = pseudo
        self.__color = color
        self.__bet = bet
        self.__solde = solde
        self.__cardsSet = cardsSet
        self.__rules=M_Rules
        super().__init__(id,pseudo,color,bet,solde,cardsSet)
    

#à finir par rapport à la regle du jeu et du nombre de cartes pour jouer
    def play_card(self, cardSet):
        
        return super().play_card(cardSet)
    
    def turn_to_play(self, player:M_APlayer)-> None:
        # Je suis dans le jeu console
        lucky:int
        if player.get_cards_chosen() > 0:
            for k in range(len(player.get_cardsSet())):
                if self.__rules.check_master_cards(self.get_cardsSet()[k])==True:
                    lucky+=1
            if randint(0, 6)<=lucky:
                self.play_snitch(self,player)
            else:
                self.play_card()
        else:
            self.play_card() 
                
        