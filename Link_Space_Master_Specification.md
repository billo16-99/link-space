# Link Space — Master Product & Coding Specification

## 1. Project Overview

**App name:** Link Space

**Core purpose:**

> Link Space is a simple, fast place where users can save any link, organize it into Spaces, and quickly find it whenever they need it.

### Core product loop

**Save → Organize → Find → Open**

The application must stay focused on this loop. Do not add unnecessary features to V1.

---

# 2. Product Principles

1. **Simple**
   - A new user should understand the app within about 10 seconds.
   - Avoid unnecessary screens, menus, settings, and complicated workflows.

2. **Fast**
   - The app should feel responsive even on low-end Android phones.
   - Avoid expensive visual effects and unnecessary network requests.

3. **Offline-first**
   - Saved links and Spaces should remain usable without an internet connection.
   - Local data should be the primary source for the UI.

4. **Clean**
   - Use a modern minimalist interface.
   - Avoid visual clutter.

5. **Expandable**
   - Build the architecture so future Pro features can be added without rebuilding the whole application.

6. **Do not overbuild V1**
   - Do not implement future/Pro features unless explicitly requested.

---

# 3. V1 Features

The first version should contain:

- Save links
- Automatically retrieve basic link metadata
- Organize links into Spaces
- Create and customize Spaces
- Search links
- Search Spaces
- Search tags/domains/titles
- Pin important links
- Recently Saved
- Open saved links
- Offline local storage
- Optional account creation
- Cloud sync when the user has an account
- Basic settings
- Delete/edit saved links
- Delete/edit Spaces

---

# 4. Future / Pro Features

Design the architecture to support these later, but DO NOT build them into V1 unless specifically requested:

- Cloud sync as a premium feature if product strategy requires it
- AI link organization
- AI summaries
- Advanced search
- Unlimited Spaces
- Bulk actions
- Reminders
- Export/backup
- Custom themes
- Additional customization
- Other premium features based on real user feedback

The future feature list must not make V1 complicated.

---

# 5. Design System

## Overall style

- Dark minimalist interface
- Black/deep charcoal background
- Rounded cards
- White primary text
- Soft gray secondary text
- Small category/color accents
- Modern clean typography
- Generous spacing
- Simple icons
- Subtle borders
- Minimal shadows
- No unnecessary animation

## Performance-friendly design

Avoid:

- Heavy blur/glass effects
- Large animated gradients
- Video backgrounds
- Particle effects
- Complex 3D effects
- Excessive shadows
- Continuous animations

Animations should normally be short, around **200–400 ms**.

---

# 6. App Icon / Brand Direction

The visual concept should communicate:

**Link + Space = Link Space**

Use a simple symbol combining:

- A minimalist chain/link shape
- A subtle orbital/space element

The icon must:

- Work at very small sizes
- Be recognizable without text
- Remain visually simple
- Avoid unnecessary detail
- Work on a dark background

Do not make the logo complicated.

---

# 7. Home Screen

## Header

Dark background.

Left:
- Menu/back-style icon depending on navigation state

Center:
- Link Space logo/icon
- "Link Space"

Right:
- User/profile icon

## Search bar

Position directly below the header.

Full width with:

- Search icon on the left
- Placeholder: **"Search links, spaces, or tags..."**
- Filter icon on the right
- Rounded corners
- Dark charcoal/translucent background
- Subtle border

The search bar should remain visually consistent with the rest of the app.

## Main section

Title:

**Saved Link Spaces**

Subtitle:

**Your links, grouped. Access them anytime.**

## Space grid

Use a two-column layout on normal phone screens.

Each Space card should contain:

- Space icon/color
- Space name
- Number of links
- Up to 3 small website/favicons from links inside the Space
- Small "+" indicator where appropriate
- Three-dot menu for Space actions

Example Spaces for demo data:

- Personal — Study Links
- Work — Freelance Tools
- Entertainment — Music & Videos
- Shopping — Deals & Shopping

These are example/default content only. Users must be able to create their own Spaces.

## Recently Saved

Show a small Recently Saved section below the Spaces when appropriate.

