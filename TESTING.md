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

## Stale session check after local DB reset

- If the local SQLite DB is reset while a browser session cookie still exists, joining a group should not surface raw Prisma FK errors.
- Expected behavior: server action recovers by recreating/reconciling the user from session data when possible, or redirects to `/signin`/`/groups` gracefully.
