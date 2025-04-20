import random
from numpy import size

def fontion_1(liste) -> None:
    for k in range(5):
        liste.append(k)

def fontion_2(liste:list[int]) -> None:
    for k in range(5):
        liste[k]+=2

def fontion_3(liste:list[int]) -> None:
    liste.clear()

def test() -> None:
    # liste=[]
    # fontion_1(liste)
    # print("fonction 1 :", liste)
    # fontion_2( liste)
    # print(f"fonction 2 :", liste)
    # fontion_3(liste)
    # return liste
    liste_3=[[1,2,3,4,5],[6,7,8,9,10]]
    liste_3.clear() 
    # liste_3.append(1)
    return liste_3
#     liste_3.append(2)

Test=test()
print(Test)