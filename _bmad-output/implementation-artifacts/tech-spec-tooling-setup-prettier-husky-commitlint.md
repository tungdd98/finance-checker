---
title: 'Tooling Setup: Prettier + Husky + Commitlint'
slug: 'tooling-setup-prettier-husky-commitlint'
created: '2026-02-28'
status: 'Completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 16', 'React 19', 'TypeScript 5', 'Node.js 22', 'npm', 'ESLint 9 flat config']
files_to_modify: ['package.json', 'eslint.config.mjs']
code_patterns:
  ['CJS default (no type:module)', 'ESM explicit via .mjs extension', 'flat ESLint config']
test_patterns: ['none']
---

# Tech-Spec: Tooling Setup: Prettier + Husky + Commitlint

**Created:** 2026-02-28

## Overview

### Problem Statement

Project hien thieu cac cong cu dam bao code quality va consistency: khong co code formatter (Prettier), khong co git hooks (Husky) de enforce format/lint tu dong truoc khi commit, va khong co commit message convention (Commitlint). Dieu nay dan den code style khong nhat quan va commit history kho doc.

### Solution

Cai dat va cau hinh Prettier (voi `eslint-config-prettier` de tranh conflict voi ESLint hien tai), Husky voi 2 hooks (`pre-commit` chay lint-staged, `commit-msg` chay commitlint), va Commitlint theo convention `@commitlint/config-conventional`.

### Scope

**In Scope:**

- Prettier config (`.prettierrc`) voi cac gia tri da xac nhan
- `eslint-config-prettier` de disable ESLint rules xung dot voi Prettier
- `prettier-plugin-tailwindcss` de auto-sort Tailwind class names
- Husky `pre-commit` hook: chay lint-staged (prettier + eslint) tren file staged
- Husky `commit-msg` hook: chay commitlint validate message
- lint-staged scope: `*.{ts,tsx}` va `*.{json,md}`
- Commitlint voi `@commitlint/config-conventional`
- Script `prepare` trong `package.json` de auto-install husky hooks sau `npm install`
- Script `lint:format` de check format thu cong

**Out of Scope:**

- CI/CD pipeline integration
- VSCode workspace settings / extension recommendations
- Testing setup / coverage tooling
- Thay doi logic ung dung
- Format lai toan bo codebase sau khi setup (viec cua dev, khong phai task nay)

---

## Context for Development

### Codebase Patterns

- Package manager: **npm** (khong co `"type": "module"` → Node runtime mac dinh CJS)
- ESLint 9 dung **flat config** format (`eslint.config.mjs` — explicit ESM via `.mjs` extension)
- TypeScript 5 strict mode, `moduleResolution: bundler`, Next.js 16 App Router
- Node.js v22.9.0
- **Confirmed Clean Slate**: Khong co Prettier, Husky, Commitlint, lint-staged nao duoc cai dat

### Files to Reference

| File                | Purpose                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `package.json`      | Them devDependencies, scripts `prepare` + `lint:format`, them `lint-staged` config block |
| `eslint.config.mjs` | Import va append `eslintConfigPrettier` vao cuoi array config                            |
| `.gitignore`        | Tham khao — `.husky/` khong bi ignore (dung), `.env*` da duoc ignore                     |

### Technical Decisions

1. **eslint-config-prettier vs eslint-plugin-prettier**: Dung `eslint-config-prettier` (chi disable ESLint rules xung dot). Khong dung `eslint-plugin-prettier` (tranh chay Prettier qua ESLint).

2. **commitlint config format**: Dung `commitlint.config.mjs` (explicit ESM) — nhat quan voi `eslint.config.mjs`. Supported boi @commitlint v19+.

3. **lint-staged config location**: Dat trong `package.json` (key `"lint-staged"`) — tranh tao them file config rieng.

