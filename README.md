# Meridian Reality – White-label Real Estate Platform

A full-stack website for a premium real estate agency, built as a white-label
product. The UI is in Slovak, aimed at the Slovak market. The codebase is in
English.

| Layer    | Stack                                                                                         |
| -------- | --------------------------------------------------------------------------------------------- |
| Backend  | Python 3, Django, Django REST Framework, django-filter, django-cors-headers, Pillow            |
| Frontend | Angular (standalone components, Signals, zoneless, strict TypeScript), pure SCSS design system |
| Database | SQLite (local), PostgreSQL via `DATABASE_URL` (production)                                    |

```
.
├── backend/     Django project (config/) + `properties` app (models, API, admin, seed)
└── frontend/    Angular app (core/, shared/, pages/, styles/)
```

---

## Quick start

### 1. Backend (http://localhost:8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional – sensible defaults are built in
python manage.py migrate
python manage.py seed_data         # demo agents, 12 listings, demo admin user
python manage.py runserver
```

`seed_data` is idempotent. You can run it as often as you like and it updates
the same records instead of duplicating them. Use `--no-admin` to skip creating
the demo superuser.

### 2. Frontend (http://localhost:4200)

```bash
cd frontend
npm install
npm start                          # = ng serve
```

The dev build calls the API at `http://localhost:8000/api`
(`src/environments/environment.ts`). If port 8000 is taken, run
`python manage.py runserver 8001` and change `apiUrl` there.

### Django Admin

| URL        | http://localhost:8000/admin |
| ---------- | --------------------------- |
| Username   | `admin`                     |
| Password   | `Reality2024!`              |

The demo superuser is only created when `DJANGO_DEBUG=True`. **Change the
password, or create your own user with `python manage.py createsuperuser`,
before any deployment.**

From the admin, agents can:

- manage listings, photo galleries (inline, with previews) and agents
- set the status badge (*Exkluzívne, Novinka, Znížená cena, Rezervované, Predané*) and the
  "featured" flag directly from the list view
- review viewing requests, valuation requests and contact messages, and mark them as resolved

---

## REST API (`/api/`)

| Method | Endpoint                    | Notes                                                                                                                         |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/properties/`          | Filters: `transaction`, `property_type`, `city`, `min_price`, `max_price`, `min_area`, `max_area`, `rooms` (5 = 5+), `featured`, `agent`, `ordering` (`price`, `-price`, `-created_at`) |
| GET    | `/api/properties/<slug>/`   | Full detail incl. gallery `images` and nested `agent`                                                                         |
| GET    | `/api/agents/`              | Agents with `active_listings_count` (listings not marked as sold)                                                              |
| POST   | `/api/inquiries/`           | Viewing request: `property` (slug), `client_name`, `email`, `phone`, `preferred_datetime?`, `message?`                       |
| POST   | `/api/valuations/`          | Valuation lead: `property_type`, `location`, `floor_area`, `rooms`, `condition`, `owner_name`, `phone`, `email`, `notes?`      |
| POST   | `/api/contact/`             | General contact form: `name`, `email`, `phone?`, `subject?`, `message`                                                       |

Validation errors come back as HTTP 400 with Slovak messages per field. The
lead endpoints are throttled to 20 requests per hour per client.

---

## White-labelling for a new client

1. **Branding and business details:** edit
   `frontend/src/app/core/config/site.config.ts`. It holds the agency name,
   logo text, phone, email, address and map coordinates, IČO/DIČ/IČ DPH, IBAN,
   social links, office hours, metrics, value propositions, testimonials,
   search locations and hero images.
2. **Colours and fonts:** either set `theme` in `site.config.ts` (applied at
   runtime as CSS custom properties) or change the defaults in
   `frontend/src/styles/_variables.scss`. Fonts are loaded in
   `frontend/src/index.html`.
3. **Page title and meta:** `frontend/src/index.html`. The favicon is
   `frontend/public/favicon.svg`.
4. **Listings and agents:** manage them in Django Admin, or adapt
   `backend/properties/management/commands/seed_data.py`.

### Design system

`frontend/src/styles/`:

- `_variables.scss` holds the design tokens (palette, typography, spacing,
  breakpoints, motion).
- `_mixins.scss` holds the responsive `up()`/`down()` mixins, container,
  eyebrow, skeleton, focus ring and similar helpers.
- `_typography.scss` holds the editorial type scale (Cormorant Garamond +
  Plus Jakarta Sans).
- `_base.scss` holds the `:root` CSS custom properties and the reset.
- `_components.scss` holds buttons, form controls, badges, chips, grids and
  skeletons.

Component styles can `@use 'variables'` and `@use 'mixins'` directly, through
`stylePreprocessorOptions.includePaths`.

---

## Production notes

Backend (`backend/.env`):

```
DJANGO_SECRET_KEY=<long random string>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=www.example.sk
CORS_ALLOWED_ORIGINS=https://www.example.sk
DATABASE_URL=postgres://user:password@host:5432/dbname   # pip install "psycopg[binary]"
```

Then run `python manage.py collectstatic` and serve Django with gunicorn/uwsgi.

Frontend: `npm run build` writes to `frontend/dist/frontend/browser`. The
production build expects the API on the same origin under `/api`
(`src/environments/environment.prod.ts`), for example through an nginx reverse
proxy. Serve `index.html` as the fallback for client-side routes.

---

## Verification

```bash
# backend
cd backend && python manage.py check && python manage.py test properties

# frontend
cd frontend && npx ng build && npx ng test --watch=false
```
