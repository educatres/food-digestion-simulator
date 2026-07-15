# 食物消化速度

這是一個可直接部署到 GitHub Pages 的純前端互動教學網站。玩家可同時選擇多種食物，設定份量與咀嚼程度，再利用時間軸觀察不同食物在口腔、食道、胃、小腸、大腸與直腸中的位置與狀態。

## 功能

- 多選食物：水、酒精飲料、一般飲料、米飯、牛排、蔬菜、珍珠、珍珠奶茶、油炸食物等
- 份量與咀嚼程度設定
- 0～72 小時消化時間軸
- 播放、暫停、倍速與階段跳轉
- 每種食物獨立移動
- 顯示目前器官、食物狀態、消化程度與吸收比例
- 簡易挑戰題
- 響應式設計，支援電腦、平板與手機

## 本機執行

直接用瀏覽器開啟 `index.html`，或使用簡易伺服器：

```bash
python3 -m http.server 8000
```

再開啟：

```text
http://localhost:8000
```

## 部署到 GitHub Pages

1. 建立新的 GitHub Repository。
2. 將本專案所有檔案上傳到 Repository 根目錄。
3. 進入 `Settings` → `Pages`。
4. 在 `Build and deployment` 選擇 `Deploy from a branch`。
5. Branch 選擇 `main`，資料夾選擇 `/root`。
6. 儲存後等待 GitHub Pages 產生網址。

## 科學說明

本網站中的時間與消化比例為教學用簡化模型。真實人體消化速度會受到個人體質、食物份量、脂肪含量、咀嚼程度、健康狀況與其他因素影響，不應用於醫療診斷。

## 圖片來源

消化系統示意圖取自 Wikimedia Commons：`Digestive_system_diagram_zh-hant.svg`。
