from abc import ABC, abstractmethod
class ACard(ABC):
    def __init__(self, color: str, rank: str):
        self.__color = color
        self.__rank = rank  

    @abstractmethod
    def __str__():
        return f"Card(color={self.color}, rank={self.rank})"
    
    @abstractmethod
    def getColor():
        return self.__color
    
    @abstractmethod
    def getRank():
        return self.__rank
    
    @abstractmethod
    def setrank(self, rank):
        self.__rank = rank
        