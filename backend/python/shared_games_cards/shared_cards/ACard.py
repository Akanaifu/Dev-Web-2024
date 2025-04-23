from abc import ABC, abstractmethod
class ACard(ABC):
    def __init__(self, color: str, rank: str, game: str):
        self.__color = color
        self.__rank = rank  
        self.__game = game
        self.__value = int(self.__rank)
        
    def __str__(self) -> str:
        return f"Card(rank={self.__rank}, color={self.__color})"
    
    def get_color(self) -> str:
        return self.__color
    
    def get_rank(self) -> str:
        return self.__rank
    
    def set_rank(self, rank) -> None:
        self.__rank = rank

    def get_value(self) -> int:
        return self.__value
    
    def set_value(self, value) -> None:
        self.__value = value
        