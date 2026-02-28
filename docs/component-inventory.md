# Danh mục Components — Family Finance Command Center

**Ngày tạo:** 2026-02-28

---

## shadcn/ui Primitives (`src/components/ui/`)

> Các file này được generate bởi `npx shadcn@latest add <component>`. **KHÔNG sửa trực tiếp** — thêm component mới bằng CLI.

| Component    | File                | Mô tả                                                          |
| ------------ | ------------------- | -------------------------------------------------------------- |
| Button       | `button.tsx`        | Nút bấm (variants: default, outline, ghost, destructive)       |
| Card         | `card.tsx`          | Container card với header/content/footer                       |
| Dialog       | `dialog.tsx`        | Modal dialog (dùng trên desktop)                               |
| Drawer       | `drawer.tsx`        | Slide-up drawer từ vaul (dùng trên mobile)                     |
| Form         | `form.tsx`          | react-hook-form integration (FormField, FormItem, FormMessage) |
| Input        | `input.tsx`         | Text input                                                     |
| Label        | `label.tsx`         | Form label                                                     |
| Select       | `select.tsx`        | Dropdown select                                                |
| Sheet        | `sheet.tsx`         | Side panel                                                     |
| Skeleton     | `skeleton.tsx`      | Loading skeleton                                               |
| Tabs         | `tabs.tsx`          | Tab navigation                                                 |
| Badge        | `badge.tsx`         | Badge/chip                                                     |
| Progress     | `progress.tsx`      | Progress bar (dùng cho goal progress)                          |
| Separator    | `separator.tsx`     | Horizontal divider                                             |
| DropdownMenu | `dropdown-menu.tsx` | Dropdown menu                                                  |
| Table        | `table.tsx`         | Data table                                                     |
| AlertDialog  | `alert-dialog.tsx`  | Confirmation dialog (xóa)                                      |
| Popover      | `popover.tsx`       | Floating popover                                               |
| Command      | `command.tsx`       | Command/search palette                                         |
| Calendar     | `calendar.tsx`      | Date calendar picker                                           |
| DatePicker   | `date-picker.tsx`   | Date picker wrapper                                            |

**Cách thêm component mới:**

```bash
npx shadcn@latest add <component-name>
```

---

## Layout Components (`src/components/layout/`)

### `sidebar.tsx`

- **Hiển thị:** Desktop (`md:` breakpoint trở lên)
- **Width:** 60px (fixed left)
- **Nội dung:** Logo, navigation links, theme toggle
- **Pattern:** Dùng `resolvedTheme` + `mounted` state để tránh hydration mismatch

### `bottom-nav.tsx`

- **Hiển thị:** Mobile (ẩn trên `md:`)
- **Vị trí:** Fixed bottom, full width
- **Tabs:** Dashboard, Transactions, Assets, Goals, Settings

### `fab.tsx`

- **Hiển thị:** Mobile only
- **Vị trí:** Fixed bottom-right
- **Action:** Mở AddTransactionDialog
- **Trigger:** Được điều khiển từ Dashboard layout (`setDialogOpen`)

---

## Dashboard Components (`src/components/dashboard/`)

### `cashflow-card.tsx`

- **Hook:** `useMonthlyCashflow(month)`
- **Hiển thị:** Thu nhập / Chi tiêu / Đầu tư / Net cashflow của tháng
- **Feature:** Month selector (previous/next)

### `goal-progress-card.tsx`

- **Hook:** `usePinnedGoal()` + `useTotalAssets()`
- **Hiển thị:** Progress bar % (totalAssets / target_amount), tên mục tiêu, số tiền
- **Logic:** Progress = totalAssets / goal.target_amount × 100

### `assets-summary-card.tsx`

- **Hook:** `useTotalAssets()`
- **Hiển thị:** Tổng giá trị danh mục (tiền mặt + đầu tư)

---

## Transaction Components (`src/components/transactions/`)

### `transaction-form.tsx`

- **Form:** react-hook-form + zod validation
- **Fields:** type (segmented), amount, category, date, notes
- **Investment fields:** direction (buy/sell), quantity, unit_price, ticker/bank, interest, term
- **UX:** Auto-focus amount, segmented type selector

### `transaction-list.tsx`

- **Props:** `transactions[]`, `isLoading`
- **Hiển thị:** Ngày, category icon, ghi chú, số tiền (màu theo type)
- **Loading state:** Skeleton

### `add-transaction-dialog.tsx`

- **Pattern:** Dialog (desktop) vs Drawer (mobile) qua `useIsMobile()`
- **State:** Quản lý từ dashboard layout (FAB click) hoặc từ page
- **Wraps:** `transaction-form.tsx`

### `ticker-symbol-combobox.tsx`

- **Dùng:** Trong transaction form khi type=investment
- **Pattern:** Command + Popover (combobox)
- **Data:** Market tickers từ market_prices

---

## Asset Components (`src/components/assets/`)

### `asset-holdings-list.tsx`

- **Hook:** `useAssetHoldings()`
- **Hiển thị:** Category, ticker, số lượng, avg cost, current value, P&L, P&L%
- **Loading:** Skeleton rows

---

## Goal Components (`src/components/goals/`)

### `goal-form.tsx`

- **Fields:** name, target_amount, show_on_dashboard
- **Validation:** zod

### `goal-list.tsx`

- **Hiển thị:** Active goals (chưa đạt) + Achieved goals (đã đạt)
- **Actions:** Pin/unpin dashboard, mark as achieved, edit, delete

### `add-goal-dialog.tsx`

- **Pattern:** Dialog (desktop) vs Drawer (mobile)

---

## Settings Components (`src/components/settings/`)

### `market-price-form-dialog.tsx`

- **Upsert** giá thị trường cho: gold, stock, ETF, savings
- **Fields:** asset_type, ticker_symbol (optional), price_per_unit
- **For savings:** bank_name, term_months, interest_rate

---

## Provider Components

### `theme-provider.tsx`

Wrapper cho `next-themes` ThemeProvider với: `attribute="class"`, `defaultTheme="system"`, `enableSystem`

### `query-provider.tsx`

Wrapper cho TanStack `QueryClientProvider`. Tạo QueryClient instance với `useState` để tránh recreate mỗi render.

---

## Pattern: Dialog vs Drawer

```typescript
// Trong mọi dialog/drawer component:
const isMobile = useIsMobile()

if (isMobile) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* Form content */}
      </DrawerContent>
    </Drawer>
  )
}

return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      {/* Same form content */}
    </DialogContent>
  </Dialog>
)
```