Sort newest saved links first.

## Add Link

Use a prominent rounded button near the bottom:

**+ Add Link**

This is the primary call-to-action.

---

# 8. Add Link Flow

The main flow should be:

```text
Tap Add Link
      ↓
Paste URL
      ↓
App validates URL
      ↓
Retrieve metadata
      ↓
Show preview
      ↓
Choose Space
      ↓
Optional tags
      ↓
Save
```

## Automatically retrieved metadata

When possible, retrieve:

- Page title
- Domain
- Favicon/website icon
- Description
- Thumbnail/image

Metadata retrieval should not prevent the user from saving the link if metadata cannot be retrieved.

If metadata retrieval fails:

- Save the URL anyway.
- Use the domain or URL as fallback title.
- Use a generic website icon.

## Editing metadata

The user should be able to edit at least:

- Title
- Space
- Tags

Do not force users to manually enter metadata that can be automatically retrieved.

---

# 9. URL Validation

Before saving:

- Validate that the input is a valid URL.
- Normalize URLs where appropriate.
- Handle common URL formats.
- Do not crash on malformed input.

If a URL is already saved by the same user:

- Detect the duplicate.
- Inform the user that the link is already saved.
- Offer to open the existing link or cancel.

Do not silently create unnecessary duplicates.

---

# 10. Spaces

Spaces are the main organizational system.

Users can:

- Create a Space
- Rename a Space
- Delete a Space
- Change Space icon
- Change Space color
- Reorder Spaces

## Link relationship

For V1:

**One saved link belongs to one Space.**

This keeps organization simple.

A link can be moved to another Space later.

## Empty Space

An empty Space should have a simple empty state:

Example:

> No links here yet.

Button:

**+ Add Link**

---

# 11. Search

Search should be fast and local whenever possible.

Search across:

- Link title
- URL
- Domain
- Space name
- Tags

Search results should update while the user types.

## Search states

### Empty search

Show normal Home content.

### Active search

Show matching links/Spaces.

### No results

Show:

> No links found.

Do not show a complicated error screen.

## Search filters

Keep filters simple.

Possible filters:

- All
- Spaces
- Pinned
- Recently Saved
- Tags

Do not create an advanced filtering system in V1.

---

# 12. Link Cards

A saved link should have a clean compact card/list design.

Suggested structure:

```text
[Website Icon]  Link Title
                domain.com
                Space name
                              [⋮]
```

Optional thumbnail may be shown where appropriate.

Prioritize compact cards over large image-heavy cards to reduce memory and data usage.

Each card should allow:

- Open
- Pin/unpin
- Edit
- Move to another Space
- Delete

---

# 13. Pinned Links

Users can pin important links.

Pin/unpin should be available from the link menu.

Pinned links should be accessible from a simple pin/favorite entry point.

Do not impose an artificial limit on pinned links.

Pinned status is simply stored as a boolean value.

---

# 14. Recently Saved

Recently Saved displays the newest saved links.

Sort by:

`created_at DESC`

Keep this feature simple.

Do not build complicated activity analytics.

---

# 15. Opening Links

When a user taps a saved link:

- Open the URL using the device's browser by default.

The app should not unnecessarily keep users inside a heavy in-app browser.

When a link is opened, optionally record a lightweight history/view event if history is enabled in the implementation.

---

# 16. Account System

Account creation should NOT be required to start using Link Space.

Recommended flow:

```text
Install app
    ↓
Start using Link Space immediately
    ↓
Save links locally
    ↓
Later create/sign into account
    ↓
Cloud sync becomes available
```

The user should not be blocked by authentication.

Recommended authentication:

- Email/password
- Google sign-in where supported
- Add other providers later if needed

---

# 17. Offline-First Architecture

The app must prioritize local data.

Recommended architecture:

```text
                 ┌──────────────┐
                 │ Local SQLite │
                 └──────┬───────┘
                        ↓
                       UI
                        ↑
                        │
User → Link Space App ──┤
                        │
                        ↓
                 Sync Engine
                        ↓
                  Supabase Cloud
```

The UI should read from the local database first.

