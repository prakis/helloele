const fs = require('fs')
const ini = require('ini')

const join = require("path").join;
const mkdirp = require('mkdirp')
const crypto = require('crypto')
const path = require('path')
const chalk = require('chalk')

const CONSTANTS = require('../CONSTANTS')

var iv = Buffer.from('26ae5cc854e36b6bdfca366848dea6bb', 'hex');


// --------------
/**
 *
 *
 * @param {*} local_file_path
 * @returns
 */
function check_file_exists(local_file_path) {
    if (null == local_file_path) {
        console.log("Please enter file name")
        return null;
    }
    if (true == is_file_exists(local_file_path)) {
        return local_file_path
    } else {
        console.log("File doesn't exist")
        return null;
    }
}
/**
 *
 *
 * @param {*} file_path
 * @param {*} max_size
 * @returns
 */
function is_file_size_in_limits(file_path, max_size) {
    if (is_file_exists(file_path)) {
        if (get_file_size_in_mb(file_path) < max_size) {
            return true;
        }
    }
    return false;
}

/**
 *
 *
 * @param {*} filename
 * @returns
 */
function get_file_size_in_mb(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
    return fileSizeInMegabytes
}

/**
 *
 *
 * @returns
 */
function expand_home_dir() {
    let path = "~";
    var homedir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

    if (!path) return path;
    if (path == '~') return homedir;
    if (path.slice(0, 2) != '~/') return path;
    return join(homedir, path.slice(2));
}

/**
 *
 *
 * @param {*} path
 * @returns
 */
function is_file_exists(path) {
    return fs.existsSync(path);
}
function get_home_ele_dir() {
    var home_ele_dir_path = join(expand_home_dir(), CONSTANTS.HOME_ELE_DIR)
    if (!fs.existsSync(home_ele_dir_path)) {
        const made = mkdirp.sync(home_ele_dir_path)
    }
    return home_ele_dir_path
}
/**
 *
 *
 * @param {*} s3_file_obj_name
 * @returns
 */
function retrive_file_name_only(s3_file_obj_name) {
    return path.parse(s3_file_obj_name).base;
}

//--------------
var config = null;

/**
 *
 *
 * @param {*} key
 * @returns
 */
function get_config_value(key) {
    return get_config()[CONSTANTS.DEFAULT][key]
}
/**
 *
 *
 * @returns
 */
function get_config() {
    if (null == config) {
        var conf_file_path = join(get_home_ele_dir(), CONSTANTS.CONFIG_FILE_ENCRYPTED)
        if (!is_file_exists(conf_file_path)) {
            console.log("Config file doesnt exists");
        }
        config = ini.parse(fs.readFileSync(conf_file_path, CONSTANTS.UTF_8))
    }
    return config;
}
/**
 *
 *
 * @param {*} file_path
 */
function copy_group_config_to_dot_ele_dir(file_path) {
    var home_ele_config_path = join(get_home_ele_dir(), CONSTANTS.CONFIG_FILE_ENCRYPTED)

    try {
        fs.copyFileSync(file_path, home_ele_config_path);
    } catch (err) {
        console.log("Error copying group config file");
        throw err;
    }
    console.log("\n Success!")
}

/**
 *
 *
 * @param {*} user_given_config
 * @param {*} new_group_name
 * @param {*} new_group_id
 * @returns
 */
function append_group_name_id(user_given_config, new_group_name, new_group_id) {
    user_given_config[CONSTANTS.DEFAULT][CONSTANTS.GROUP_NAME] = new_group_name
    user_given_config[CONSTANTS.DEFAULT][CONSTANTS.GROUP_ID] = new_group_id
    let new_group_plain_file_name = new_group_name + ".ini"

    fs.writeFileSync(new_group_plain_file_name, ini.stringify(user_given_config))

    console.log("\n1) Created group setting file in current dir: '", chalk.blue(new_group_plain_file_name) + "'")
    console.log("\n2) Share this file with your group members")
    console.log("\n3) To join this group run $ ele join " + chalk.blue(new_group_plain_file_name))

    return new_group_plain_file_name
}
/**
 *
 *
 * @param {*} user_given_config
 * @param {*} new_group_name
 * @param {*} new_group_id
 * @returns
 */
