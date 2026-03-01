# Family Finance Command Center

Ứng dụng quản lý tài chính gia đình cho 2 người (vợ/chồng). Theo dõi thu/chi, đầu tư, mục tiêu tài chính. Giao diện tiếng Việt, đơn vị VND.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS v4 + shadcn/ui (New York, Neutral)
- **Backend:** Supabase (PostgreSQL + Auth)
- **State:** TanStack Query v5
- **Forms:** react-hook-form + zod
- **Deploy:** Vercel

## Cài đặt & Chạy

```bash
npm install

# Tạo .env.local với Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

npm run dev      # http://localhost:3000
npm run build    # Production build (TypeScript + ESLint check)
npm run lint     # ESLint only
```

Xem chi tiết: [`docs/development-guide.md`](docs/development-guide.md)

## Tài liệu dự án

| Tài liệu                                                     | Mô tả                                 |
| ------------------------------------------------------------ | ------------------------------------- |
| [`docs/index.md`](docs/index.md)                             | Entry point — index toàn bộ docs      |
| [`docs/architecture.md`](docs/architecture.md)               | Request flow, layers, auth, state     |
| [`docs/data-models.md`](docs/data-models.md)                 | DB schema, TypeScript types           |
| [`docs/api-contracts.md`](docs/api-contracts.md)             | Tất cả Supabase hooks                 |
| [`docs/component-inventory.md`](docs/component-inventory.md) | 30+ components                        |
| [`docs/development-guide.md`](docs/development-guide.md)     | Setup, commands, conventions          |
| [`CLAUDE.md`](CLAUDE.md)                                     | Hướng dẫn conventions cho Claude Code |

---

## Quy trình làm việc với BMAD

