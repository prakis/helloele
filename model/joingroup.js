const utils = require('../utils/utils')
const CONSTANTS = require('../CONSTANTS')
const { BaseCommand } = require("./basecommand")

class JoinGroup extends BaseCommand {
    /**
     *Creates an instance of JoinGroup.
     * @param {*} args - Arguments passed to the command, group credential file
     * @memberof JoinGroup
     */
    constructor(args) {
        super(args)
    }
    action() {
        var group_config_name = this.args[CONSTANTS.GROUP_CONFIG_FILE]
        utils.copy_group_config_to_dot_ele_dir(group_config_name)
    }
}
module.exports = {
    JoinGroup
};