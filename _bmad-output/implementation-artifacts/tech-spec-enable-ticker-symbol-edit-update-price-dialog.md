---
title: 'Enable Ticker Symbol Editing in Update Price Dialog'
slug: 'enable-ticker-symbol-edit-update-price-dialog'
created: '2026-02-28'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  ['Next.js 16', 'React 19', 'TypeScript', 'react-hook-form', 'zod', 'TanStack Query', 'Supabase']
files_to_modify:
  ['src/components/settings/market-price-form-dialog.tsx', 'src/hooks/use-market-prices.ts']
code_patterns:
  [
    'react-hook-form FormField',
    'TanStack Query useMutation',
    'Supabase update by ID',
    'normalizeTickerSymbol from @/lib/utils',
  ]
test_patterns:
  [
    'Playwright MCP — navigate /settings/market-prices, click edit, type, assert field enabled + value saved',
  ]
---

# Tech-Spec: Enable Ticker Symbol Editing in Update Price Dialog

**Created:** 2026-02-28

## Overview

### Problem Statement

Trong dialog "Cập nhật giá" (`MarketPriceFormDialog`), khi `isEditing = true`, field "Mã / Tên" (`ticker_symbol`) bị `disabled={isEditing}`. User không thể sửa mã ticker khi cập nhật một market price record thuộc loại gold, stock, hoặc ETF.

### Solution

1. Bỏ `disabled={isEditing}` khỏi Input `ticker_symbol`
2. Cập nhật `onSubmit` để include `ticker_symbol` trong payload khi gọi `updateMutation`
3. Cập nhật `useUpdateMarketPrice` mutation (nếu cần) để nhận `ticker_symbol`

### Scope

**In Scope:**

- Enable field `ticker_symbol` khi editing (gold/stock/ETF)
- Update submit logic gửi `ticker_symbol` theo ID (update in-place)
- `asset_type` Select vẫn disabled khi editing (không thay đổi)
- savings fields (bank_name, term_months, interest_rate) không thay đổi

**Out of Scope:**

- Thay đổi logic create market price
- Thay đổi upsert conflict strategy
- Enable `asset_type` select khi editing

## Context for Development

### Codebase Patterns

- Form dùng `react-hook-form` + `zodResolver`
- Mutations từ `@tanstack/react-query` — `onSuccess` invalidate `['market-prices']` và `['asset-holdings']`
- Supabase update: `.update({ ...updates, updated_at: now }).eq('id', id)` — update by PK, an toàn khi đổi ticker
- `normalizeTickerSymbol(ticker)` từ `@/lib/utils` → trim + toUpperCase, trả về `undefined` nếu empty/null
- `onBlur` handler trên Input đã normalize — giữ nguyên, KHÔNG thay đổi
- `useUpdateMarketPrice` hiện tại **THIẾU** `ticker_symbol` trong TypeScript type — phải thêm

### Files to Reference

| File                                                   | Purpose                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| `src/components/settings/market-price-form-dialog.tsx` | File sửa chính: bỏ `disabled`, cập nhật `onSubmit`                    |
| `src/hooks/use-market-prices.ts`                       | Thêm `ticker_symbol?: string \| null` vào `useUpdateMarketPrice` type |
| `src/lib/utils.ts`                                     | `normalizeTickerSymbol()` — đã có, dùng lại                           |
| `src/types/database.ts`                                | `MarketPrice.ticker_symbol?: string \| null` — reference only         |

### Technical Decisions

- Update strategy: **update by ID** (`.eq('id', id)`) → không trigger upsert conflict
- `ticker_symbol` normalize qua `normalizeTickerSymbol()` → nếu empty → `null` (falsy coerce)
- `normalizeTickerSymbol()` returns `undefined` when empty → dùng `|| null` để convert sang `null` cho Supabase
- `onBlur` normalize trên Input giữ nguyên — không cần thay đổi

## Implementation Plan

### Tasks

- [x] Task 1: Thêm `ticker_symbol` vào type của `useUpdateMarketPrice`
  - File: `src/hooks/use-market-prices.ts`
  - Action: Trong type của `mutationFn` (dòng 61-67), thêm `ticker_symbol?: string | null` vào object type sau `id: string`
  - Notes: Supabase `.update({ ...updates })` sẽ tự động include field này khi được truyền vào

