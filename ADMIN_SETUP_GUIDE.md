# Dawa'ah Admin System - Setup & Usage Guide

## Overview
The Dawa'ah system now includes a dedicated **Admin Panel** where administrators and executives can manage all public-facing content. Everything they add is automatically saved to the database and displayed to all regular users across the system.

## New Files Created

### 1. **admin.html** - Admin Panel Interface
- A complete admin dashboard interface
- Accessible only to users with `admin` or `executive` role
- Main content management tools

### 2. **admin.js** - Admin Panel JavaScript
- Handles all admin panel functionality
- Communicates with the API to save/retrieve data
- Real-time updates and notifications

### 3. **admin_api.php** - Admin Content API
- Endpoints for creating/reading/deleting:
  - Announcements
  - Events
  - Leadership members
  - Gallery items
- All data saved directly to database

## How It Works

### Admin Workflow
1. **Admin logs in** to the main Dawa'ah system with `admin` or `executive` role
2. **Clicks "Content Manager"** in the Admin Panel menu (or visit `admin.html` directly)
3. **Creates content** (announcements, events, leadership, gallery)
4. **Data is saved** to the database automatically
5. **Regular users see** the content immediately on the landing page

### User Workflow
1. **Regular users** visit the landing page
2. **System fetches** latest leadership and gallery from database
3. **Content displays** in the "Our Leadership" and "Gallery" sections
4. **Updates happen** in real-time as admins add/remove content

## Features

### 📢 Announcements Management
- Create announcements with title, content, and priority level
- Set expiration dates
- Delete announcements
- Displayed to all members in the dashboard

### 📅 Events Management
- Create upcoming events with date, time, and location
- Add descriptions
- Delete events
- Members can register for events

### 👥 Leadership Members Management
- Add leadership member profiles
- Include name, position, bio, email, phone, photo URL
- Display on landing page in "Our Leadership" section
- Delete members

### 🖼️ Gallery Management
- Upload gallery items with title and description
- Add image URLs
- Gallery displays on landing page
- Delete items

## Usage Instructions

### Accessing the Admin Panel

**Option 1: From Main Dashboard**
1. Login with admin/executive account
2. Look for "Admin Panel" menu section
3. Click "Content Manager" button
4. New window opens with full admin interface

**Option 2: Direct Access**
- Visit `admin.html` directly (requires login first)
- Must be logged in as admin/executive

### Creating an Announcement
1. Go to Admin Panel → Announcements
2. Fill in:
   - **Title**: Announcement headline
   - **Content**: Full announcement text
   - **Priority**: Low / Normal / High
   - **Expires At**: (Optional) When to stop showing
3. Click "Create Announcement"
4. Success message appears
5. Available to all users immediately

### Creating an Event
1. Go to Admin Panel → Events
2. Fill in:
   - **Event Title**: Name of the event
   - **Description**: Event details
   - **Date & Time**: When the event occurs
   - **Location**: Where it's happening
3. Click "Create Event"
4. Event appears in upcoming events list
5. Users can register to attend

### Adding Leadership Members
1. Go to Admin Panel → Leadership
2. Fill in:
   - **Name**: Full name
   - **Position**: Leadership title
   - **Short Bio**: Brief biography
   - **Description**: Detailed information
   - **Email**: Contact email
   - **Phone**: Contact number
   - **Photo URL**: Link to their photo (optional)
3. Click "Add Member"
4. Appears on landing page immediately

### Adding Gallery Items
1. Go to Admin Panel → Gallery
2. Fill in:
   - **Title**: Image title
   - **Description**: Image details
   - **Image URL**: Direct link to image (must be publicly accessible)
3. Click "Add to Gallery"
4. Appears in gallery section immediately

## Data Storage

### Database Tables
The system creates these tables automatically:

- **leadership_profiles** - Stores leadership member information
- **gallery** - Stores gallery items
- **announcements** - Stores announcements
- **events** - Stores event information

### Data Persistence
- All admin-created content is stored in **MySQL database**
- Data persists across browser sessions
- Multiple admins can manage content simultaneously
- Historical data is maintained for auditing

## Dashboard Statistics

The admin dashboard shows:
- **Total Announcements** - Count of active announcements
- **Active Events** - Count of upcoming events
- **Leadership Members** - Count of leadership profiles
- **Gallery Items** - Count of gallery items

Statistics update automatically every 30 seconds.

## User Permissions

### Admin/Executive Role
- ✅ Full access to admin panel
- ✅ Can create/delete announcements
- ✅ Can create/delete events
- ✅ Can add/remove leadership members
- ✅ Can manage gallery items
- ✅ Can view all system data

### Student/Regular User
- ❌ Cannot access admin panel
- ❌ Cannot create content
- ✅ Can view all public content
- ✅ Can register for events
- ✅ Can view announcements
- ✅ Can browse gallery

## API Endpoints

### Announcements
- `GET admin_api.php?action=getAnnouncements` - Fetch all announcements
- `POST admin_api.php?action=createAnnouncement` - Create announcement
- `DELETE admin_api.php?action=deleteAnnouncement` - Delete announcement

### Events
- `GET admin_api.php?action=getEvents` - Fetch all events
- `POST admin_api.php?action=createEvent` - Create event
- `DELETE admin_api.php?action=deleteEvent` - Delete event

### Leadership
- `GET admin_api.php?action=getLeaders` - Fetch all leaders
- `POST admin_api.php?action=addLeader` - Add leader
- `DELETE admin_api.php?action=deleteLeader` - Delete leader

### Gallery
- `GET admin_api.php?action=getGallery` - Fetch all gallery items
- `POST admin_api.php?action=addGalleryItem` - Add gallery item
- `DELETE admin_api.php?action=deleteGalleryItem` - Delete item

## Important Notes

1. **Required Fields**
   - Announcements: Title, Content
   - Events: Title, Description, Date/Time
   - Leadership: Name, Position
   - Gallery: Title, Image URL

2. **Image URLs**
   - Must be complete URLs (https://example.com/image.jpg)
   - Image must be publicly accessible
   - Recommended size: under 5MB

3. **Data Display**
   - Leadership and gallery content fetches from database first
   - Falls back to localStorage if database unavailable
   - Regular users see data in real-time

4. **Editing Content**
   - Currently delete and re-create to edit
   - Database stores creation timestamp for audit trail

5. **Notifications**
   - Success/error messages appear at top-right
   - Auto-dismiss after 5 seconds
   - Check notifications for operation status

## Troubleshooting

### Admin Panel Won't Load
- Ensure you're logged in with admin/executive account
- Check browser console for errors
- Verify database connection is working

### Content Not Appearing
- Refresh the page
- Check that the add operation completed successfully
- Verify image URLs are correct (if gallery)
- Try clearing browser cache

### Database Connection Issues
- Ensure MySQL server is running
- Check database credentials in `database.php`
- Verify database and tables exist
- Check file permissions on PHP files

## Next Steps

1. **Login as admin/executive** with your Dawa'ah credentials
2. **Access admin panel** from the dashboard menu
3. **Start adding content** - leadership members, events, announcements
4. **Monitor dashboard** to see usage statistics
5. **Regular users** will see all your additions automatically

---

For technical support or questions, contact the Dawa'ah IT team.
