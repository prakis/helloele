class BaseCommand {
    /**
     *Creates an instance of BaseCommand. All the CLI commands implements this class.
     * @param {*} args - arguments passed for the command
     * @param {*} [options=null] - command options
     * @memberof BaseCommand
     */
    constructor(args, options = null) {
        this.args = args;
        this.options = options;
    }
    action() {
        console.log('Base class Command::action()');
    }
    getArgsValue(key) {
        return this.args[key];
    }
}

module.exports = {
    BaseCommand
};