# Phase 6 — Authentication and privacy

## Authentication
- Supabase Auth email/password sign-in and account creation.
- Native Sign in with Apple via Expo Apple Authentication on iOS.
- Session persistence uses Expo SecureStore.
- Refresh-token activity follows app foreground/background lifecycle.
- AI features require a valid signed-in session; browsing itself remains available without sign-in.

## Data model and RLS
- `profiles`, `user_settings`, `bookmarks`, `history`, `conversations`, `messages`, `analyses`, and `locked_domains` are user-owned.
- Every table enables RLS and has an owner policy.
- Message policies verify ownership of both the message and its parent conversation.
- User deletion cascades through user-owned rows.
- AI functions are stateless; the app does not automatically insert page text, chat content, OCR images or AI responses into these tables.

## Account deletion
- Settings asks for an explicit destructive confirmation.
- The authenticated Edge Function deletes the current Auth user using the server-only admin credential.
- Foreign keys use `ON DELETE CASCADE` for associated records.
- The client clears its local auth session only after the server confirms deletion.

## Remaining production setup
- Create the dedicated iBuddy Supabase project.
- Apply both SQL migrations in order.
- Enable Apple provider and configure the app identifier in Apple Developer and Supabase.
- Configure email confirmation templates and allowed redirect URLs.
- Test RLS and deletion using at least two separate accounts.
