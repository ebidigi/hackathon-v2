# Claude Code Build Battle — 発表・採点システム

M-1グランプリ風の笑神籤（えみくじ）抽選 → プレゼン → 採点 → 優勝発表を一気通貫で行うシステム。

---

## システム構成

| ファイル | 用途 | 使う人 |
|---------|------|--------|
| `index.html` | プロジェクター投影用（抽選・発表・優勝画面） | MC |
| `scoring.html` | 各参加者が手元PCで採点するページ | 全参加者 |
| `gas_scoring.js` | Google Apps Script（採点データの集計） | 自動 |

### 画面フロー

```
Title → 笑神籤（抽選） → 発表画面 → [採点] → 次の抽選へ → ... → 優勝発表
```

---

## セットアップ手順

### 1. チーム名・メンバーの変更

**3つのファイル全てで TEAMS を変更する必要があります。**

#### index.html（約556行目）
```javascript
const TEAMS = [
  { name:"チーム名A", members:"メンバー1、メンバー2" },
  { name:"チーム名B", members:"メンバー3、メンバー4" },
  // ... 必要な数だけ追加
];
```

#### scoring.html（約414行目）
```javascript
const TEAMS = [
  { name:"チーム名A", members:"メンバー1、メンバー2" },
  { name:"チーム名B", members:"メンバー3、メンバー4" },
];
```

#### gas_scoring.js（約19行目）
```javascript
const TEAMS = [
  'チーム名A', 'チーム名B', // ※ name だけの文字列配列
];
```

> **注意**: 3ファイルのチーム名は完全一致させてください。1文字でもずれると集計が正しく動きません。

---

### 2. Google Apps Script のデプロイ

1. Google Sheets を新規作成
2. シート名を「回答」にリネーム
3. もう1つシートを追加して「集計」にリネーム
4. 拡張機能 → Apps Script を開く
5. `gas_scoring.js` の内容を貼り付けて保存
6. デプロイ → 新しいデプロイ → ウェブアプリ
   - 実行ユーザー: **自分**
   - アクセスできるユーザー: **全員**
7. デプロイURLをコピー

#### clasp を使う場合

```bash
# gas/.clasp.json の scriptId を自分のGASプロジェクトIDに変更
cd gas
clasp push --force
# GASエディタからウェブアプリとしてデプロイ
```

---

### 3. GAS_URL の設定

デプロイURLを以下の2ファイルに貼り付ける。

#### index.html（約551行目）
```javascript
const GAS_URL = 'https://script.google.com/macros/s/xxxxxxx/exec';
```

#### scoring.html（約412行目）
```javascript
const GAS_URL = 'https://script.google.com/macros/s/xxxxxxx/exec';
```

---

### 4. タイトル・賞品の変更

#### index.html 内のタイトル（約369行目）
```html
<div class="m1-subtitle">CLAUDE CODE</div>
<div class="m1-title">BUILD BATTLE</div>
<div class="m1-vol">Vol.2</div>
```

#### 賞品テキスト（約375行目）
```html
<p class="prize-main">賞品のメインテキスト</p>
<p class="prize-sub">賞品のサブテキスト</p>
```

---

### 5. 出囃子（BGM）の変更

#### index.html（約567行目）
```javascript
const DEBAYASHI_VIDEO_ID = "YouTubeの動画ID";
```

> 動画IDはYouTube URLの `v=` 以降の文字列（例: `https://youtu.be/JlbkpHrASPU` → `JlbkpHrASPU`）
> ※ 出囃子はMCが別タブで手動再生する運用も可能

---

### 6. 採点基準の変更

#### scoring.html（約425行目）
```javascript
const CRITERIA = [
  { key:"business", label:"業務活用度", desc:"すぐに使いたいか" },
  { key:"quality",  label:"クオリティ", desc:"動作・完成度" },
  { key:"pres",     label:"プレゼン",   desc:"伝わりやすさ" },
];
```

採点基準を変更する場合は `gas_scoring.js` のカラム名・集計ロジックも合わせて変更してください。

---

## 公開方法

### GitHub Pages（推奨）

```bash
git init
git add index.html scoring.html gas_scoring.js
git commit -m "初回コミット"
gh repo create <リポジトリ名> --public --source=. --push
gh api repos/<org>/<repo>/pages -X POST -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/"
```

公開URL:
- 発表画面: `https://<org>.github.io/<repo>/index.html`
- 採点ページ: `https://<org>.github.io/<repo>/scoring.html`

### ローカルサーバー

```bash
python3 -m http.server 8080
# → http://localhost:8080/index.html
# → http://localhost:8080/scoring.html
```

---

## 運用メモ

### ランキングの計算方法
- 各チームの合計点を **投票人数で割った平均点** でランキング
- 発表者の人数がチームごとに異なっても公平に計算される

### 進行状態の保持
- 抽選の進行状態は localStorage に保存される
- ハードリロードしても復元される

### 進行状態の手動復元
ブラウザのコンソール（Cmd+Option+J）で実行:
```javascript
localStorage.setItem('bb2_order', JSON.stringify(["チーム名A","チーム名B","チーム名C"]));
localStorage.setItem('bb2_round', 2); // 0-indexed: 進行済みチーム数 - 1
location.reload();
```

### 進行状態のリセット
```javascript
localStorage.removeItem('bb2_order');
localStorage.removeItem('bb2_round');
location.reload();
```

### 採点データの再送信
- scoring.html は入力内容を localStorage に保存
- 送信済みでもボタンをタップすれば再送信可能
- GAS側で同じ採点者×チーム名の行を上書き（重複しない）

---

## 変更チェックリスト

次回開催時に変更が必要な箇所:

- [ ] `index.html` — TEAMS 配列（チーム名・メンバー）
- [ ] `scoring.html` — TEAMS 配列（チーム名・メンバー）
- [ ] `gas_scoring.js` — TEAMS 配列（チーム名のみ）
- [ ] `index.html` — タイトル（Vol.X）
- [ ] `index.html` — 賞品テキスト
- [ ] Google Sheets — 新しいシートを作成（前回のデータと分離）
- [ ] GAS — 新しいデプロイURL取得
- [ ] `index.html` — GAS_URL
- [ ] `scoring.html` — GAS_URL
- [ ] localStorage をクリア（前回の進行状態リセット）
