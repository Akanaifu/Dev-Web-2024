# from typing import List
# from shared_games_cards.shared_cards.ACard import ACard

#cette classe est une pile de carte, elle contient une liste de carte
# elle est utilisée pour les cartes qui sont posées sur la table
class CardsStack():
    def __init__(self,list_card :List[ACard]):
        self.__cards: List[ACard] = []

    def add_card(self, card: ACard) -> None:
        self.__cards.append(card)

    def get_cardsSet(self) -> List[ACard]:
        return self.__cards

    