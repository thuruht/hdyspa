-- Add image_url column to content_blocks table
ALTER TABLE content_blocks ADD COLUMN image_url TEXT;

-- Update the hours entry to include the default image
UPDATE content_blocks SET image_url = './mxdiyjuly.png' WHERE id = 'hours';
