const utils = require('../utils/utils')
const CONSTANTS = require('../CONSTANTS')
const { BUCKET_NAME, GROUP_NAME, GROUP_ID, FILE_INDEX_FROM_SERVER, DEBUG, CLI_USER_ENTERED_FILE_NUMBER } = require('../CONSTANTS')
const s3utils = require('../utils/s3utils')
const { BaseCommand } = require("./basecommand")

const axios = require('axios')

class Download extends BaseCommand {

    /**
     * Creates an instance of Download.
     * @param {*} args - File number to be downloaded.
     * @memberof Download
     */
    constructor(args) {
        super(args);
    }

    /**
     * This method takes file number to be downloaded and calls server to get corresponding file name and downloads the file locally.
     */
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
            }
            else {

                let s3_file_obj_name = file_data_from_db["s3_url"]
                let local_file_path = utils.retrive_file_name_only(s3_file_obj_name)
                const bucket_name = utils.get_config_value(BUCKET_NAME)
                s3utils.download_file_from_s3(bucket_name, s3_file_obj_name, local_file_path)
            }
        }, (err) => {
            if (DEBUG) console.log(err); else console.log('Error-124: in downloading file');
        });
    }
}

module.exports = {
    Download
}