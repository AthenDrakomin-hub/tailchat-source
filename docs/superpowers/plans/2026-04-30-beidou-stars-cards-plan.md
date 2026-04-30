# Beidou Stars Cards (Admin Configurable) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the login page “Beidou Stars” 7 profile cards configurable via Admin System Config, remove the dashed constellation polyline, and keep a safe fallback to current hardcoded defaults.

**Architecture:** Reuse existing global client config pipeline (`config.client` + `config.setClientConfig`). Store `beidouStarsCards` in persisted client config (`__client_config__`). Web reads from `useGlobalConfigStore` and merges with fixed layout (positions + twinkle). Admin edits all 7 cards and saves a single patch.

**Tech Stack:** React (web + admin), Tushan (admin UI), Tailwind (web), Moleculer config service (existing), Jest + @testing-library/react (web tests).

---

## File Structure (Touched)

**Shared (User client config types)**
- Modify: `client/shared/model/config.ts`

**Admin (System Config page + i18n)**
- Modify: `server/admin/src/client/routes/system/index.tsx`
- Modify: `server/admin/src/client/i18n/zh.ts`
- Modify: `server/admin/src/client/i18n/en.ts`

**Web (Entry background + cards)**
- Modify: `client/web/src/routes/Entry/components/BeidouStars.tsx`
- Create: `client/web/src/routes/Entry/components/BeidouStars.test.tsx`

---

### Task 1: Extend Global Client Config Type

**Files:**
- Modify: `client/shared/model/config.ts`

- [ ] **Step 1: Add types**

```ts
export type BeidouStarCardConfig = {
  id: string;
  name: string;
  title: string;
  bio: string;
  tags: string[];
  avatar?: string;
  verifiedText?: string;
  verifiedIcon?: string;
  footerLeftText?: string;
};
```

- [ ] **Step 2: Extend GlobalConfig**

```ts
export interface GlobalConfig {
  // ...
  beidouStarsCards?: BeidouStarCardConfig[];
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm -C /workspace/client/web check:type`
Expected: PASS

---

### Task 2: Admin — Add “Beidou Stars Cards” Editor

**Files:**
- Modify: `server/admin/src/client/routes/system/index.tsx`
- Modify: `server/admin/src/client/i18n/zh.ts`
- Modify: `server/admin/src/client/i18n/en.ts`

- [ ] **Step 1: Add i18n keys**
- `custom.config.beidouStarsTitle`
- `custom.config.beidouStarsTip`
- `custom.config.beidouCardAvatar`
- `custom.config.beidouCardName`
- `custom.config.beidouCardTitle`
- `custom.config.beidouCardBio`
- `custom.config.beidouCardTags`
- `custom.config.beidouCardVerifiedText`
- `custom.config.beidouCardFooterLeftText`
- `custom.config.saveAll`

- [ ] **Step 2: Add default cards fallback in admin**
Use the current hardcoded 7 profiles (id/name/title/bio/tags) as defaults when config is empty, leaving `avatar/verifiedText/footerLeftText` empty.

- [ ] **Step 3: Render 7 editors**
Render 7 form sections (simple inputs), keep fixed order, and support avatar upload using the existing `/file/upload` logic (same as `serverEntryImage` upload).

- [ ] **Step 4: Save**
Add a “Save All” button that sends:

```json
{ "key": "beidouStarsCards", "value": [/* 7 items */] }
```

to `PATCH /admin/api/config/client`.

- [ ] **Step 5: Manual verify**
Run admin dev server: `pnpm -C /workspace/server/admin dev`
Open: `/admin` → System → Config tab
Expected: The new section renders and saving updates config.

---

### Task 3: Web — Use Configurable Cards + Remove Dashed Polyline

**Files:**
- Modify: `client/web/src/routes/Entry/components/BeidouStars.tsx`

- [ ] **Step 1: Split fixed layout vs configurable content**
Keep positions/twinkle hardcoded in the component (layout), but take content from `useGlobalConfigStore().beidouStarsCards` if provided, otherwise fallback to existing hardcoded content.

- [ ] **Step 2: Remove dashed polyline**
Remove the `<svg><polyline ... strokeDasharray ... /></svg>` block entirely.

- [ ] **Step 3: Add avatar rendering**
If `avatar` is provided: render an `<img>` avatar.
Else fallback to current initials circle.

- [ ] **Step 4: Verified footer**
Replace the hardcoded “认证档案” with `verifiedText` (optional). If empty, hide the right-side verified section.

- [ ] **Step 5: Manual verify**
Run web dev: `WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true pnpm -C /workspace/client/web dev:main`
Expected: Stars show without dashed lines; clicking a star shows a richer card.

---

### Task 4: Tests — Minimal Coverage for Web Component

**Files:**
- Create: `client/web/src/routes/Entry/components/BeidouStars.test.tsx`

- [ ] **Step 1: Test default render (no polyline)**
Assert that the rendered output does not contain a `polyline` element.

- [ ] **Step 2: Test config override**
Mock `useGlobalConfigStore` to return a custom `beidouStarsCards` (with avatar + verifiedText) and assert the modal displays those values after click.

- [ ] **Step 3: Run tests**
Run: `pnpm -C /workspace/client/web test`
Expected: PASS

---

## Git Push Strategy (Remote main updated)

- If you implement on a feature branch: push that branch and open a PR into `main`.
- If you must push to `main` directly:
  - [ ] `git fetch origin main`
  - [ ] `git rebase origin/main` (or `git merge origin/main`)
  - [ ] Resolve conflicts and rerun tests
  - [ ] Push:
    - merge-based: `git push origin main`
    - rebase-based: `git push --force-with-lease origin main`

