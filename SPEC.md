# Finance Tracker App — SPEC.md

> Source of truth cho toàn bộ project. Đọc file này trước khi code bất kỳ tính năng nào.

---

## 1. Project Overview

**Mục tiêu:** Web app quản lý tài sản cá nhân cho gia đình, mobile-first.
**Mục tiêu tài chính:** Tích lũy đủ vốn mua nhà năm 2030 (cần 1,500 tr, đã có ~905 tr).
**Người dùng:** Cá nhân (1 user, không cần multi-tenant).

---

## 2. Tech Stack

| Layer      | Tech                                    |
| ---------- | --------------------------------------- |
| Frontend   | Next.js (App Router), TypeScript        |
| Styling    | Tailwind CSS + shadcn/ui                |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
| Charts     | Recharts                                |
| Deploy     | Vercel                                  |

---

## 3. Thông tin tài chính thực tế

> ⚠️ **Bảo mật:** Các con số dưới đây là dữ liệu thực — KHÔNG commit file này lên repo public. Giá trị khởi tạo được nhập qua Onboarding flow (xem Section 13), không hardcode vào source code.

### Tài sản hiện tại (snapshot khởi tạo)

| Tài sản   | Giá trị                           |
| --------- | --------------------------------- |
| Vàng nhẫn | 22.5 chỉ × 18 tr/chỉ = **405 tr** |
| Tiết kiệm | **500 tr**                        |
| **Tổng**  | **~905 tr**                       |

### Thu nhập gia đình

|          | Hiện tại          | Tăng trưởng |
| -------- | ----------------- | ----------- |
| Chồng    | 29.7 tr/tháng NET | ~5%/năm     |
| Vợ       | 13.6 tr/tháng NET | ~5%/năm     |
| **Tổng** | **43.3 tr/tháng** |             |

### Chi tiêu cố định

- **12 tr/tháng** (không bao gồm chi phí thai sản / em bé)

### Mục tiêu mua nhà 2030

| Khoản                | Giá trị             |
| -------------------- | ------------------- |
| Giá nhà              | 3,000 tr            |
| Vay ngân hàng (max)  | 1,500 tr            |
| Vốn tự có cần        | 1,500 tr            |
| Đã có                | ~905 tr             |
| **Còn cần tích lũy** | **~595 tr**         |
| Timeline             | 57 tháng (đến 2030) |

---

## 4. Kế hoạch DCA — 4 Giai đoạn

### Phase 1 — Chưa có em bé

| Kênh         | Số tiền       | Ghi chú           |
| ------------ | ------------- | ----------------- |
| Vàng         | 18 tr/tháng   | 1 chỉ/tháng       |
| ETF E1VFVN30 | 3.3 tr/tháng  | 100 cổ × 33,000đ  |
| Coin         | ~3.8 tr/tháng | 5$/ngày × 30 ngày |
| **Tổng DCA** | **25.1 tr**   |                   |
| Chi tiêu     | 12 tr         |                   |
| **Buffer**   | **~6.2 tr**   |                   |

### Phase 2 — Mang thai

| Kênh             | Số tiền       | Ghi chú       |
| ---------------- | ------------- | ------------- |
| Vàng             | 12 tr/tháng   | 2 chỉ/3 tháng |
| ETF              | 3.3 tr/tháng  | Giữ nguyên    |
| Coin             | ~3.8 tr/tháng | Giữ nguyên    |
| Chi phí thai sản | 4 tr/tháng    | Khám + thuốc  |
| **Buffer**       | **~8.2 tr**   |               |

### Phase 3 — Vợ nghỉ sinh (6 tháng)

| Kênh       | Số tiền       | Ghi chú                       |
| ---------- | ------------- | ----------------------------- |
| Vàng       | 6 tr/tháng    | 1 chỉ/3 tháng                 |
| ETF        | 3.3 tr/tháng  | Giữ nguyên                    |
| Coin       | ~3.8 tr/tháng | Giữ nguyên                    |
| Thu nhập   | 39.7 tr       | Chồng 29.7 tr + BHTS vợ 10 tr |
| Chi phí bé | 5.5 tr/tháng  | Sữa + tã + đồ dùng            |
| **Buffer** | **~9.1 tr**   |                               |

