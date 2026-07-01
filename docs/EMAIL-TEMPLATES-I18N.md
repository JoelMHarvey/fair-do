# Email Templates — Translations (es · fr · de · it · pt)

Translations for the 16 email templates flagged as **English-only** in
[Email Flows & Templates](/founder/email-flows). Produced by a 5-locale
translation + placeholder-integrity/brand-voice QA pass (one agent translates,
a second verifies every `{token}` survived untouched and the tone matches
fair-do's brand voice — calm, plain, warm, direct — before shipping).

**Status: translation only, not yet wired into the app.** These are not live —
`src/lib/email.ts` still sends the English strings for every flow below. To ship
a language, an engineer needs to: (1) add each block under `email.*` in the
matching `src/messages/{locale}.json` using the keys below, (2) refactor the
corresponding `send*` function in `email.ts` to call `getDictionary(emailLocale(...))`
the same way `sendTeacherApproved`, `sendSessionReminder`, and `sendGiftVoucher`
already do, and (3) replace the hardcoded English strings with `interpolate(t.key, {...})`.
The three flows *already* localised (`teacher_approved`, `gift_voucher`,
`session_reminder`) are not repeated here — see `src/messages/*.json`.

**Verified:** every `{token}` (e.g. `{firstName}`, `{practiceName}`, `{date}`) is
identical across all 5 languages for every one of the 99 translated strings —
checked programmatically, not just by the QA agent's self-report.

**Two flows are intentionally left English-only everywhere and are NOT included
below:** the teacher copy of `sendBookingConfirmed` and `sendCancellationNotice`
(per the existing code comment: "always platform-branded, always en-GB") and
`sendOpsAlert` (internal ops inbox only).

---

## Quick reference — subject lines across all 5 languages

| Template | ES | FR | DE | IT | PT |
|---|---|---|---|---|---|
| Teacher rejected | Tu solicitud en fair-do — próximos pasos | Votre candidature fair-do — les prochaines étapes | Deine fair-do-Bewerbung — die nächsten Schritte | La tua candidatura fair-do — prossimi passi | A tua candidatura fair-do — próximos passos |
| Credential expiry reminder | Recordatorio: tu {label} caduca en {daysUntil} días | Rappel : votre {label} expire dans {daysUntil} jours | Erinnerung: {label} läuft in {daysUntil} Tagen ab | Promemoria: il tuo {label} scade tra {daysUntil} giorni | Lembrete: o teu {label} expira dentro de {daysUntil} dias |
| Credential suspended | Tu perfil de fair-do se ha pausado | Votre profil fair-do a été suspendu | Dein fair-do-Profil wurde pausiert | Il tuo profilo fair-do è stato sospeso | O teu perfil fair-do foi suspenso |
| Self-booking confirm | Confirma tu clase con {practiceName} | Confirmez votre cours avec {practiceName} | Bestätige deine Lektion bei {practiceName} | Conferma la tua lezione con {practiceName} | Confirma a tua aula com {practiceName} |
| Booking confirmed (student copy) | Clase confirmada — {practiceName}, {date} | Cours confirmé — {practiceName}, {date} | Lektion bestätigt — {practiceName}, {date} | Lezione confermata — {practiceName}, {date} | Aula confirmada — {practiceName}, {date} |
| No-show notice | Sobre tu clase — {date} | À propos de votre cours — {date} | Zu deiner Lektion — {date} | La tua lezione del {date} | Sobre a tua aula — {date} |
| Client invite | {practiceName} te ha invitado a reservar clases en fair-do | {practiceName} vous invite à réserver des cours sur fair-do | {practiceName} hat dich eingeladen, auf fair-do Lektionen zu buchen | {practiceName} ti ha invitato a prenotare lezioni su fair-do | {practiceName} convidou-te a marcar aulas na fair-do |
| Session scheduled by teacher | Confirma tu clase con {practiceName} — {date} | Confirmez votre cours avec {practiceName} — {date} | Bestätige deine Lektion bei {practiceName} — {date} | Conferma la tua lezione con {practiceName} — {date} | Confirma a tua aula com {practiceName} — {date} |
| Event invite (fixed phrases) | Hola {firstName}: | Bonjour {firstName}, | Hallo {firstName}, | Ciao {firstName}, | Olá, {firstName}, |
| Session series scheduled | {count} clases reservadas con {practiceName} — a partir del {date} | {count} cours réservés avec {practiceName} — à partir du {date} | {count} Lektionen gebucht bei {practiceName} — ab {date} | {count} lezioni prenotate con {practiceName} — a partire dal {date} | {count} aulas marcadas com {practiceName} — a começar {date} |
| Package offered | {practiceName} — tu {packageName} | {practiceName} — votre {packageName} | {practiceName} — dein {packageName} | {practiceName} — il tuo {packageName} | {practiceName} — o teu {packageName} |
| Cancellation notice (student copy) | Clase cancelada — {date} | Cours annulé — {date} | Lektion abgesagt — {date} | Lezione cancellata — {date} | Aula cancelada — {date} |
| Parent invite | Sigue las clases de {studentFirstName} en fair-do | Suivez les cours de {studentFirstName} sur fair-do | Verfolge {studentFirstName}s Nachhilfe auf fair-do | Segui le lezioni di {studentFirstName} su fair-do | Acompanha as explicações de {studentFirstName} na fair-do |
| Parent receipt | Recibo — {amountLabel} por las clases de {studentFirstName} | Reçu — {amountLabel} pour les cours de {studentFirstName} | Quittung — {amountLabel} für {studentFirstName}s Nachhilfe | Ricevuta — {amountLabel} per le lezioni di {studentFirstName} | Recibo — {amountLabel} pelas explicações de {studentFirstName} |
| Admin message (fixed phrases) | Hola {firstName}: | Bonjour {firstName}, | Hallo {firstName}, | Ciao {firstName}, | Olá, {firstName}, |
| Client broadcast (fixed phrases) | Hola {firstName}: | Bonjour {firstName}, | Hallo {firstName}, | Ciao {firstName}, | Olá, {firstName}, |

---

## Spanish (Español) — `es`

Ready to merge into `src/messages/es.json` under the `email` key (add each
block as a new sibling of `teacher_approved` / `gift_voucher` / `session_reminder`).

### Teacher rejected — `sendTeacherRejected`

```json
"teacher_rejected": {
  "subject": "Tu solicitud en fair-do — próximos pasos",
  "heading": "Hola {firstName}:",
  "body_p1": "No hemos podido verificar tu titulación de {qualificationBody} con los datos facilitados — suele deberse a una cualificación caducada o a un error en los datos de la referencia.",
  "body_p2": "Vuelve a solicitarlo con los datos actualizados, o escribe a support@fair-do.com si crees que se trata de un error."
}
```

### Credential expiry reminder — `sendCredentialExpiryReminder`

```json
"credential_expiry_reminder": {
  "subject_expiring": "Recordatorio: tu {label} caduca en {daysUntil} días",
  "subject_expired": "Acción necesaria: tu {label} ha caducado",
  "heading_expiring": "Tu {label} caduca pronto",
  "heading_expired": "Tu {label} ha caducado",
  "body_expiring": "Tu {label} registrado caduca el {when} — dentro de {daysUntil} días. Renuévalo con tiempo para que tu perfil siga activo.",
  "body_expired": "Según nuestros registros, tu {label} caducó el {when}. Para mantener activo tu perfil de fair-do, renuévalo y actualiza tus datos. Si no contamos con una fecha válida, tu perfil quedará pausado para nuevas reservas.",
  "body_note": "¿Ya lo has renovado? Actualiza la fecha en tu perfil y dejarás de recibir este recordatorio.",
  "cta": "Actualizar mis datos"
}
```

### Credential suspended — `sendCredentialSuspended`

```json
"credential_suspended": {
  "subject": "Tu perfil de fair-do se ha pausado",
  "heading": "Tu perfil se ha pausado",
  "body_p1": "Tu {label} caducó el {when} y ya ha superado nuestro periodo de gracia, así que hemos pausado tu perfil para nuevas reservas.",
  "body_p2": "Las clases ya reservadas no se ven afectadas — sigue impartiéndolas con normalidad. Para reactivar tu perfil, renueva tu {label} y actualiza la fecha, o escribe a support@fair-do.com si necesitas ayuda.",
  "cta": "Actualizar mis datos"
}
```

### Self-booking confirm — `sendSelfBookingConfirm`

```json
"self_booking_confirm": {
  "subject": "Confirma tu clase con {practiceName}",
  "heading": "Confirma tu reserva",
  "body_p1": "Has solicitado una clase con {practiceName} el {when}. Toca abajo para confirmar — tu reserva no queda fijada hasta que lo hagas.",
  "body_p2": "¿No has solicitado esto? Puedes ignorar este correo; no se ha reservado nada.",
  "cta": "Confirmar mi clase"
}
```

### Booking confirmed (student copy) — `sendBookingConfirmed`

```json
"booking_confirmed_student": {
  "subject": "Clase confirmada — {practiceName}, {date}",
  "heading": "Ya tienes tu reserva, {firstName}",
  "body_tutor_label": "Profesor/a:",
  "body_when_label": "Cuándo:",
  "body_paid_label": "Pagado:",
  "body_ics_note": "Adjuntamos la invitación de calendario, y la videollamada se abre 10 minutos antes de tu clase.",
  "body_cancel_note": "¿Necesitas cancelar? {cancelLink} — sin coste hasta {hours} horas antes.",
  "cancel_link_text": "Gestionar tu reserva",
  "cta": "Ver clase"
}
```

### No-show notice — `sendNoShowNotice`

```json
"no_show_notice": {
  "subject": "Sobre tu clase — {date}",
  "heading": "Hola {firstName}:",
  "body_student_no_show": "Según nuestros registros, no asististe a la clase con {practiceName} del {date}. Como el profesor sí estaba disponible, esta clase no es reembolsable — pero si algo salió mal, cuéntanoslo.",
  "body_teacher_no_show": "Lo sentimos — parece que tu profesor no se conectó a la clase del {date}.",
  "body_no_one_joined": "Parece que la clase del {date} no llegó a celebrarse.",
  "body_refunded": "Se ha emitido un reembolso completo — los reembolsos con tarjeta tardan de 5 a 10 días laborables; el saldo en crédito o bono ya está disponible.",
  "cta": "Reservar otra clase"
}
```

### Client invite — `sendClientInvite`

```json
"client_invite": {
  "subject": "{practiceName} te ha invitado a reservar clases en fair-do",
  "heading": "Hola {firstName}:",
  "body_p1": "{practiceName} quiere verte en fair-do — un lugar sencillo y seguro para reservar clases, unirte por videollamada y pagar, todo en un mismo sitio.",
  "body_rate_line": "Tu tarifa por clase es de {rate}/clase.",
  "body_p2": "Aceptar solo te vincula al estudio de tu profesor — no se cobra nada hasta que reserves una clase.",
  "cta": "Aceptar tu invitación"
}
```

### Session scheduled by teacher — `sendSessionScheduledByTherapist`

```json
"session_scheduled_by_therapist": {
  "subject_needs_pay": "Confirma tu clase con {practiceName} — {date}",
  "subject_confirmed": "Clase reservada con {practiceName} — {date}",
  "heading": "Hola {firstName}:",
  "body_p1": "{practiceName} te ha programado una clase.",
  "body_when_label": "Cuándo:",
  "body_amount_label": "Importe a confirmar:",
  "body_fee_label": "Tarifa:",
  "body_needs_pay_note": "Toca abajo para confirmar y pagar de forma segura. Tu videollamada se abre 10 minutos antes de la clase.",
  "body_confirmed_note": "Tu videollamada se abre 10 minutos antes de la clase. Tu profesor acordará el pago contigo directamente.",
  "cta_confirm_pay": "Confirmar y pagar",
  "cta_view": "Ver clase"
}
```

### Event invite (fixed phrases) — `sendClientEventInvite`

```json
"client_event_invite_wrapper": {
  "greeting": "Hola {firstName}:",
  "when_label": "Cuándo:",
  "where_label": "Dónde:",
  "join_label": "Acceso:",
  "join_link_text": "Abrir enlace",
  "ics_note": "Adjuntamos la invitación de calendario — ábrela para añadir esto a tu calendario.",
  "footer_note": "Recibes este correo porque eres alumno/a de {practiceName} en fair-do."
}
```

### Session series scheduled — `sendSessionSeriesScheduled`

```json
"session_series_scheduled": {
  "subject": "{count} clases reservadas con {practiceName} — a partir del {date}",
  "heading": "Hola {firstName}:",
  "body_p1": "{practiceName} te ha programado un bloque semanal de clases.",
  "body_lessons_label": "Clases:",
  "body_first_lesson_label": "Primera clase:",
  "body_via_package": "Estas clases se descuentan de tu bono — no tienes nada más que pagar. Cada sala se abre 10 minutos antes.",
  "body_direct_pay": "Tu profesor acordará el pago contigo directamente. Cada sala se abre 10 minutos antes.",
  "cta": "Ver tu próxima clase"
}
```

### Package offered — `sendPackageOffered`

```json
"package_offered": {
  "subject": "{practiceName} — tu {packageName}",
  "heading": "Hola {firstName}:",
  "body_p1": "{practiceName} te ha ofrecido un bono de clases.",
  "body_package_label": "Bono:",
  "body_lessons_label": "Clases:",
  "body_total_label": "Total:",
  "body_note": "Paga una sola vez a continuación — después, cada clase que reserves se descontará de tu bono, sin necesidad de tarjeta.",
  "cta": "Comprar bono"
}
```

### Cancellation notice (student copy) — `sendCancellationNotice`

```json
"cancellation_notice_student": {
  "subject": "Clase cancelada — {date}",
  "heading": "Clase cancelada",
  "body_p1": "Tu clase con {practiceName} del {date} se ha cancelado.",
  "body_refunded": "Se ha emitido un reembolso completo — los reembolsos con tarjeta aparecen en 5 a 10 días laborables; el saldo en crédito o bono ya está disponible.",
  "body_not_refunded": "Como esta cancelación se ha producido dentro del plazo de {hours} horas, no procede reembolso.",
  "cta": "Buscar otro horario"
}
```

### Parent invite — `sendParentInvite`

```json
"parent_invite": {
  "subject": "Sigue las clases de {studentFirstName} en fair-do",
  "heading": "Mantente al tanto de las clases de {studentFirstName}",
  "body_p1": "{teacherName} te ha invitado a seguir las clases de {studentFirstName} en fair-do.",
  "body_p2": "El portal de padres te da visibilidad completa — próximas clases, asistencia, facturas y contacto directo con el profesor — por 4,99 £/mes. Cancela cuando quieras.",
  "body_p3": "Toca abajo para configurarlo.",
  "cta": "Abrir el portal de padres"
}
```

### Parent receipt — `sendParentReceipt`

```json
"parent_receipt": {
  "subject": "Recibo — {amountLabel} por las clases de {studentFirstName}",
  "heading": "Pago recibido",
  "body_p1": "Gracias — hemos recibido {amountLabel} por {description} ({studentFirstName}).",
  "body_p2": "Tu recibo detallado está disponible para consultar y descargar a continuación.",
  "cta": "Ver recibo"
}
```

### Admin message (fixed phrases) — `sendTeacherAdminMessage`

```json
"admin_message_wrapper": {
  "greeting": "Hola {firstName}:",
  "signoff": "— El equipo de fair-do"
}
```

### Client broadcast (fixed phrases) — `sendClientBroadcast`

```json
"client_broadcast_wrapper": {
  "greeting": "Hola {firstName}:",
  "footer_note": "Recibes este correo porque eres alumno/a de {practiceName} en fair-do."
}
```

---

## French (Français) — `fr`

Ready to merge into `src/messages/fr.json` under the `email` key (add each
block as a new sibling of `teacher_approved` / `gift_voucher` / `session_reminder`).

### Teacher rejected — `sendTeacherRejected`

```json
"teacher_rejected": {
  "subject": "Votre candidature fair-do — les prochaines étapes",
  "heading": "Bonjour {firstName},",
  "body_p1": "Nous n'avons pas pu vérifier vos qualifications {qualificationBody} avec les informations fournies — il s'agit souvent d'une qualification expirée ou d'une erreur dans les références indiquées.",
  "body_p2": "Merci de refaire une demande avec des informations à jour, ou d'écrire à support@fair-do.com si vous pensez qu'il s'agit d'une erreur."
}
```

### Credential expiry reminder — `sendCredentialExpiryReminder`

```json
"credential_expiry_reminder": {
  "subject_expiring": "Rappel : votre {label} expire dans {daysUntil} jours",
  "subject_expired": "Action requise : votre {label} a expiré",
  "heading_expiring": "Votre {label} expire bientôt",
  "heading_expired": "Votre {label} a expiré",
  "body_expiring": "Votre {label} enregistré expire le {when} — soit dans {daysUntil} jours. Merci de le renouveler à temps pour que votre profil reste actif.",
  "body_expired": "Selon nos informations, votre {label} a expiré le {when}. Pour que votre profil fair-do reste actif, merci de le renouveler et de mettre à jour vos informations. Si nous n'avons pas de date valide enregistrée, votre profil sera suspendu pour les nouvelles réservations.",
  "body_note": "Déjà renouvelé ? Mettez à jour la date sur votre profil et ce rappel s'arrêtera.",
  "cta": "Mettre à jour mes informations"
}
```

### Credential suspended — `sendCredentialSuspended`

```json
"credential_suspended": {
  "subject": "Votre profil fair-do a été suspendu",
  "heading": "Votre profil a été suspendu",
  "body_p1": "Votre {label} a expiré le {when} et le délai de grâce est maintenant dépassé, nous avons donc suspendu votre profil pour les nouvelles réservations.",
  "body_p2": "Les cours déjà réservés ne sont pas affectés — merci de continuer à les honorer. Pour réactiver votre profil, renouvelez votre {label} et mettez à jour la date sur votre profil, ou écrivez à support@fair-do.com pour obtenir de l'aide.",
  "cta": "Mettre à jour mes informations"
}
```

### Self-booking confirm — `sendSelfBookingConfirm`

```json
"self_booking_confirm": {
  "subject": "Confirmez votre cours avec {practiceName}",
  "heading": "Confirmez votre réservation",
  "body_p1": "Vous avez demandé un cours avec {practiceName} le {when}. Confirmez ci-dessous — votre réservation n'est pas garantie tant que vous ne l'avez pas fait.",
  "body_p2": "Vous n'êtes pas à l'origine de cette demande ? Vous pouvez ignorer cet e-mail ; rien n'a été réservé.",
  "cta": "Confirmer mon cours"
}
```

### Booking confirmed (student copy) — `sendBookingConfirmed`

```json
"booking_confirmed_student": {
  "subject": "Cours confirmé — {practiceName}, {date}",
  "heading": "C'est réservé, {firstName}",
  "body_tutor_label": "Professeur :",
  "body_when_label": "Quand :",
  "body_paid_label": "Payé :",
  "body_ics_note": "L'invitation calendrier est jointe, et la salle vidéo ouvre 10 minutes avant votre cours.",
  "body_cancel_note": "Besoin d'annuler ? {cancelLink} — gratuit jusqu'à {hours} heures avant.",
  "cancel_link_text": "Gérer ma réservation",
  "cta": "Voir le cours"
}
```

### No-show notice — `sendNoShowNotice`

```json
"no_show_notice": {
  "subject": "À propos de votre cours — {date}",
  "heading": "Bonjour {firstName},",
  "body_student_no_show": "Selon nos informations, le cours avec {practiceName} du {date} n'a pas été suivi de votre côté. Le professeur étant disponible, ce cours n'est pas remboursable — mais si quelque chose s'est mal passé, dites-le-nous.",
  "body_teacher_no_show": "Nous sommes désolés — il semble que votre professeur ne se soit pas connecté au cours du {date}.",
  "body_no_one_joined": "Il semble que le cours du {date} n'ait pas eu lieu.",
  "body_refunded": "Un remboursement intégral a été effectué — les remboursements par carte apparaissent sous 5 à 10 jours ouvrés ; les fonds en crédit/bon d'achat sont déjà de retour dans votre solde.",
  "cta": "Réserver un autre cours"
}
```

### Client invite — `sendClientInvite`

```json
"client_invite": {
  "subject": "{practiceName} vous invite à réserver des cours sur fair-do",
  "heading": "Bonjour {firstName},",
  "body_p1": "{practiceName} aimerait vous retrouver sur fair-do — un espace simple et sécurisé pour réserver des cours, les suivre par vidéo et régler vos paiements, le tout au même endroit.",
  "body_rate_line": "Votre tarif de cours est de {rate}/cours.",
  "body_p2": "Accepter vous relie simplement au studio de votre professeur — rien n'est facturé tant que vous n'avez pas réservé de cours.",
  "cta": "Accepter l'invitation"
}
```

### Session scheduled by teacher — `sendSessionScheduledByTherapist`

```json
"session_scheduled_by_therapist": {
  "subject_needs_pay": "Confirmez votre cours avec {practiceName} — {date}",
  "subject_confirmed": "Cours réservé avec {practiceName} — {date}",
  "heading": "Bonjour {firstName},",
  "body_p1": "{practiceName} a programmé un cours pour vous.",
  "body_when_label": "Quand :",
  "body_amount_label": "Montant à confirmer :",
  "body_fee_label": "Tarif :",
  "body_needs_pay_note": "Confirmez et réglez en toute sécurité ci-dessous. Votre salle vidéo ouvre 10 minutes avant le cours.",
  "body_confirmed_note": "Votre salle vidéo ouvre 10 minutes avant le cours. Votre professeur réglera le paiement directement avec vous.",
  "cta_confirm_pay": "Confirmer et payer",
  "cta_view": "Voir le cours"
}
```

### Event invite (fixed phrases) — `sendClientEventInvite`

```json
"client_event_invite_wrapper": {
  "greeting": "Bonjour {firstName},",
  "when_label": "Quand :",
  "where_label": "Où :",
  "join_label": "Rejoindre :",
  "join_link_text": "Ouvrir le lien",
  "ics_note": "L'invitation calendrier est jointe — ouvrez-la pour l'ajouter à votre calendrier.",
  "footer_note": "Vous recevez cet e-mail car vous êtes élève de {practiceName} sur fair-do."
}
```

### Session series scheduled — `sendSessionSeriesScheduled`

```json
"session_series_scheduled": {
  "subject": "{count} cours réservés avec {practiceName} — à partir du {date}",
  "heading": "Bonjour {firstName},",
  "body_p1": "{practiceName} a programmé une série hebdomadaire de cours pour vous.",
  "body_lessons_label": "Cours :",
  "body_first_lesson_label": "Premier cours :",
  "body_via_package": "Ces cours sont inclus dans votre forfait — rien de plus à payer. Chaque salle ouvre 10 minutes avant.",
  "body_direct_pay": "Votre professeur réglera le paiement directement avec vous. Chaque salle ouvre 10 minutes avant.",
  "cta": "Voir votre prochain cours"
}
```

### Package offered — `sendPackageOffered`

```json
"package_offered": {
  "subject": "{practiceName} — votre {packageName}",
  "heading": "Bonjour {firstName},",
  "body_p1": "{practiceName} vous a proposé un forfait de cours.",
  "body_package_label": "Forfait :",
  "body_lessons_label": "Cours :",
  "body_total_label": "Total :",
  "body_note": "Réglez en une fois ci-dessous — chaque cours que vous réservez ensuite est prélevé sur votre forfait, sans carte nécessaire.",
  "cta": "Acheter le forfait"
}
```

### Cancellation notice (student copy) — `sendCancellationNotice`

```json
"cancellation_notice_student": {
  "subject": "Cours annulé — {date}",
  "heading": "Cours annulé",
  "body_p1": "Votre cours avec {practiceName} du {date} a été annulé.",
  "body_refunded": "Un remboursement intégral a été effectué — les remboursements par carte apparaissent sous 5 à 10 jours ouvrés ; les fonds en crédit/bon d'achat sont déjà de retour dans votre solde.",
  "body_not_refunded": "Cette annulation ayant eu lieu dans la fenêtre d'annulation de {hours} heures, aucun remboursement n'est possible.",
  "cta": "Trouver un autre créneau"
}
```

### Parent invite — `sendParentInvite`

```json
"parent_invite": {
  "subject": "Suivez les cours de {studentFirstName} sur fair-do",
  "heading": "Restez informé(e) des cours de {studentFirstName}",
  "body_p1": "{teacherName} vous a invité(e) à suivre les cours de {studentFirstName} sur fair-do.",
  "body_p2": "L'espace parent vous donne une visibilité complète — cours à venir, présence, factures, et un contact direct avec le professeur — pour 4,99 £/mois. Résiliable à tout moment.",
  "body_p3": "Configurez-le en un clic ci-dessous.",
  "cta": "Ouvrir l'espace parent"
}
```

### Parent receipt — `sendParentReceipt`

```json
"parent_receipt": {
  "subject": "Reçu — {amountLabel} pour les cours de {studentFirstName}",
  "heading": "Paiement reçu",
  "body_p1": "Merci — nous avons bien reçu {amountLabel} pour {description} ({studentFirstName}).",
  "body_p2": "Votre reçu détaillé est disponible à consulter et à télécharger ci-dessous.",
  "cta": "Voir le reçu"
}
```

### Admin message (fixed phrases) — `sendTeacherAdminMessage`

```json
"admin_message_wrapper": {
  "greeting": "Bonjour {firstName},",
  "signoff": "— L'équipe fair-do"
}
```

### Client broadcast (fixed phrases) — `sendClientBroadcast`

```json
"client_broadcast_wrapper": {
  "greeting": "Bonjour {firstName},",
  "footer_note": "Vous recevez cet e-mail car vous êtes élève de {practiceName} sur fair-do."
}
```

---

## German (Deutsch) — `de`

Ready to merge into `src/messages/de.json` under the `email` key (add each
block as a new sibling of `teacher_approved` / `gift_voucher` / `session_reminder`).

### Teacher rejected — `sendTeacherRejected`

```json
"teacher_rejected": {
  "subject": "Deine fair-do-Bewerbung — die nächsten Schritte",
  "heading": "Hallo {firstName},",
  "body_p1": "Wir konnten deine {qualificationBody}-Qualifikation anhand der angegebenen Daten nicht verifizieren — meist liegt das an einer abgelaufenen Qualifikation oder einem Fehler in den Referenzangaben.",
  "body_p2": "Bitte bewirb dich mit aktualisierten Angaben erneut, oder schreib uns an support@fair-do.com, falls du denkst, dass hier ein Fehler vorliegt."
}
```

### Credential expiry reminder — `sendCredentialExpiryReminder`

```json
"credential_expiry_reminder": {
  "subject_expiring": "Erinnerung: {label} läuft in {daysUntil} Tagen ab",
  "subject_expired": "Handlungsbedarf: {label} ist abgelaufen",
  "heading_expiring": "{label} läuft bald ab",
  "heading_expired": "{label} ist abgelaufen",
  "body_expiring": "Dein hinterlegtes {label} läuft am {when} ab — das sind noch {daysUntil} Tage. Bitte erneuere es rechtzeitig, damit dein Profil aktiv bleibt.",
  "body_expired": "Unseren Unterlagen zufolge ist dein {label} am {when} abgelaufen. Damit dein fair-do-Profil aktiv bleibt, erneuere es bitte und aktualisiere deine Angaben. Liegt uns kein gültiges Datum vor, wird dein Profil für neue Buchungen pausiert.",
  "body_note": "Schon erneuert? Aktualisiere das Datum in deinem Profil, dann endet diese Erinnerung.",
  "cta": "Angaben aktualisieren"
}
```

### Credential suspended — `sendCredentialSuspended`

```json
"credential_suspended": {
  "subject": "Dein fair-do-Profil wurde pausiert",
  "heading": "Dein Profil wurde pausiert",
  "body_p1": "Dein {label} ist am {when} abgelaufen und liegt inzwischen außerhalb unserer Kulanzfrist. Deshalb haben wir dein Profil für neue Buchungen pausiert.",
  "body_p2": "Bereits gebuchte Lektionen sind davon nicht betroffen — bitte führe sie wie geplant durch. Um dein Profil zu reaktivieren, erneuere dein {label} und aktualisiere das Datum in deinem Profil, oder schreib uns an support@fair-do.com — wir helfen gern.",
  "cta": "Angaben aktualisieren"
}
```

### Self-booking confirm — `sendSelfBookingConfirm`

```json
"self_booking_confirm": {
  "subject": "Bestätige deine Lektion bei {practiceName}",
  "heading": "Bestätige deine Buchung",
  "body_p1": "Du hast eine Lektion bei {practiceName} am {when} angefragt. Tippe unten, um zu bestätigen — deine Buchung ist erst gesichert, wenn du das getan hast.",
  "body_p2": "Hast du das nicht angefragt? Dann kannst du diese E-Mail einfach ignorieren — es wurde nichts gebucht.",
  "cta": "Lektion bestätigen"
}
```

### Booking confirmed (student copy) — `sendBookingConfirmed`

```json
"booking_confirmed_student": {
  "subject": "Lektion bestätigt — {practiceName}, {date}",
  "heading": "Du bist gebucht, {firstName}",
  "body_tutor_label": "Nachhilfelehrer/in:",
  "body_when_label": "Wann:",
  "body_paid_label": "Bezahlt:",
  "body_ics_note": "Die Kalendereinladung ist angehängt, und der Videoraum öffnet sich 10 Minuten vor deiner Lektion.",
  "body_cancel_note": "Musst du absagen? {cancelLink} — kostenlos bis {hours} Stunden vorher.",
  "cancel_link_text": "Buchung verwalten",
  "cta": "Lektion ansehen"
}
```

### No-show notice — `sendNoShowNotice`

```json
"no_show_notice": {
  "subject": "Zu deiner Lektion — {date}",
  "heading": "Hallo {firstName},",
  "body_student_no_show": "Unseren Unterlagen zufolge hast du an der Lektion bei {practiceName} am {date} nicht teilgenommen. Da der/die Nachhilfelehrer/in verfügbar war, ist diese Lektion nicht erstattungsfähig — falls jedoch etwas schiefgelaufen ist, lass es uns wissen.",
  "body_teacher_no_show": "Es tut uns leid — es sieht so aus, als hätte dein/e Nachhilfelehrer/in die Lektion am {date} nicht wahrgenommen.",
  "body_no_one_joined": "Es sieht so aus, als hätte die Lektion am {date} nicht stattgefunden.",
  "body_refunded": "Eine vollständige Rückerstattung wurde veranlasst — Rückbuchungen auf die Karte dauern 5–10 Werktage; Guthaben oder Gutscheine stehen bereits jetzt wieder zur Verfügung.",
  "cta": "Weitere Lektion buchen"
}
```

### Client invite — `sendClientInvite`

```json
"client_invite": {
  "subject": "{practiceName} hat dich eingeladen, auf fair-do Lektionen zu buchen",
  "heading": "Hallo {firstName},",
  "body_p1": "{practiceName} möchte dich auf fair-do begrüßen — ein einfacher, sicherer Ort, um Lektionen zu buchen, per Video teilzunehmen und zu bezahlen, alles an einem Platz.",
  "body_rate_line": "Dein Lektionspreis beträgt {rate}/Lektion.",
  "body_p2": "Mit der Annahme verbindest du dich einfach mit dem Studio deines/deiner Nachhilfelehrers/in — berechnet wird erst, wenn du eine Lektion buchst.",
  "cta": "Einladung annehmen"
}
```

### Session scheduled by teacher — `sendSessionScheduledByTherapist`

```json
"session_scheduled_by_therapist": {
  "subject_needs_pay": "Bestätige deine Lektion bei {practiceName} — {date}",
  "subject_confirmed": "Lektion gebucht bei {practiceName} — {date}",
  "heading": "Hallo {firstName},",
  "body_p1": "{practiceName} hat eine Lektion für dich angesetzt.",
  "body_when_label": "Wann:",
  "body_amount_label": "Zu bestätigender Betrag:",
  "body_fee_label": "Gebühr:",
  "body_needs_pay_note": "Tippe unten, um sicher zu bestätigen und zu bezahlen. Dein Videoraum öffnet sich 10 Minuten vor der Lektion.",
  "body_confirmed_note": "Dein Videoraum öffnet sich 10 Minuten vor der Lektion. Dein/e Nachhilfelehrer/in klärt die Bezahlung direkt mit dir.",
  "cta_confirm_pay": "Bestätigen & bezahlen",
  "cta_view": "Lektion ansehen"
}
```

### Event invite (fixed phrases) — `sendClientEventInvite`

```json
"client_event_invite_wrapper": {
  "greeting": "Hallo {firstName},",
  "when_label": "Wann:",
  "where_label": "Wo:",
  "join_label": "Teilnehmen:",
  "join_link_text": "Link öffnen",
  "ics_note": "Die Kalendereinladung ist angehängt — öffne sie, um den Termin in deinen Kalender zu übernehmen.",
  "footer_note": "Du erhältst diese E-Mail, weil du Schüler/in von {practiceName} auf fair-do bist."
}
```

### Session series scheduled — `sendSessionSeriesScheduled`

```json
"session_series_scheduled": {
  "subject": "{count} Lektionen gebucht bei {practiceName} — ab {date}",
  "heading": "Hallo {firstName},",
  "body_p1": "{practiceName} hat eine wöchentliche Serie für dich angesetzt.",
  "body_lessons_label": "Lektionen:",
  "body_first_lesson_label": "Erste Lektion:",
  "body_via_package": "Diese stammen aus deinem Paket — es ist nichts weiter zu bezahlen. Jeder Raum öffnet sich 10 Minuten vorher.",
  "body_direct_pay": "Dein/e Nachhilfelehrer/in klärt die Bezahlung direkt mit dir. Jeder Raum öffnet sich 10 Minuten vorher.",
  "cta": "Nächste Lektion ansehen"
}
```

### Package offered — `sendPackageOffered`

```json
"package_offered": {
  "subject": "{practiceName} — dein {packageName}",
  "heading": "Hallo {firstName},",
  "body_p1": "{practiceName} hat dir ein Lektionspaket angeboten.",
  "body_package_label": "Paket:",
  "body_lessons_label": "Lektionen:",
  "body_total_label": "Gesamt:",
  "body_note": "Zahle unten einmalig — danach wird jede gebuchte Lektion von deinem Paket abgezogen, ganz ohne Karte.",
  "cta": "Paket kaufen"
}
```

### Cancellation notice (student copy) — `sendCancellationNotice`

```json
"cancellation_notice_student": {
  "subject": "Lektion abgesagt — {date}",
  "heading": "Lektion abgesagt",
  "body_p1": "Deine Lektion bei {practiceName} am {date} wurde abgesagt.",
  "body_refunded": "Eine vollständige Rückerstattung wurde veranlasst — Rückbuchungen auf die Karte erscheinen innerhalb von 5–10 Werktagen; Guthaben oder Gutscheine stehen bereits jetzt wieder zur Verfügung.",
  "body_not_refunded": "Da dies innerhalb des {hours}-Stunden-Stornofensters abgesagt wurde, ist keine Rückerstattung möglich.",
  "cta": "Anderen Termin finden"
}
```

### Parent invite — `sendParentInvite`

```json
"parent_invite": {
  "subject": "Verfolge {studentFirstName}s Nachhilfe auf fair-do",
  "heading": "Bleib auf dem Laufenden über {studentFirstName}s Lektionen",
  "body_p1": "{teacherName} hat dich eingeladen, {studentFirstName}s Nachhilfe auf fair-do zu verfolgen.",
  "body_p2": "Das Eltern-Portal gibt dir vollen Überblick — anstehende Lektionen, Anwesenheit, Rechnungen und eine direkte Verbindung zum/zur Nachhilfelehrer/in — für £4,99/Monat. Jederzeit kündbar.",
  "body_p3": "Tippe unten, um loszulegen.",
  "cta": "Eltern-Portal öffnen"
}
```

### Parent receipt — `sendParentReceipt`

```json
"parent_receipt": {
  "subject": "Quittung — {amountLabel} für {studentFirstName}s Nachhilfe",
  "heading": "Zahlung erhalten",
  "body_p1": "Danke — wir haben {amountLabel} für {description} ({studentFirstName}) erhalten.",
  "body_p2": "Deine detaillierte Quittung kannst du unten ansehen und herunterladen.",
  "cta": "Quittung ansehen"
}
```

### Admin message (fixed phrases) — `sendTeacherAdminMessage`

```json
"admin_message_wrapper": {
  "greeting": "Hallo {firstName},",
  "signoff": "— Dein fair-do-Team"
}
```

### Client broadcast (fixed phrases) — `sendClientBroadcast`

```json
"client_broadcast_wrapper": {
  "greeting": "Hallo {firstName},",
  "footer_note": "Du erhältst diese E-Mail, weil du Schüler/in von {practiceName} auf fair-do bist."
}
```

---

## Italian (Italiano) — `it`

Ready to merge into `src/messages/it.json` under the `email` key (add each
block as a new sibling of `teacher_approved` / `gift_voucher` / `session_reminder`).

### Teacher rejected — `sendTeacherRejected`

```json
"teacher_rejected": {
  "subject": "La tua candidatura fair-do — prossimi passi",
  "heading": "Ciao {firstName},",
  "body_p1": "Non siamo riusciti a verificare le tue credenziali {qualificationBody} con i dati forniti — spesso si tratta di una qualifica scaduta o di un errore nei dati di riferimento.",
  "body_p2": "Ricandidati con i dati aggiornati, oppure scrivi a support@fair-do.com se pensi si tratti di un errore."
}
```

### Credential expiry reminder — `sendCredentialExpiryReminder`

```json
"credential_expiry_reminder": {
  "subject_expiring": "Promemoria: il tuo {label} scade tra {daysUntil} giorni",
  "subject_expired": "Azione richiesta: il tuo {label} è scaduto",
  "heading_expiring": "Il tuo {label} scade a breve",
  "heading_expired": "Il tuo {label} è scaduto",
  "body_expiring": "Il tuo {label} registrato scade il {when} — mancano {daysUntil} giorni. Rinnovalo per tempo così il tuo profilo resta attivo.",
  "body_expired": "I nostri dati indicano che il tuo {label} è scaduto il {when}. Per mantenere attivo il tuo profilo fair-do, rinnovalo e aggiorna i tuoi dati. Se non riceviamo una data valida, il tuo profilo verrà sospeso dalle nuove prenotazioni.",
  "body_note": "Hai già rinnovato? Aggiorna la data sul tuo profilo e questo promemoria si ferma.",
  "cta": "Aggiorna i miei dati"
}
```

### Credential suspended — `sendCredentialSuspended`

```json
"credential_suspended": {
  "subject": "Il tuo profilo fair-do è stato sospeso",
  "heading": "Il tuo profilo è stato sospeso",
  "body_p1": "Il tuo {label} è scaduto il {when} e ha ormai superato il periodo di tolleranza, quindi abbiamo sospeso il tuo profilo dalle nuove prenotazioni.",
  "body_p2": "Le lezioni già prenotate non sono interessate — continua a svolgerle regolarmente. Per riattivare il profilo, rinnova il tuo {label} e aggiorna la data, oppure scrivi a support@fair-do.com per assistenza.",
  "cta": "Aggiorna i miei dati"
}
```

### Self-booking confirm — `sendSelfBookingConfirm`

```json
"self_booking_confirm": {
  "subject": "Conferma la tua lezione con {practiceName}",
  "heading": "Conferma la tua prenotazione",
  "body_p1": "Hai richiesto una lezione con {practiceName} per il {when}. Tocca qui sotto per confermare — la prenotazione non è garantita finché non lo fai.",
  "body_p2": "Non hai richiesto tu questa lezione? Puoi ignorare questa email: non è stato prenotato nulla.",
  "cta": "Conferma la mia lezione"
}
```

### Booking confirmed (student copy) — `sendBookingConfirmed`

```json
"booking_confirmed_student": {
  "subject": "Lezione confermata — {practiceName}, {date}",
  "heading": "Prenotazione confermata, {firstName}",
  "body_tutor_label": "Insegnante:",
  "body_when_label": "Quando:",
  "body_paid_label": "Pagato:",
  "body_ics_note": "L'invito al calendario è allegato e la stanza video si apre 10 minuti prima della lezione.",
  "body_cancel_note": "Devi cancellare? {cancelLink} — gratis fino a {hours} ore prima.",
  "cancel_link_text": "Gestisci la tua prenotazione",
  "cta": "Vai alla lezione"
}
```

### No-show notice — `sendNoShowNotice`

```json
"no_show_notice": {
  "subject": "La tua lezione del {date}",
  "heading": "Ciao {firstName},",
  "body_student_no_show": "I nostri dati indicano che non hai seguito la lezione con {practiceName} del {date}. Poiché l'insegnante era disponibile, questa lezione non è rimborsabile — ma se qualcosa è andato storto, faccelo sapere.",
  "body_teacher_no_show": "Ci dispiace — risulta che il tuo insegnante non si sia collegato alla lezione del {date}.",
  "body_no_one_joined": "Risulta che la lezione del {date} non si sia svolta.",
  "body_refunded": "È stato emesso un rimborso completo — i rimborsi su carta richiedono 5-10 giorni lavorativi; i fondi in credito/voucher sono già disponibili nel tuo saldo.",
  "cta": "Prenota un'altra lezione"
}
```

### Client invite — `sendClientInvite`

```json
"client_invite": {
  "subject": "{practiceName} ti ha invitato a prenotare lezioni su fair-do",
  "heading": "Ciao {firstName},",
  "body_p1": "{practiceName} vorrebbe vederti su fair-do — uno spazio semplice e sicuro per prenotare lezioni, partecipare via video e pagare, tutto in un unico posto.",
  "body_rate_line": "La tua tariffa è {rate}/lezione.",
  "body_p2": "Accettare ti collega semplicemente allo studio del tuo insegnante — non viene addebitato nulla finché non prenoti una lezione.",
  "cta": "Accetta il tuo invito"
}
```

### Session scheduled by teacher — `sendSessionScheduledByTherapist`

```json
"session_scheduled_by_therapist": {
  "subject_needs_pay": "Conferma la tua lezione con {practiceName} — {date}",
  "subject_confirmed": "Lezione prenotata con {practiceName} — {date}",
  "heading": "Ciao {firstName},",
  "body_p1": "{practiceName} ha programmato una lezione per te.",
  "body_when_label": "Quando:",
  "body_amount_label": "Importo da confermare:",
  "body_fee_label": "Tariffa:",
  "body_needs_pay_note": "Tocca qui sotto per confermare e pagare in sicurezza. La stanza video si apre 10 minuti prima della lezione.",
  "body_confirmed_note": "La stanza video si apre 10 minuti prima della lezione. Il tuo insegnante si accorderà direttamente con te per il pagamento.",
  "cta_confirm_pay": "Conferma e paga",
  "cta_view": "Vai alla lezione"
}
```

### Event invite (fixed phrases) — `sendClientEventInvite`

```json
"client_event_invite_wrapper": {
  "greeting": "Ciao {firstName},",
  "when_label": "Quando:",
  "where_label": "Dove:",
  "join_label": "Collegamento:",
  "join_link_text": "Apri il link",
  "ics_note": "L'invito al calendario è allegato — aprilo per aggiungerlo al tuo calendario.",
  "footer_note": "Ricevi questa email perché sei uno studente di {practiceName} su fair-do."
}
```

### Session series scheduled — `sendSessionSeriesScheduled`

```json
"session_series_scheduled": {
  "subject": "{count} lezioni prenotate con {practiceName} — a partire dal {date}",
  "heading": "Ciao {firstName},",
  "body_p1": "{practiceName} ha programmato per te un ciclo settimanale di lezioni.",
  "body_lessons_label": "Lezioni:",
  "body_first_lesson_label": "Prima lezione:",
  "body_via_package": "Queste lezioni fanno parte del tuo pacchetto — non c'è altro da pagare. Ogni stanza si apre 10 minuti prima.",
  "body_direct_pay": "Il tuo insegnante si accorderà direttamente con te per il pagamento. Ogni stanza si apre 10 minuti prima.",
  "cta": "Vai alla tua prossima lezione"
}
```

### Package offered — `sendPackageOffered`

```json
"package_offered": {
  "subject": "{practiceName} — il tuo {packageName}",
  "heading": "Ciao {firstName},",
  "body_p1": "{practiceName} ti ha proposto un pacchetto di lezioni.",
  "body_package_label": "Pacchetto:",
  "body_lessons_label": "Lezioni:",
  "body_total_label": "Totale:",
  "body_note": "Paga una volta sola qui sotto — poi ogni lezione che prenoti verrà scalata dal pacchetto, senza bisogno di carta.",
  "cta": "Acquista il pacchetto"
}
```

### Cancellation notice (student copy) — `sendCancellationNotice`

```json
"cancellation_notice_student": {
  "subject": "Lezione cancellata — {date}",
  "heading": "Lezione cancellata",
  "body_p1": "La tua lezione con {practiceName} del {date} è stata cancellata.",
  "body_refunded": "È stato emesso un rimborso completo — i rimborsi su carta compaiono entro 5-10 giorni lavorativi; i fondi in credito/voucher sono già disponibili nel tuo saldo.",
  "body_not_refunded": "Poiché la cancellazione è avvenuta entro la finestra di {hours} ore, non è previsto alcun rimborso.",
  "cta": "Trova un altro orario"
}
```

### Parent invite — `sendParentInvite`

```json
"parent_invite": {
  "subject": "Segui le lezioni di {studentFirstName} su fair-do",
  "heading": "Resta aggiornato sulle lezioni di {studentFirstName}",
  "body_p1": "{teacherName} ti ha invitato a seguire le lezioni di {studentFirstName} su fair-do.",
  "body_p2": "Il portale genitori ti offre visibilità completa — prossime lezioni, presenze, fatture e un contatto diretto con l'insegnante — per £4,99/mese. Disdici quando vuoi.",
  "body_p3": "Tocca qui sotto per attivarlo.",
  "cta": "Apri il portale genitori"
}
```

### Parent receipt — `sendParentReceipt`

```json
"parent_receipt": {
  "subject": "Ricevuta — {amountLabel} per le lezioni di {studentFirstName}",
  "heading": "Pagamento ricevuto",
  "body_p1": "Grazie — abbiamo ricevuto {amountLabel} per {description} ({studentFirstName}).",
  "body_p2": "La tua ricevuta dettagliata è disponibile per la visualizzazione e il download qui sotto.",
  "cta": "Vedi la ricevuta"
}
```

### Admin message (fixed phrases) — `sendTeacherAdminMessage`

```json
"admin_message_wrapper": {
  "greeting": "Ciao {firstName},",
  "signoff": "— Il team di fair-do"
}
```

### Client broadcast (fixed phrases) — `sendClientBroadcast`

```json
"client_broadcast_wrapper": {
  "greeting": "Ciao {firstName},",
  "footer_note": "Ricevi questa email perché sei uno studente di {practiceName} su fair-do."
}
```

---

## Portuguese (Português) — `pt`

Ready to merge into `src/messages/pt.json` under the `email` key (add each
block as a new sibling of `teacher_approved` / `gift_voucher` / `session_reminder`).

### Teacher rejected — `sendTeacherRejected`

```json
"teacher_rejected": {
  "subject": "A tua candidatura fair-do — próximos passos",
  "heading": "Olá, {firstName},",
  "body_p1": "Não conseguimos validar as tuas credenciais de {qualificationBody} com os dados fornecidos — normalmente isto deve-se a uma qualificação expirada ou a um erro na referência indicada.",
  "body_p2": "Por favor, candidata-te novamente com dados atualizados, ou envia um email para support@fair-do.com se achares que isto é um engano."
}
```

### Credential expiry reminder — `sendCredentialExpiryReminder`

```json
"credential_expiry_reminder": {
  "subject_expiring": "Lembrete: o teu {label} expira dentro de {daysUntil} dias",
  "subject_expired": "Ação necessária: o teu {label} expirou",
  "heading_expiring": "O teu {label} expira em breve",
  "heading_expired": "O teu {label} expirou",
  "body_expiring": "O teu {label} em ficheiro expira a {when} — faltam {daysUntil} dias. Por favor, renova-o com antecedência para o teu perfil se manter ativo.",
  "body_expired": "Os nossos registos mostram que o teu {label} expirou a {when}. Para manter o teu perfil fair-do ativo, por favor renova-o e atualiza os teus dados. Se não tivermos uma data válida em ficheiro, o teu perfil será suspenso de novas marcações.",
  "body_note": "Já renovaste? Atualiza a data no teu perfil e este lembrete deixa de ser enviado.",
  "cta": "Atualizar os meus dados"
}
```

### Credential suspended — `sendCredentialSuspended`

```json
"credential_suspended": {
  "subject": "O teu perfil fair-do foi suspenso",
  "heading": "O teu perfil foi suspenso",
  "body_p1": "O teu {label} expirou a {when} e já ultrapassou o nosso período de tolerância, por isso suspendemos o teu perfil de aceitar novas marcações.",
  "body_p2": "As aulas já marcadas não são afetadas — continua a realizá-las normalmente. Para reativares o perfil, renova o teu {label} e atualiza a data no teu perfil, ou envia um email para support@fair-do.com para obteres ajuda.",
  "cta": "Atualizar os meus dados"
}
```

### Self-booking confirm — `sendSelfBookingConfirm`

```json
"self_booking_confirm": {
  "subject": "Confirma a tua aula com {practiceName}",
  "heading": "Confirma a tua marcação",
  "body_p1": "Pediste uma aula com {practiceName} para {when}. Toca abaixo para confirmar — a tua marcação só fica reservada depois de confirmares.",
  "body_p2": "Não pediste isto? Podes ignorar este email; não foi feita nenhuma marcação.",
  "cta": "Confirmar a minha aula"
}
```

### Booking confirmed (student copy) — `sendBookingConfirmed`

```json
"booking_confirmed_student": {
  "subject": "Aula confirmada — {practiceName}, {date}",
  "heading": "A tua aula está marcada, {firstName}",
  "body_tutor_label": "Explicador:",
  "body_when_label": "Quando:",
  "body_paid_label": "Pago:",
  "body_ics_note": "O convite de calendário vai em anexo, e a sala de vídeo abre 10 minutos antes da tua aula.",
  "body_cancel_note": "Precisas de cancelar? {cancelLink} — grátis até {hours} horas antes.",
  "cancel_link_text": "Gerir a minha marcação",
  "cta": "Ver aula"
}
```

### No-show notice — `sendNoShowNotice`

```json
"no_show_notice": {
  "subject": "Sobre a tua aula — {date}",
  "heading": "Olá, {firstName},",
  "body_student_no_show": "Os nossos registos mostram que a aula com {practiceName} a {date} não foi frequentada da tua parte. Como o explicador estava disponível, esta aula não é reembolsável — mas se algo correu mal, conta-nos.",
  "body_teacher_no_show": "Lamentamos — parece que o teu explicador não entrou na aula a {date}.",
  "body_no_one_joined": "Parece que a aula a {date} não chegou a realizar-se.",
  "body_refunded": "Foi emitido um reembolso total — os reembolsos no cartão levam 5 a 10 dias úteis; os fundos em crédito/vale já estão disponíveis no teu saldo.",
  "cta": "Marcar outra aula"
}
```

### Client invite — `sendClientInvite`

```json
"client_invite": {
  "subject": "{practiceName} convidou-te a marcar aulas na fair-do",
  "heading": "Olá, {firstName},",
  "body_p1": "{practiceName} gostaria de te ver na fair-do — um espaço simples e seguro para marcar aulas, entrar por vídeo e pagar, tudo num só lugar.",
  "body_rate_line": "O valor da tua aula é {rate}/aula.",
  "body_p2": "Aceitar apenas te liga ao estúdio do teu explicador — nada é cobrado até marcares uma aula.",
  "cta": "Aceitar o convite"
}
```

### Session scheduled by teacher — `sendSessionScheduledByTherapist`

```json
"session_scheduled_by_therapist": {
  "subject_needs_pay": "Confirma a tua aula com {practiceName} — {date}",
  "subject_confirmed": "Aula marcada com {practiceName} — {date}",
  "heading": "Olá, {firstName},",
  "body_p1": "{practiceName} marcou uma aula para ti.",
  "body_when_label": "Quando:",
  "body_amount_label": "Valor a confirmar:",
  "body_fee_label": "Custo:",
  "body_needs_pay_note": "Toca abaixo para confirmar e pagar em segurança. A tua sala de vídeo abre 10 minutos antes da aula.",
  "body_confirmed_note": "A tua sala de vídeo abre 10 minutos antes da aula. O teu explicador vai combinar o pagamento diretamente contigo.",
  "cta_confirm_pay": "Confirmar e pagar",
  "cta_view": "Ver aula"
}
```

### Event invite (fixed phrases) — `sendClientEventInvite`

```json
"client_event_invite_wrapper": {
  "greeting": "Olá, {firstName},",
  "when_label": "Quando:",
  "where_label": "Onde:",
  "join_label": "Entrar:",
  "join_link_text": "Abrir link",
  "ics_note": "O convite de calendário vai em anexo — abre-o para adicionares isto ao teu calendário.",
  "footer_note": "Estás a receber este email porque és aluno/a de {practiceName} na fair-do."
}
```

### Session series scheduled — `sendSessionSeriesScheduled`

```json
"session_series_scheduled": {
  "subject": "{count} aulas marcadas com {practiceName} — a começar {date}",
  "heading": "Olá, {firstName},",
  "body_p1": "{practiceName} marcou uma série semanal de aulas para ti.",
  "body_lessons_label": "Aulas:",
  "body_first_lesson_label": "Primeira aula:",
  "body_via_package": "Estas aulas vêm do teu pacote — não há mais nada a pagar. Cada sala abre 10 minutos antes.",
  "body_direct_pay": "O teu explicador vai combinar o pagamento diretamente contigo. Cada sala abre 10 minutos antes.",
  "cta": "Ver a tua próxima aula"
}
```

### Package offered — `sendPackageOffered`

```json
"package_offered": {
  "subject": "{practiceName} — o teu {packageName}",
  "heading": "Olá, {firstName},",
  "body_p1": "{practiceName} ofereceu-te um pacote de aulas.",
  "body_package_label": "Pacote:",
  "body_lessons_label": "Aulas:",
  "body_total_label": "Total:",
  "body_note": "Paga uma vez abaixo — depois cada aula que marcares é descontada do teu pacote, sem precisares de cartão.",
  "cta": "Comprar pacote"
}
```

### Cancellation notice (student copy) — `sendCancellationNotice`

```json
"cancellation_notice_student": {
  "subject": "Aula cancelada — {date}",
  "heading": "Aula cancelada",
  "body_p1": "A tua aula com {practiceName} a {date} foi cancelada.",
  "body_refunded": "Foi emitido um reembolso total — os reembolsos no cartão aparecem em 5 a 10 dias úteis; os fundos em crédito/vale já estão disponíveis no teu saldo.",
  "body_not_refunded": "Como este cancelamento ocorreu dentro da janela de cancelamento de {hours} horas, não há reembolso disponível.",
  "cta": "Encontrar outro horário"
}
```

### Parent invite — `sendParentInvite`

```json
"parent_invite": {
  "subject": "Acompanha as explicações de {studentFirstName} na fair-do",
  "heading": "Fica a par das aulas de {studentFirstName}",
  "body_p1": "{teacherName} convidou-te a acompanhar as explicações de {studentFirstName} na fair-do.",
  "body_p2": "O portal para pais dá-te visibilidade total — próximas aulas, presenças, faturas e uma linha direta com o explicador — por £4,99/mês. Cancela quando quiseres.",
  "body_p3": "Toca abaixo para o configurares.",
  "cta": "Abrir o portal para pais"
}
```

### Parent receipt — `sendParentReceipt`

```json
"parent_receipt": {
  "subject": "Recibo — {amountLabel} pelas explicações de {studentFirstName}",
  "heading": "Pagamento recebido",
  "body_p1": "Obrigado — recebemos {amountLabel} por {description} ({studentFirstName}).",
  "body_p2": "O teu recibo detalhado está disponível para consultar e descarregar abaixo.",
  "cta": "Ver recibo"
}
```

### Admin message (fixed phrases) — `sendTeacherAdminMessage`

```json
"admin_message_wrapper": {
  "greeting": "Olá, {firstName},",
  "signoff": "— A equipa fair-do"
}
```

### Client broadcast (fixed phrases) — `sendClientBroadcast`

```json
"client_broadcast_wrapper": {
  "greeting": "Olá, {firstName},",
  "footer_note": "Estás a receber este email porque és aluno/a de {practiceName} na fair-do."
}
```

---
