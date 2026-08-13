# VVOS Layer 05 — Deal & Delivery

Layer 05 turns an accepted quote into a controlled delivery process.

## Modules
- Deal creation and lifecycle
- Purchase agreement and document dossier
- Warranty package selection
- Finance application status
- Deposit and balance payments
- Registration status
- Delivery checklist by department
- Personal customer portal
- Delivery readiness gate

## Deal lifecycle
`draft → awaiting_signature → signed → payment_pending → paid → registration → preparation → ready → delivered`

A vehicle may only be delivered when payment is complete, registration is completed and every mandatory delivery task is marked done.

## Safety
Payment and electronic-signature endpoints remain in preview mode until provider credentials and provider-specific SDK implementations are tested. Never store identity documents or payment card data directly in Firestore.
