from backend.python.ACard import ACard

class M_ACard(ACard):
    #overwride pour le menteur
    def __init__(self, color: str, jeux: str):
        super().__init__(color, jeux)
