/**
 * VISIONSHINE STUDIOS - Google Apps Script Web App for Client Onboarding Form
 * 
 * Target Google Sheet: https://docs.google.com/spreadsheets/d/1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I/edit?gid=399205612#gid=399205612
 * Spreadsheet ID: 1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I
 * GID: 399205612
 * 
 * =========================================================================
 * STEP-BY-STEP DEPLOYMENT INSTRUCTIONS (NO PERMISSION ERRORS FOR ANY USER):
 * =========================================================================
 * 1. Open your Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I/edit?gid=399205612#gid=399205612
 * 2. In your Google Sheet, click on the top menu: "Extensions" > "Apps Script".
 * 3. Delete all code inside Code.gs, paste this entire file, and click the Save icon (Ctrl+S / Cmd+S).
 * 4. In the top right corner, click the blue "Deploy" button > "New deployment".
 * 5. Click the gear icon next to "Select type" and select "Web app".
 * 6. Configure these EXACT settings:
 *    - Description: "VisionShine Form Submissions"
 *    - Execute as: "Me (your-gmail@gmail.com)"  <-- [CRITICAL: Submissions run under owner]
 *    - Who has access: "Anyone"               <-- [CRITICAL: Allows ANY Gmail user/incognito/mobile without 403 errors]
 * 7. Click "Deploy". When prompted, click "Authorize access", choose your Google account, click "Advanced" -> "Go to Untitled project (unsafe)", and click "Allow".
 * 8. Copy the generated "Web app URL" (it ends with /exec).
 * 9. Paste this Web App URL into your VisionShine Studio Dashboard under "Google Sheet & Web App Setup".
 * =========================================================================
 */

var TARGET_SPREADSHEET_ID = '1Ehg3A_TnzZYg048U6f1sRvd_lrmyj5_8Nn7DVci1D-I';
var TARGET_GID = 399205612;

var SHEET_COLUMNS = [
  'Submission ID',
  'Submission Date & Time',
  'Phone / WhatsApp',
  'Email',
  'Partner 1 Name',
  'Partner 2 Name',
  'Full Couple Name',
  'Traditions / Wedding Types',
  'Wedding Styles',
  'Destination / City',
  'Main Venue',
  'Total Guests',
  'Selected Functions Count',
  'Functions Summary (Name, Date, Time, Venue, Guests)',
  'Function Dates',
  'Function Timings / Time Slots',
  'Function Venues',
  'Function Guest Counts',
  'Selected Photography & Cinema Services',
  'Special Moments & Traditions',
  'Photography Preferences & Visual Style',
  'Discovery Source',
  'Instagram Handle',
  'Planner Name & Contact',
  'Reference Links / Moodboards',
  'Uploaded Files',
  'Additional Information',
  'Status'
];

function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  return SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
}

function getTargetSheet(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === TARGET_GID) {
      return sheets[i];
    }
  }
  var clientSubSheet = ss.getSheetByName('Client Submissions');
  if (clientSubSheet) return clientSubSheet;
  return sheets[0] || ss.insertSheet('Client Submissions');
}

/**
 * Automatically format and style the header row if the sheet is newly created
 */
function setupHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_COLUMNS);
    var headerRange = sheet.getRange(1, 1, 1, SHEET_COLUMNS.length);
    headerRange.setBackground('#1C1917');
    headerRange.setFontColor('#FAF7F2');
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Arial');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
}

