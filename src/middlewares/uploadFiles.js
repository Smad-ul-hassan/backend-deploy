import multer from 'multer'
import multerS3 from 'multer-s3'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
})

export const uploadUserProfileImage = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'epitap-bucket',
        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: (req, file, callBack) => {
            const folderName = 'user/'
            var fullPath =
                folderName + file.originalname
            callBack(null, fullPath)
        },
    }),
})

// upload review image
export const uploadMemoryWallImage = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'epitap-bucket',
        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: (req, file, callBack) => {
            const folderName = 'medallion/momory-wall'
            var fullPath =
                folderName + file.originalname
            callBack(null, fullPath)
        },
    }),
})

// upload medallion multiple images
export const uploadMedallionImages = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'epitap-bucket',
        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: (req, file, callBack) => {
            const folderName = 'user/medallions/'
            var fullPath =
                folderName + file.originalname
            callBack(null, fullPath)
        },
    }),
})

// delete image
export const deleteImage = (key) => {
    const params = {
        Bucket: 'epitap-bucket',
        Key: key,
    }
    const data = s3
        .send(new DeleteObjectCommand(params))
        .then((response) => {
            return 'success'
        })
        .catch((error) => {
            return 'error'
        })
    return data
}

// delete single image
export const deleteSingleImage = (key) => {
    const params = {
        Bucket: 'epitap-bucket',
        Key: key,
    }
    const data = s3
        .send(new DeleteObjectCommand(params))
        .then((response) => {
            return 'success'
        })
        .catch((error) => {
            return 'error'
        })
    return data
}