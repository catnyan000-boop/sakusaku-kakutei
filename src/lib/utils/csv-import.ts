import Papa from 'papaparse';

// --- Encoding detection ---

export function decodeFileBuffer(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  if (!utf8.includes('\uFFFD')) {
    return utf8.replace(/^\uFEFF/, '');
  }
  const sjis = new TextDecoder('shift-jis').decode(buffer);
  return sjis.replace(/^\uFEFF/, '');
}

// --- CSV parsing ---

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const data = result.data;
  if (data.length === 0) return { headers: [], rows: [] };
  return { headers: data[0], rows: data.slice(1) };
}

// --- Column auto-mapping ---

export interface ColumnMapping {
  date: number;
  description: number;
  deposit: number;     // -1 if not present
  withdrawal: number;  // -1 if not present
  amount: number;      // -1 if deposit/withdrawal split
}

const DATE_KEYWORDS = ['日付', '取引日', 'date', '利用日', '発生日', '年月日'];
const DESC_KEYWORDS = ['摘要', '内容', '適用', '取引内容', 'description', '明細', 'お取引内容', '備考'];
const DEPOSIT_KEYWORDS = ['入金', '入金額', 'お預り金額', 'credit', '収入', '入金（税込）'];
const WITHDRAWAL_KEYWORDS = ['出金', '出金額', 'お支払金額', 'debit', '支出', '支払', '出金（税込）'];
const AMOUNT_KEYWORDS = ['金額', 'amount', '取引金額', '税込金額'];

