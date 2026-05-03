# Wechat Chat Mainline Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the personal chat mainline so the product feels much closer to WeChat in the places users actually notice: message alignment, friend profile actions, friend feed access, and relationship-driven behavior.

**Architecture:** Keep the existing Tailchat data model and routes, but rewire the personal conversation UI and user popovers around relationship-aware actions. Treat “is friend / not friend / self / temp user / bot” as the behavioral switch that controls which actions and entry points are shown.

**Tech Stack:** React, TypeScript, Tailchat shared client APIs, Ant Design, existing personal/group/chat routes and popovers.

---

### Task 1: Rebuild Personal Chat Message Layout

**Files:**
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
- Modify: `client/web/src/components/Panel/personal/ConversePanel.tsx`

- [ ] Define WeChat-like layout rules for DM messages:
  - self messages align right
  - other messages align left
  - self header text is hidden
  - self action bar anchors to left edge of the bubble group
  - other action bar anchors to right edge
  - time grouping remains shared

- [ ] Implement the layout using conditional container classes instead of only bubble color changes.

- [ ] Verify the following behaviors manually in the DM route:
  - self and other messages split left/right
  - continuous messages keep grouped spacing
  - system messages stay centered

- [ ] Commit with a DM-layout-specific message.

### Task 2: Make User Popovers Relationship-Aware

**Files:**
- Modify: `client/web/src/components/popover/UserPopover/GroupUserPopover.tsx`
- Modify: `client/web/src/components/popover/UserPopover/PersonalUserPopover.tsx`
- Modify: `client/web/src/components/UserProfileContainer.tsx`
- Read if needed: `client/shared/model/friend.ts`

- [ ] Add relationship-aware action rendering:
  - self: no relationship action
  - existing friend: show “发消息” and “查看动态”
  - non-friend normal user: show “申请联系人”
  - bot/temp user: suppress irrelevant social actions

- [ ] Use existing friend APIs and Redux friend state instead of fabricating new backend behavior.

- [ ] Ensure group member popover and personal popover both expose the same friend/feed actions when valid.

- [ ] Commit with a relationship-actions-specific message.

### Task 3: Restore Friend Feed Access

**Files:**
- Modify: `client/web/src/components/popover/UserPopover/GroupUserPopover.tsx`
- Modify: `client/web/src/components/popover/UserPopover/PersonalUserPopover.tsx`
- Reuse existing route: `client/web/src/routes/Main/Content/Feed/UserFeedPage.tsx`

- [ ] Add direct navigation to `/main/feed/user/:userId` from friend-capable popovers.
- [ ] Ensure the entry only appears for users where feed viewing is meaningful.
- [ ] Verify that clicking the entry lands on the existing personal feed page and does not break current feed routing.

- [ ] Commit with a feed-entry-specific message.

### Task 4: Fix Personal Conversation Header and Interaction Tone

**Files:**
- Modify: `client/web/src/components/Panel/personal/ConversePanel.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/SidebarDMItem.tsx`

- [ ] Remove non-WeChat-like narrative copy from the DM header.
- [ ] Replace it with compact relationship/status cues only when needed.
- [ ] Keep the DM list focused on chat utility, not explanatory copy.

- [ ] Commit with a personal-chat-header-specific message.

### Task 5: Run Focused Verification

**Files:**
- No production files

- [ ] Verify friend popover from group member list.
- [ ] Verify friend popover from personal chat.
- [ ] Verify add-friend action for non-friends.
- [ ] Verify feed jump for friends.
- [ ] Verify self/other message left-right split in DM.
- [ ] Verify dark mode does not break the new layout.

- [ ] Commit final polish only if verification required a code fix.
