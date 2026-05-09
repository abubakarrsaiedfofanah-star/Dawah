# Hadith Management System - Admin Controlled

## Overview
Hadiths are now completely managed by admins. Only admins can add, edit, or delete hadiths through the admin panel. All users see exactly what the admin adds.

## How It Works

### Admin Workflow
1. **Login** with admin/executive role
2. **Go to Admin Panel → Content Manager (admin.html)**
3. **Click on "Hadiths"** tab in the sidebar
4. **Add New Hadith** by filling in:
   - **Arabic Text** - The hadith in Arabic (with right-to-left support)
   - **English Translation** - English version of the hadith
   - **Reference** - Citation source (e.g., "Sahih Bukhari 1901 & Muslim 760")
   - **Source** - Who said it (e.g., "Prophet Muhammad (Peace Be Upon Him)")
   - **Category** - Category label (e.g., "Spirituality", "Charity", "Knowledge")
5. **Click "Add Hadith"** to save to database
6. **View all hadiths** in the list below
7. **Delete hadiths** using the trash icon

### User Workflow
1. **Users visit dashboard**
2. **Daily Hadith section** loads automatically
3. **See what admin added** - each day shows a different hadith
4. **Can navigate** hadiths using Previous/Next buttons
5. **See Arabic and English** versions

## Data Flow

```
Admin Panel (admin.html)
    ↓
Admin API (admin_api.php)
    ↓
Database (hadiths table)
    ↓
Public API (dawaah.php)
    ↓
User Dashboard (index.html)
```

## Features

### For Admins
- ✅ Add new hadiths with all details
- ✅ View list of all hadiths
- ✅ Delete hadiths
- ✅ RTL support for Arabic text
- ✅ Real-time updates
- ✅ Success/error notifications

### For Users
- ✅ See daily hadith (changes each day)
- ✅ Navigate between hadiths (Previous/Next)
- ✅ View Arabic and English text
- ✅ See reference and source info
- ✅ Auto-loads from database

## API Endpoints

### Admin API (admin_api.php)
- `POST admin_api.php?action=addHadith` - Add new hadith
- `GET admin_api.php?action=getHadiths` - Get all hadiths
- `GET admin_api.php?action=getDailyHadith` - Get today's hadith
- `GET admin_api.php?action=getHadithById&id=1` - Get specific hadith
- `PUT admin_api.php?action=updateHadith` - Update hadith
- `DELETE admin_api.php?action=deleteHadith` - Delete hadith

### Public API (dawaah.php)
- `GET dawaah.php?action=getAll` - Get all hadiths (for users)
- `GET dawaah.php?action=getDaily` - Get today's hadith (for dashboard)
- `GET dawaah.php?action=getById&id=1` - Get specific hadith
- `GET dawaah.php?action=getToday` - Get today's hadith (alternative)

## Database Table Structure

### hadiths
```
id (INT) - Primary key
arabic (TEXT) - Hadith in Arabic
english (TEXT) - English translation
reference (VARCHAR) - Citation reference
source (VARCHAR) - Source (e.g., Prophet Muhammad)
category (VARCHAR) - Category/topic
added_by (INT) - Admin user ID who added it
created_at (TIMESTAMP) - Creation date
updated_at (TIMESTAMP) - Last update date
status (ENUM) - 'active' or 'inactive'
```

## Usage Examples

### Adding a Hadith
```json
POST admin_api.php?action=addHadith
{
    "arabic": "عن أبي هريرة قال: قال رسول الله...",
    "english": "Whoever stands (in prayer) during...",
    "reference": "Sahih Bukhari 1901 & Muslim 760",
    "source": "Prophet Muhammad (Peace Be Upon Him)",
    "category": "Spirituality",
    "added_by": 1
}
```

### Getting All Hadiths
```
GET dawaah.php?action=getAll
Response: Array of all hadiths in database
```

### Getting Today's Hadith
```
GET dawaah.php?action=getDaily
Response: Today's selected hadith (same for all users)
```

## Daily Hadith Selection Logic

The system uses a smart algorithm to ensure all users see the **same hadith** on any given day:
- Calculate day of year (0-365)
- Use modulo operation: `dayOfYear % totalHadiths`
- This ensures consistency and cycles through all hadiths

## Key Files

1. **admin.html** - Admin panel with hadiths management section
2. **admin.js** - Frontend functions for managing hadiths
   - `addHadith()` - Adds new hadith
   - `loadHadiths()` - Fetches and displays all hadiths
   - `deleteHadithItem()` - Deletes a hadith
3. **admin_api.php** - Backend API endpoints for admin operations
4. **dawaah.php** - Public API that fetches from database
5. **db_operations.php** - Database helper functions
   - `addHadith()` - Database insert
   - `getAllHadiths()` - Fetch all
   - `getDailyHadith()` - Get today's hadith
   - `updateHadith()` - Update existing
   - `deleteHadith()` - Delete from database
6. **dawaah.javascript** - User frontend
   - Already calls `dawaah.php?action=getDaily`
   - Displays hadiths on dashboard
   - Navigation functions already in place

## Important Notes

1. **No Hardcoded Hadiths** - All hadiths come from database
2. **Admin Controlled** - Only admins can manage hadiths
3. **Real-Time Updates** - Users see changes immediately
4. **Arabic Support** - Full RTL support for Arabic text
5. **Persistent Storage** - All data saved to MySQL database
6. **Secure** - API checks for admin role before allowing changes

## Troubleshooting

### Hadiths not showing
- Check database connection in `database.php`
- Ensure hadiths table was created
- Check browser console for errors

### Admin panel won't save
- Verify admin/executive login
- Check `admin_api.php` is accessible
- Check database write permissions

### Daily hadith not rotating
- Clear browser cache
- Verify hadiths exist in database
- Check that database query returns results

## Future Enhancements

- Add edit functionality for existing hadiths
- Schedule hadiths for future dates
- Add hadith categories and filters
- Allow users to favorite hadiths
- Add hadith search functionality
- Export hadiths to PDF/Excel
