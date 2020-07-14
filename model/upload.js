/**
* This module contains class that uploads the 
*/
const utils = require('../utils/utils')
const CONSTANTS = require('../CONSTANTS')
const { BUCKET_NAME, GROUP_NAME, GROUP_ID, FILE_INDEX_FROM_SERVER, HTTPS, DEBUG,
    PUBLIC_SHARED_FOLDER, S3_SERVER_ENDPOINT, CLI_KEY_FILE_NAME } = require('../CONSTANTS')
const s3utils = require('../utils/s3utils')
const { BaseCommand } = require("./basecommand")

const axios = require('axios')
const chalk = require('chalk')

class Upload extends BaseCommand {
    /**
     *Creates an instance of Upload.
     * @param {*} args - Arguments passed to the command, name of file to be uploaded.
     * @param {*} options - options of the command.
     * @memberof Upload
     */
    constructor(args, options) {
        super(args, options);
    }
    action() {

        let epoch_time = (new Date()) / 1000;
        let local_file_path = utils.check_file_exists(this.getArgsValue(CLI_KEY_FILE_NAME))
        if (local_file_path) {
            const bucket_name = utils.get_config_value(BUCKET_NAME)
            const group_name = utils.get_config_value(GROUP_NAME)
            const group_id = utils.get_config_value(GROUP_ID)
            const public_shared_folder = utils.get_config_value(PUBLIC_SHARED_FOLDER)
            const s3_server_endpoint = utils.get_config_value(S3_SERVER_ENDPOINT)

            let s3_file_obj_name = group_name + "/" + epoch_time + "/" + local_file_path
            let s3_full_public_path = null;
            const DOT = ".";
            const PUBLIC_FILE_PERMISSION = 'public-read'
            let is_public = null;
            if (this.options.public && public_shared_folder) {
                s3_file_obj_name = public_shared_folder + "/" + s3_file_obj_name;
                s3_full_public_path = HTTPS + bucket_name + DOT + s3_server_endpoint + "/" + s3_file_obj_name;
                is_public = PUBLIC_FILE_PERMISSION;
            }


            s3utils.upload_to_s3(local_file_path, bucket_name, s3_file_obj_name, is_public, (data) => {
                this.store_file_path_in_firestore(bucket_name, group_id, group_name, s3_file_obj_name, s3_full_public_path)
            });
        }
    }
    /**
     * This method adds the url to the firebase database and gets the file index number.
     * @param {*} bucket_name - Bucket name where file has to be uploaded.
     * @param {*} group_id - Group ID of the group
     * @param {*} group_name - Group name of the group to which file has to be uploaded.
     * @param {*} s3_file_obj_name - S3 object name of the file to be uploaded.
     * @param {*} s3_full_public_path - S3 full URL to the file in storage.
     * @memberof Upload
     */
    store_file_path_in_firestore(bucket_name, group_id, group_name, s3_file_obj_name, s3_full_public_path) {
        let upload_file_data = {
            "bucket_name": bucket_name,
            "group_id": group_id,
            "group_name": group_name,
            "s3_url": s3_file_obj_name
        }
        axios.post(CONSTANTS.FIRESSTORE_URL_TO_GET_NUMBER, upload_file_data).then((response) => {

            let pub_url = "";
            if (s3_full_public_path) {
                pub_url = " \n\n " + s3_full_public_path;
            }

            console.log(" \n ");
            console.log("Success!   file number: " + chalk.red(response.data[FILE_INDEX_FROM_SERVER]));
            console.log("\n" + pub_url, "  \n\n  ");
        }, (err) => {
            if (DEBUG) console.log(err); else console.log('Error-96: in fetching file number');
        });
    }
}

module.exports = {
    Upload
}