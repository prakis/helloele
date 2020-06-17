const utils = require('../utils/utils')
const CONSTANTS = require('../CONSTANTS')
const { BUCKET_NAME, GROUP_NAME, GROUP_ID, FILE_INDEX_FROM_SERVER, DEBUG, CLI_USER_ENTERED_FILE_NUMBER } = require('../CONSTANTS')
const { BaseCommand } = require("./basecommand")
const axios = require('axios')
const s3utils = require('../utils/s3utils')


class DeleteFile extends BaseCommand {
    /**
     *Creates an instance of DeleteFile.
     * @param {*} args - Arguments passed to the command, user entered file number.
     * @param {*} options - Options of the command
     * @memberof DeleteFile
     */
    constructor(args, options) {
        super(args, options)
    }
    action() {
        const bucket_name = utils.get_config_value(BUCKET_NAME)
        const group_name = utils.get_config_value(GROUP_NAME)
        const group_id = utils.get_config_value(GROUP_ID)

        const file_index = this.getArgsValue(CLI_USER_ENTERED_FILE_NUMBER);
        const local_group_data = { [BUCKET_NAME]: bucket_name, [GROUP_ID]: group_id, [GROUP_NAME]: group_name, [FILE_INDEX_FROM_SERVER]: file_index }

        axios.post(CONSTANTS.FIRESSTORE_URL_TO_GET_FILE_DATA, local_group_data).then((response) => {
            let file_data_from_db = response.data;
            if (file_data_from_db["delete_status"] == true) {
                console.log("\n File number : " + file_index + " is deleted \n")
            } else {
                let s3_file_obj_name = file_data_from_db["s3_url"]
                s3utils.delete_file_from_s3(bucket_name, s3_file_obj_name, (data) => {
                    this.update_delete_status_in_firestore(bucket_name, group_id, group_name, file_index)
                })
            }
        }, (err) => {
            if (DEBUG)
                console.log(err);
        });
    }
    /**
     *This method updates the delete status in the firebase datastore.
     * @param {*} bucket_name - Bucket name from where the file has to be deleted.
     * @param {*} group_id - Group ID to which the file index belongs to.
     * @param {*} group_name - Group Name to which the file index belongs to.
     * @param {*} file_index - file index of the file to be deleted.
     * @memberof DeleteFile
     */
    update_delete_status_in_firestore(bucket_name, group_id, group_name, file_index) {
        const delete_file_status_data = { [BUCKET_NAME]: bucket_name, [GROUP_ID]: group_id, [GROUP_NAME]: group_name, [FILE_INDEX_FROM_SERVER]: file_index }
        axios.post(CONSTANTS.FIRESSTORE_URL_TO_UPDATE_DELETE_STATUS, delete_file_status_data).then((response) => {
            console.log("\n File Deleted \n");
        }, (err) => {
            if (DEBUG) console.log(err); else console.log('Error-45: in deleting file number');
        });
    }
}

module.exports = {
    DeleteFile
};