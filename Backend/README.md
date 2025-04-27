# CarService

## Hitelesítés

### /Users

#### Regisztráció

Az **api/Users/Registration POST** végponton lehet regisztrálni a következő json-t küldve.

```json 
{
  "email": "teszt@teszt.hu",
  "password": "admin1234",
  "name": "Nagy István",
  "phone": "069066666666",
  "roleId": 3
}
```

- A név nem lehet egyedi azonosító, így az e-mail címet kell egyedinek venni, de mivel később a személy (ügyfél) valós nevére is szükség van ezt is rögzíteni kell a jelszó mellett.
- A roleId nullable, a végponton default 3-at, vagyis Ügyfél jogokat kap. 
- Telefonszám szintén nullable

Ha az ügyintéző vesz fel egy beeső megrendelést, akkor nem regisztrálhatja az ügyfelet, vagyis felületen, az ügyintéző vehessen fel csak e-mail címet és nevet megadva új ügyfelet. Ilyenkor később az email cím mellé a regisztrációs végponton a felhasználó tud regisztrálni (jelszót ad meg a már rögzített e-mail címéhez.)

#### Bejelentkezés

Az **api/Users/Login GET** végponton Basic authal lehet bejelentkezni. A válaszban a felhasznáűló adatait átadjuk, ezzel megkapja az ügyfél id-t ami egy Guid és a későbbiekben, minden más végponton ezt kell küldeni mint hitelesítő adat Bearer Token-ként.

#### Felhasználó adatok

Az **api/Users GET** végponton lekérhető mninden felhasználó adata, de query paraméterrel, ID-ra szűrve is lekérhető egy felhasználó adata is. 
https://localhost:7197/api/Users?userId=7A8097F2-D196-4D19-BF42-8E06B429F55A

Az **api/Users PUT** végponton rögzített felhasználók adatai módosíthatók, mint név, telefonszám, jogkör, kedvezmény.
