from backend.python.menteur.cards.CardsSet import CardsSet
from backend.python.menteur.rules.Board import Board

class Draft:
    
    def __init__(self, cards: CardsSet, board: Board):
        self.__cards = cards
        self.__board = board

    def draft_cards(self, board: Board, number_of_cards: int) -> CardsSet:
        """
        Draft a number of cards for a player.
        :param player: The player who is drafting the cards.
        :param number_of_cards: The number of cards to draft.
        :return: A set of drafted cards.
        """
        drafted_cards = self.__cards.draw_cards(number_of_cards)
        return drafted_cards