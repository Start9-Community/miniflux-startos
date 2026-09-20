# Miniflux

## Documentation

- [Miniflux documentation](https://miniflux.app/docs/) — the official user and admin guide, covering keyboard shortcuts, filtering rules, integrations, and the REST API.

## What you get on StartOS

Miniflux runs with its own dedicated PostgreSQL database, reachable at the Web Interface address
shown on this service's page. The admin account is created on the first start with the password you set.

## Getting set up

1. Run **Set Admin Password** — the service asks for it before it will start. It shows you your
   username and password; save them somewhere safe, since running the action again generates a
   new password.
2. Start Miniflux, open the Web Interface address and sign in with those credentials.
3. Start adding feeds — the **+** button in the web app accepts a feed URL, or a site URL it will
   try to discover a feed from.

## Using Miniflux

### Web interface

This is the full Miniflux app: your feed list, unread entries, search, and account settings all
live here. It's also where you create additional (non-admin) user accounts, if you want them.

### Actions

- **Set Admin Password** — generates a new admin password and shows it to you. Run it any time
  you've lost your password or want to rotate it. Change the password here rather than in
  Miniflux's own settings: the one set here is put back whenever the service starts.
- **Set Primary URL** — choose which of this service's reachable addresses Miniflux uses when it
  needs to build a link back to itself (for example, in the links it writes into feed entries).
  If you're not using any integrations that rely on links back to your Miniflux instance, you can
  leave this at its default.
