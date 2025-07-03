# Hours Image Update Feature

The Howdy DIY Thrift app now includes a feature to update the "hours" section image from the admin area. This allows the store manager to easily replace the hours image whenever the schedule changes.

## How It Works

1. **Admin Panel Access**: Log in to the admin panel by clicking the "Admin" button at the bottom of the page.

2. **Navigate to Hours Section**: In the admin panel, find the "Edit Hours" section.

3. **Update Hours Image**:
   - The current hours image is displayed for reference
   - Click the "Choose File" button to select a new image
   - Click "Upload New Image" to upload the selected image
   - A confirmation message will appear when the upload is successful
   - Click "Save Hours Content" to save the changes

4. **Image Requirements**:
   - Recommended format: PNG with transparent background
   - Recommended width: 800px (will automatically scale to fit)
   - For best results, use text colors that contrast well with the site background

## Technical Implementation

The hours image feature uses the following components:

1. **Database**: The `content_blocks` table has been updated with an `image_url` column to store the path to the current hours image.

2. **API Endpoints**:
   - `GET /api/content/hours` - Returns hours content including the image URL
   - `PUT /api/content/hours` - Updates hours content and image URL
   - `POST /api/media/upload` - Handles image file uploads to R2 storage

3. **Admin Interface**:
   - New UI elements in the hours section of the admin panel
   - Preview of current image
   - File input and upload button
   - Status messages for upload progress and errors

4. **Frontend Display**:
   - The hours image is displayed below the hours text content
   - GSAP animations for smooth transitions when updating the image

## Deployment

When deploying updates, the database migration script `migration_hours_image.sql` must be run to add the `image_url` column to the `content_blocks` table. This is included in the deployment script as an optional step.
