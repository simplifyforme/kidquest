# Dieren herkennen met foto's — activity folder

Activity ID: `dieren-nl` · Version: **1** · Category: **Nederlands** · Locale: **nl-BE**.

This entire folder belongs to one activity. It contains:

- `pack.json`: eight Dutch multiple-choice questions linked to animal images by the `media.file` field.
- `photo-sources.json`: the original Commons file titles, source pages and CC0 1.0 declarations. **Do not remove attribution/source records.**
- `assets/*.jpg`: actual animal photographs mirrored from the listed public-domain sources by `scripts/sync-activity-media.mjs`. This folder is populated automatically during CI and committed with the SHA-256 content manifest.

Photos: cat, dog, horse, cow, rabbit, elephant, sheep and lion. The images are not external runtime dependencies: after the update they are read from a per-activity folder on the child's PC and work offline.

To make changes later, increase `pack.json.version`, preserve stable question IDs, add/remove photographs under `assets/` as needed, and append an entry to `docs/DEVELOPMENT_LOG.md` in the same Pull Request. Existing media with matching hashes are not downloaded twice.

For other activities, create `site/activities/<new-id>/pack.json` plus an `assets/` folder when assets are needed. Supported binary media: jpg/jpeg/png/webp/gif/mp4/webm/mp3/ogg/wav. A new **engine** or interactive logic still requires a new application version; this package carries only declared content and safe resources.
