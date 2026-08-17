---
description: Runs the full verification suite (typecheck + build + link audit) before finishing any task.
---

Before you finish, verify the project exactly like this:
1. Run `npx astro check` — it must report 0 errors.
2. Run `npx astro build` — it must complete without errors.
3. If a dev server is running, fetch each page under `http://localhost:4321/deldar_beauty/`
   (about/, shop/, booking/, checkout/) and confirm 200, and confirm no hard-coded
   '/about'-style hrefs appear in the served HTML (they must use `/deldar_beauty/`).
4. Report the results in Persian.