### Phase 4 — Vợ đi làm lại

| Kênh       | Số tiền       | Ghi chú       |
| ---------- | ------------- | ------------- |
| Vàng       | 12 tr/tháng   | 2 chỉ/3 tháng |
| ETF        | 3.3 tr/tháng  | Giữ nguyên    |
| Coin       | ~3.8 tr/tháng | Giữ nguyên    |
| Chi phí bé | 5.5 tr/tháng  | Vẫn còn       |
| **Buffer** | **~6.7 tr**   |               |

---

## 5. Danh mục Coin

| Coin | Tỷ lệ | DCA     |
| ---- | ----- | ------- |
| BTC  | 20%   | 1$/ngày |
| ETH  | 20%   | 1$/ngày |
| SOL  | 20%   | 1$/ngày |
| BNB  | 20%   | 1$/ngày |
| XRP  | 20%   | 1$/ngày |

> Dùng Recurring Buy trên Binance — set up 1 lần, tự động. **Dữ liệu giao dịch nhập thủ công vào app** (xem Section 6.2 Coin).

---

## 6. Màn hình & Tính năng

### Navigation

- **Mobile:** Bottom tab bar — Dashboard / Tài sản / DCA / Forecast / Cài đặt
- **Desktop:** Sidebar

### 6.1 Dashboard (`/`)

- Summary bar: Tổng tài sản, Tăng trưởng tháng, Còn cần tích lũy, Mục tiêu 2030 %
- Net worth line chart (filter: 3T / 6T / 1N / Tất cả)
- Asset allocation donut chart (Vàng / Tiết kiệm / Coin / ETF / Tiền mặt)
- Goal progress card: "Mua nhà 2030 — 905tr / 1,500tr"
- DCA status row: 4 kênh × badge Đã mua / Chưa mua

### 6.2 Tài sản (`/assets`)

List 5 kênh dạng card: Vàng / Tiết kiệm / Coin / ETF / Tiền mặt

#### Vàng (`/assets/gold`)

**Summary bar (3 rows × 2 cols):**

- Row 1: Tổng chỉ | Giá vốn TB
- Row 2: Tổng giá trị | P&L (Unrealized)
- Row 3: Giá hiện tại | Chênh lệch GVK

**Chart:** Biến động giá — Giá vốn TB vs Giá thị trường

**Giao dịch:**

- Badge MUA (xanh) / BÁN (đỏ)
- Mỗi row: Badge | Ngày | Số chỉ · Giá/chỉ | Thành tiền | ⋮ menu
- ⋮ dropdown: Sửa / Xoá
- Xoá → confirmation dialog

**Bottom sheet thêm giao dịch:**

- Toggle: MUA / BÁN
- Fields: Ngày, Số chỉ, Giá/chỉ, Thành tiền (auto), Ghi chú
- Khi BÁN: hiển thị note "Số tiền sẽ tự động cộng vào Tiền mặt"

#### Tiết kiệm (`/assets/savings`)

**Summary:** Tổng gốc, Tổng lãi dự kiến, Tổng đáo hạn

**Cards per sổ:** Tên ngân hàng, Số tiền gốc, Lãi suất, Ngày gửi, Ngày đáo hạn, Giá trị đáo hạn, Badge trạng thái (Đang chạy / Sắp đáo hạn / Đã đáo hạn)

**Quy tắc badge trạng thái:**
- `active`: ngày hiện tại < maturity_date − 30 ngày
- `maturing`: trong vòng 30 ngày trước maturity_date
- `matured`: ngày hiện tại >= maturity_date

**Flow đáo hạn (KHÔNG tự động):**
- Vercel Cron chạy hàng ngày: nếu `maturity_date <= today` và `status = active` → đổi status thành `matured`
- App hiển thị banner: "Sổ [tên ngân hàng] đã đáo hạn — Xác nhận nhận tiền?"
- User bấm xác nhận → tạo `cash_transactions` (type: in, source: savings_maturity)
- Nếu user không xác nhận, tiền chưa vào Tiền mặt

