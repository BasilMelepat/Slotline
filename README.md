# Slotline

Plan a start time for every mail and its projects. A MERN stack progressive web app (PWA) built for phones.

- **Mobile layout** with a bottom menu: Mails, Add, Account.
- **Two ways to save.** Sign in to save to the cloud (MongoDB). Or skip sign in and keep the list on the device.
- **Installable and offline.** Add it to the home screen. The app opens without a connection.
- **Same features as the original page:** live countdown with seconds, colour by time left, a throbbing green "Active" state, projects that switch between active and inactive, notes, a clock face time picker (10 minute steps), and sorting.

## Stack

| Part | Tech |
| --- | --- |
| Client | React 18, Vite, plain CSS, service worker written by hand |
| Server | Node 18+, Express, Mongoose |
| Database | MongoDB |
| Auth | Email and password, bcrypt hashes, JWT (30 days) |

## Run it

You need Node 18 or newer and a MongoDB (local, or a free Atlas cluster).

```bash
npm run install:all
cp server/.env.example server/.env     # then edit MONGODB_URI and JWT_SECRET
npm run dev
```

- App: http://localhost:5173 (the client proxies `/api` to the server)
- API: http://localhost:5000

To try it on a phone during development, open `http://<your-computer-ip>:5173` on the same Wi-Fi. Note that installing as an app and offline mode need HTTPS, so test those on a deployed copy.

## Build and deploy (one server)

```bash
npm run build      # builds client/dist
npm start          # the API also serves client/dist
```

Set these environment variables on your host:

| Name | Value |
| --- | --- |
| `MONGODB_URI` | your MongoDB connection string |
| `JWT_SECRET` | a long random string (the server refuses to start in production without one) |
| `NODE_ENV` | `production` |
| `PORT` | optional, default 5000 |

Serve it over HTTPS. Render, Railway, Fly.io and similar hosts do this for you. If you host the client and API on different domains, set `CLIENT_ORIGIN` on the server and `VITE_API_URL` when building the client.

## How saving works

- **First launch** shows Sign in, Create account and "Continue without an account".
- **Device mode** keeps the list in the browser's `localStorage`. Clearing site data removes it.
- **Cloud mode** keeps the list in MongoDB and a copy on the device so the app opens offline. Changes need a connection; if one fails the app tells you and puts the change back.
- **Signing in after using the device list** offers to upload the device list to the account. Mail ids already in the account are skipped.
- **Signing out** returns to device mode and shows the device list.
- The Account tab can export the current list as JSON.

## API

All `/api/mails` routes need `Authorization: Bearer <token>`.

| Method and path | Purpose |
| --- | --- |
| `POST /api/auth/register` | `{ email, password, name? }` returns `{ token, user }` |
| `POST /api/auth/login` | `{ email, password }` returns `{ token, user }` |
| `GET /api/auth/me` | current user |
| `GET /api/mails` | list your mails |
| `POST /api/mails` | create a mail |
| `PUT /api/mails/:id` | replace a mail |
| `DELETE /api/mails/:id` | delete a mail |
| `POST /api/mails/bulk` | `{ items: [...] }` import a device list, skipping duplicate mail ids |

A mail looks like this:

```json
{
  "id": "…",
  "mail": "priya@example.com",
  "start": "15:30",
  "at": 1767004200000,
  "activeNow": false,
  "note": "Call after lunch",
  "projects": [{ "name": "Website relaunch", "active": true }, { "name": "Onboarding", "active": false }]
}
```

`start` is 24 hour time. `at` is when the countdown ends, in milliseconds. A mail with `activeNow: true` has no start time.

## Project layout

```
slotline/
  client/
    public/            manifest, service worker, icons
    src/
      screens/         Mails, Add, Account, Auth
      components/      MailCard, ClockSheet, BottomNav, ProjectChip
      store.jsx        device and cloud storage in one place
      lib/             time rules, API helper
  server/
    src/
      models/          User, Mail
      routes/          auth, mails
```

## App name and icons

The app is called **Slotline**. Icons are in `client/public/icons`: a clock with a green "active" dot on a navy square. `icon.svg` and `icon-maskable.svg` are the sources. The 192, 512, maskable and Apple touch PNGs were rendered from them. If you change the artwork, re-export the PNGs at the same sizes.

## Versions

Slotline uses major.minor.patch versions. The root `package.json` holds the version. One command updates it everywhere.

| Command | Use it for | Example |
| --- | --- | --- |
| `npm run version:patch` | bug fixes and small tweaks | 1.0.1 to 1.0.2 |
| `npm run version:minor` | new features that keep everything else working | 1.0.2 to 1.1.0 |
| `npm run version:major` | changes that break something that worked before | 1.1.0 to 2.0.0 |
| `npm run version:show` | print the current version | |
| `node scripts/bump.mjs 2.3.4` | set an exact version | |

A bump changes `package.json` in the root, `client` and `server`, the service worker cache name (so installed apps fetch the new files), and adds a section to `CHANGELOG.md` for you to fill in. The version appears on the Account tab and at `GET /api/health`.

## Good next steps

- Password reset by email, and a "delete my account" action.
- Push notifications when a countdown ends (needs a push service and a saved subscription per device).
- Background sync, so changes made offline in cloud mode are sent when the connection returns.