Internet should mainly be used for:

- Metadata retrieval
- Authentication
- Cloud synchronization
- Other future cloud features

---

# 18. Recommended Technology Stack

Use:

- **React Native + Expo** for the mobile application
- **SQLite** for local storage
- **Supabase** for backend services
- **PostgreSQL** through Supabase
- **Supabase Auth** for accounts
- **Supabase Storage** only where file storage is genuinely needed
- Backend/server functions for webpage metadata retrieval

Keep dependencies to a reasonable minimum.

Do not introduce unnecessary libraries when native or existing project functionality is sufficient.

---

# 19. Database Structure

## users

```text
id
name
email
profile_image
created_at
updated_at
settings
```

## spaces

```text
id
user_id
name
icon
color
position
created_at
updated_at
```

## links

```text
id
user_id
space_id
url
title
description
domain
favicon
thumbnail
is_pinned
created_at
updated_at
```

## tags

If tags are implemented as separate records:

```text
id
user_id
name
created_at
```

## link_tags

```text
link_id
tag_id
```

## history

If history is implemented:

```text
id
user_id
link_id
viewed_at
```

---

# 20. Database Rules

Every cloud record must belong to the authenticated user.

Never trust a client-provided `user_id` for authorization.

Use Supabase Row Level Security so users can only access their own:

- Links
- Spaces
- Tags
- History
- Profile data

Deleted user data should not remain accessible.

---

# 21. Sync

When a user is signed in:

```text
Phone A
   ↕
Supabase
   ↕
Phone B
```

Sync should support:

- Uploading locally created links
- Downloading cloud links
- Creating/updating Spaces
- Pin/unpin synchronization
- Deleting records
- Conflict handling

The app should continue working if synchronization temporarily fails.

Never make the entire UI unusable just because the server is unavailable.

---

# 22. Metadata Retrieval

When a URL is saved:

```text
User pastes URL
      ↓
Validate URL
      ↓
Metadata service
      ↓
Title
Domain
Favicon
Description
Thumbnail
      ↓
Local save
      ↓
Cloud sync if signed in
```

Metadata retrieval must have:

- Timeout
- Error handling
- Fallback behavior

Never make the user wait indefinitely.

Do not download unnecessarily large images.

---

# 23. Performance Requirements

Link Space must work well on low-end phones.

Priorities:

1. Fast startup
2. Low RAM usage
3. Low data usage
4. Small app size
5. Smooth scrolling
6. Offline usability

Implementation guidelines:

- Use SQLite/local database.
- Do not load every link into memory at startup.
- Use pagination or lazy loading for large lists.
- Lazy-load thumbnails.
- Cache frequently used metadata.
- Compress images.
- Avoid unnecessary API requests.
- Debounce search input where appropriate.
- Use indexed database fields for search.
- Keep animations short.
- Avoid heavy UI effects.
- Avoid unnecessary background work.

---

# 24. Loading States

Loading animations are allowed but should be lightweight.

Use loading indicators for real operations such as:

- Saving
- Metadata retrieval
- Syncing

Examples:

- Small spinner
- Short fade
- Simple scale animation

Do not create fake delays just to display an animation.

A loading animation must never intentionally make the app slower.

---

# 25. Error Handling

Errors should be understandable to normal users.

Examples:

Instead of:

> HTTP 422 metadata extraction exception

Show:

> We couldn't load the website details, but you can still save this link.

For network problems:

> You're offline. Your link was saved on this device and will sync later.

The app should fail gracefully.

---

# 26. Settings

Keep Settings minimal in V1.

Possible sections:

- Account
- Appearance
- Sync
- Notifications
- Privacy
- About
- Log out

Do not fill Settings with unnecessary options.

Appearance can support:

- Dark
- Light
- System

If dark mode is the primary design, keep the light theme simple and consistent.

---

# 27. Empty States

Use friendly, simple empty states.

Examples:

### No links

> No saved links yet.

Button:

> + Add Link

### Empty Space

> No links in this Space yet.

Button:

> + Add Link

### No search results

> No links found.

Avoid excessive illustrations and animations.

---

# 28. Navigation