Project này tích hợp [BMAD Method](https://github.com/bmadcode/bmad-method) — framework giúp AI có context xuyên suốt và quy trình làm việc có cấu trúc.

### Chọn quy trình phù hợp

| Quy mô task     | Ví dụ                                                               | Quy trình          |
| --------------- | ------------------------------------------------------------------- | ------------------ |
| **Nhỏ / Trung** | Sửa bug, enable/disable field, thêm validation, tweak UI            | Quick Flow         |
| **Lớn**         | Tính năng mới hoàn chỉnh, thay đổi architecture, multi-page feature | Full BMad Flow     |
| **Research**    | Phân tích cạnh tranh, brainstorm ý tưởng, technical spike           | Research Workflows |

---

### Quick Flow — Task nhỏ & trung

Dùng khi thay đổi ≤ 5 files, không cần PRD, có thể spec xong trong 1 session.

```
Bước 1: /bmad-bmm-quick-spec
  → Step 1: Understand  — Claude hỏi decisions (strategy, scope, edge cases)
                          [A] Advanced Elicitation để đào sâu hơn
                          [C] Continue sang bước tiếp
  → Step 2: Investigate — Claude đọc code, xác định chính xác dòng/file cần sửa
  → Step 3: Generate    — Tạo tasks + Acceptance Criteria (ACs) chi tiết
  → Step 4: Review      — [C] finalize spec | [B] bắt đầu dev ngay | [R] adversarial review spec

Bước 2: /bmad-bmm-quick-dev <path-to-spec>
  → Execute:            Implement từng task, chạy npm run build verify TypeScript
  → Self-check:         Đối chiếu tất cả tasks + ACs
  → Adversarial review: Tìm findings (Critical/High/Medium/Low/Noise)
                        [F] Auto-fix findings "real" | [W] Walk through từng cái | [S] Skip
  → Playwright MCP:     Test ACs trên browser thực tế (cần npm run dev đang chạy)

Bước 3: commit + push
```

**Spec artifacts:** `_bmad-output/implementation-artifacts/tech-spec-<slug>.md`

---

### Full BMad Flow — Task lớn & tính năng mới

Dùng khi cần planning kỹ, nhiều file thay đổi, hoặc cần alignment trước khi code.

```
Bước 1: Research (tuỳ chọn)
  /bmad-bmm-market-research     — Nghiên cứu thị trường / cạnh tranh
  /bmad-bmm-domain-research     — Nghiên cứu domain / ngành
  /bmad-bmm-technical-research  — Nghiên cứu kỹ thuật, lựa chọn giải pháp

Bước 2: Planning
  /bmad-bmm-create-product-brief  — Tạo product brief (vấn đề, mục tiêu, users)
  /bmad-bmm-create-prd            — Tạo PRD chi tiết từ brief
  /bmad-bmm-validate-prd          — Validate PRD trước khi chuyển sang design
  /bmad-bmm-create-ux-design      — Tạo UX specs & patterns
  /bmad-bmm-create-architecture   — Tạo technical architecture & solution design

Bước 3: Breakdown
  /bmad-bmm-create-epics-and-stories  — Chia PRD thành epics + user stories
  /bmad-bmm-sprint-planning           — Tạo sprint plan từ epics

Bước 4: Implementation (lặp lại cho mỗi story)
  /bmad-bmm-create-story      — Tạo story file với đầy đủ context cho AI
  /bmad-bmm-dev-story <file>  — Implement story (agent dev tự động)
  /bmad-bmm-sprint-status     — Kiểm tra tiến độ sprint, phát hiện risks

Bước 5: Review & Retro
  /bmad-bmm-code-review       — Adversarial code review
  /bmad-bmm-correct-course    — Xử lý khi cần thay đổi hướng giữa sprint
  /bmad-bmm-retrospective     — Retrospective sau khi hoàn thành epic
```

**Planning artifacts:** `_bmad-output/planning-artifacts/`
**Implementation artifacts:** `_bmad-output/implementation-artifacts/`

---

### Research & Utilities

```
/bmad-brainstorming               — Brainstorm ý tưởng với nhiều kỹ thuật sáng tạo
/bmad-bmm-document-project        — Scan & generate docs cho project (đã chạy → docs/)
/bmad-bmm-generate-project-context — Tạo project-context.md với AI rules
/bmad-bmm-check-implementation-readiness — Validate PRD + UX + Architecture đã đủ chưa
/bmad-help                        — Gợi ý bước tiếp theo dựa trên trạng thái hiện tại
/bmad-party-mode                  — Multi-agent discussion giữa tất cả BMAD agents
```

---

### Agents chuyên biệt

Có thể gọi trực tiếp từng agent để có góc nhìn chuyên sâu:

| Agent            | Lệnh                          | Chuyên môn                                  |
| ---------------- | ----------------------------- | ------------------------------------------- |
| Product Manager  | `/bmad-agent-bmm-pm`          | PRD, requirements, prioritization           |
| Business Analyst | `/bmad-agent-bmm-analyst`     | Research, user stories, acceptance criteria |
| Architect        | `/bmad-agent-bmm-architect`   | Technical design, solution decisions        |
| UX Designer      | `/bmad-agent-bmm-ux-designer` | UX patterns, design specs                   |
| Developer        | `/bmad-agent-bmm-dev`         | Implementation, code review                 |
| QA Engineer      | `/bmad-agent-bmm-qa`          | Test strategy, edge cases                   |
| Scrum Master     | `/bmad-agent-bmm-sm`          | Sprint planning, sprint status              |
| Tech Writer      | `/bmad-agent-bmm-tech-writer` | Documentation                               |

---

### Tips

- Bắt đầu bằng `/bmad-help` nếu không chắc nên làm gì tiếp theo
- Với task nhỏ: không cần full flow — Quick Flow là đủ và nhanh hơn nhiều
- Với task lớn: đừng bỏ qua bước `/bmad-bmm-validate-prd` và `/bmad-bmm-check-implementation-readiness` trước khi code
- `/bmad-party-mode` hữu ích khi cần nhiều góc nhìn khác nhau cho một quyết định khó