4. **Prettier config values (da xac nhan)**: `semi: false`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 100`.

5. **Husky v9 setup**: Them `"prepare": "husky"` vao scripts, tao thu muc `.husky/` va hook files thu cong, sau do chay `npm run prepare` de init.

6. **prettier-plugin-tailwindcss**: Include trong plugins cua `.prettierrc` — standard practice cho Tailwind v4.

---

## Implementation Plan

### Tasks

- [x] Task 1: Install tat ca devDependencies
  - File: `package.json` (cap nhat tu dong boi npm)
  - Action: Chay lenh sau trong terminal:
    ```bash
    npm install --save-dev prettier prettier-plugin-tailwindcss eslint-config-prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
    ```
  - Notes: Day la buoc nen tang, phai lam TRUOC tat ca cac task con lai.

- [x] Task 2: Tao file `.prettierrc`
  - File: `.prettierrc` (tao moi o root)
  - Action: Tao file voi noi dung sau:
    ```json
    {
      "semi": false,
      "singleQuote": true,
      "tabWidth": 2,
      "trailingComma": "es5",
      "printWidth": 100,
      "plugins": ["prettier-plugin-tailwindcss"]
    }
    ```

- [x] Task 3: Tao file `.prettierignore`
  - File: `.prettierignore` (tao moi o root)
  - Action: Tao file voi noi dung sau:
    ```
    node_modules
    .next
    out
    build
    .env*
    package-lock.json
    ```

- [x] Task 4: Cap nhat `eslint.config.mjs` — them eslint-config-prettier
  - File: `eslint.config.mjs`
  - Action: Them import `eslintConfigPrettier` va append vao cuoi array cua `defineConfig`. File sau khi sua:

    ```js
    import { defineConfig, globalIgnores } from 'eslint/config'
    import nextVitals from 'eslint-config-next/core-web-vitals'
    import nextTs from 'eslint-config-next/typescript'
    import eslintConfigPrettier from 'eslint-config-prettier'

    const eslintConfig = defineConfig([
      ...nextVitals,
      ...nextTs,
      // Override default ignores of eslint-config-next.
      globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
      ]),
      eslintConfigPrettier, // must be last — disables conflicting ESLint rules
    ])

    export default eslintConfig
    ```

  - Notes: `eslintConfigPrettier` PHAI o vi tri cuoi cung de override cac rules cua cac config truoc.

- [x] Task 5: Tao file `commitlint.config.mjs`
  - File: `commitlint.config.mjs` (tao moi o root)
  - Action: Tao file voi noi dung sau:
    ```js
    export default {
      extends: ['@commitlint/config-conventional'],
    }
    ```
  - Notes: Dung `.mjs` extension (explicit ESM) de nhat quan voi `eslint.config.mjs`. Conventional types hop le: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`, `perf`, `revert`.

- [x] Task 6: Cap nhat `package.json` — them scripts va lint-staged config
  - File: `package.json`
  - Action: Them vao `"scripts"`:
    ```json
    "prepare": "husky",
    "lint:format": "prettier --check ."
    ```
    Them key `"lint-staged"` o top level cua package.json (ngang voi `"scripts"`):
    ```json
    "lint-staged": {
      "*.{ts,tsx}": [
        "prettier --write",
        "eslint --fix"
      ],
      "*.{json,md}": [
        "prettier --write"
      ]
    }
    ```
  - Notes: `"prepare"` script se tu dong chay `husky` sau moi `npm install`, giup setup hooks cho developer moi clone repo.

- [x] Task 7: Setup Husky — tao `.husky/` va hook files
  - File: `.husky/pre-commit` va `.husky/commit-msg` (tao moi)
  - Action:
    1. Tao thu muc `.husky/` (neu chua co)
    2. Tao file `.husky/pre-commit` voi noi dung:
       ```sh
       npx lint-staged
       ```
    3. Tao file `.husky/commit-msg` voi noi dung:
       ```sh
       npx --no -- commitlint --edit $1
       ```
    4. Chay `npm run prepare` (hoac `npx husky`) de initialize git hooks
  - Notes: Husky v9 chi can cac file nay ton tai trong `.husky/` — khong can chmod thu cong (husky v9 tu xu ly executable bit). File `.husky/pre-commit` va `.husky/commit-msg` can duoc commit vao git.

