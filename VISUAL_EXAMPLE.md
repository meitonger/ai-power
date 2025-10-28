# Visual Example - Status Management UI

## Admin Dashboard Table View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Admin Dashboard - Truck Schedule                        📅 Calendar │ 📋 Table │
└──────────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━┳━━━━━━━━┓
┃    When     ┃  User   ┃ Vehicle ┃  Schedule Status     ┃ Window ┃ Actions┃
┃             ┃         ┃         ┃  & Dispatch          ┃        ┃        ┃
┡━━━━━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━╇━━━━━━━━┩
│ Nov 2, 2025 │ John    │ Toyota  │ ● [Customer Confirm ▼]│ Window │  Edit  │
│ 10:00 AM    │ Doe     │ Camry   │   🟢 Confirmed       │ Mode   │        │
│             │         │ 2023    │ ● [Complete        ▼]│        │        │
│             │         │         │   🟢 Complete        │        │        │
├─────────────┼─────────┼─────────┼──────────────────────┼────────┼────────┤
│ Nov 3, 2025 │ Jane    │ Honda   │ ● [Sent to Customer▼]│ Window │  Edit  │
│ 2:00 PM     │ Smith   │ Accord  │   🟠 Waiting         │ Mode   │        │
│             │         │ 2022    │ ● [Assigned        ▼]│        │        │
│             │         │         │   🟠 Tech Assigned   │        │        │
├─────────────┼─────────┼─────────┼──────────────────────┼────────┼────────┤
│ Nov 4, 2025 │ Bob     │ Ford    │ ● [Draft           ▼]│ Window │  Edit  │
│ 9:00 AM     │ Wilson  │ F-150   │   ⚪ Not Started    │ Mode   │        │
│             │         │ 2024    │ ● [Unassigned      ▼]│        │        │
│             │         │         │   ⚪ No Tech Yet     │        │        │
└─────────────┴─────────┴─────────┴──────────────────────┴────────┴────────┘
```

## Status Dropdowns

### Schedule State Dropdown:
```
┌─────────────────────────┐
│ ● Draft                 │
│ ● Internal Confirmed    │
│ ● Sent to Customer      │  ← Orange dot
│ ● Customer Confirmed    │  ← Green dot
│ ● Customer Declined     │
│ ● Cancelled             │
└─────────────────────────┘
```

### Dispatch Status Dropdown:
```
┌─────────────────────────┐
│ ● Unassigned            │
│ ● Assigned              │
│ ● In Route              │
│ ● Complete              │  ← Green dot
└─────────────────────────┘
```

## How It Works

1. **View the Dashboard**: Navigate to Admin Dashboard and switch to "Table" view

2. **See Status Indicators**: Each appointment shows:
   - A colored dot (●) next to the status
   - A dropdown menu to change the status
   - Two rows: Schedule State (top) and Dispatch Status (bottom)

3. **Change Status**: Simply click the dropdown and select a new status
   - The change is saved immediately via GraphQL mutation
   - The colored dot updates to match the new status
   - No page refresh needed!

4. **Color Meanings**:
   - 🟢 **Green**: Everything is confirmed/complete
   - 🟠 **Orange**: Waiting for customer response or tech is assigned
   - 🔵 **Blue**: Internal processes (internal confirmed, tech in route)
   - ⚪ **Gray**: Not started yet (draft, unassigned)
   - 🔴 **Red**: Declined or cancelled

## Example Workflow

```
Step 1: New appointment created
        Status: ● Draft (Gray)

Step 2: Admin reviews and approves internally
        Status: ● Internal Confirmed (Blue)

Step 3: Send confirmation email to customer
        Status: ● Sent to Customer (Orange)  ← This is ORANGE as requested!

Step 4: Customer confirms
        Status: ● Customer Confirmed (Green)  ← This is GREEN as requested!

Step 5: Assign technician
        Dispatch: ● Assigned (Orange)

Step 6: Tech is on the way
        Dispatch: ● In Route (Blue)

Step 7: Job complete
        Dispatch: ● Complete (Green)
```

## API Usage

### Change Schedule State
```graphql
mutation {
  updateScheduleState(
    appointmentId: "abc-123",
    state: "CUSTOMER_CONFIRMED"
  )
}
```

### Change Dispatch Status
```graphql
mutation {
  updateDispatchStatus(
    appointmentId: "abc-123",
    status: "IN_ROUTE"
  )
}
```

---

✨ **You now have a fully functional status management system with visual indicators!**