**Bottom sheet thêm sổ:**

- Fields: Tên ngân hàng, Số tiền gốc, Lãi suất (%/năm), Ngày gửi
- Kỳ hạn: segmented [1T][3T][6T][9T][12T][24T]
- Loại lãi: toggle [Cuối kỳ][Hàng tháng]
- Ngày đáo hạn: auto tính, read-only
- Giá trị đáo hạn: auto tính, read-only, màu teal
- Note: "Khi đáo hạn, bạn sẽ được nhắc xác nhận nhận tiền vào Tiền mặt"

#### Coin (`/assets/coin`)

**Summary:** Tổng giá trị (USD + VND), Tổng đầu tư, P&L

**Holdings:** Cards per coin (BTC/ETH/SOL/BNB/XRP)

- Logo, Tên, Số lượng, Giá vốn TB, Giá hiện tại, Giá trị, P&L (%)

**Tabs:** Danh mục / Lịch sử DCA

**Bottom sheet thêm giao dịch coin:**

- Toggle: MUA / BÁN
- Fields: Coin (dropdown BTC/ETH/SOL/BNB/XRP), Ngày, Số lượng, Giá (USD), Tổng USD (auto)
- Khi BÁN: validate số lượng bán ≤ số đang giữ per coin

> **MVP:** Nhập thủ công từng giao dịch. Recurring Buy trên Binance không tự sync — người dùng nhập cuối tuần hoặc cuối tháng.
> **Future:** Import CSV từ Binance export.

#### ETF (`/assets/etf`)

**Summary:** Tổng số cổ, Giá vốn TB, Giá trị hiện tại, P&L

**Chart:** Giá vốn TB vs Giá thị trường theo tháng

**Giao dịch:** Ngày, Số cổ, Giá mua, Thành tiền | ⋮ menu

#### Tiền mặt (`/assets/cash`)

- Tổng số dư
- Lịch sử: tiền vào từ bán vàng / đáo hạn tiết kiệm / nhập thủ công
- Tiền ra khi chi tiêu hoặc chuyển sang kênh khác

**Bottom sheet "Chi tiền mặt":**

- Fields: Số tiền, Ngày, Mục đích (dropdown: Mua vàng / Mua ETF / Mua Coin / Chi tiêu / Khác), Ghi chú
- Validate: số tiền chi ≤ số dư hiện tại
- `cash_transactions.source = 'manual_out'`

**Bottom sheet "Nhận tiền mặt" (nhập thủ công):**

- Fields: Số tiền, Ngày, Ghi chú
- `cash_transactions.source = 'manual_in'`

### 6.3 DCA Tracker (`/dca`)

- Phase selector tabs: P1 / P2 / P3 / P4
- Mỗi phase: kế hoạch DCA, thu nhập, chi tiêu, buffer
- Monthly table: kế hoạch vs thực tế vs chênh lệch
- Cumulative DCA chart: thực tế vs kế hoạch

**Ghi nhận thực tế:**
Mỗi tháng có nút "Ghi nhận tháng [MM/YYYY]" → bottom sheet nhập actual cho từng kênh (Vàng, ETF, Coin). Dữ liệu lưu vào bảng `dca_logs`.

### 6.4 Forecast (`/forecast`)

- Goal card: 1,500 tr — đã có 905 tr — còn 595 tr
- Forecast chart: đường tích lũy dự kiến theo simulation từng tháng, highlight điểm về đích
- Simulation sliders: điều chỉnh DCA tháng, tỷ lệ tăng trưởng từng kênh → chart tự update
- Scenario cards: Giữ nguyên / Tăng 20% / Giảm 20%

### 6.5 Cài đặt (`/settings`)

**Phase hiện tại:**
- Dropdown chọn thủ công: P1 / P2 / P3 / P4
- Ngày bắt đầu phase: date picker
- Khi đổi phase: `dca_plans` cũ giữ nguyên (immutable), tạo record mới với `is_active = true`, record cũ set `is_active = false`
- Dashboard và DCA Tracker đọc phase có `is_active = true`
- Lịch sử DCA vẫn hiển thị đúng phase theo tháng đã log trong `dca_logs`

