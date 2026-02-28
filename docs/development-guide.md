# Hướng dẫn phát triển — Family Finance Command Center

**Ngày tạo:** 2026-02-28

---

## Prerequisites

| Tool | Phiên bản | Mô tả |
|------|-----------|-------|
| Node.js | ≥ 20 | Runtime |
| npm | ≥ 10 | Package manager |
| Supabase account | — | Backend/DB |

---

## Setup môi trường

### 1. Clone và cài dependencies
```bash
git clone <repo-url>
cd finance-tracker-v2
npm install
```

### 2. Cấu hình environment variables
Tạo file `.env.local` ở root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> File `.env.local` đã có sẵn trong project. Xem Supabase dashboard → Settings → API.

### 3. Setup database
Vào Supabase Dashboard → SQL Editor, chạy theo thứ tự:
```
1. supabase/schema.sql                          # Schema + RLS + seed categories
2. supabase/migration-category-redesign.sql     # Nếu cần
3. supabase/migration-investment-tracking.sql   # Nếu cần
4. supabase/migration-normalize-tickers.sql     # Nếu cần
```

### 4. Tạo users
Vào Supabase Dashboard → Authentication → Users → Add user
(App là single-family, tạo thủ công 2 users: vợ/chồng)

---

## Lệnh phát triển

```bash
npm run dev      # Dev server tại http://localhost:3000
npm run build    # Production build (TypeScript check + ESLint + Next.js build)
npm run lint     # Chạy ESLint
```

---

## Thêm shadcn/ui component

```bash
npx shadcn@latest add <component-name>
# Ví dụ:
npx shadcn@latest add table
npx shadcn@latest add chart
```

File được tạo tại `src/components/ui/<component>.tsx`

---

## Conventions

### TypeScript Types
- **Source of truth:** `src/types/database.ts`
- Khi thêm field mới vào DB → cập nhật type ở đây trước

### TanStack Query Hooks
Pattern cho mỗi entity mới:
```typescript
// src/hooks/use-<entity>.ts

export function use<Entity>(filters?) {
  return useQuery({
    queryKey: ['<entity>', filters],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('<table>').select('...')
      if (error) throw error
      return data ?? []
    }
  })
}

export function useCreate<Entity>() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => { /* supabase insert */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['<entity>'] })
    }
  })
}
```

### Supabase Client
```typescript
// Client components + hooks → LUÔN dùng browser client
import { createClient } from '@/lib/supabase/client'

// Server components → dùng server client
import { createClient } from '@/lib/supabase/server'
```

### Soft Delete
- `transactions` và `assets` dùng soft delete
- Query luôn có: `.is('deleted_at', null)`
- Delete: `.update({ deleted_at: new Date().toISOString() })`

### Dialog vs Drawer
```typescript
const isMobile = useIsMobile() // từ hook resize listener
// Mobile → <Drawer> (vaul)
// Desktop → <Dialog> (shadcn/ui)
```

### Theme (Anti-hydration-mismatch)
```typescript
// LUÔN dùng pattern này khi render theme-dependent UI
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
const { resolvedTheme, setTheme } = useTheme()

// Render:
if (!mounted) return null // hoặc fallback
return resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />
```

### Currency & Locale
```typescript
// Format VND
new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// Format date
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
format(date, 'dd/MM/yyyy', { locale: vi })
```

---

## Cấu trúc form mới

Pattern chuẩn với react-hook-form + zod:

```typescript
const schema = z.object({
  amount: z.number().positive('Số tiền phải > 0'),
  // ...
})

export function MyForm({ onSubmit }: { onSubmit: (data) => void }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

---

## Thêm trang mới (Dashboard)

1. Tạo file `src/app/(dashboard)/<page-name>/page.tsx`
2. Thêm link vào `src/components/layout/sidebar.tsx` (desktop)
3. Thêm tab vào `src/components/layout/bottom-nav.tsx` (mobile)

---

## Deploy

Project được deploy trên **Vercel** (`.vercel/project.json` đã có).

```bash
# Deploy tự động qua Git push
git push origin main
# Vercel tự động build và deploy
```

**Build check:** `npm run build` phải pass trước khi merge PR.

---

## CI/CD

| Workflow | Trigger | Mô tả |
|----------|---------|-------|
| `.github/workflows/claude-code-review.yml` | PR | Claude AI review code |
| `.github/workflows/claude.yml` | PR | Claude PR assistant |

---

## Debugging

**TanStack Query DevTools:** Thêm `ReactQueryDevtools` vào `query-provider.tsx` khi debug:
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// Trong QueryProvider:
<ReactQueryDevtools initialIsOpen={false} />
```

**Supabase logs:** Dashboard → Logs → API logs để debug queries.

**Hydration errors:** Kiểm tra theme-dependent components có dùng `mounted` pattern chưa.
