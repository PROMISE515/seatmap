# SeatMap Invite Codes

Invite codes are one-time promo passes for creators or partners. A code is redeemed inside the
Travel Pass paywall and unlocks the existing pass logic on that device.

## Create one lifetime creator code

Run this in Supabase SQL editor after the invite-code migration is applied:

```sql
insert into public.invite_codes (code, label, pass_days, max_redemptions)
values ('CREATOR-LIFETIME-001', 'Creator lifetime pass', 36500, 1);
```

## Create a 14-day test code

```sql
insert into public.invite_codes (code, label, pass_days, max_redemptions)
values ('CREATOR-14D-001', 'Creator 14-day test pass', 14, 1);
```

## Create several one-time creator codes

```sql
insert into public.invite_codes (code, label, pass_days, max_redemptions)
values
  ('BLOGGER-ANNA-001', 'Anna lifetime pass', 36500, 1),
  ('BLOGGER-MIKE-001', 'Mike lifetime pass', 36500, 1),
  ('BLOGGER-SOFIA-001', 'Sofia lifetime pass', 36500, 1);
```

`max_redemptions = 1` means the code can only be redeemed once globally.
