class EnterValue():
    
    def EnterValue(self,minimum:int, maximum:int) -> int:
        number_as_integer = None
        while number_as_integer is None:
            try:
                number_as_integer=int(input(f"Veuillez entrer un nombre entier entre {minimum} et {maximum} inclus : "))
                while not(minimum <=number_as_integer and number_as_integer<=maximum):
                    number_as_integer=int(input(f"Veuillez entrer un nombre entier entre {minimum} et {maximum} inclus : "))
                else:
                    print(f" {number_as_integer}")  
                    return number_as_integer
            except ValueError:
                print(f"Attention : !!!! erreur ")    

