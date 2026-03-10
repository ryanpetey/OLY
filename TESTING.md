# Testing Notes

## Two-user post-submit routing regression check

1. Sign in as User 1 and create a group.
2. Copy the invite link from the group dashboard.
3. In a separate browser/session, sign in as User 2 and join using the invite link.
4. Open the current round as User 1 and submit a response.
5. Open the current round as User 2 and submit a response.
6. Confirm User 2 is redirected to `/groups/[groupId]/round/reveal` (not a 404 group page).
7. Confirm visiting `/groups/[groupId]` as either member still loads and links to reveal for the completed round.

## Stale session check after local DB reset

- If the local SQLite DB is reset while a browser session cookie still exists, joining a group should not surface raw Prisma FK errors.
- Expected behavior: server action recovers by recreating/reconciling the user from session data when possible, or redirects to `/signin`/`/groups` gracefully.
