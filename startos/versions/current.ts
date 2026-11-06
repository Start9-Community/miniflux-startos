import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.3.5:0',
  releaseNotes: {
    en_US: `Updated Miniflux to 2.3.5.

**Features**

- OpenID Connect admin role mapping through OAUTH2_ADMIN_GROUP and OAUTH2_GROUP_CLAIM
- Passkeys can be the only login method when local authentication is disabled
- Username, password, account linking and passkey settings moved to a new Authentication page
- Invalid CSS selectors are rejected when saving rewrite and scraper rules
- Fewer unused sessions stored in the database

**Security**

- The current password is required to set a new one, and other sessions are signed out when it changes
- Administrators can no longer edit their own account from the user management page
- Feed cookies are only sent to the feed's own website
- Closed another server-side request forgery bypass (6to4 and IPv4-compatible IPv6 addresses)
- Client IPs can no longer be spoofed through X-Forwarded-For
- Shared entry pages are no longer cached publicly

**Fixes**

- Fever API: starring, mark-as-read and item requests now behave correctly
- Fixed a Google Reader API crash and case-sensitive category matching
- JSON feeds with a byte order mark and lower-case RFC 3339 dates are accepted
- Fixed raw translation keys showing in some messages

The Miniflux image now ships an up-to-date certificate store, so the package no longer rebuilds it.`,
    es_ES: `Miniflux actualizado a 2.3.5.

**Novedades**

- Asignación del rol de administrador mediante OpenID Connect con OAUTH2_ADMIN_GROUP y OAUTH2_GROUP_CLAIM
- Las passkeys pueden ser el único método de inicio de sesión cuando la autenticación local está desactivada
- Los ajustes de usuario, contraseña, vinculación de cuentas y passkeys pasan a una nueva página de Autenticación
- Se rechazan los selectores CSS no válidos al guardar reglas de reescritura y de extracción
- Menos sesiones sin uso almacenadas en la base de datos

**Seguridad**

- Se exige la contraseña actual para establecer una nueva y se cierran las demás sesiones al cambiarla
- Los administradores ya no pueden editar su propia cuenta desde la página de gestión de usuarios
- Las cookies de los feeds solo se envían al sitio web del propio feed
- Se cerró otra forma de eludir la protección contra la falsificación de solicitudes del lado del servidor (direcciones 6to4 e IPv6 compatibles con IPv4)
- Ya no se puede falsificar la IP del cliente mediante X-Forwarded-For
- Las páginas de entradas compartidas ya no se almacenan en cachés públicas

**Correcciones**

- API Fever: marcar con estrella, marcar como leído y solicitar elementos ahora funcionan correctamente
- Se corrigió un fallo de la API de Google Reader y la comparación de categorías sensible a mayúsculas
- Se aceptan feeds JSON con marca de orden de bytes y fechas RFC 3339 en minúsculas
- Se corrigieron claves de traducción sin traducir en algunos mensajes

La imagen de Miniflux ya incluye un almacén de certificados actualizado, por lo que el paquete ya no lo reconstruye.`,
    de_DE: `Miniflux auf 2.3.5 aktualisiert.

**Neuerungen**

- Zuordnung der Administratorrolle über OpenID Connect mit OAUTH2_ADMIN_GROUP und OAUTH2_GROUP_CLAIM
- Passkeys können die einzige Anmeldemethode sein, wenn die lokale Authentifizierung deaktiviert ist
- Einstellungen für Benutzername, Passwort, Kontoverknüpfung und Passkeys auf einer neuen Seite „Authentifizierung“
- Ungültige CSS-Selektoren werden beim Speichern von Umschreib- und Scraper-Regeln abgelehnt
- Weniger ungenutzte Sitzungen in der Datenbank

**Sicherheit**

- Zum Festlegen eines neuen Passworts ist das aktuelle erforderlich, und andere Sitzungen werden abgemeldet
- Administratoren können ihr eigenes Konto nicht mehr über die Benutzerverwaltung bearbeiten
- Feed-Cookies werden nur noch an die Website des Feeds gesendet
- Eine weitere Umgehung des Schutzes vor Server-Side-Request-Forgery wurde geschlossen (6to4- und IPv4-kompatible IPv6-Adressen)
- Die Client-IP lässt sich nicht mehr über X-Forwarded-For fälschen
- Geteilte Eintragsseiten werden nicht mehr in öffentlichen Caches gespeichert

**Korrekturen**

- Fever-API: Markieren, Als-gelesen-Markieren und Abrufen von Einträgen funktionieren jetzt korrekt
- Ein Absturz der Google-Reader-API und die Groß-/Kleinschreibung bei Kategorien wurden behoben
- JSON-Feeds mit Byte-Order-Mark und RFC-3339-Daten in Kleinbuchstaben werden akzeptiert
- Rohe Übersetzungsschlüssel in einigen Meldungen behoben

Das Miniflux-Image enthält jetzt einen aktuellen Zertifikatsspeicher, das Paket baut ihn daher nicht mehr neu.`,
    pl_PL: `Zaktualizowano Miniflux do 2.3.5.

**Nowości**

- Przypisywanie roli administratora przez OpenID Connect za pomocą OAUTH2_ADMIN_GROUP i OAUTH2_GROUP_CLAIM
- Klucze dostępu mogą być jedyną metodą logowania, gdy uwierzytelnianie lokalne jest wyłączone
- Ustawienia nazwy użytkownika, hasła, łączenia kont i kluczy dostępu przeniesiono na nową stronę Uwierzytelnianie
- Nieprawidłowe selektory CSS są odrzucane przy zapisywaniu reguł przepisywania i scrapera
- Mniej nieużywanych sesji w bazie danych

**Bezpieczeństwo**

- Ustawienie nowego hasła wymaga podania obecnego, a pozostałe sesje są wylogowywane po jego zmianie
- Administratorzy nie mogą już edytować własnego konta na stronie zarządzania użytkownikami
- Pliki cookie kanałów są wysyłane tylko do witryny danego kanału
- Zamknięto kolejny sposób obejścia ochrony przed fałszowaniem żądań po stronie serwera (adresy 6to4 i IPv6 zgodne z IPv4)
- Adresu IP klienta nie można już podrobić przez X-Forwarded-For
- Udostępnione strony wpisów nie są już zapisywane w publicznych pamięciach podręcznych

**Poprawki**

- API Fever: oznaczanie gwiazdką, oznaczanie jako przeczytane i pobieranie elementów działają poprawnie
- Naprawiono awarię API Google Reader i rozróżnianie wielkości liter w kategoriach
- Akceptowane są kanały JSON z BOM oraz daty RFC 3339 pisane małymi literami
- Naprawiono surowe klucze tłumaczeń w niektórych komunikatach

Obraz Miniflux zawiera teraz aktualny magazyn certyfikatów, więc pakiet nie przebudowuje go już samodzielnie.`,
    fr_FR: `Miniflux mis à jour vers 2.3.5.

**Nouveautés**

- Attribution du rôle d’administrateur via OpenID Connect avec OAUTH2_ADMIN_GROUP et OAUTH2_GROUP_CLAIM
- Les clés d’accès peuvent être la seule méthode de connexion lorsque l’authentification locale est désactivée
- Les paramètres du nom d’utilisateur, du mot de passe, de la liaison de comptes et des clés d’accès passent sur une nouvelle page Authentification
- Les sélecteurs CSS invalides sont rejetés lors de l’enregistrement des règles de réécriture et d’extraction
- Moins de sessions inutilisées dans la base de données

**Sécurité**

- Le mot de passe actuel est requis pour en définir un nouveau, et les autres sessions sont déconnectées lors du changement
- Les administrateurs ne peuvent plus modifier leur propre compte depuis la page de gestion des utilisateurs
- Les cookies des flux ne sont envoyés qu’au site web du flux
- Un autre contournement de la protection contre la falsification de requêtes côté serveur a été corrigé (adresses 6to4 et IPv6 compatibles IPv4)
- L’adresse IP du client ne peut plus être usurpée via X-Forwarded-For
- Les pages d’articles partagées ne sont plus mises en cache publiquement

**Corrections**

- API Fever : le marquage en favori, le marquage comme lu et la récupération des éléments fonctionnent correctement
- Correction d’un plantage de l’API Google Reader et de la casse des catégories
- Les flux JSON avec marque d’ordre d’octets et les dates RFC 3339 en minuscules sont acceptés
- Correction de clés de traduction brutes affichées dans certains messages

L’image Miniflux inclut désormais un magasin de certificats à jour ; le paquet ne le reconstruit plus.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
