
const multer = require('multer'),
    multerS3 = require('multer-s3');
// const { S3Client } = require('@aws-sdk/client-s3');
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: 'ddvbrhwab',
    api_key: '312698569797977',
    api_secret: 'dcGxziDDSIxuzYEq0bLd0_idtcQ'
});
// s3 = new S3Client({
//     credentials: {
//         secretAccessKey: process.env.AWS_SECRET_KEY,
//         accessKeyId: process.env.AWS_ACCESS_KEY
//     },
//     region: 'us-east-1'
// });
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "veebo_uploads",
        format: async (req, file) => "png",
        public_id: (req, file) => Date.now() + "-" + file.originalname,
    },
});
module.exports = {
    upload: multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 },
    })
    // upload: multer({
    //     storage: multerS3({
    //         s3: s3,
    //         acl: 'public-read',
    //         bucket: 'service-app-docs',
    //         key: function (req, file, cb) {
    //             console.log('came in upload');
    //             cb(null, `${new Date().getTime()}-${file.originalname}`);
    //         }
    //     })
    // })
}