Keep navigation minimal.

Recommended structure:

```text
Home
 ├── Search
 ├── Space
 │    └── Link Details/Edit
 ├── Add Link
 ├── Pinned
 ├── Profile/Settings
 └── Recently Saved
```

Avoid creating a separate screen for every tiny action.

---

# 29. Security

The implementation must:

- Use secure authentication.
- Protect user data with database access policies.
- Never expose service-role secrets in the mobile application.
- Never hard-code private backend credentials into the app.
- Validate user input.
- Sanitize metadata where necessary.
- Restrict cloud access to the authenticated user's records.

---

# 30. Privacy

Link Space stores URLs saved by users.

Users should be able to:

- View their saved links
- Delete individual links
- Delete Spaces
- Sign out
- Delete their account/data when account functionality is implemented

Do not collect unnecessary personal data.

---

# 31. V1 Scope Boundary

The coding agent MUST NOT add the following without explicit approval:

- AI assistant
- AI summaries
- Social feed
- Public profiles
- Messaging
- Complex sharing system
- Recommendation engine
- Gamification
- Heavy analytics
- Cryptocurrency/Web3 features
- Unnecessary animations
- Video backgrounds
- Complex onboarding
- Complicated notification systems
- Large in-app browser
- Unnecessary subscription logic

The goal is a focused link-saving application.

---

# 32. Development Order

Build in this order:

### Phase 1 — Foundation

- Project setup
- Theme
- Navigation
- Local SQLite database

### Phase 2 — Core

- Home screen
- Spaces
- Add Link
- Link cards
- Open links

### Phase 3 — Organization

- Pinning
- Recently Saved
- Edit link
- Move link
- Delete link
- Space customization

### Phase 4 — Search

- Search bar
- Local search
- Search filters
- Search results

### Phase 5 — Accounts & Cloud

- Supabase
- Authentication
- Cloud database
- Sync
- Security/RLS

### Phase 6 — Optimization

- Low-end device testing
- Offline testing
- Large-link-list testing
- Network failure testing
- Memory/performance optimization

### Phase 7 — Future

Only after V1 has been tested with real users should future/Pro features be considered.

---

# 33. Coding Agent Rules

The coding agent must follow these rules:

1. **Do not change the product concept without permission.**
2. **Do not add features simply because they seem useful.**
3. **Keep V1 simple.**
4. **Keep the UI consistent across screens.**
5. **Prioritize performance over visual effects.**
6. **Use reusable components.**
7. **Keep business logic separate from UI where practical.**
8. **Keep database operations organized in a dedicated data layer.**
9. **Handle loading, errors, and offline states.**
10. **Do not expose secrets in the mobile client.**
11. **Do not break existing features when adding new ones.**
12. When modifying an existing screen, preserve unrelated functionality.
13. Prefer small, understandable implementations over unnecessary abstractions.
14. Test important flows after changes.
15. If a requirement is ambiguous, choose the simplest implementation consistent with this specification.

---

# 34. Core User Journey

A new user should be able to do this easily:

```text
Open Link Space
      ↓
See Home
      ↓
Tap + Add Link
      ↓
Paste a URL
      ↓
See automatic website information
      ↓
Choose a Space
      ↓
Save
      ↓
Link appears in the Space
      ↓
Later search for it
      ↓
Tap it
      ↓
Website opens
```

This is the most important journey in the application.

---

# 35. Success Criteria for V1

V1 is successful when a new user can:

- Understand what Link Space does quickly.
- Save a URL with minimal effort.
- Automatically receive useful website metadata.
- Organize links into Spaces.
- Find saved links quickly.
- Pin important links.
- See recently saved links.
- Open a saved link easily.
- Use the app without an account.
- Continue using saved data offline.
- Sign in later and synchronize data.
- Use the app smoothly on lower-end phones.

---

# 36. Final Product Definition

**Link Space is not meant to be a giant productivity platform.**

It is a focused, lightweight link library.

Its main promise is:

> **Save your links. Organize them into Spaces. Find them quickly. Use them whenever you need them.**

Build the simplest version that delivers that promise well.