function formatSingleRow(data) {
  var now = new Date();
  var formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone() || 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');
  var fullPhone = ((data.countryCode || '+91') + ' ' + (data.phone || '')).trim();
  var coupleName = (data.partner1 && data.partner2) ? (data.partner1 + ' & ' + data.partner2) : (data.partner1 || data.partner2 || 'N/A');
  
  var weddingTypesStr = (Array.isArray(data.weddingTypes) ? data.weddingTypes : []).join(', ');
  if (data.weddingTypeOther) weddingTypesStr += (weddingTypesStr ? ', ' : '') + 'Other (' + data.weddingTypeOther + ')';
  
  var weddingStylesStr = (Array.isArray(data.weddingStyles) ? data.weddingStyles : []).join(', ');
  if (data.weddingStyleOther) weddingStylesStr += (weddingStylesStr ? ', ' : '') + 'Other (' + data.weddingStyleOther + ')';

  var functionsList = Array.isArray(data.functions) ? data.functions : [];
  var functionsSummary = functionsList.map(function(f, i) {
    var time = (f.timeSlot === 'Custom' && f.customTime) ? f.customTime : (f.timeSlot || 'TBD');
    var venue = f.venue || data.mainVenue || 'TBD';
    var guests = f.guestCount ? (f.guestCount + ' guests') : ((data.guestCount || 'TBD') + ' guests');
    return '[' + (i + 1) + '] ' + f.name + ' — Date: ' + (f.date || 'TBD') + ' — Time: ' + time + ' — Venue: ' + venue + ' — Scale: ' + guests;
  }).join(' | \n');

  var functionDates = functionsList.map(function(f) { return f.name + ': ' + (f.date || 'TBD'); }).join(', ');
  var functionTimings = functionsList.map(function(f) { return f.name + ': ' + ((f.timeSlot === 'Custom' && f.customTime) ? f.customTime : f.timeSlot); }).join(', ');
  var functionVenues = functionsList.map(function(f) { return f.name + ': ' + (f.venue || data.mainVenue || 'TBD'); }).join(', ');
  var functionGuestCounts = functionsList.map(function(f) { return f.name + ': ' + (f.guestCount || data.guestCount || 'TBD'); }).join(', ');

  var photoServices = (Array.isArray(data.photographyServices) ? data.photographyServices : []).join(', ');
  if (data.photographyOther) photoServices += (photoServices ? ', ' : '') + 'Custom: ' + data.photographyOther;

  var refLinks = (Array.isArray(data.references) ? data.references : []).map(function(r) {
    return '[' + (r.platform || 'Link') + '] ' + r.url + (r.description ? ' (' + r.description + ')' : '');
  }).join('\n');

  var fileLinks = (Array.isArray(data.files) ? data.files : []).map(function(f) {
    return f.name + (f.size ? ' (' + (f.size / (1024 * 1024)).toFixed(2) + ' MB)' : '');
  }).join('\n');

  var plannerContact = [data.plannerName, data.plannerPhone ? ('(' + data.plannerPhone + ')') : ''].filter(Boolean).join(' ');
  var submissionId = data.submissionId || ('VS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));

  return [
    submissionId,
    formattedDate,
    fullPhone,
    data.email || 'N/A',
    data.partner1 || '',
    data.partner2 || '',
    coupleName,
    weddingTypesStr || 'None selected',
    weddingStylesStr || 'None selected',
    data.city || 'TBD',
    data.mainVenue || 'TBD',
    String(data.guestCount || 'TBD'),
    functionsList.length,
    functionsSummary || 'No functions documented',
    functionDates || 'TBD',
    functionTimings || 'TBD',
    functionVenues || 'TBD',
    functionGuestCounts || 'TBD',
    photoServices || 'None selected',
    data.specialMoments || 'None specified',
    data.photographyPreferences || 'None specified',
    (data.discoverySource || 'Direct') + (data.discoverySourceOther ? (' (' + data.discoverySourceOther + ')') : ''),
    data.instagramHandle || 'N/A',
    plannerContact || 'N/A',
    refLinks || 'None provided',
    fileLinks || 'None attached',
    data.additionalInformation || 'None',
    data.status || 'NEW'
  ];
}

/**
 * Handle incoming form submissions via HTTP POST
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    
    var rawData = e.postData ? e.postData.contents : '';
    var data = {};
    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var ss = getSpreadsheet();
    var sheet = getTargetSheet(ss);
    setupHeaders(sheet);

    // Support bulk submissions sync
    var bulkList = data.bulkSubmissions || data.submissions;
    if (Array.isArray(bulkList) && bulkList.length > 0) {
      for (var b = 0; b < bulkList.length; b++) {
        sheet.appendRow(formatSingleRow(bulkList[b]));
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: 'success',
        message: 'Successfully appended ' + bulkList.length + ' rows to Google Sheet',
        rowsCount: bulkList.length,
        spreadsheetId: ss.getId(),
        sheetName: sheet.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Single submission
    var row = formatSingleRow(data);
    sheet.appendRow(row);
    var newRow = sheet.getLastRow();

    var responsePayload = {
      success: true,
      status: 'success',
      result: 'ok',
      message: 'Submission successfully recorded in Google Sheet',
      submissionId: row[0],
      rowIndex: newRow,
      sheetName: sheet.getName(),
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl()
    };

    return ContentService.createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorPayload = {
      success: false,
      status: 'error',
      message: 'Apps Script Error: ' + err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorPayload))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests for health check and connection verification
 */
function doGet(e) {
  var ss = getSpreadsheet();
  var sheet = getTargetSheet(ss);
  setupHeaders(sheet);
  
  var info = {
    status: 'ok',
    success: true,
    service: 'VISIONSHINE Google Apps Script Web App',
    time: new Date().toISOString(),
    spreadsheetTitle: ss.getName(),
    spreadsheetId: ss.getId(),
    sheetName: sheet.getName(),
    totalRows: sheet.getLastRow(),
    message: 'Web App is active and ready to receive client form submissions into sheet ' + TARGET_SPREADSHEET_ID
  };

  return ContentService.createTextOutput(JSON.stringify(info))
    .setMimeType(ContentService.MimeType.JSON);
}
