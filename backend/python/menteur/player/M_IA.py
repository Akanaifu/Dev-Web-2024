from backend.python.shared_games_cards.shared_players.APlayer import APlayer

class M_IA(APlayer):
    def __init__(self, name: str, color: str, jeux: str):
        super().__init__(name, color, jeux)
        self.__name = name
        self.__color = color
        self.__jeux = jeux

#à finir par rapport à la regle du jeu et du nombre de cartes pour jouer
    def play_card(self, cardSet):
        
        return super().play_card(cardSet)