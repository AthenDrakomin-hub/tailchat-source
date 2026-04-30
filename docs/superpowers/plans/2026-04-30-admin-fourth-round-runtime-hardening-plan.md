# Admin Fourth-Round Runtime Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 network、analytics、system-notify 及相关接口补运行时降级与结构化错误返回。

**Architecture:** 延续前三轮的最小改动策略，不推翻原有页面，只在页面入口与关键 API 返回上补统一降级、统一错误语义和最小可验证测试。

**Tech Stack:** React, TypeScript, Express, Node.js test runner, Vite

---
