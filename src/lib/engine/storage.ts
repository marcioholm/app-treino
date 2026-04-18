import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

// In a real SaaS, process.env.STORAGE_PROVIDER would be 's3' or 'r2'
// For this environment we mock physical storage in the public folder.

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

/**
 * Uploads a file buffer either local or S3 (mocked returning local path url for now)
 * @param buffer The file buffer (image, video)
 * @param fileName Original filename or extension
 * @param folder Folder to organize (e.g., 'exercises')
 * @returns {string} public URL path
 */
export async function uploadFile(buffer: Buffer, fileName: string, folder: string = 'general'): Promise<string> {
    const isLocal = process.env.NODE_ENV !== 'production' || process.env.STORAGE_PROVIDER === 'local';

    // Generate unique ID
    const uniqueId = crypto.randomUUID();
    const ext = fileName.split('.').pop() || 'jpg';
    const newName = `${uniqueId}.${ext}`;

    if (isLocal || !process.env.S3_BUCKET) {
        // Local strategy inside public folder
        const targetDir = join(UPLOAD_DIR, folder);

        try {
            await mkdir(targetDir, { recursive: true });
        } catch (e: any) {
            if (e.code !== 'EEXIST') throw e;
        }

        const filePath = join(targetDir, newName);
        await writeFile(filePath, buffer);

        return `/uploads/${folder}/${newName}`;
    }

    // AWS S3 / Cloudflare R2 Mock path logic
    // const command = new PutObjectCommand({ ... });
    // await s3Client.send(command);
    // return `https://${process.env.S3_BUCKET_URL}/${folder}/${newName}`;

    throw new Error('Cloud storage not fully implemented yet');
}