function append_group_name_id_and_encrypt(user_given_config, new_group_name, new_group_id) {
    user_given_config[CONSTANTS.DEFAULT][CONSTANTS.GROUP_NAME] = new_group_name
    user_given_config[CONSTANTS.DEFAULT][CONSTANTS.GROUP_ID] = new_group_id
    let new_group_plain_file_name = new_group_name + ".ini"

    fs.writeFileSync(new_group_plain_file_name, ini.stringify(user_given_config))

    return _encrypt_group_file(new_group_plain_file_name, new_group_name)
}
/**
 *
 *
 * @param {*} group_config_file_name
 * @param {*} new_group_name
 * @returns
 */
function _encrypt_group_file(group_config_file_name, new_group_name) {
    let new_group_encrypted_file_name = new_group_name + ".encrypted"
    try {
        _encrpt_file(group_config_file_name, new_group_encrypted_file_name);
    } catch (err) {
        console.log("Error copying group config file");
        throw err;
    }
    console.log("\n1) Created group setting file in current dir: '", chalk.blue(new_group_encrypted_file_name) + "'")
    console.log("\n2) Share this file with your group members")
    console.log("\n3) To join this group run $ ele join " + chalk.blue(new_group_encrypted_file_name))

    return new_group_encrypted_file_name;
}

/**
 *
 *
 * @param {*} group_settings_input
 * @param {*} group_settings_output
 * @param {*} [password=CONSTANTS.DEFAULT_PASSWORD]
 */
function _encrpt_file(group_settings_input, group_settings_output, password = CONSTANTS.DEFAULT_PASSWORD) {
    const input_file_content = fs.readFileSync(group_settings_input, CONSTANTS.UTF_8);
    var encrpted_data = _encrpt_data(input_file_content, password);

    fs.writeFileSync(group_settings_output, encrpted_data, CONSTANTS.UTF_8);
}
/**
 *
 *
 * @param {*} group_settings_input
 * @param {*} [group_settings_output=null]
 * @param {*} [password=CONSTANTS.DEFAULT_PASSWORD]
 * @returns
 */
function _decrypt_file(group_settings_input, group_settings_output = null, password = CONSTANTS.DEFAULT_PASSWORD) {
    try {
        const input_file_content = fs.readFileSync(group_settings_input, CONSTANTS.UTF_8);
        var decrypted_data = _decrypt_data(input_file_content, password);

        if (null == group_settings_output) {
            return decrypted_data;
        } else {
            fs.writeFileSync(group_settings_output, decrypted_data, CONSTANTS.UTF_8);
        }

    } catch (err) {
        console.log("Error in copying group config file", err);
    }
}


/**
 *
 *
 * @param {*} password
 * @returns
 */
function _get_hash_digest_key(password) {
    const hash = crypto.createHash('sha256'); //'sha256');
    hash.update(password);
    return hash.digest();
}
/**
 *
 *
 * @param {*} data
 * @param {*} password
 * @returns
 */
function _encrpt_data(data, password) {

    var hash_digest_key = _get_hash_digest_key(password);
    var cipher = crypto.createCipheriv(CONSTANTS.ALGORITHM, hash_digest_key, iv) //createCipher(ALGORITHM, password)
    var encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    return encrypted;
}
/**
 *
 *
 * @param {*} data
 * @param {*} password
 * @returns
 */
function _decrypt_data(data, password) {

    var hash_digest_key = _get_hash_digest_key(password);

    var decipher = crypto.createDecipheriv(CONSTANTS.ALGORITHM, hash_digest_key, iv) //createDecipher(ALGORITHM, password)
    var decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    get_home_ele_dir,
    get_file_size_in_mb,
    is_file_exists,
    retrive_file_name_only,
    check_file_exists,

    get_config,
    get_config_value,
    copy_group_config_to_dot_ele_dir,
    append_group_name_id_and_encrypt,
    append_group_name_id
}