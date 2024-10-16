const Banner = require('../models/bannerModel');
const { uploadImageToStorage } = require('../utils/uploadImageToStorage');


exports.createBanner = async (req, res) => {
    try {
        const { title, image } = req.body;

        // Ensure image is a base64 string
        let uploadedImage;
        if (typeof image === 'string') {
            const imageBuffer = Buffer.from(image, 'base64'); // Convert base64 to buffer
            uploadedImage = await uploadImageToStorage(imageBuffer); // Upload the buffer
        } else {
            throw new Error('Invalid image format. Expected a base64-encoded string.');
        }

        const banner = new Banner({
            title,
            image: uploadedImage, // Save uploaded image information
        });

        await banner.save();

        res.status(201).json({
            success: true,
            banner,
        });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all banners
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find();
        res.status(200).json({
            success: true,
            banners,
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get a single banner by ID
exports.getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        res.status(200).json({
            success: true,
            banner,
        });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update a banner by ID

// exports.updateBanner = async (req, res) => {
//     try {
//         const { title, images } = req.body; // Changed from image to images to match the category logic

//         let banner = await Banner.findById(req.params.id);
//         if (!banner) {
//             return res.status(404).json({ success: false, message: 'Banner not found' });
//         }

//         // Update the title if provided
//         if (title) {
//             banner.title = title;
//         }

//         // If images are provided, validate each image has the required fields
//         if (images && Array.isArray(images)) {
//             for (let img of images) {
//                 // Log each image for validation
//                 console.log("Validating image:", img); 
//                 if (!img.public_id || !img.url) {
//                     return res.status(400).json({
//                         success: false,
//                         message: 'Each image must have both public_id and url.',
//                     });
//                 }
//             }
//             banner.images = images; // Only set if all images are valid
//         }

//         // Save the updated banner
//         await banner.save();

//         res.status(200).json({
//             success: true,
//             banner,
//         });
//     } catch (error) {
//         console.error('Error updating banner:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };
// Backend: updateBanner controller
exports.updateBanner = async (req, res) => {
    try {
      const { title, images } = req.body; // Changed from image to images to match the category logic
  
      let banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
  
      // Update the title if provided
      if (title) {
        banner.title = title;
      }
  
      // If images are provided, validate each image has the required fields
      if (image && Array.isArray(image)) {
        for (let img of image) {
          console.log("Validating image:", img); // Log each image for validation
          if (!img.public_id || !img.url) {
            return res.status(400).json({
              success: false,
              message: 'Each image must have both public_id and url.',
            });
          }
        }
        banner.image = images; // Only set if all images are valid
      }
  
      // Save the updated banner
      await banner.save();
      console.log("Updated banner:", banner); // Log the updated banner
  
      res.status(200).json({
        success: true,
        banner,
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
// Delete a banner by ID
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        await banner.remove();

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};