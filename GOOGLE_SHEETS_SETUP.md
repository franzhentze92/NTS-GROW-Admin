# Google Sheets Integration Setup

This application now integrates with Google Sheets to fetch task data from the GROW Tasks spreadsheet.

## Current Implementation

The application currently uses a public CSV export approach to fetch data from the Google Sheets spreadsheet. This works for publicly accessible spreadsheets.

## Features

- ✅ Fetches real task data from Google Sheets
- ✅ Displays tasks in a Gantt chart view
- ✅ Shows task statistics and progress
- ✅ Filter tasks by project
- ✅ Responsive design with loading states
- ✅ Error handling for network issues

## Data Structure

The application expects the following columns in your Google Sheets:
- A: Project
- B: Category  
- C: Task
- D: Description
- E: Date of start
- F: Date of completion
- G: Action
- H: Update Pushed Live

## Future Enhancements

To enable full Google Sheets API integration (for private sheets or write access), you'll need to:

1. **Get a Google Sheets API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Sheets API
   - Create credentials (API Key)
   - Restrict the API key to Google Sheets API only

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
   ```

3. **Update the Service:**
   The `fetchTasksWithGoogleAPI` function in `src/lib/googleSheets.ts` is ready to use with proper authentication.

## Current Spreadsheet

The application is configured to fetch data from:
- **Spreadsheet ID:** `1_JBGbLO8ZC9GtLBYbOiMdVtBB6L_He7wfKQnAeJ1wrY`
- **Range:** `A:H` (columns A through H)

## Usage

1. Navigate to the Task Calendar page
2. The application will automatically fetch data from Google Sheets
3. Use the project filter to view tasks by specific projects
4. Click the "Refresh" button to reload data
5. View task progress in the Gantt chart and table view

## Troubleshooting

- **CORS Issues:** If you encounter CORS errors, ensure the spreadsheet is publicly accessible
- **Data Not Loading:** Check the browser console for error messages
- **Date Parsing Issues:** Ensure dates in the spreadsheet are in DD/MM/YYYY format

## Security Notes

- The current implementation uses public CSV export, which is suitable for public data
- For sensitive data, implement proper Google Sheets API authentication
- Never commit API keys to version control 