# How to Export Your Expense Data

> **For developers:** see the [technical reference](../../docs/dev/export-modal.md)

## What is this?

The Export Data feature lets you download all your expenses as a file you can open in Excel, use in other apps, or archive as a backup. You can choose the file format, filter by date or category, and preview exactly what will be exported before you download.

## Before you start

- You must be signed in to your account.
- You need at least one expense recorded — the Export button is disabled on an empty account.

---

## How to use it

### Step 1 — Open the Export dialog

On the main dashboard, click the **Export Data** button in the top-right corner of the page.

![Screenshot placeholder: Dashboard header showing the indigo "Export Data" button with a download icon, positioned to the right of the "Overview" heading](screenshots/export-modal-step-1.png)

---

### Step 2 — Choose a file format

Pick the format that suits what you want to do with the data:

![Screenshot placeholder: Three format cards side by side — CSV, JSON, PDF — with the currently selected one highlighted in indigo](screenshots/export-modal-step-2.png)

| Format | Best for |
|---|---|
| **CSV** | Opening in Excel, Google Sheets, or any spreadsheet app |
| **JSON** | Importing into another app or for developers |
| **PDF** | Printing or sharing a formatted report |

---

### Step 3 — Filter by date range (optional)

If you only want to export expenses from a specific time period, enter a **From** and **To** date. Leave both blank to export all expenses.

![Screenshot placeholder: Two date inputs labelled "From" and "To" side by side, with a calendar picker visible](screenshots/export-modal-step-3.png)

---

### Step 4 — Filter by category (optional)

Click one or more category buttons to export only those categories. If no categories are selected, all categories are included.

Click **Clear** to deselect all and go back to including everything.

![Screenshot placeholder: Row of category pill buttons (Food, Transportation, Entertainment, etc.) with some highlighted in indigo to show they are selected](screenshots/export-modal-step-4.png)

---

### Step 5 — Set a filename (optional)

The filename field is pre-filled with today's date (e.g. `expenses-2026-04-21`). You can change it to anything you like — the correct file extension (`.csv`, `.json`, or `.pdf`) is added automatically.

![Screenshot placeholder: Text input showing a custom filename with the file extension displayed next to it in grey](screenshots/export-modal-step-5.png)

---

### Step 6 — Preview your data (optional)

Click **Preview** to see a table of exactly which expenses will be included in the download, based on your filters.

The summary bar above the preview always shows the record count and total amount at a glance.

![Screenshot placeholder: Expanded preview table showing columns Date, Category, Amount, Description with a few sample rows, and the summary bar above showing "Records 12 | Total NRs 4,250"](screenshots/export-modal-step-6.png)

---

### Step 7 — Download

Click **Export N records** to start the download. The button shows a spinner while the file is being prepared, then confirms with a green "Exported!" message when done.

![Screenshot placeholder: Export button in green "Exported!" success state after a completed download](screenshots/export-modal-step-7.png)

Your file will appear in your browser's default downloads folder.

---

## Options explained

| Option | What it does |
|---|---|
| **CSV** | Creates a `.csv` spreadsheet file. Opens directly in Excel or Google Sheets. |
| **JSON** | Creates a `.json` file with all data including record IDs and timestamps. |
| **PDF** | Creates a formatted `.pdf` report with a table, alternating row colours, and a total at the bottom. |
| **From / To dates** | Narrows the export to expenses within that date range (inclusive). |
| **Category filter** | Only exports expenses that belong to the selected categories. |
| **Filename** | The name of the downloaded file. The extension is added for you. |

---

## Tips

- The dialog **remembers your last-used format and filename** — so if you always export as CSV with the same filename, you only need to click Export next time.
- You can use the **Preview** to double-check your filters before downloading, especially useful when combining date and category filters.
- For tax purposes, try exporting with no filters and choosing **CSV** — it includes every expense you've recorded, sorted in the order they were entered.
- PDF exports look best when printed at A4 size.

---

## Troubleshooting

**Problem:** The "Export Data" button is greyed out and I can't click it.
**Solution:** You need at least one expense recorded. Go to **Add Expense** and add one first.

**Problem:** My download didn't start.
**Solution:** Check that your browser isn't blocking pop-ups or downloads from localhost. Try clicking Export again — if the issue persists, switch to a different format.

**Problem:** The PDF looks cut off or columns are misaligned.
**Solution:** Try opening the PDF at a different zoom level, or use CSV/JSON instead for a more reliable export on large datasets.

**Problem:** I filtered by category but got more records than expected.
**Solution:** If no category buttons are highlighted (selected), all categories are included. Click the specific categories you want — selected ones turn indigo.

---

## Frequently asked questions

**Q: Does exporting delete my data?**
A: No. Exporting only creates a copy of your data as a file. Nothing is changed or removed from your account.

**Q: Can I re-import the file later?**
A: Not yet — there is no import feature currently. The export is for archiving, sharing, or use in other tools.

**Q: Why does my CSV show weird characters when I open it in Excel?**
A: Excel sometimes misreads the file encoding. Try opening Excel first, then use Data → From Text/CSV and select the file, which lets you choose the correct encoding (UTF-8).

**Q: Is my data sent anywhere when I export?**
A: No. The file is generated entirely in your browser and downloaded directly to your device. Nothing is uploaded to any server.
