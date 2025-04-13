

from backend.python.menteur.cards.CardsSet import CardsSet


class Rules:
    
    def __init__(self, rules: list) -> None:
        self.rules = rules
        self.__max_players = 4
        self.__max_Cards_per_player = 5
        self.__max_Cards_per_game = 20
        self.__max_Cards_played = 3
        self.__master_cards = str
        self.cards_for_the_game = CardsSet

    def create_cards(self):
        
        for k in range(5):
            self.cards_for_the_game.add_card(self.cards_for_the_game, "" "Ace")
            self.cards_for_the_game.add_card(self.cards_for_the_game, "King")
            self.cards_for_the_game.add_card(self.cards_for_the_game, "Queen")