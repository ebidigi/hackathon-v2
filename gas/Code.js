/**
 * Google Apps Script — Build Battle Vol.2 採点集計
 *
 * 【セットアップ手順】
 * 1. Google Sheets を新規作成
 * 2. シート名を「回答」にリネーム（デフォルトの「シート1」を変更）
 * 3. もう1つシートを追加して「集計」にリネーム
 * 4. 拡張機能 → Apps Script を開く
 * 5. このコードを貼り付けて保存
 * 6. デプロイ → 新しいデプロイ → ウェブアプリ
 *    - 実行ユーザー: 自分
 *    - アクセスできるユーザー: 全員
 * 7. デプロイURLをコピーして scoring.html と index.html の GAS_URL に貼る
 */

const SHEET_NAME_RAW = '回答';
const SHEET_NAME_SUMMARY = '集計';

const TEAMS = [
  'わんこクラブ', 'お寝坊ズ', 'ダブルメガネ', 'JK',
  '右往左往', 'いぶし銀', '池田ジュニア', '小甲陽平'
];

// ======================
//  POST: 採点を送信
// ======================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME_RAW);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME_RAW);
      sheet.appendRow(['タイムスタンプ', '採点者', 'チーム名', '業務活用度', 'クオリティ', 'プレゼン', '合計', 'コメント']);
    }

    const scorer = data.scorer || '匿名';
    const team = data.team;
    const scores = data.scores;
    const comment = data.comment || '';
    const total = scores.business + scores.quality + scores.pres;

    // 同じ採点者×チームの既存行を探して上書き
    const allData = sheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][1] === scorer && allData[i][2] === team) {
        const row = i + 1;
        sheet.getRange(row, 1, 1, 8).setValues([[
          new Date(), scorer, team, scores.business, scores.quality, scores.pres, total, comment
        ]]);
        found = true;
        break;
      }
    }

    if (!found) {
      sheet.appendRow([
        new Date(), scorer, team, scores.business, scores.quality, scores.pres, total, comment
      ]);
    }

    // 集計シートを更新
    updateSummary(ss);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ======================
//  GET: 集計結果を取得
// ======================
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawSheet = ss.getSheetByName(SHEET_NAME_RAW);

    if (!rawSheet || rawSheet.getLastRow() < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, results: [], details: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = rawSheet.getDataRange().getValues();
    const teamTotals = {};
    const details = [];

    TEAMS.forEach(t => { teamTotals[t] = { total: 0, count: 0, business: 0, quality: 0, pres: 0 }; });

    for (let i = 1; i < data.length; i++) {
      const team = data[i][2];
      const business = Number(data[i][3]) || 0;
      const quality = Number(data[i][4]) || 0;
      const pres = Number(data[i][5]) || 0;
      const total = business + quality + pres;
      const scorer = data[i][1];
      const comment = data[i][7] || '';

      if (teamTotals[team] !== undefined) {
        teamTotals[team].total += total;
        teamTotals[team].count += 1;
        teamTotals[team].business += business;
        teamTotals[team].quality += quality;
        teamTotals[team].pres += pres;
      }

      details.push({ scorer, team, business, quality, pres, total, comment });
    }

    const results = TEAMS.map(name => {
      const c = teamTotals[name].count;
      return {
        name,
        totalScore: teamTotals[name].total,
        voteCount: c,
        avgBusiness: c > 0 ? Math.round(teamTotals[name].business / c * 10) / 10 : 0,
        avgQuality: c > 0 ? Math.round(teamTotals[name].quality / c * 10) / 10 : 0,
        avgPres: c > 0 ? Math.round(teamTotals[name].pres / c * 10) / 10 : 0,
        avgTotal: c > 0 ? Math.round(teamTotals[name].total / c * 10) / 10 : 0,
      };
    }).sort((a, b) => b.avgTotal - a.avgTotal);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, results, details }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ======================
//  集計シート更新
// ======================
function updateSummary(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME_SUMMARY);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_SUMMARY);
  }
  sheet.clear();

  const rawSheet = ss.getSheetByName(SHEET_NAME_RAW);
  if (!rawSheet || rawSheet.getLastRow() < 2) return;

  const data = rawSheet.getDataRange().getValues();
  const teamTotals = {};
  TEAMS.forEach(t => { teamTotals[t] = { total: 0, count: 0, business: 0, quality: 0, pres: 0 }; });

  for (let i = 1; i < data.length; i++) {
    const team = data[i][2];
    if (teamTotals[team] !== undefined) {
      teamTotals[team].business += Number(data[i][3]) || 0;
      teamTotals[team].quality += Number(data[i][4]) || 0;
      teamTotals[team].pres += Number(data[i][5]) || 0;
      teamTotals[team].total += Number(data[i][6]) || 0;
      teamTotals[team].count += 1;
    }
  }

  // Header
  sheet.appendRow(['チーム名', '投票数', '業務活用度(平均)', 'クオリティ(平均)', 'プレゼン(平均)', '平均合計', '順位']);

  const sorted = TEAMS.map(name => {
    const c = teamTotals[name].count;
    return {
      name,
      count: c,
      avgBusiness: c > 0 ? Math.round(teamTotals[name].business / c * 10) / 10 : 0,
      avgQuality: c > 0 ? Math.round(teamTotals[name].quality / c * 10) / 10 : 0,
      avgPres: c > 0 ? Math.round(teamTotals[name].pres / c * 10) / 10 : 0,
      avgTotal: c > 0 ? Math.round(teamTotals[name].total / c * 10) / 10 : 0,
    };
  }).sort((a, b) => b.avgTotal - a.avgTotal);

  sorted.forEach((t, i) => {
    sheet.appendRow([t.name, t.count, t.avgBusiness, t.avgQuality, t.avgPres, t.avgTotal, i + 1]);
  });

  // Formatting
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#ffd700');
  sheet.autoResizeColumns(1, 7);
}