**Giá thủ công:**
- Giá vàng hiện tại (VND/chỉ): input + nút "Lưu" → lưu vào `price_overrides`
- Tỷ giá USD/VND: toggle [Tự động fetch] / [Nhập tay]
- Hiển thị "Cập nhật lần cuối: HH:MM DD/MM" cho mọi giá thủ công

**Quản lý DCA per phase:** chỉnh sửa `dca_plans` của phase đang active

---

## 7. Data Model (Supabase)

> **Security:** Bật RLS cho tất cả bảng. Policy mẫu áp dụng cho mọi bảng:
> ```sql
> CREATE POLICY "user_isolation" ON <table>
>   FOR ALL USING (user_id = auth.uid());
> ```
> Anon key chỉ dùng cho auth flow, không query dữ liệu trực tiếp.

```sql
-- Vàng
gold_transactions (
  id, user_id, type (buy/sell), date,
  quantity_chi, price_per_chi, total_amount,
  note, created_at
)

-- Tiết kiệm
savings_accounts (
  id, user_id, bank_name, principal,
  interest_rate, start_date, term_months,
  interest_type (end_of_term/monthly),
  maturity_date, maturity_value,
  status (active/maturing/matured),
  note, created_at
)

-- Coin
coin_transactions (
  id, user_id, coin_symbol, type (buy/sell),
  date, quantity, price_usd, total_usd,
  note, created_at
)

-- ETF
etf_transactions (
  id, user_id, date, quantity,
  price_per_share, total_amount,
  note, created_at
)

-- Tiền mặt
cash_transactions (
  id, user_id, type (in/out),
  amount, source (gold_sale/savings_maturity/manual_in/manual_out),
  source_id, date, note, created_at
)

-- DCA Plan config
dca_plans (
  id, user_id, phase (1/2/3/4),
  gold_amount, etf_amount, coin_amount,
  income, fixed_expense, extra_expense,
  is_active, created_at
)

-- DCA thực tế (để so sánh với kế hoạch)
dca_logs (
  id, user_id, phase (1/2/3/4),
  month (YYYY-MM),
  channel (gold/etf/coin),
  planned_amount, actual_amount,
  note, created_at
)

-- Giá nhập tay
price_overrides (
  id, user_id,
  asset (gold/usd_vnd),
  price, updated_at
)

-- Goals
goals (
  id, user_id, name, target_amount,
  target_date, created_at
)
```

---

## 8. Business Logic

### 8.1 Giá vốn trung bình vàng (Average Cost Method)

```
Khi MUA:
  GVK_TB_mới = (Tổng tiền đã bỏ ra) / (Tổng số chỉ hiện có)

Khi BÁN:
  GVK_TB KHÔNG thay đổi
  Pool chỉ = Pool cũ - Số chỉ bán
  Realized P&L = (Giá bán - GVK_TB) × Số chỉ bán
  → Tiền bán tự động cộng vào Tiền mặt (tạo cash_transaction)
```

### 8.2 P&L Vàng

```
Unrealized P&L = (Giá HT - GVK_TB) × Tổng chỉ đang giữ
Realized P&L   = Tổng lãi/lỗ từ các lần bán (dùng GVK_TB tại thời điểm bán)
```

> ⚠️ KHÔNG hiển thị P&L trên từng giao dịch riêng lẻ — chỉ hiển thị tổng trong Summary bar.

### 8.3 Tiết kiệm — Tính lãi

```
Cuối kỳ:
  Lãi = Gốc × Lãi_suất × (Số_ngày / 365)
  Giá trị đáo hạn = Gốc + Lãi

Hàng tháng:
  Lãi/tháng = Gốc × (Lãi_suất / 12)
  Không compound tự động — user phải xác nhận tái tục để ghi nhận compound
```

### 8.4 Forecast — Monthly Simulation

Thay vì công thức linear, forecast chạy simulation từng tháng:

