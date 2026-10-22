import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.3.4:0',
  releaseNotes: {
    en_US: `Updated Miniflux to 2.3.4.

**Features**

- Gotify push notification support
- Steam scraper rules
- Helpful messages when saving invalid rewrite rules
- Lower database storage and memory use

**Security**

- Reserved IP address ranges are blocked to further protect against server-side request forgery
- Hardened passkey redirects, embedded iframes and Google Reader sign-in
- Feeds can no longer use a proxy on a private address unless FETCHER_ALLOW_PRIVATE_FEED_PROXY=1 is set
- Stops trusting certificates from a compromised certificate authority (eMudhra)

**Fixes**

- Proxies set through HTTP_PROXY and HTTPS_PROXY work again, including across redirects
- Fixed several crashes when adding feeds or sending bad requests

[Full upstream release notes](https://github.com/miniflux/v2/releases/tag/2.3.4)`,
    es_ES: `Miniflux actualizado a 2.3.4.

**Novedades**

- Compatibilidad con notificaciones push de Gotify
- Reglas de extracción para Steam
- Mensajes útiles al guardar reglas de reescritura no válidas
- Menor uso de almacenamiento y memoria

**Seguridad**

- Se bloquean los rangos de direcciones IP reservadas para reforzar la protección contra la falsificación de solicitudes del lado del servidor
- Mayor protección en las redirecciones de passkeys, los iframes incrustados y el inicio de sesión de Google Reader
- Los feeds ya no pueden usar un proxy en una dirección privada salvo que se defina FETCHER_ALLOW_PRIVATE_FEED_PROXY=1
- Deja de confiar en los certificados de una autoridad de certificación comprometida (eMudhra)

**Correcciones**

- Los proxies definidos con HTTP_PROXY y HTTPS_PROXY vuelven a funcionar, también tras redirecciones
- Se corrigieron varios fallos al añadir feeds o recibir solicitudes incorrectas

[Notas completas de la versión original](https://github.com/miniflux/v2/releases/tag/2.3.4)`,
    de_DE: `Miniflux auf 2.3.4 aktualisiert.

**Neuerungen**

- Unterstützung für Gotify-Push-Benachrichtigungen
- Scraper-Regeln für Steam
- Hilfreiche Meldungen beim Speichern ungültiger Umschreibregeln
- Geringerer Speicher- und Arbeitsspeicherverbrauch

**Sicherheit**

- Reservierte IP-Adressbereiche werden blockiert, um besser vor Server-Side-Request-Forgery zu schützen
- Gehärtete Passkey-Weiterleitungen, eingebettete iframes und Google-Reader-Anmeldung
- Feeds können keinen Proxy mit privater Adresse mehr nutzen, außer FETCHER_ALLOW_PRIVATE_FEED_PROXY=1 ist gesetzt
- Vertraut Zertifikaten einer kompromittierten Zertifizierungsstelle (eMudhra) nicht mehr

**Korrekturen**

- Über HTTP_PROXY und HTTPS_PROXY gesetzte Proxys funktionieren wieder, auch bei Weiterleitungen
- Mehrere Abstürze beim Hinzufügen von Feeds oder bei fehlerhaften Anfragen behoben

[Vollständige Upstream-Versionshinweise](https://github.com/miniflux/v2/releases/tag/2.3.4)`,
    pl_PL: `Zaktualizowano Miniflux do 2.3.4.

**Nowości**

- Obsługa powiadomień push Gotify
- Reguły scrapera dla Steam
- Pomocne komunikaty przy zapisywaniu nieprawidłowych reguł przepisywania
- Mniejsze zużycie miejsca w bazie danych i pamięci

**Bezpieczeństwo**

- Zarezerwowane zakresy adresów IP są blokowane, aby lepiej chronić przed fałszowaniem żądań po stronie serwera
- Wzmocnione przekierowania kluczy dostępu, osadzone elementy iframe i logowanie Google Reader
- Kanały nie mogą już używać proxy pod adresem prywatnym, chyba że ustawiono FETCHER_ALLOW_PRIVATE_FEED_PROXY=1
- Przestaje ufać certyfikatom przejętego urzędu certyfikacji (eMudhra)

**Poprawki**

- Proxy ustawione przez HTTP_PROXY i HTTPS_PROXY znów działają, także przy przekierowaniach
- Naprawiono kilka awarii przy dodawaniu kanałów lub nieprawidłowych żądaniach

[Pełne informacje o wydaniu upstream](https://github.com/miniflux/v2/releases/tag/2.3.4)`,
    fr_FR: `Miniflux mis à jour vers 2.3.4.

**Nouveautés**

- Prise en charge des notifications push Gotify
- Règles d’extraction pour Steam
- Messages utiles lors de l’enregistrement de règles de réécriture invalides
- Moindre utilisation du stockage et de la mémoire

**Sécurité**

- Les plages d’adresses IP réservées sont bloquées pour mieux se protéger contre la falsification de requêtes côté serveur
- Redirections des clés d’accès, iframes intégrées et connexion Google Reader renforcées
- Les flux ne peuvent plus utiliser un proxy à adresse privée sauf si FETCHER_ALLOW_PRIVATE_FEED_PROXY=1 est défini
- Ne fait plus confiance aux certificats d’une autorité de certification compromise (eMudhra)

**Corrections**

- Les proxys définis via HTTP_PROXY et HTTPS_PROXY refonctionnent, y compris après redirections
- Correction de plusieurs plantages lors de l’ajout de flux ou de requêtes invalides

[Notes de version complètes du projet amont](https://github.com/miniflux/v2/releases/tag/2.3.4)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
