// 澄海渡假村 Resort DB —— 所有資料皆為虛構
export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE room_type (
  type_id     TEXT PRIMARY KEY,
  type_name   TEXT NOT NULL,
  capacity    INTEGER NOT NULL CHECK (capacity > 0),
  base_price  INTEGER NOT NULL CHECK (base_price > 0)
);

CREATE TABLE room (
  room_no   TEXT PRIMARY KEY,
  type_id   TEXT NOT NULL REFERENCES room_type(type_id),
  floor     INTEGER NOT NULL,
  view      TEXT NOT NULL CHECK (view IN ('海景','山景','花園')),
  status    TEXT NOT NULL DEFAULT '可使用' CHECK (status IN ('可使用','維修中'))
);

CREATE TABLE guest (
  guest_id      INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  city          TEXT,
  member_level  TEXT CHECK (member_level IN ('一般','金卡','VIP'))  -- NULL = 非會員
);

CREATE TABLE booking (
  booking_id       INTEGER PRIMARY KEY,
  guest_id         INTEGER NOT NULL REFERENCES guest(guest_id),
  room_no          TEXT    NOT NULL REFERENCES room(room_no),
  check_in         TEXT    NOT NULL,
  check_out        TEXT    NOT NULL,
  adults           INTEGER NOT NULL CHECK (adults > 0),
  price_per_night  INTEGER NOT NULL,
  status           TEXT    NOT NULL CHECK (status IN ('已預訂','已入住','已退房','已取消')),
  CHECK (check_out > check_in)
);

