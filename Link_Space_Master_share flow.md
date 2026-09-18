# Link Space — Master Specification

## Product Overview
Link Space is a simple, fast place to save any link, organize it into Spaces, find it quickly, and open it whenever needed.

Core journey: Save → Organize → Find → Open


## Share-to-Link Space: Silent Link Capture

Link Space must support receiving shared URLs from Android apps such as YouTube, Chrome, WhatsApp, and other apps through the Android system Share menu.

### Required behavior

When the user is viewing content in another app:

1. The user taps **Share**.
2. The user selects **Link Space**.
3. Link Space receives the shared URL.
4. **Do not open Link Space's UI.**
5. **Do not interrupt, switch away from, or overlay the current app.**
6. Show only a lightweight system notification confirming receipt.

Example notification:

> 🔗 Link received  
> Saved to your Inbox.  
> **[Open Link Space]**

The user can dismiss the notification and continue using the original app immediately.

### Inbox / Unsorted

Shared links received through the Share Target are initially stored in a local **Inbox / Unsorted** state.

Later, when the user opens Link Space, they can:

- Review the received link.
- Edit the title.
- Review the URL and automatically fetched metadata.
- Choose a Space.
- Add optional tags or notes.
- Organize/save the link into the selected Space.
- Delete unwanted received links.

### Important UX rule

**Sharing a link must be a quick capture action, not an interruption.**

The Share Target must never automatically navigate the user into Link Space after receiving a link. The notification is the only immediate user-facing confirmation.

### Relationship to Add Link

The normal **+ Add Link** flow inside Link Space remains available for users who are already in the app.

There are therefore two capture methods:

- **Inside Link Space:** `+ Add Link` → review/edit → choose Space → Save.
- **From another app:** `Share` → `Link Space` → silent receipt → notification → link waits in Inbox → organize later.

