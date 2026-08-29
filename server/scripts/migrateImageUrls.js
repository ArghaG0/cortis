import mongoose from 'mongoose';
import 'dotenv/config';
import Post from '../models/post.js';
import imagekit from '../configs/imagekit.js';

async function migrate() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URL + '/pingup');
        console.log('Connected.');

        const posts = await Post.find({});
        let migratedCount = 0;
        let skippedCount = 0;

        for (const post of posts) {
            let needsUpdate = false;
            const newImageUrls = [];

            for (const img of post.image_urls) {
                // If img is a string (legacy data)
                if (typeof img === 'string') {
                    needsUpdate = true;
                    
                    try {
                        // Extract filename from the URL (e.g., https://ik.imagekit.io/.../filename.ext)
                        // Note: ImageKit URLs might have query params or transformations
                        const urlObj = new URL(img);
                        const pathname = urlObj.pathname;
                        // Example path: /i8s8hwh7f/posts/filename.ext
                        const parts = pathname.split('/');
                        let filename = parts[parts.length - 1];
                        
                        // Search for the file in ImageKit
                        const result = await imagekit.listFiles({
                            searchQuery: `name="${filename}"`
                        });

                        if (result && result.length > 0) {
                            // Find the best match if there are multiple (e.g. by folder)
                            const file = result.find(f => f.filePath.includes('/posts/')) || result[0];
                            newImageUrls.push({ url: img, fileId: file.fileId });
                            console.log(`Resolved fileId for ${filename}: ${file.fileId}`);
                        } else {
                            console.log(`Warning: Could not find fileId for ${img} in ImageKit. Skipping exact match.`);
                            newImageUrls.push({ url: img, fileId: null });
                        }
                    } catch (err) {
                        console.log(`Error resolving fileId for ${img}:`, err.message);
                        newImageUrls.push({ url: img, fileId: null });
                    }
                } 
                // If it's already an object but missing url/fileId (just in case)
                else if (img && img.url) {
                    newImageUrls.push(img);
                } 
                // Sometimes mongoose might cast the old string array to objects with empty fields
                // if we don't use lean(). To handle that, we would need to look at raw DB data.
                // Let's assume Mongoose keeps the _doc strings or we use lean().
            }

            if (needsUpdate) {
                post.image_urls = newImageUrls;
                await post.save();
                migratedCount++;
                console.log(`Migrated post ${post._id}`);
            } else {
                skippedCount++;
            }
        }

        console.log(`Migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
