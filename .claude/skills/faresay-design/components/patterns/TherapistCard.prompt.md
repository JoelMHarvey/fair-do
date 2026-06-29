The core Faresay marketplace object — a therapist listing row composing Avatar, Badge, Tag and Button.

```jsx
<TherapistCard
  name="Priya Patel"
  credential="✓ BACP verified"
  tagline="Anxiety & burnout"
  bio="I help people untangle anxiety and rebuild a steadier pace of life."
  price="£55"
  rating={4.9}
  ratingCount={28}
  founding
  bestMatch
  specialisms={['Anxiety', 'CBT', 'Burnout', 'EMDR']}
  nextAvailable="Tomorrow 14:00"
  onBook={() => {}}
  onView={() => {}}
/>
```

Pass pre-formatted `price`/`nextAvailable` strings. Drop `onBook`/`onView` to render a static (clickable-wrapper) card. Badges layer automatically: best match → rating → founding.
