The Faresay surface — white, rounded-3xl (24px), 1px sand border, quiet shadow. Everything sits on a card.

```jsx
<Card>
  <h3>Your clients stay yours</h3>
  <p>You own the relationship and the record.</p>
</Card>

<Card interactive as="a" href="/therapists/123">…</Card>
```

`interactive` adds the hover lift (border warms to brand, shadow deepens) used on therapist and listing cards. `padding` is `sm`/`md`/`lg`/`xl` or a raw value. Use `as` to render as a link or section.
