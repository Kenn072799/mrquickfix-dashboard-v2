import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import pLimit from 'p-limit';
import sharp from 'sharp';

// @desc Generate OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc Send Email
export const sendEmail = async (email, title, body, attachments) => {
    if (!email || !title || !body) {
        throw new Error('Missing required email parameters');
    }

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER_BUSINESS,
            pass: process.env.EMAIL_PASSWORD_BUSINESS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_BUSINESS_FROM,
            to: email,
            subject: title,
            html: body,
            attachments
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// @desc Configure Cloudinary
const configureCloudinary = () => {
    const requiredConfigs = {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY_CLOUD,
        api_secret: process.env.API_SECRET_CLOUD
    };

    const missingConfigs = Object.entries(requiredConfigs)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingConfigs.length > 0) {
        throw new Error(
            `Missing required Cloudinary configuration(s): ${missingConfigs.join(', ')}`
        );
    }

    try {
        cloudinary.config(requiredConfigs);
    } catch (error) {
        throw new Error(`Failed to configure Cloudinary: ${error.message}`);
    }
};

// @desc Upload Job Quotation File Single
export const upload_JobQuotation_File_Single = async (buffer) => {
    if (!buffer) {
        throw new Error('No file buffer provided');
    }

    configureCloudinary();

    try {
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'job_quotations',
                    max_file_size: 10000000 // 10MB limit
                },
                (error, result) => {
                    if (error || !result) {
                        reject(new Error(error?.message || 'Upload failed'));
                        return;
                    }
                    
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        format: result.format,
                        size: result.bytes
                    });
                }
            );

            uploadStream.on('error', (error) => {
                reject(new Error(`Stream upload failed: ${error.message}`));
            });

            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error('File upload failed:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

// @desc Upload Multiple File
export const Upload_Multiple_File = async (imageBuffers) => {
    if (!Array.isArray(imageBuffers) || !imageBuffers.length) {
        throw new Error('No valid image buffers provided');
    }

    configureCloudinary();
    const limit = pLimit(5);

    try {
        const uploadPromises = imageBuffers.map(image => 
            limit(async () => {
                // Convert to WebP
                const webpBuffer = await convertToWebP(image.buffer);
                
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'auto',
                            folder: 'project_images',
                            format: 'webp',
                            quality: 'auto',
                            fetch_format: 'auto',
                        },
                        (error, result) => {
                            if (error || !result) {
                                reject(new Error(error?.message || 'Upload failed'));
                                return;
                            }
                            resolve(result.secure_url);
                        }
                    );

                    uploadStream.on('error', (error) => {
                        reject(new Error(`Stream upload failed: ${error.message}`));
                    });

                    uploadStream.end(webpBuffer);
                });
            })
        );

        const results = await Promise.all(uploadPromises);
        return results.filter(url => url);
    } catch (error) {
        console.error('Multiple file upload failed:', error);
        throw new Error(`Failed to upload multiple files: ${error.message}`);
    }
};

// @desc Delete Cloudinary Image
export const deleteCloudinaryImage = async (public_ids) => {
    if (!public_ids) {
        throw new Error('No public_id provided');
    }

    configureCloudinary();

    try {
        if (Array.isArray(public_ids)) {
            // Batch delete for multiple images
            const result = await cloudinary.api.delete_resources(public_ids);
            return {
                success: true,
                deleted: result.deleted,
                failed: result.failed
            };
        } else {
            // Single image delete
            const result = await cloudinary.uploader.destroy(public_ids);
            return {
                success: result.result === 'ok',
                deleted: result.result === 'ok' ? [public_ids] : [],
                failed: result.result !== 'ok' ? [public_ids] : []
            };
        }
    } catch (error) {
        console.error('Image deletion failed:', error);
        throw new Error(`Failed to delete image(s): ${error.message}`);
    }
};

// @desc Convert to WebP
export const convertToWebP = async (buffer) => {
    try {
        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 }) // Adjust quality as needed (0-100)
            .toBuffer();
        return webpBuffer;
    } catch (error) {
        console.error('Error converting to WebP:', error);
        throw new Error('Failed to convert image to WebP');
    }
};

// @desc Upload Single Image
export const upload_Single_Image = async (buffer) => {
    if (!buffer) {
        throw new Error('No file buffer provided');
    }

    try {
        configureCloudinary();
        try {
            await cloudinary.api.ping();
        } catch (error) {
            throw new Error(
                `Cannot connect to Cloudinary. Please check your internet connection and credentials. Error: ${error.message}`
            );
        }

        // Convert to WebP
        const webpBuffer = await convertToWebP(buffer);

        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    format: 'webp',
                    quality: 'auto',
                    timeout: 60000, // 60 second timeout
                },
                (error, result) => {
                    if (error) {
                        reject(new Error(`Upload failed: ${error.message}`));
                        return;
                    }
                    if (!result) {
                        reject(new Error('Upload failed: No result returned'));
                        return;
                    }
                    
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        format: result.format,
                        size: result.bytes
                    });
                }
            );

            uploadStream.on('error', (error) => {
                reject(new Error(`Stream upload failed: ${error.message}`));
            });

            uploadStream.end(webpBuffer);
        });
    } catch (error) {
        console.error('File upload failed:', error);
        
        if (error.message.includes('ENOTFOUND')) {
            throw new Error(
                'Cannot connect to Cloudinary. Please check your internet connection and DNS settings.'
            );
        } else if (error.message.includes('401')) {
            throw new Error(
                'Authentication failed. Please check your Cloudinary credentials.'
            );
        } else if (error.message.includes('timeout')) {
            throw new Error(
                'Upload timed out. Please check your internet connection and try again.'
            );
        }
        
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};