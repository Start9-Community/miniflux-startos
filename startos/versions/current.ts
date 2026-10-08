import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.3.3:1',
  releaseNotes: {
    en_US: `- Open UI opens Miniflux at its primary URL when your connection can reach it.
- When the port of the primary URL changes, as after a restore from backup, Miniflux follows it instead of asking you to choose again.
- Set Primary URL's description explains what the address is used for, including that passkeys work only at that address.`,
    es_ES: `- Abrir interfaz abre Miniflux en su URL principal cuando su conexión puede alcanzarla.
- Cuando cambia el puerto de la URL principal, como tras restaurar una copia de seguridad, Miniflux lo sigue en lugar de pedirle que vuelva a elegir.
- La descripción de Establecer URL principal explica para qué se usa la dirección, incluido que las llaves de acceso solo funcionan en ella.`,
    de_DE: `- „Oberfläche öffnen“ öffnet Miniflux unter seiner primären URL, wenn Ihre Verbindung sie erreichen kann.
- Ändert sich der Port der primären URL, etwa nach einer Wiederherstellung aus einem Backup, folgt Miniflux ihm, statt Sie erneut wählen zu lassen.
- Die Beschreibung von „Primäre URL festlegen“ erklärt, wofür die Adresse verwendet wird, einschließlich dass Passkeys nur unter dieser Adresse funktionieren.`,
    pl_PL: `- „Otwórz interfejs” otwiera Miniflux pod jego głównym adresem URL, gdy Twoje połączenie może go osiągnąć.
- Gdy zmieni się port głównego adresu URL, na przykład po przywróceniu z kopii zapasowej, Miniflux podąża za nim, zamiast prosić o ponowny wybór.
- Opis akcji „Ustaw adres główny” wyjaśnia, do czego służy adres, w tym że klucze dostępu działają tylko pod nim.`,
    fr_FR: `- Ouvrir l'interface ouvre Miniflux sur son URL principale lorsque votre connexion peut l'atteindre.
- Lorsque le port de l'URL principale change, comme après une restauration depuis une sauvegarde, Miniflux le suit au lieu de vous demander de choisir à nouveau.
- La description de « Définir l'URL principale » explique à quoi sert l'adresse, y compris que les clés d'accès ne fonctionnent qu'à cette adresse.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