```
Giả định tăng trưởng mặc định (user chỉnh qua sliders):
  Vàng:       +0.5%/tháng  (≈ 6%/năm, conservative)
  ETF:        +0.8%/tháng  (≈ 10%/năm)
  Coin:       +0%/tháng    (không giả định, quá volatile)
  Tiết kiệm:  theo lãi suất từng sổ

Mỗi tháng t:
  gold_value(t)    = gold_value(t-1) × (1 + growth_gold) + dca_gold(t)
  savings_value(t) = savings_value(t-1) + accrued_interest(t)
  etf_value(t)     = etf_value(t-1) × (1 + growth_etf) + dca_etf(t)
  coin_value(t)    = coin_value(t-1) + dca_coin(t)
  cash_value(t)    = cash_value(t-1)

  net_worth(t) = gold_value(t) + savings_value(t) + etf_value(t)
               + coin_value(t) + cash_value(t)

Tháng về đích = t đầu tiên mà net_worth(t) >= target (1,500 tr)
```

> Simulation sliders cho phép user điều chỉnh growth rate và DCA amount → chart tự re-render.

### 8.5 Format số tiền

```
0                        → "0 đ"
< 1,000,000              → "X,XXX đ"          (VD: 850,000 đ)
>= 1,000,000             → "X.X tr"           (VD: 102.9 tr)
>= 1,000,000,000         → "X.X tỷ"           (VD: 1.5 tỷ)

Số âm: thêm dấu "-" phía trước   (VD: -12.3 tr)
Làm tròn 1 chữ số thập phân cho tr/tỷ
```

### 8.6 Validation Rules

```
Vàng:
  - Số chỉ bán ≤ tổng chỉ đang giữ (không cho phép bán khống)
  - Số chỉ và giá/chỉ phải > 0
  - Ngày không được trong tương lai

Tiết kiệm:
  - Lãi suất: 0.1% – 20%/năm
  - Số tiền gốc > 0
  - Ngày gửi không được trong tương lai

Coin:
  - Số lượng bán ≤ số đang giữ per coin symbol
  - Giá USD > 0, số lượng > 0

Tiền mặt:
  - Số tiền chi ≤ số dư hiện tại

API failures:
  - Nếu fetch giá thất bại: hiển thị giá cached + label "Dữ liệu cũ từ HH:MM"
  - Nếu không có cache: hiển thị "--" và cho phép nhập thủ công tạm thời
  - Không block toàn bộ UI khi một API lỗi
```

---

## 9. API Integrations

| Data                   | Source                          | Fallback                   | Cache TTL |
| ---------------------- | ------------------------------- | -------------------------- | --------- |
| Giá vàng hiện tại      | Nhập tay trong Settings         | N/A (tay là primary)       | Vĩnh viễn đến khi user cập nhật |
| Giá coin (BTC/ETH/...) | Binance public API              | Giá cached + timestamp     | 15 phút   |
| Giá ETF E1VFVN30       | TCBS API (unofficial, cần test) | Nhập tay (tương tự vàng)   | 1 ngày    |
| Tỷ giá USD/VND         | exchangerate-api.com            | Nhập tay trong Settings    | 30 phút   |

> **Giá vàng:** Người dùng nhập thủ công trong Settings, lưu vào `price_overrides`. Nút "Cập nhật giá vàng" đặt ở màn hình `/assets/gold`. Hiển thị "Cập nhật lần cuối: HH:MM DD/MM".
>
> **Giá ETF:** Test TCBS API trước khi release. Nếu API unstable hoặc bị block, fallback về nhập tay. Cache 1 ngày vì ETF chỉ cập nhật cuối phiên giao dịch.

---

## 10. UI/UX Decisions (Decision Log)

