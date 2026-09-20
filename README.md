# Portfolio site

A static site (plain HTML/CSS/JS, no build step) that pulls your GitHub
repos live via the GitHub REST API, plus a hand-curated section for
non-code work like social media management.

## 1. Set it up

Open `script.js` and edit the `CONFIG` block at the top:

- `GITHUB_USERNAME` — WitInMotion.
- `EXCLUDE_REPOS` — repo names to hide (use this for anything under
  NDA, like your InfraGuard AI work — keep the repo private on GitHub
  too, this only hides it from the *display* if it were public).
- `FEATURED_REPOS` — repo names to pin to the top regardless of
  recent activity.
- `SOCIAL_WORK` — replace the placeholder entries with your actual
  social media / campaign work (title, role, description, one metric).

Also update in `index.html`:
- the `mailto:` link and LinkedIn URL in the `#contact` section.
- the page `<title>` and meta description if you want different copy.

## 2. Preview it locally

No build tools needed. From this folder, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. (Opening
`index.html` directly also mostly works, but some browsers block the
GitHub API fetch from a `file://` URL — a local server avoids that.)

## 3. Deploy it — GitHub Pages (free, recommended)

1. Create a new GitHub repo, e.g. `yourusername.github.io` (using
   exactly that name gives you a site at the root of that URL — any
   other repo name serves at `yourusername.github.io/repo-name`).
2. Push these three files (`index.html`, `styles.css`, `script.js`)
   to the repo's default branch.
3. In the repo: **Settings → Pages → Source**, select the branch
   (usually `main`) and root folder, then save.
4. GitHub will publish it at `https://WitInMotion.github.io`
   (or `.../repo-name`) within a minute or two.

## 4. Alternative hosts

Since this is a plain static site, it also deploys as-is to Netlify
or Vercel (drag-and-drop the folder, or connect the repo) if you want
a custom domain or want to add server-side rendering later.

## Notes

- The GitHub API is called client-side and unauthenticated, which is
  rate-limited to 60 requests/hour per visitor IP — fine for a
  personal portfolio's traffic levels.
- Forked repos are filtered out automatically so the grid only shows
  your own work.
