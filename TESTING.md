# Testing Notes

## Final-submit routing regression checklist

1. Sign in as User A and create a group.
2. Copy invite link and join as User B in a separate browser/session.
3. User A answers first, User B answers second.
4. Verify the second submit redirects to `/groups/[groupId]/round/reveal`.
5. Repeat with reversed order: User B answers first, User A answers second.
6. Verify the second submit again redirects to `/groups/[groupId]/round/reveal`.
7. In both orders, verify neither user sees a 404 and both can open:
   - `/groups/[groupId]`
   - `/groups/[groupId]/round`
   - `/groups/[groupId]/round/reveal`

## Invite flow while logged out (existing user)

1. Log out.
2. Open a valid invite URL directly (`/join/[token]`).
3. Verify redirect to `/signin?callbackUrl=/join/[token]`.
4. Sign in with an existing account.
5. Verify you return to `/join/[token]` and can join immediately.
6. Verify you are redirected into the invited group after pressing **Join group** (no manual reopen needed).

## Invite flow for brand-new user

1. Open a valid invite URL in a fresh/logged-out session.
2. Sign in with a new email/name (first-time user creation).
3. Verify you return to `/join/[token]` after auth.
4. Press **Join group** and verify successful join on first attempt.

## Invalid/expired invite handling

- Open an invalid invite token and verify the join screen shows a friendly invalid-link message.
- Open an expired invite token and verify the join screen shows an expired-link message.
- In both cases, verify there is a safe path back to `/groups`.

## Stale session check after local DB reset

- If the local SQLite DB is reset while a browser session cookie still exists, joining a group should not surface raw Prisma FK errors.
- Expected behavior: server action recovers by recreating/reconciling the user from session data when possible, or redirects to `/signin`/`/groups` gracefully.
