# Client app UI kit

An interactive recreation of the Faresay client experience (`/dashboard`, `/therapists`, `/book/[id]`).

- **index.html** — a working click-through: dashboard → find a therapist → pick a slot → confirm → the session appears back on your dashboard.
- **AppData.jsx** — fictional therapist seed data, slots and days.
- **Screens.jsx** — `AppNav`, `Dashboard`, `Directory` (with sort tabs), `Booking`, `Confirmation`.

Built on the design-system bundle — `TherapistCard`, `Card`, `Stat`, `Badge`, `Avatar`, `Button`, `Tag`, `Logo`. The directory and booking flow mirror the product's matching results and slot picker; data is fake (no real backend).
