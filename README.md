# GeoBoat
## Opis
GeoBoat to gra w stylu platformowym, osadzona w morskim świecie, gdzie gracz wciela się w postać kapitana żaglowca. Celem gry jest przemierzanie różnych regionów na mapie, rozwiązując zagadki i zdobywając doświadczenie oraz punkty za wykonywanie quizów.

## Technologie
Projekt GeoBoat został stworzony przy użyciu szeregu zaawansowanych technologii:

- Phaser 3: Silnik do tworzenia gier 2D dla języka JavaScript. Zapewnia wsparcie dla fizyki, animacji, interakcji i wielu innych funkcji potrzebnych do gry platformowej.

- Express: Minimalistyczny i elastyczny framework do tworzenia serwerów dla Node.js. Odpowiada za obsługę zapytań HTTP, dostarcza endpointy do pobierania danych dla gry oraz serwuje statyczne pliki.

- SQLite3: Lekka i szybka baza danych typu SQL, która przechowuje dane graczy, wyników i innych istotnych informacji potrzebnych do funkcjonowania gry.

- Body-parser: Middleware do analizowania danych żądania w Express. Umożliwia obsługę danych przesyłanych przez klienta, takich jak JSON.

- Phaser3-rex-plugins: Zbiór przydatnych wtyczek do silnika Phaser 3. Wykorzystane do obsługi efektów w grze.

## Instrukcje
### Wymagania
- Node.js zainstalowany na komputerze.
### Instalacja
1. Pobierz lub sklonuj repozytorium z projektem GeoBoat.
2. W terminalu przejdź do katalogu z projektem.
3. Wykonaj polecenie npm install w celu zainstalowania niezbędnych modułów.
### Uruchomienie
1. W terminalu wykonaj polecenie npm start, aby uruchomić serwer gry.
2. Otwórz przeglądarkę i przejdź pod adres http://localhost:8081/game.
### Rozgrywka
1. Steruj postacią kapitana żaglowca za pomocą klawiszy WSAD.
2. Przemierzaj tajemnicze regiony na mapie, aby zdobywać punkty doświadczenia (XP).
3. Rozwiązuj różnorodne quizy aby zdobyć cenne doświadczenie i zwiększyć swoją wiedzę.
4. Twoje decyzje wpływają na wynik i ranking gracza, sprawdź jak wysoko możesz się wspiąć na liście najlepszych odkrywców.
## Licencja
Ten projekt jest objęty licencją MIT. Szczegóły znajdują się w pliku LICENSE.

## Autorzy
- Kamil Sulkowski - https://github.com/KamilSulkowski
- Kamil Oglęcki - https://github.com/koglecki
- Bartosz Sobański - https://github.com/striker1523
- Oliwia Raciborska

## Podziękowania

Chcielibyśmy serdecznie podziękować firmie [Oskar Wegner](https://oskarwegner.pl) za możliwość odbycia praktyk i wsparcie podczas tworzenia tego projektu. Dzięki nim możliwe było stworzenie tej wspaniałej gry i zdobycie nowych umiejętności.
