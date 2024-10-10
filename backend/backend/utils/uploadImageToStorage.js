const cloudinary = require('cloudinary').v2; // Make sure you have the correct version


const uploadImageToStorage = async (imageBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
                if (error) {
                    console.error("Error uploading image:", error);
                    return reject(error); // Reject promise on error
                }
                resolve({
                    public_id: result.public_id,
                    url: result.secure_url,
                }); // Resolve with both public_id and url
            }
        );
        uploadStream.end(imageBuffer); // End the stream with the buffer
    });
};

module.exports = { uploadImageToStorage };