| #   | Quyết định                                                                        | Lý do                                               |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Mobile-first, 390px baseline                                                      | App dùng chính trên điện thoại                      |
| 2   | Bottom tab bar trên mobile                                                        | Native feel, thumb-friendly                         |
| 3   | Bottom sheet thay vì dialog cho forms                                             | UX mobile tốt hơn                                   |
| 4   | ⋮ dropdown menu thay vì swipe-to-delete                                           | Web browser không hỗ trợ swipe tốt, conflict scroll |
| 5   | Bán vàng → tiền về Tiền mặt mặc định                                              | Đơn giản, không cần quyết định ngay                 |
| 6   | Tiết kiệm đáo hạn → user xác nhận trước khi tiền vào Tiền mặt                    | Tránh tự động tạo transaction sai khi cron chạy sớm |
| 7   | Không hiển thị P&L từng giao dịch vàng                                            | Vàng là tài sản gộp, P&L per-transaction sai logic  |
| 8   | Average Cost Method cho GVK TB vàng                                               | Phổ biến nhất, đơn giản nhất                        |
| 9   | Format số: tr / tỷ thay vì full digits                                            | Tránh tràn UI trên mobile                           |
| 10  | Color coding: Vàng=amber, Tiết kiệm=teal, Coin=indigo, ETF=emerald, Tiền mặt=gray | Nhất quán toàn app                                  |
| 11  | Giá API cache theo từng loại tài sản (xem Section 9)                              | ETF cần cache dài hơn coin vì ít biến động hơn      |
| 12  | shadcn/ui Drawer cho bottom sheet                                                 | Có sẵn, không cần custom                            |
| 13  | Coin nhập thủ công, không sync Binance tự động                                    | MVP đơn giản; Binance API cần auth phức tạp          |
| 14  | Phase transition thủ công trong Settings                                          | Người dùng tự biết khi nào chuyển giai đoạn         |
| 15  | Forecast dùng monthly simulation thay vì linear                                   | Phản ánh đúng tăng trưởng tài sản theo thời gian    |

---

## 11. Color Palette

| Token        | Hex                    | Dùng cho               |
| ------------ | ---------------------- | ---------------------- |
| `--gold`     | `#f59e0b`              | Vàng (amber)           |
| `--saving`   | `#06d6a0`              | Tiết kiệm (teal)       |
| `--coin`     | `#818cf8`              | Coin (indigo)          |
| `--etf`      | `#34d399`              | ETF (emerald)          |
| `--cash`     | `#6b7280`              | Tiền mặt (gray)        |
| `--bg`       | `#111111`              | Background             |
| `--card`     | `#1a1a1a`              | Card surface           |
| `--border`   | `rgba(255,255,255,0.08)` | Border               |
| `--muted`    | `#94a3b8`              | Text phụ               |
| `--green`    | `#4ade80`              | P&L dương              |
| `--red`      | `#ef4444`              | P&L âm                 |

---

## 12. Component Conventions

```
- Dùng shadcn/ui cho: Card, Button, Badge, Drawer, Tabs,
  Progress, Slider, Dialog, DropdownMenu, DatePicker
- Chart: Recharts (LineChart, PieChart/Donut)
- Icon: lucide-react
- Format tiền: utils/format.ts → formatVND(amount)
- Fetch giá: hooks/useAssetPrices.ts với SWR + cache
```

---

## 13. Thứ tự Build

1. **Onboarding flow** — wizard 3 bước nhập dữ liệu khởi tạo:
   - Bước 1: Vàng hiện có (số chỉ + giá vốn TB ước tính)
   - Bước 2: Các sổ tiết kiệm đang chạy
   - Bước 3: Coin holdings hiện tại (số lượng per coin)
   - Sau wizard: redirect về Dashboard với dữ liệu thực
2. Setup Supabase schema + auth + RLS policies
3. Layout + navigation (bottom tab bar)
4. Dashboard (mock data trước)
5. Module Vàng (đơn giản nhất, đủ pattern cho các module khác)
6. Module Tiết kiệm (bao gồm Vercel Cron cho maturity check)
7. Module ETF
8. Module Coin (phức tạp hơn vì multi-coin + API)
9. Tiền mặt
10. DCA Tracker (bao gồm `dca_logs` entry flow)
11. Forecast (simulation engine)
12. Cài đặt (phase management + price overrides)
13. Kết nối API giá thực + test TCBS ETF API
14. Polish + responsive desktop

## Tài liệu liên quan

1. finance-tracker.pen
