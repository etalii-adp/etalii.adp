# Contract: Build Badge

Every readme and every row of both build tables uses exactly these strings, with `<repo>` replaced by the repository's name. Nothing else varies (FR-012, FR-015).

## Markdown (readmes and the `.github` profile)

```markdown
[![Build](https://github.com/etalii-adp/<repo>/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/etalii-adp/<repo>/actions/workflows/build.yml?query=branch%3Adevelop)
```

- Alt text: `Build`.
- Image: `https://github.com/etalii-adp/<repo>/actions/workflows/build.yml/badge.svg?branch=develop`.
- Link: `https://github.com/etalii-adp/<repo>/actions/workflows/build.yml?query=branch%3Adevelop`.

## Readme placement

The badge is the first line after the readme's top-level heading, on its own line.

## Site

The site derives the same image and link from `src/data/builds.ts` (`repository`, `workflow: 'build.yml'`, `public: true`). How the component renders them is the site's own specification.

## Check

A reviewer verifies SC-004 by collecting every badge URL from the six readmes, the profile and the site's built home page, and confirming each matches the image string above for its repository. Any other form, such as a badge without `?branch=develop` or pointing at `deploy.yml`, is a mismatch.
