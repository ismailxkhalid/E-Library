// utils/fileUpload.ts

import path from 'node:path';
import fs from 'node:fs';
import cloudinary from '../config/cloudinary';

interface UploadedFile {
    filename: string;
    mimetype: string;
}

async function uploadFile(file: UploadedFile, folder: string): Promise<string> {
    const { filename, mimetype } = file;
    const filePath = path.resolve(
        __dirname,
        `../../public/data/uploads/${filename}`
    );

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: filename,
            folder: folder,
            format: mimetype.split('/')[1]
        });

        await fs.promises.unlink(filePath);
        return uploadResult.secure_url;
    } catch (error) {
        throw new Error('Failed to upload file');
    }
}

export default uploadFile;