CREATE TABLE facility (
  facility_id    TEXT PRIMARY KEY,
  facility_name  TEXT NOT NULL,
  category       TEXT NOT NULL,
  unit_price     INTEGER NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE facility_order (
  order_id     INTEGER PRIMARY KEY,
  booking_id   INTEGER NOT NULL REFERENCES booking(booking_id),
  facility_id  TEXT    NOT NULL REFERENCES facility(facility_id),
  use_date     TEXT    NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);
`;

export const ROWS = {
  room_type: [
    ['STD', '標準雙人房', 2, 3800],
    ['DLX', '豪華海景房', 2, 5600],
    ['FAM', '家庭四人房', 4, 7200],
    ['VIL', '私人泳池別墅', 6, 15800],
  ],
  room: [
    ['101', 'STD', 1, '花園', '可使用'],
    ['102', 'STD', 1, '花園', '可使用'],
    ['103', 'STD', 1, '山景', '可使用'],
    ['201', 'DLX', 2, '海景', '可使用'],
    ['202', 'DLX', 2, '海景', '可使用'],
    ['203', 'DLX', 2, '山景', '維修中'],
    ['301', 'FAM', 3, '海景', '可使用'],
    ['302', 'FAM', 3, '山景', '可使用'],
    ['303', 'FAM', 3, '花園', '可使用'],
    ['V01', 'VIL', 1, '海景', '可使用'],
    ['V02', 'VIL', 1, '海景', '可使用'],
    ['V03', 'VIL', 1, '花園', '可使用'],
  ],
  guest: [
    [1, '林雅婷', '0912-000-101', '台北', 'VIP'],
    [2, '陳冠宇', '0912-000-102', '台中', '金卡'],
    [3, '王怡君', '0912-000-103', '高雄', '金卡'],
    [4, '張家豪', '0912-000-104', '新竹', '一般'],
    [5, '李佳穎', '0912-000-105', '台北', null],
    [6, '黃俊傑', '0912-000-106', '台南', '一般'],
    [7, '吳淑芬', '0912-000-107', '桃園', null],
    [8, '劉子晴', '0912-000-108', '台北', 'VIP'],
    [9, '蔡明哲', '0912-000-109', '香港', null],
    [10, '鄭雨萱', '0912-000-110', '台中', '一般'],
    [11, '謝承恩', '0912-000-111', '新竹', '一般'],
  ],
  booking: [
    [1, 1, '201', '2026-11-01', '2026-11-03', 2, 5600, '已退房'],
    [2, 2, '301', '2026-11-01', '2026-11-04', 4, 7200, '已退房'],
    [3, 3, 'V01', '2026-11-05', '2026-11-08', 5, 15800, '已入住'],
    [4, 4, '101', '2026-11-06', '2026-11-08', 2, 3800, '已入住'],
    [5, 1, 'V02', '2026-11-20', '2026-11-23', 6, 14800, '已預訂'],
    [6, 5, '202', '2026-11-14', '2026-11-16', 2, 5600, '已取消'],
    [7, 6, '102', '2026-10-25', '2026-10-27', 1, 3600, '已退房'],
    [8, 7, '302', '2026-12-20', '2026-12-28', 4, 7200, '已預訂'],
    [9, 8, '201', '2026-12-24', '2026-12-26', 2, 6200, '已預訂'],
    [10, 2, 'V01', '2026-12-23', '2026-12-25', 6, 17800, '已預訂'],
    [11, 9, '103', '2026-12-25', '2026-12-27', 2, 3800, '已預訂'],
    [12, 3, '202', '2026-12-24', '2026-12-26', 2, 6200, '已取消'],
    [13, 10, '301', '2026-11-28', '2026-11-30', 3, 7200, '已預訂'],
    [14, 5, '101', '2026-10-18', '2026-10-20', 2, 3800, '已退房'],
    [15, 4, 'V02', '2026-10-10', '2026-10-12', 4, 15800, '已退房'],
    [16, 1, '202', '2026-10-03', '2026-10-05', 2, 5600, '已退房'],
    [17, 6, '303', '2026-12-26', '2026-12-28', 4, 7800, '已預訂'],
  ],
  facility: [
    ['SPA', '海風 SPA 芳療', 'SPA', 2800],
    ['DIV', '浮潛體驗', '戶外', 1500],
    ['SUP', '立槳 SUP', '戶外', 1800],
    ['BBQ', '海灘燒烤晚餐', '餐飲', 1200],
    ['YOG', '晨間瑜珈', '課程', 0],
    ['KID', '兒童探險營', '課程', 900],
  ],
  facility_order: [
    [1, 1, 'SPA', '2026-11-02', 2],
    [2, 1, 'BBQ', '2026-11-02', 2],
    [3, 2, 'KID', '2026-11-02', 2],
    [4, 2, 'BBQ', '2026-11-03', 4],
    [5, 2, 'DIV', '2026-11-03', 2],
    [6, 3, 'SPA', '2026-11-06', 1],
    [7, 3, 'SUP', '2026-11-06', 3],
    [8, 3, 'BBQ', '2026-11-06', 5],
    [9, 4, 'YOG', '2026-11-07', 2],
    [10, 7, 'DIV', '2026-10-26', 1],
    [11, 14, 'SPA', '2026-10-19', 1],
    [12, 15, 'BBQ', '2026-10-11', 4],
    [13, 15, 'KID', '2026-10-11', 2],
    [14, 16, 'SPA', '2026-10-04', 2],
    [15, 16, 'YOG', '2026-10-04', 2],
    [16, 3, 'DIV', '2026-11-07', 2],
    [17, 4, 'BBQ', '2026-11-07', 2],
    [18, 2, 'SPA', '2026-11-03', 1],
  ],
};

// 欄位說明（順序須與 SCHEMA 相同）
export const TABLES = [
  {
    name: 'room_type', zh: '房型', desc: '渡假村提供的房型與官方定價。',
    cols: [
      ['type_id', 'TEXT', 'PK', '房型代碼，如 STD、VIL'],
      ['type_name', 'TEXT', '', '房型名稱'],
      ['capacity', 'INTEGER', '', '最多可住人數（> 0）'],
      ['base_price', 'INTEGER', '', '官方每晚定價（新台幣）'],
    ],
  },
  {
    name: 'room', zh: '客房', desc: '每一間實體客房，一間房屬於一種房型。',
    cols: [
      ['room_no', 'TEXT', 'PK', '房號；V 開頭為別墅'],
      ['type_id', 'TEXT', 'FK', '→ room_type.type_id'],
      ['floor', 'INTEGER', '', '樓層'],
      ['view', 'TEXT', '', '景觀：海景／山景／花園'],
      ['status', 'TEXT', '', '可使用／維修中'],
    ],
  },
  {
    name: 'guest', zh: '旅客', desc: '曾註冊或訂房的旅客。',
    cols: [
      ['guest_id', 'INTEGER', 'PK', '旅客編號'],
      ['name', 'TEXT', '', '姓名'],
      ['phone', 'TEXT', 'UQ', '手機（唯一，不可重複）'],
      ['city', 'TEXT', '', '居住城市'],
      ['member_level', 'TEXT', '', '一般／金卡／VIP；NULL 表示非會員'],
    ],
  },
  {
    name: 'booking', zh: '訂房', desc: '一筆訂單 = 一位旅客在一段日期入住一間房。',
    cols: [
      ['booking_id', 'INTEGER', 'PK', '訂單編號'],
      ['guest_id', 'INTEGER', 'FK', '→ guest.guest_id'],
      ['room_no', 'TEXT', 'FK', '→ room.room_no'],
      ['check_in', 'TEXT', '', '入住日 YYYY-MM-DD'],
      ['check_out', 'TEXT', '', '退房日（須晚於入住日）'],
      ['adults', 'INTEGER', '', '入住人數'],
      ['price_per_night', 'INTEGER', '', '成交價：訂房當下的每晚房價'],
      ['status', 'TEXT', '', '已預訂／已入住／已退房／已取消'],
    ],
  },
  {
    name: 'facility', zh: '設施', desc: '可付費（或免費）預約的設施與活動。',
    cols: [
      ['facility_id', 'TEXT', 'PK', '設施代碼'],
      ['facility_name', 'TEXT', '', '設施名稱'],
      ['category', 'TEXT', '', '類別：SPA／戶外／餐飲／課程'],
      ['unit_price', 'INTEGER', '', '每人次單價（0 = 免費）'],
    ],
  },
  {
    name: 'facility_order', zh: '設施使用', desc: '住客在住宿期間預約設施的紀錄，掛在訂單底下。',
    cols: [
      ['order_id', 'INTEGER', 'PK', '紀錄編號'],
      ['booking_id', 'INTEGER', 'FK', '→ booking.booking_id'],
      ['facility_id', 'TEXT', 'FK', '→ facility.facility_id'],
      ['use_date', 'TEXT', '', '使用日期'],
      ['quantity', 'INTEGER', '', '人次（> 0）'],
    ],
  },
];

// 關聯：[子表, 子欄, 父表, 父欄, 說明]
export const RELATIONS = [
  ['room', 'type_id', 'room_type', 'type_id', '一種房型有多間客房'],
  ['booking', 'guest_id', 'guest', 'guest_id', '一位旅客可有多筆訂單'],
  ['booking', 'room_no', 'room', 'room_no', '一間客房可被訂多次'],
  ['facility_order', 'booking_id', 'booking', 'booking_id', '一筆訂單可加購多項設施'],
  ['facility_order', 'facility_id', 'facility', 'facility_id', '一項設施可被多次使用'],
];

export const QUERIES = [
  {
    id: 'q1', topic: 'SELECT · JOIN · ORDER BY',
    title: '海景房有哪些？',
    who: '櫃檯',
    question: '旅客指定要「海景」，列出所有海景房的房號、房型與每晚定價，價格由高到低。',
    sql: `SELECT r.room_no   AS 房號,
       t.type_name AS 房型,
       t.base_price AS 每晚定價
FROM room AS r
JOIN room_type AS t ON r.type_id = t.type_id
WHERE r.view = '海景'
ORDER BY t.base_price DESC, r.room_no;`,
    explain: 'room 只存 type_id，房型名稱與價格在 room_type，所以要用 JOIN 以 type_id 接起來；WHERE 篩出海景，ORDER BY 先依價格遞減，同價再依房號。',
  },
  {
    id: 'q2', topic: '日期函數 · 計算欄位',
    title: '每筆訂單住幾晚、房費多少？',
    who: '財務',
    question: '列出所有「未取消」訂單的住宿晚數與房費總額（晚數 × 成交價）。',
    sql: `SELECT booking_id AS 訂單,
       room_no    AS 房號,
       check_in   AS 入住,
       check_out  AS 退房,
       CAST(julianday(check_out) - julianday(check_in) AS INTEGER) AS 晚數,
       price_per_night * (julianday(check_out) - julianday(check_in)) AS 房費
FROM booking
WHERE status <> '已取消'
ORDER BY check_in;`,
    explain: 'SQLite 沒有 DATE 型別，日期以 YYYY-MM-DD 文字儲存；julianday() 把日期轉成天數，相減就是晚數。房費用成交價 price_per_night 而不是房型定價，因為各訂單可能有折扣或假日價。',
  },
  {
    id: 'q3', topic: 'GROUP BY · 聚合函數',
    title: '哪種房型最賺錢？',
    who: '經理',
    question: '統計各房型的有效訂單數、總晚數與房費營收（不含取消），依營收由高到低。',
    sql: `SELECT t.type_name AS 房型,
       COUNT(*) AS 訂單數,
       SUM(julianday(b.check_out) - julianday(b.check_in)) AS 總晚數,
       SUM(b.price_per_night * (julianday(b.check_out) - julianday(b.check_in))) AS 營收
FROM booking AS b
JOIN room      AS r ON b.room_no = r.room_no
JOIN room_type AS t ON r.type_id = t.type_id
WHERE b.status <> '已取消'
GROUP BY t.type_id
ORDER BY 營收 DESC;`,
    explain: 'booking → room → room_type 兩次 JOIN 才拿得到房型。WHERE 先排除取消的訂單，GROUP BY 再把同房型的訂單收成一列，COUNT / SUM 對每組計算。',
  },
  {
    id: 'q4', topic: 'LEFT JOIN · COUNT(欄位)',
    title: '哪些房間乏人問津？',
    who: '經理',
    question: '列出每間房被預訂的次數（不含取消），「從未被訂過的房間也要出現」，次數為 0。',
    sql: `SELECT r.room_no AS 房號,
       r.status  AS 狀態,
       COUNT(b.booking_id) AS 被訂次數
FROM room AS r
LEFT JOIN booking AS b
       ON b.room_no = r.room_no
      AND b.status <> '已取消'
GROUP BY r.room_no
ORDER BY 被訂次數, r.room_no;`,
    explain: 'LEFT JOIN 保留左表 room 的每一列，沒有對應訂單的房間，b 的欄位全是 NULL。COUNT(b.booking_id) 不計 NULL，所以這些房間是 0。注意排除取消的條件放在 ON 裡，若放在 WHERE 會把 NULL 列也濾掉。',
  },
  {
    id: 'q5', topic: 'GROUP BY · HAVING',
    title: '設施消費大戶',
    who: '行銷',
    question: '計算每位旅客的設施消費總額（單價 × 人次），只列出超過 3,000 元的旅客。',
    sql: `SELECT g.name AS 旅客,
       g.member_level AS 會員等級,
       SUM(f.unit_price * fo.quantity) AS 設施消費
FROM guest AS g
JOIN booking        AS b  ON b.guest_id = g.guest_id
JOIN facility_order AS fo ON fo.booking_id = b.booking_id
JOIN facility       AS f  ON f.facility_id = fo.facility_id
GROUP BY g.guest_id
HAVING SUM(f.unit_price * fo.quantity) > 3000
ORDER BY 設施消費 DESC;`,
    explain: '設施使用掛在訂單下，要從 guest 一路 JOIN 到 facility 才知道誰花了多少。「超過 3000」是針對加總後的值，所以要寫在 HAVING（分組後篩選），不能寫在 WHERE（分組前篩選）。',
  },
  {
    id: 'q6', topic: '子查詢（純量）',
    title: '高於平均的訂單',
    who: '財務',
    question: '找出房費總額高於「所有有效訂單平均房費」的訂單。',
    sql: `SELECT b.booking_id AS 訂單,
       g.name AS 旅客,
       b.room_no AS 房號,
       b.price_per_night * (julianday(b.check_out) - julianday(b.check_in)) AS 房費
FROM booking AS b
JOIN guest AS g ON g.guest_id = b.guest_id
WHERE b.status <> '已取消'
  AND b.price_per_night * (julianday(b.check_out) - julianday(b.check_in)) >
      (SELECT AVG(price_per_night * (julianday(check_out) - julianday(check_in)))
       FROM booking
       WHERE status <> '已取消')
ORDER BY 房費 DESC;`,
    explain: '括號內的子查詢先算出一個值（平均房費），外層查詢再拿每筆訂單和它比較。平均值本身也要排除取消的訂單，標準才一致。',
  },
  {
    id: 'q7', topic: 'NOT EXISTS · 日期區間重疊',
    title: '聖誕節還有空房嗎？',
    who: '櫃檯',
    question: '旅客想 2026-12-24 入住、12-26 退房。列出這段期間可以訂的房間（未維修、沒有與此區間重疊的有效訂單）。',
    sql: `SELECT r.room_no AS 房號, t.type_name AS 房型, r.view AS 景觀, t.base_price AS 定價
FROM room AS r
JOIN room_type AS t ON t.type_id = r.type_id
WHERE r.status = '可使用'
  AND NOT EXISTS (
        SELECT 1
        FROM booking AS b
        WHERE b.room_no = r.room_no
          AND b.status <> '已取消'
          AND b.check_in  < '2026-12-26'   -- 對方入住早於我退房
          AND b.check_out > '2026-12-24'   -- 對方退房晚於我入住
      )
ORDER BY t.base_price, r.room_no;`,
    explain: '兩段住宿 [A入, A退) 與 [B入, B退) 重疊的條件是 A入 < B退 且 A退 > B入。NOT EXISTS 對每間房檢查「是否存在一筆重疊的有效訂單」，不存在才是空房。退房日當天可以讓下一位入住，所以用 < 與 > 而不是 <= >=。',
  },
  {
    id: 'q8', topic: 'CASE · COALESCE · NULL',
    title: '各會員等級的貢獻',
    who: '行銷',
    question: '依會員等級（NULL 顯示為「非會員」）統計旅客人數、有效訂單數與總住宿晚數。',
    sql: `SELECT COALESCE(g.member_level, '非會員') AS 等級,
       COUNT(DISTINCT g.guest_id) AS 旅客數,
       COUNT(b.booking_id) AS 訂單數,
       COALESCE(SUM(julianday(b.check_out) - julianday(b.check_in)), 0) AS 總晚數
FROM guest AS g
LEFT JOIN booking AS b
       ON b.guest_id = g.guest_id AND b.status <> '已取消'
GROUP BY 等級
ORDER BY CASE 等級 WHEN 'VIP' THEN 1 WHEN '金卡' THEN 2
                   WHEN '一般' THEN 3 ELSE 4 END;`,
    explain: 'COALESCE 把 NULL 換成「非會員」；一位旅客可能有多筆訂單，所以旅客數用 COUNT(DISTINCT)。ORDER BY 裡的 CASE 自訂排序，否則文字會依字碼排。',
  },
  {
    id: 'q9', topic: '視窗函數 · RANK()',
    title: '各類別最熱門的設施',
    who: '營運',
    question: '計算每項設施的總人次與收入，並在「同一類別內」依人次排名。',
    sql: `SELECT f.category AS 類別,
       f.facility_name AS 設施,
       SUM(fo.quantity) AS 總人次,
       SUM(fo.quantity * f.unit_price) AS 收入,
       RANK() OVER (PARTITION BY f.category
                    ORDER BY SUM(fo.quantity) DESC) AS 類別內排名
FROM facility AS f
JOIN facility_order AS fo ON fo.facility_id = f.facility_id
GROUP BY f.facility_id
ORDER BY 類別, 類別內排名;`,
    explain: '先 GROUP BY 算出每項設施的總人次，RANK() OVER (PARTITION BY 類別) 再在每個類別內各自排名；和 GROUP BY 不同，視窗函數不會把列合併。課程類的兩項都是 4 人次，RANK() 給同分同名次（都是 1）。',
  },
];

// 結果比較：每組 2–3 個版本
export const COMPARES = [
  {
    id: 'c1', ref: 'q4', title: 'INNER JOIN vs LEFT JOIN，COUNT(*) vs COUNT(欄位)',
    question: '每間房被預訂幾次？（從未被訂的也要列出）',
    variants: [
      {
        label: 'A · INNER JOIN',
        sql: `SELECT r.room_no, COUNT(*) AS times
FROM room AS r
JOIN booking AS b ON b.room_no = r.room_no AND b.status <> '已取消'
GROUP BY r.room_no
ORDER BY times, r.room_no;`,
      },
      {
        label: 'B · LEFT JOIN + COUNT(*)',
        sql: `SELECT r.room_no, COUNT(*) AS times
FROM room AS r
LEFT JOIN booking AS b ON b.room_no = r.room_no AND b.status <> '已取消'
GROUP BY r.room_no
ORDER BY times, r.room_no;`,
      },
      {
        label: 'C · LEFT JOIN + COUNT(b.booking_id)',
        sql: `SELECT r.room_no, COUNT(b.booking_id) AS times
FROM room AS r
LEFT JOIN booking AS b ON b.room_no = r.room_no AND b.status <> '已取消'
GROUP BY r.room_no
ORDER BY times, r.room_no;`,
      },
    ],
    // explanation filled with real numbers at build time via template
    explainTpl: `A 用 INNER JOIN，只留下「有配對到訂單」的房間，所以從未被訂的 {missing} 直接消失（{rowsA} 列）。
B 改成 LEFT JOIN，12 間房都回來了（{rowsB} 列），但沒訂單的房間顯示 1 次──因為 LEFT JOIN 仍會為它產生一列（訂單欄位是 NULL），COUNT(*) 數的是「列」。
C 改數 COUNT(b.booking_id)，COUNT(欄位) 會略過 NULL，那些房間才正確變成 0。`,
  },
  {
    id: 'c2', ref: 'q7', title: '日期條件寫錯：BETWEEN 入住日 vs 區間重疊',
    question: '12/24 入住、12/26 退房，哪些房間是空的？',
    variants: [
      {
        label: 'A · 只看入住日是否落在區間',
        sql: `SELECT r.room_no
FROM room AS r
WHERE r.status = '可使用'
  AND r.room_no NOT IN (
        SELECT room_no FROM booking
        WHERE status <> '已取消'
          AND check_in BETWEEN '2026-12-24' AND '2026-12-26')
ORDER BY r.room_no;`,
      },
      {
        label: 'B · 正確的區間重疊條件',
        sql: `SELECT r.room_no
FROM room AS r
WHERE r.status = '可使用'
  AND r.room_no NOT IN (
        SELECT room_no FROM booking
        WHERE status <> '已取消'
          AND check_in  < '2026-12-26'
          AND check_out > '2026-12-24')
ORDER BY r.room_no;`,
      },
    ],
    explainTpl: `A 多出 {extraInA}：302 是 12/20 入住、12/28 退房，V01 是 12/23 入住、12/25 退房，入住日都不在 12/24–12/26 之間，但人其實還住在房裡──照 A 賣出去就會重複訂房（overbooking）。
A 也少了 {missingInA}：303 的訂單是 12/26 入住，BETWEEN 包含端點，被當成衝突；但我們 12/26 早上就退房，根本不衝突。
B 用「對方入住 < 我退房 且 對方退房 > 我入住」判斷重疊，兩種錯誤都消失。`,
  },
  {
    id: 'c3', ref: 'q3', title: '忘記排除「已取消」訂單',
    question: '各房型營收是多少？',
    variants: [
      {
        label: 'A · 沒有 WHERE',
        sql: `SELECT t.type_name,
       COUNT(*) AS bookings,
       SUM(b.price_per_night * (julianday(b.check_out) - julianday(b.check_in))) AS revenue
FROM booking AS b
JOIN room AS r ON b.room_no = r.room_no
JOIN room_type AS t ON r.type_id = t.type_id
GROUP BY t.type_id
ORDER BY revenue DESC;`,
      },
      {
        label: "B · WHERE status <> '已取消'",
        sql: `SELECT t.type_name,
       COUNT(*) AS bookings,
       SUM(b.price_per_night * (julianday(b.check_out) - julianday(b.check_in))) AS revenue
FROM booking AS b
JOIN room AS r ON b.room_no = r.room_no
JOIN room_type AS t ON r.type_id = t.type_id
WHERE b.status <> '已取消'
GROUP BY t.type_id
ORDER BY revenue DESC;`,
      },
    ],
    explainTpl: `資料中有 2 筆取消的訂單（#6、#12），都是豪華海景房。A 把它們也算進去，豪華海景房的訂單數從 {dlxB} 變 {dlxA}、營收多算了 {dlxDiff} 元（{dlxB2} → {dlxA2}）。
SQL 只會照你寫的條件算：資料表裡有 status 欄位，不代表查詢會自動排除取消單，商業規則必須寫進 WHERE。`,
  },
  {
    id: 'c4', ref: 'q8', title: 'NULL 不等於任何值：<> 漏掉非會員',
    question: '列出所有「不是 VIP」的旅客',
    variants: [
      {
        label: "A · member_level <> 'VIP'",
        sql: `SELECT guest_id, name, member_level
FROM guest
WHERE member_level <> 'VIP'
ORDER BY guest_id;`,
      },
      {
        label: 'B · 加上 IS NULL',
        sql: `SELECT guest_id, name, member_level
FROM guest
WHERE member_level <> 'VIP' OR member_level IS NULL
ORDER BY guest_id;`,
      },
    ],
    explainTpl: `共有 11 位旅客、2 位 VIP，「不是 VIP」應該有 9 位，但 A 只回傳 {rowsA} 位。
少掉的 {missing} 是非會員，member_level 為 NULL。在 SQL 中 NULL <> 'VIP' 的結果不是 TRUE，而是 UNKNOWN，WHERE 只保留 TRUE 的列，所以它們被濾掉。B 明確加上 IS NULL 後才正確（{rowsB} 位）。`,
  },
  {
    id: 'c5', ref: 'q5', title: '聚合條件放在 WHERE → 錯誤訊息',
    question: '設施消費超過 3,000 元的旅客',
    variants: [
      {
        label: 'A · 寫在 WHERE',
        sql: `SELECT g.name, SUM(f.unit_price * fo.quantity) AS spend
FROM guest AS g
JOIN booking AS b ON b.guest_id = g.guest_id
JOIN facility_order AS fo ON fo.booking_id = b.booking_id
JOIN facility AS f ON f.facility_id = fo.facility_id
WHERE SUM(f.unit_price * fo.quantity) > 3000
GROUP BY g.guest_id;`,
      },
      {
        label: 'B · 改成 HAVING',
        sql: `SELECT g.name, SUM(f.unit_price * fo.quantity) AS spend
FROM guest AS g
JOIN booking AS b ON b.guest_id = g.guest_id
JOIN facility_order AS fo ON fo.booking_id = b.booking_id
JOIN facility AS f ON f.facility_id = fo.facility_id
GROUP BY g.guest_id
HAVING SUM(f.unit_price * fo.quantity) > 3000
ORDER BY spend DESC;`,
      },
    ],
    explainTpl: `A 無法執行，SQLite 回傳「{errA}」。執行順序是 FROM → WHERE → GROUP BY → HAVING → SELECT：WHERE 篩選的時候還沒分組，SUM 根本還沒算出來。
B 把條件移到 HAVING，分組後再篩選：有設施消費的 {groups} 位旅客中，{rowsB} 位超過 3,000 元。`,
  },
];

// 每題的「試著修改看看」提示
export const TRY = {
  q1: "把 '海景' 改成 '花園'，或把 DESC 拿掉看排序怎麼變。",
  q2: "把 WHERE 整行刪掉，取消的訂單 #6、#12 會出現。",
  q3: "把 GROUP BY t.type_id 改成 GROUP BY r.room_no，改成以房間為單位統計。",
  q4: "把 COUNT(b.booking_id) 改成 COUNT(*)，或把 LEFT JOIN 改成 JOIN（見「結果比較」1）。",
  q5: "把 3000 改成 10000；或把 HAVING 改成 WHERE 看錯誤訊息（見「結果比較」5）。",
  q6: "把 > 改成 <，找出低於平均的訂單。",
  q7: "把日期換成 '2026-11-06' 到 '2026-11-08'，看看哪些房間正住著人。",
  q8: "把 COALESCE(g.member_level, '非會員') 換成 g.member_level，NULL 組會變成空白。",
  q9: "把 RANK() 改成 ROW_NUMBER()，同分的兩項課程就會分出 1、2 名。",
};