function findColumn(headers: string[], keywords: string[]): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const kw of keywords) {
    const idx = normalized.indexOf(kw.toLowerCase());
    if (idx !== -1) return idx;
  }
  for (const kw of keywords) {
    const idx = normalized.findIndex((h) => h.includes(kw.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function autoMapColumns(headers: string[]): ColumnMapping | null {
  const date = findColumn(headers, DATE_KEYWORDS);
  const description = findColumn(headers, DESC_KEYWORDS);
  if (date === -1 || description === -1) return null;

  const deposit = findColumn(headers, DEPOSIT_KEYWORDS);
  const withdrawal = findColumn(headers, WITHDRAWAL_KEYWORDS);
  const amount = findColumn(headers, AMOUNT_KEYWORDS);

  if (deposit !== -1 && withdrawal !== -1) {
    return { date, description, deposit, withdrawal, amount: -1 };
  }
  if (amount !== -1) {
    return { date, description, deposit: -1, withdrawal: -1, amount };
  }
  return null;
}

// --- Date normalization ---

export function normalizeDate(raw: string): string | null {
  const s = raw.trim().replace(/\s+/g, '');

  // YYYY/MM/DD or YYYY-MM-DD
  let m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  // YYYY年MM月DD日
  m = s.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  // MM/DD/YYYY (US format)
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;

  return null;
}

// --- Amount parsing ---

export function parseAmount(raw: string): number | null {
  let s = raw.trim();
  // Full-width to half-width
  s = s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
  s = s.replace(/，/g, ',');
  s = s.replace(/￥/g, '');
  s = s.replace(/¥/g, '');
  // Remove commas
  s = s.replace(/,/g, '');
  // Remove whitespace
  s = s.replace(/\s/g, '');

  if (s === '' || s === '-') return null;

  const num = Number(s);
  if (isNaN(num)) return null;
  return Math.round(Math.abs(num));
}

// --- Account suggestion ---

interface HistoryEntry {
  description: string;
  accountId: string;
}

function tokenize(text: string): string[] {
  // Extract tokens of 2+ characters (katakana, hiragana, kanji, or latin words)
  const tokens: string[] = [];
  const matches = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{2,}|[a-zA-Z]{3,}/g);
  if (matches) tokens.push(...matches);
  return tokens;
}

export function buildSuggestionMap(
  history: HistoryEntry[],
): Map<string, Map<string, number>> {
  // token -> (accountId -> count)
  const map = new Map<string, Map<string, number>>();
  for (const entry of history) {
    if (!entry.description || !entry.accountId) continue;
    const tokens = tokenize(entry.description);
    for (const token of tokens) {
      if (!map.has(token)) map.set(token, new Map());
      const counts = map.get(token)!;
      counts.set(entry.accountId, (counts.get(entry.accountId) || 0) + 1);
    }
  }
  return map;
}

export function suggestAccount(
  description: string,
  suggestionMap: Map<string, Map<string, number>>,
): string | null {
  const tokens = tokenize(description);
  const scores = new Map<string, number>();

  for (const token of tokens) {
    const counts = suggestionMap.get(token);
    if (!counts) continue;
    counts.forEach((count, accountId) => {
      scores.set(accountId, (scores.get(accountId) || 0) + count);
    });
  }

  let bestId: string | null = null;
  let bestScore = 0;
  scores.forEach((score, accountId) => {
    if (score > bestScore) {
      bestScore = score;
      bestId = accountId;
    }
  });

  return bestId;
}

// --- Duplicate check ---

export function checkDuplicate(
  date: string,
  amount: number,
  description: string,
  existing: { date: string; amount: number; description: string }[],
): boolean {
  return existing.some(
    (e) => e.date === date && e.amount === amount && e.description === description,
  );
}

// --- Zengin (全銀) format support ---

// Half-width katakana → full-width katakana conversion
const HALF_KANA_BASE = '\uFF65\uFF66\uFF67\uFF68\uFF69\uFF6A\uFF6B\uFF6C\uFF6D\uFF6E\uFF6F\uFF70\uFF71\uFF72\uFF73\uFF74\uFF75\uFF76\uFF77\uFF78\uFF79\uFF7A\uFF7B\uFF7C\uFF7D\uFF7E\uFF7F\uFF80\uFF81\uFF82\uFF83\uFF84\uFF85\uFF86\uFF87\uFF88\uFF89\uFF8A\uFF8B\uFF8C\uFF8D\uFF8E\uFF8F\uFF90\uFF91\uFF92\uFF93\uFF94\uFF95\uFF96\uFF97\uFF98\uFF99\uFF9A\uFF9B\uFF9C\uFF9D\uFF9E\uFF9F';
const FULL_KANA_BASE = '・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜';

const DAKUTEN_MAP: Record<string, string> = {
  'カ': 'ガ', 'キ': 'ギ', 'ク': 'グ', 'ケ': 'ゲ', 'コ': 'ゴ',
  'サ': 'ザ', 'シ': 'ジ', 'ス': 'ズ', 'セ': 'ゼ', 'ソ': 'ゾ',
  'タ': 'ダ', 'チ': 'ヂ', 'ツ': 'ヅ', 'テ': 'デ', 'ト': 'ド',
  'ハ': 'バ', 'ヒ': 'ビ', 'フ': 'ブ', 'ヘ': 'ベ', 'ホ': 'ボ',
  'ウ': 'ヴ',
};

const HANDAKUTEN_MAP: Record<string, string> = {
  'ハ': 'パ', 'ヒ': 'ピ', 'フ': 'プ', 'ヘ': 'ペ', 'ホ': 'ポ',
};

export function halfToFullKana(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const idx = HALF_KANA_BASE.indexOf(ch);
    if (idx === -1) {
      result += ch;
      continue;
    }
    const fullChar = FULL_KANA_BASE[idx];
    // Check next char for dakuten/handakuten combining
    const next = str[i + 1];
    if (next === '\uFF9E' && DAKUTEN_MAP[fullChar]) {
      result += DAKUTEN_MAP[fullChar];
      i++;
    } else if (next === '\uFF9F' && HANDAKUTEN_MAP[fullChar]) {
      result += HANDAKUTEN_MAP[fullChar];
      i++;
    } else {
      result += fullChar;
    }
  }
  return result;
}

// Zengin format detection
export function isZenginFormat(allRows: string[][]): boolean {
  if (allRows.length < 2) return false;
  return allRows[0][0]?.trim() === '1';
}

// YYMMDD → YYYY-MM-DD
export function zenginDateToISO(yymmdd: string): string | null {
  const s = yymmdd.trim();
  if (!/^\d{6}$/.test(s)) return null;
  const yy = parseInt(s.slice(0, 2), 10);
  const mm = s.slice(2, 4);
  const dd = s.slice(4, 6);
  const yyyy = yy < 50 ? 2000 + yy : 1900 + yy;
  return `${yyyy}-${mm}-${dd}`;
}

// Trade type labels
const ZENGIN_TRADE_TYPES: Record<string, string> = {
  '10': '現金', '11': '振込', '12': '振替', '13': '手形',
  '14': '振込(手形)', '18': 'その他', '19': '雑',
};

export interface ZenginRow {
  date: string;
  description: string;
  amount: number;
  isRevenue: boolean;
}

export function parseZenginRows(allRows: string[][]): ZenginRow[] {
  const results: ZenginRow[] = [];
  for (const row of allRows) {
    if (row[0]?.trim() !== '2') continue;

    const date = zenginDateToISO(row[2] || '');
    if (!date) continue;

    const ioFlag = (row[4] || '').trim(); // 1=入金, 2=出金
    const tradeCode = (row[5] || '').trim();
    const rawAmount = parseAmount(row[6] || '');
    const clientName = halfToFullKana((row[14] || '').trim());

    if (!rawAmount || rawAmount === 0) continue;

    const tradeLabel = ZENGIN_TRADE_TYPES[tradeCode] || '';
    const description = tradeLabel
      ? `${tradeLabel} ${clientName}`.trim()
      : clientName;

    results.push({
      date,
      description,
      amount: rawAmount,
      isRevenue: ioFlag === '1',
    });
  }
  return results;
}
