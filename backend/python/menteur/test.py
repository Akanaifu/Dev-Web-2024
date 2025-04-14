import random
from numpy import size

def test(__life:int) -> bool:
    random_1=random.randint(1,__life)
    random_2=random.randint(1,__life)
    if random_1==random_2:
        __life=0
        print(f"a perdu ")
        return True
    else:
        __life-=1
        print(f" vous restez {__life} vies")
        return False
Test=test(2)
print(Test)