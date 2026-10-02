# How to Connect Enquiries to Google Sheets (100% Free & Automated)

Your website now uses an **On-Site Modal Form** that intercepts all enquiry actions and submits data silently in the background without sending users to external forms.

Follow these simple steps if you would like form submissions to automatically append to a **Google Sheet** in real-time.

---

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and name it **"AKSPCL Lead Enquiries"**.
2. In the first row, create the following column headers:
   - **A1**: `Timestamp`
   - **B1**: `Name`
   - **C1**: `Phone`
   - **D1**: `Service`
   - **E1**: `District`
   - **F1**: `Email`
   - **G1**: `Details`
   - **H1**: `Status`

---

### Step 2: Add Google Apps Script
1. In the Google Sheet menu, click **Extensions** → **Apps Script**.
2. Replace all code in the editor with this script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.service || '',
      data.district || '',
      data.email || '',
      data.details || '',
      'New Lead'
    ]);
    
    // Optional: Send instant email notification to founder/team
    MailApp.sendEmail({
      to: "contact@akspropertychecklist.in",
      subject: "🔔 New Property Enquiry: " + data.name + " (" + data.service + ")",
      body: "New lead received from website:\n\n" +
            "Name: " + data.name + "\n" +
            "Phone: +91 " + data.phone + "\n" +
            "Service: " + data.service + "\n" +
            "District: " + data.district + "\n" +
            "Email: " + (data.email || 'N/A') + "\n" +
            "Details: " + (data.details || 'N/A') + "\n"
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### Step 3: Deploy the Script as a Web App
1. At the top right of the Apps Script editor, click **Deploy** → **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and select **Web app**.
3. Fill in the deployment details:
   - **Description**: `AKSPCL Website Webhook`
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: **`Anyone`** *(Important: Must be "Anyone" so the website can post to it without a login prompt)*
4. Click **Deploy** and authorize the script when prompted.
5. Copy the generated **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).

---

### Step 4: Paste URL into Website Config
1. Open `src/config/site.ts` in your codebase.
2. Paste the URL into `webhookUrl`:
   ```typescript
   contact: {
     webhookUrl: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
     ...
   }
   ```
3. Run `npm run build`. Done! All enquiries will now flow directly into your Google Sheet and alert your email in real-time.