- [x] Task 2: Bỏ `disabled={isEditing}` khỏi Input `ticker_symbol`
  - File: `src/components/settings/market-price-form-dialog.tsx`
  - Action: Xóa prop `disabled={isEditing}` tại dòng 344 trên `<Input>` của field `ticker_symbol`
  - Notes: `onBlur` normalize handler (trim + toUpperCase) giữ nguyên, không thay đổi

- [x] Task 3: Thêm `ticker_symbol` vào payload của `updateMutation` trong `onSubmit`
  - File: `src/components/settings/market-price-form-dialog.tsx`
  - Action: Trong nhánh `isEditing && asset_type !== 'savings'` (hiện tại dòng 187-191), thêm `ticker_symbol: normalizeTickerSymbol(values.ticker_symbol) || null` vào object truyền cho `updateMutation.mutateAsync`
  - Notes: `normalizeTickerSymbol()` trả về `undefined` khi empty, dùng `|| null` để convert sang `null` cho Supabase

### Acceptance Criteria

- [x] AC 1: Given user mở dialog "Cập nhật giá" cho một record loại gold/stock/ETF, when dialog render, then field "Mã / Tên" ở trạng thái enabled (không bị disabled, có thể click và nhập)

- [x] AC 2: Given user đang edit một record với `ticker_symbol = "SJC"`, when user xóa "SJC" và nhập "SJC2" rồi click "Cập nhật", then record trong DB được update với `ticker_symbol = "SJC2"` và list market prices hiển thị lại đúng

- [x] AC 3: Given user xóa trắng field `ticker_symbol` và submit, then record được update với `ticker_symbol = null` (không phải empty string)

- [x] AC 4: Given user nhập "sjc" (chữ thường) vào field ticker_symbol, when user blur khỏi field, then giá trị trong field tự động normalize thành "SJC" (uppercase)

- [x] AC 5: Given user đang edit một record loại `savings`, when dialog render, then field `bank_name`, `term_months`, `interest_rate` vẫn editable như cũ (không bị ảnh hưởng bởi thay đổi này)

- [x] AC 6: Given user đang edit bất kỳ loại market price nào, when dialog render, then dropdown "Loại tài sản" vẫn bị disabled (không thay đổi)

## Additional Context

### Dependencies

- Không có external dependencies mới
- Không cần migration DB — `ticker_symbol` đã là nullable column trong `market_prices`

### Testing Strategy

**Playwright MCP (tự động sau khi implement):**

```
1. Navigate http://localhost:3000/settings/market-prices
2. Click nút edit trên một record gold/stock/ETF
3. Assert: field "Mã / Tên" không có attribute `disabled`
4. Clear field, type "TEST123", blur
5. Assert: field hiển thị "TEST123" (normalized uppercase)
6. Click "Cập nhật"
7. Assert: dialog đóng, list refresh, record hiển thị ticker "TEST123"
8. Mở lại edit → Assert: ticker_symbol = "TEST123"
9. Clear field ticker, submit → Assert: ticker_symbol = null (field trống)
```

**Manual check:**

- Mở dialog edit savings record → bank_name, term_months editable bình thường
- dropdown "Loại tài sản" vẫn disabled với mọi loại

### Notes

- **Risk thấp:** Chỉ 3 thay đổi nhỏ, không ảnh hưởng create flow
- **Risk trung bình:** Nếu user đổi ticker thành một ticker đã tồn tại trong cùng asset_type → Supabase có thể throw unique constraint error. Tuy nhiên, constraint này nằm ở upsert (create), không phải update-by-ID. Cần verify DB constraint trước khi ship.
- **Future:** Có thể thêm validation client-side để check duplicate ticker nếu cần

## Review Notes

- Adversarial review completed (8 findings total)
- F1 + F3 fixed: Thêm `useState<string | null>` error state + try-catch vào `onSubmit` — hiển thị lỗi inline nếu Supabase throw
- F2 fixed: Playwright MCP tests đã chạy — tất cả 6 AC verified trên trình duyệt thực tế
- F4 skipped: onBlur handler — spec cấm thay đổi ("giữ nguyên, KHÔNG thay đổi")
- F5 skipped: ticker_symbol always sent — by design, cần thiết cho update
- F6, F7, F8 skipped: pre-existing / noise
- Resolution approach: auto-fix
