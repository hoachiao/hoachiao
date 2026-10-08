# ho-a-chiao

以 suki_ho 為基礎的 Next.js App Router 專案，保留原有首頁、動畫、樣式、中英文文章及 MongoDB / Notion 架構。

- 網站名稱：ho-a-chiao。
- 移除 Projects 導覽、頁面、API、資料型別及專用資源。
- Humanity 分類顯示於故事筆記；其他有標籤的文章皆歸入主題專欄。文章列表、分類及單篇 API 依此規則篩選。
- 沿用原專案 .env.local 連線設定與資料庫名稱；資料庫預設名稱 projects 是既有 MongoDB 名稱，與已移除的 Projects 頁面無關。
- Notion 同步會保留原始標籤；一般同步只處理標記為新的 Ready 文章。使用 `node script/blogs.js --refresh-all` 可重新抓取所有 Ready 文章到 MongoDB，不修改 Notion 同步標記。

## 開發

使用 Node.js 20，執行 `npm ci` 後：

```sh
npm run dev
```

開啟 http://localhost:3001 。正式建置使用 `npm run build`。

`.env.local` 不應提交至 Git；所需變數見 `.env.example`。
