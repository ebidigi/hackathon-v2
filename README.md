# Claude Code Build Battle — 発表・採点システム

M-1グランプリ風の笑神籤（えみくじ）抽選 → プレゼン → 採点 → 優勝発表を一気通貫で行うシステム。

---

## はじめに（初めてこのリポジトリを受け取った人へ）

### 必要なもの
- **Googleアカウント**（Google Sheets / Apps Script 用）
- **テキストエディタ**（VS Code 推奨。なければメモ帳でもOK）
- **Gitアカウント**（GitHub Pages で公開する場合のみ）

### 最短セットアップ（15分）

#### Step 1: リポジトリをダウンロード

```bash
git clone https://github.com/ebidigi/hackathon-v2.git
cd hackathon-v2
```

Gitが使えない場合は GitHub の「Code → Download ZIP」でダウンロードして解凍。

#### Step 2: チーム名を変更する

以下の3ファイルをテキストエディタで開いて、TEAMSの部分を書き換えます。

**index.html** — `const TEAMS = [` で検索（Cmd+F / Ctrl+F）

```javascript
const TEAMS = [
  { name:"チームA", members:"田中、佐藤" },
  { name:"チームB", members:"鈴木、高橋" },
  // 必要な分だけ行を追加・削除
];
```

**scoring.html** — 同じく `const TEAMS = [` で検索して同じ内容に変更

**gas_scoring.js** — `const TEAMS = [` で検索。こちらは名前だけの配列

```javascript
const TEAMS = [
  'チームA', 'チームB',  // index.html の name と完全一致させる
];
```

#### Step 3: Google Sheets + Apps Script を設定する

1. [Google Sheets](https://sheets.google.com) を新規作成
2. スプレッドシート名を好きな名前に（例: 「ハッカソン採点」）
3. 既存の「シート1」を右クリック → 「名前を変更」 → **回答** にする
4. 左下の「+」ボタンでシートを追加 → 名前を **集計** にする
5. メニューの **拡張機能 → Apps Script** をクリック
6. エディタが開いたら、既存のコードを全て消す
7. `gas_scoring.js` の中身を全てコピーして貼り付け → **Ctrl+S で保存**
8. 右上の **「デプロイ」→「新しいデプロイ」** をクリック
9. 左の歯車アイコン → **「ウェブアプリ」** を選択
10. 設定:
    - 説明: 任意（例: 「ハッカソン採点API」）
    - 実行ユーザー: **自分**
    - アクセスできるユーザー: **全員**
11. **「デプロイ」** をクリック → 権限の承認を求められたら許可
12. 表示されたURLをコピー（`https://script.google.com/macros/s/xxxxx/exec` の形式）

#### Step 4: GAS_URL を貼り付ける

**index.html** — `const GAS_URL = '` で検索して、URLを差し替え

```javascript
const GAS_URL = 'https://script.google.com/macros/s/xxxxx/exec';  // ← Step 3 でコピーしたURL
```

**scoring.html** — 同じく `const GAS_URL = '` で検索して同じURLを貼り付け

#### Step 5: タイトル・賞品を変更する

**index.html** で以下を検索して書き換え:

- `BUILD BATTLE` → イベント名
- `Vol.2` → 回数
- `CLAUDE CODE` → サブタイトル
- `prize-main` で検索 → 賞品テキスト
- `prize-sub` で検索 → 賞品サブテキスト

#### Step 6: 公開する

**方法A: GitHub Pages（推奨 — 全員がURLでアクセス可能）**

```bash
git add -A
git commit -m "チーム・設定変更"
git push
```

数分後に以下のURLで公開されます:
- MC用: `https://<あなたのGitHubアカウント>.github.io/<リポジトリ名>/index.html`
- 採点用: `https://<あなたのGitHubアカウント>.github.io/<リポジトリ名>/scoring.html`

**方法B: ローカルサーバー（自分のPCだけで確認）**

```bash
python3 -m http.server 8080
```

→ `http://localhost:8080/index.html` で確認

#### Step 7: 動作確認

1. scoring.html を開く
2. 名前を入力して、どれかのチームに適当に採点して送信
3. Google Sheets の「回答」シートにデータが入ればOK
4. index.html の「優勝」タブをクリックしてランキングが表示されればOK
5. 確認後、テストデータはスプレッドシートから手動で削除

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
