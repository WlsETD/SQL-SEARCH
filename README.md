# 澄海渡假村 · 訂房與設施資料庫 SQL 查詢練習

資料庫課程作業：可操作的 SQL 查詢網頁，部署於 GitHub Pages。

**網址：** https://wlsetd.github.io/SQL-SEARCH/

## 網頁內容

1. **案例背景**：虛構海濱渡假村，使用者為櫃檯、營運經理、財務、行銷；要解決重複訂房、取消單被算進營收、閒置房間、高消費旅客等問題。
2. **資料庫設計**：設計規則、ERD、6 張資料表的欄位說明與全部 67 筆樣本資料。
3. **查詢操作**：9 個查詢（SELECT/JOIN、日期計算、GROUP BY、LEFT JOIN、HAVING、子查詢、NOT EXISTS、CASE/COALESCE、視窗函數），每題有 SQL、預期結果，可修改並執行，顯示實際結果或錯誤訊息（附中文提示）。
4. **結果比較**：5 組「同一問題、不同 SQL」：INNER vs LEFT JOIN、日期區間重疊、忘記排除取消單、NULL 比較、WHERE vs HAVING。

## 資料表

| 資料表 | 說明 | 關聯 |
|---|---|---|
| `room_type` | 房型與定價 | 1 : N `room` |
| `room` | 客房 | 1 : N `booking` |
| `guest` | 旅客（`account` 唯一；`member_level` NULL = 非會員） | 1 : N `booking` |
| `booking` | 訂單，保存成交價與狀態 | 1 : N `facility_order` |
| `facility` | 設施 | 1 : N `facility_order` |
| `facility_order` | 設施使用紀錄 | — |

## 技術與檔案

- `index.html`：網頁本體（GitHub Pages 的入口）。
- `assets/`：版面系統（system、motion、layout 的 CSS／JS），由 index.html 載入。
- `lib/`：[sql.js](https://github.com/sql-js/sql.js)（SQLite 編譯為 WebAssembly，MIT 授權）。找不到時會改從 jsDelivr 載入。
- 全部在瀏覽器執行，不需伺服器；每次執行都從原始資料重建資料庫。
- 圖示：Lucide（ISC）介面圖示，SQLite 與 GitHub 標誌來自 Simple Icons（CC0），名稱與標誌屬於其所有者。網頁中沒有使用 emoji。
- 配色：#0B6896、#0A97BE、#24A3AB、#8FC2BB、#DCDAD4（海灘色票）。

## 修改內容

資料、查詢與說明文字在 `src/data.mjs`，版面在 `src/template.html`。修改後重新產生 `index.html`：

```bash
npm install
npm run build
```

建置程式會用真正的 SQLite 計算每題的「預期結果」，並把實際數字填進比較說明。

> 注意：直接雙擊 `index.html` 以 `file://` 開啟時，瀏覽器可能擋下 `.wasm` 與模組腳本；請用 GitHub Pages 網址或 `python3 -m http.server` 開啟。
