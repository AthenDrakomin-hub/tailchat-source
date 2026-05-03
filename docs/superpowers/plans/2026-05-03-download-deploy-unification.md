# Download Deploy Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the server deployment, client package publishing, and `/downloads` distribution workflow consistent, documented, and executable from the server with minimal manual steps.

**Architecture:** Keep the main application on the existing Docker Compose deployment path, and treat client packages as static assets served from `server/public/downloads/client/`. Add one script for full application redeploy, one script for Android-on-server build, and one script for publishing package artifacts and updating `client.json`.

**Tech Stack:** Bash, Docker Compose, Android Gradle, Yarn, Python 3 JSON patching, existing static download center.

---

### Task 1: Add deployment and package publishing scripts

**Files:**
- Create: `scripts/deploy-all.sh`
- Create: `scripts/build-android-release.sh`
- Create: `scripts/publish-client-assets.sh`

- [ ] Add a full redeploy script for the Docker Compose stack.
- [ ] Add a low-memory Android build script for the server.
- [ ] Add a package publishing script that copies artifacts and updates `server/public/downloads/client.json`.

### Task 2: Update docs for the new single-path workflow

**Files:**
- Modify: `README.md`
- Modify: `docs/deployment/redeploy-existing-server.md`
- Create: `docs/deployment/client-release-workflow.md`
- Modify: `server/public/downloads/client/README.md`

- [ ] Document the server one-command redeploy flow.
- [ ] Document Android build-on-server flow.
- [ ] Document Windows/macOS artifact upload-and-publish flow.
- [ ] Document the unified `/downloads` behavior and verification commands.

### Task 3: Verify and finalize

**Files:**
- Modify: `scripts/*.sh`
- Modify: `docs/deployment/*.md`

- [ ] Sanity-check command syntax and environment assumptions.
- [ ] Ensure docs and scripts use the same paths, filenames, and update order.
- [ ] Commit and push the workflow update.