---

### Acceptance Criteria

- [x] AC 1: Given repo da duoc setup, when chay `npx prettier --check .`, then Prettier chay khong loi va report cac file can format (khong throw error ve config).

- [x] AC 2: Given co 1 file `.ts` hoac `.tsx` staged voi formatting issue, when chay `git commit`, then `pre-commit` hook tu dong format file do va commit thanh cong voi code da duoc format.

- [x] AC 3: Given co 1 file `.json` hoac `.md` staged, when chay `git commit`, then `pre-commit` hook chay `prettier --write` tren file do truoc khi commit.

- [x] AC 4: Given commit message khong theo conventional format (vi du: `"update stuff"` hoac `"fix bug"`), when chay `git commit -m "update stuff"`, then commit bi tu choi voi error message tu commitlint.

- [x] AC 5: Given commit message dung conventional format (vi du: `"feat: add login page"`, `"fix: correct vnd formatting"`, `"chore: update dependencies"`), when chay `git commit`, then commit-msg hook pass va commit thanh cong.

- [x] AC 6: Given code co formatting ma ESLint truoc day co the conflict (vi du: trailing semicolons, quote style), when chay `npm run lint`, then ESLint khong bao loi formatting (cac rules do da duoc disable boi `eslint-config-prettier`).

- [x] AC 7: Given developer moi clone repo va chay `npm install`, then script `prepare` tu dong chay `husky` va setup git hooks trong `.git/hooks/` — khong can config thu cong them.

---

## Additional Context

### Dependencies

**npm packages (devDependencies):**
| Package | Version | Purpose |
| ------- | ------- | ------- |
| `prettier` | latest | Code formatter |
| `prettier-plugin-tailwindcss` | latest | Auto-sort Tailwind class names |
| `eslint-config-prettier` | latest | Disable ESLint rules conflicting with Prettier |
| `husky` | latest (v9+) | Git hooks manager |
| `lint-staged` | latest | Run linters on staged files only |
| `@commitlint/cli` | latest | Commitlint CLI |
| `@commitlint/config-conventional` | latest | Conventional commits ruleset |

**Prerequisites:**

- Git repository da duoc init (co `.git/` dir) — da co
- Node.js v18+ — da co (v22.9.0)

### Testing Strategy

Khong co automated tests cho tooling config. Manual testing sau khi setup:

1. **Test Prettier**: Chay `npx prettier --check .` — phai chay khong loi.
2. **Test lint-staged**: Stage 1 file `.ts`, chay `git commit` → xem hook output.
3. **Test commitlint (fail case)**: `git commit -m "bad message"` → phai bi reject.
4. **Test commitlint (pass case)**: `git commit -m "chore: setup tooling"` → phai pass.
5. **Test ESLint no conflict**: Chay `npm run lint` → khong co formatting errors.

### Notes

**Rui ro / luu y:**

- Sau khi them `prettier-plugin-tailwindcss`, neu Prettier khong tim thay Tailwind config, plugin se bi disable silently — khong sao, khong anh huong functionality chinh.
- Chay Prettier lan dau tren codebase hien tai se reformat nhieu file (vi code chua tung qua Prettier). Nen commit rieng sau khi setup: `chore: format codebase with prettier`.
- `eslint --fix` trong lint-staged co the modified them ngoai formatting — nen kiem tra ky output truoc khi commit lan dau.
- Neu gap loi `husky - command not found` sau `npm run prepare`, thu chay `npx husky` truc tiep.

## Review Notes

- Adversarial review completed
- Findings: 10 total, 4 fixed, 6 skipped (noise/out-of-scope)
- Resolution approach: auto-fix
- Fixed: F4 (quoted `"$1"` in commit-msg), F5 (`.mjs` added to lint-staged), F7 (`prepare` guard with `|| true`), F8 (added `format` script)
