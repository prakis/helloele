const utils = require('../utils/utils')
const CONSTANTS = require('../CONSTANTS')
const { BUCKET_NAME, GROUP_NAME, GROUP_ID, DEBUG } = require('../CONSTANTS')
const { BaseCommand } = require("./basecommand")

const axios = require('axios')
const ini = require('ini')
const fs = require('fs')



var readlineSync = require('readline-sync')

class CreateGroup extends BaseCommand {

    /**
     * Creates an instance of CreateGroup.
     * @param {*} args - arguments passed to the command.
     * @param {*} options - options passed to the command.
     * @memberof CreateGroup
     */
    constructor(args, options) {
        super(args, options);
    }

    /**
     * This method prompts user to enter their s3 credentials.
     */
    ask_credentials() {
        let s3_storage_type;
        let s3_storage_service = readlineSync.question(' \nChoose your storage service provider \n[1] AWS Amazon Storage Bucket \n[2] Digital Ocean Spaces \n[3] BackBlaze B2  \n>');
        if (s3_storage_service == 1) {
            s3_storage_type = CONSTANTS.AWS_AMAZON_STORAGE_BUCKET;
        } else if (s3_storage_service == 2) {
            s3_storage_type = CONSTANTS.DIGITAL_OCEAN_SPACES;
        } else if (s3_storage_service == 3) {
            s3_storage_type = CONSTANTS.BACK_BLAZE_B2;
        } else {
            console.log("Please enter the valid option");
            process.exit()
        }
        let s3_access_key = readlineSync.question(' \nPlease enter s3 access key: ');
        let s3_secret_access_key = readlineSync.question(' \nPlease enter s3 secret access key: ');
        let s3_bucket_name = readlineSync.question(' \nPlease enter s3 bucket name: ');
        let file_data = "[" + CONSTANTS.DEFAULT + "]" + "\n" + CONSTANTS.ACCESS_KEY + "=" + s3_access_key + "\n" + CONSTANTS.SECRET_ACCESS_KEY + "=" + s3_secret_access_key + "\n" + CONSTANTS.BUCKET_NAME + "=" + s3_bucket_name + "\n" + CONSTANTS.S3_SERVER_ENDPOINT + "=" + s3_storage_type + "\n" + CONSTANTS.PUBLIC_SHARED_FOLDER + "=public" + "\n";
        fs.writeFileSync(CONSTANTS.CONFIG_FILE, file_data, CONSTANTS.UTF_8);
        return CONSTANTS.CONFIG_FILE;

    }

    /**
    * This method prompts user to enter their group name.
    */
    ask_group_name() {
        var groupName = readlineSync.question(' \nPlease enter group name: ');
        return groupName;
    }

    /**
    * This method stores the group credentials locally and calls the server to create the group.
    */
    action() {
        let group_config_file_name = this.ask_credentials()
        let new_group_name = this.ask_group_name();
        let user_given_config = ini.parse(fs.readFileSync(group_config_file_name, CONSTANTS.UTF_8))
        let user_given_bucket_name = user_given_config[CONSTANTS.DEFAULT][BUCKET_NAME];
        this.call_server_to_create_group(user_given_config, new_group_name, user_given_bucket_name)
    }

    /**
     *
     * This method takes the user configured information and creates the new document in the firebase store.
     * @param {*} user_given_config - User S3 credentials.
     * @param {*} new_group_name - Name of the group to be created.
     * @param {*} user_given_bucket_name - Bucket name where the group need to be created.
     * @memberof CreateGroup
     */
    call_server_to_create_group(user_given_config, new_group_name, user_given_bucket_name) {
        let local_group_data = {
            [BUCKET_NAME]: user_given_bucket_name,
            [GROUP_NAME]: new_group_name
        }
        axios.post(CONSTANTS.FIRESSTORE_URL_TO_CREATE_GROUP, local_group_data).then((response) => {

            let new_group_id = response.data[GROUP_ID]
            console.log(response.data);
            if (response.data[CONSTANTS.STATUS] == CONSTANTS.FAILURE) {
                console.log("Unable to create new group", response.data);
            } else {
                let new_group_file_name = utils.append_group_name_id(user_given_config, new_group_name, new_group_id)
                utils.copy_group_config_to_dot_ele_dir(new_group_file_name)
            }
        }, (err) => {
            if (DEBUG) console.log(err); else console.log('Error-213: in creating group');
        });
    }
}

module.exports = {
    CreateGroup
};