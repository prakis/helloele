const AWS = require('aws-sdk');
const fs = require('fs');

const utils = require('./utils');
const CONSTANTS = require('../CONSTANTS')
const { HTTPS, DEBUG } = require('../CONSTANTS')

/**
 * This function updates the AWS credentials provided by the user.
 * @returns
 */
function init_s3() {

    let endpointUrl = HTTPS + utils.get_config_value(CONSTANTS.S3_SERVER_ENDPOINT);
    AWS.config.update({
        accessKeyId: utils.get_config_value(CONSTANTS.ACCESS_KEY),
        secretAccessKey: utils.get_config_value(CONSTANTS.SECRET_ACCESS_KEY),
        endpoint: endpointUrl
    });
    let s3 = new AWS.S3();
    return s3;
}

/**
 * This function downloads the given file number from the S3 store.
 * @param {*} bucket_name - Bucket name from where the file has to be downloaded.
 * @param {*} s3_file_obj_name - S3 url to download the file.
 * @param {*} local_file_path - Path where the file has to be saved.
 */
function download_file_from_s3(bucket_name, s3_file_obj_name, local_file_path) {
    let s3 = init_s3();

    var fileStream = fs.createWriteStream(local_file_path);
    var s3Stream = s3.getObject({ Bucket: bucket_name, Key: s3_file_obj_name }).createReadStream();

    s3Stream.on('error', function (err) {
        console.error(err); // NoSuchKey: The specified key does not exist
    });

    s3Stream.pipe(fileStream).on('error', function (err) {
        // capture any errors that occur when writing data to the file
        if (DEBUG) console.log(err); else console.log('Error-37: Error in downlading file ');
    }).on('close', function () {
        console.log(' \n\n Download Complete: ', local_file_path, "  \n\n ");
    });
}

/**
 * This function upload the given file to the S3 store.
 *
 * @param {*} local_file_path - Path of the file need to be uploaded.
 * @param {*} bucket_name - Bucket name where the file has to be uploaded.
 * @param {*} s3_file_obj_name - S3 url to upload the file.
 * @param {*} public_permision 
 * @param {*} callback
 */
function upload_to_s3(local_file_path, bucket_name, s3_file_obj_name, public_permision, callback) {
    let s3 = init_s3();
    var params = {
        Bucket: bucket_name,
        Body: fs.createReadStream(local_file_path),
        Key: s3_file_obj_name
    };

    if (public_permision) {
        params['ACL'] = 'public-read';
    }
    s3.upload(params, function (err, data) {
        //handle error
        if (err) {
            if (DEBUG) console.log(err); else console.log('Error-59: Error in uploading file ');
        }

        //success
        if (data) {
            callback(data);
        }
    });
}

/**
 * This function deletes the given file number from the S3 store.
 *
 * @param {*} bucket_name - Bucket name where the file has to be deleted.
 * @param {*} s3_file_path - S3 url to delete the file
 * @param {*} callback
 */
function delete_file_from_s3(bucket_name, s3_file_path, callback) {
    let s3 = init_s3();

    var params = {
        Bucket: bucket_name,
        Delete: {
            Objects: [
                {
                    Key: s3_file_path
                }
            ],
        },
    };

    s3.deleteObjects(params, function (err, data) {
        //handle error
        if (err) {
            if (DEBUG) console.log(err); else console.log('Error-87: Error in deleting file ');
        }

        //success
        if (data) {
            callback(data);
        }
    });
}

module.exports = {
    init_s3,
    upload_to_s3,
    download_file_from_s3,
    delete_file_from_s3
}