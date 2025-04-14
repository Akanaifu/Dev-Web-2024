from numpy import size


liste=[]
liste_2=[]
liste_caca=[]
for k in range(4):
    liste.append(k)
    liste_2.append(k*k)

liste_caca.append(liste)
liste_caca.append(liste_2)

print(liste_caca)