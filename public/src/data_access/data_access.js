function fetchThen(sciezka, dane) {
    fetch(sciezka, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dane)
    })
        .then(response => {
            if (response.ok) {
                console.log('Dane zapisano pomyślnie');
            } else {
                console.error('Error:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Zapisywanie wyniku quizu gracza
export function setWynik(pktZdobyte, pktDoZd, xp, czas) {
    const wynik = {
        punktyZdobyte: pktZdobyte,
        punktyDoZdobycia: pktDoZd,
        zdobyteXP: xp,
        czas: czas //sekundy
    };
    fetchThen('/dane/zapisWyniku', wynik)
}

// Zapisywanie odpowiedzi gracza
export function setOdp(idOdp, czas, nazwaUz) {
    const odp = {
        idOdpowiedzi: idOdp,
        czasOdpowiedzi: czas, //sekundy
        nazwaUzytkownika: nazwaUz
    };
    fetchThen('/dane/odpowiedzGracza', odp)
}

export function zablokujPytanie(idPyt) {
    const pytanie = {
        idPytania: idPyt
    };
    fetchThen('/dane/blokadaPytania', pytanie)
}

export function odblokujPytanie(idPyt) {
    const pytanie = {
        idPytania: idPyt
    };
    fetchThen('/dane/odblokowaniePytania', pytanie)
}

export function updateUser(punktyXP, poziom, wytrzymaloscLodzi, maxPredkoscLodzi, id) {
    const data = {
        punktyXP: punktyXP,
        poziom: poziom,
        wytrzymaloscLodzi: wytrzymaloscLodzi,
        maxPredkoscLodzi: maxPredkoscLodzi,
        id: id
    };
    fetchThen('/dane/aktualizacjaUzytkownika', data)
}

export async function fetchData(path) {
    try {
        const response = await fetch(path);
        const data = await response.json();
        return data;
    }
    catch (e) {
        console.error(e.message);
    }
}