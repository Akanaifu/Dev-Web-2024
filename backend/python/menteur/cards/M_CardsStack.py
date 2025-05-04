from typing import List, Dict, Any
from shared_games_cards.shared_cards.ACard import ACard

#cette classe est une pile de carte, elle contient une liste de carte
# elle est utilisée pour les cartes qui sont posées sur la table
class M_CardsStack():
    def __init__(self, listCardsStack=List[ACard]) -> None:
        self.__listCardsStack = listCardsStack

    def add_card(self, card: ACard) -> None:
        self.__listCardsStack.append(card)

    # def remove_card(self, card: ACard):
    #     self.__listCardsStack.remove(card)
        #je dois garder les deniers cards dans la pile

    def get_cardsSet(self) -> List[ACard]:
        return self.__listCardsStack

    