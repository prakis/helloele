#!/usr/bin/env node

const myProgVersion = require("./package.json").version;
const prog = require("caporal");

const CONSTANTS = require('./CONSTANTS')

const { DeleteFile } = require("./model/delete");
const { CreateGroup } = require("./model/creategroup");
const { JoinGroup } = require("./model/joingroup");
const { Upload } = require("./model/upload");
const { Download } = require("./model/download");

// ----------- upload ---------------
prog.version(myProgVersion)

    .command("upload", "Upload a file") //.alias("u")
    .argument("<" + CONSTANTS.CLI_KEY_FILE_NAME + ">", "File name to upload")
    .option(
        "--public",
        "Upload file to public directory (anyone with link can download it)"
    )
    .action(function (args, options, logger) {
        let up = new Upload(args, options);
        up.action();
    });

// ----------- download ----------
prog.version(myProgVersion)
    .command("download", "Download a file") //.alias("d")
    .argument("<" + CONSTANTS.CLI_USER_ENTERED_FILE_NUMBER + ">", "File number to download", prog.INT)
    .action(function (args, options, logger) {
        let downlo = new Download(args);
        downlo.action();
    });

// ----------- join-group ----------
prog.version(myProgVersion)
    .command("join", "Join a group").alias("join-group")
    .argument("<" + CONSTANTS.CLI_JOIN_GROUP_CONFIG_FILE + ">", "Group information config file")
    .action(function (args, options, logger) {
        let jg = new JoinGroup(args);
        jg.action();
    });

// ----------- create-group ----------
prog.version(myProgVersion)
    .command("create-group", "Create a group")
    .option(
        "--credentials <credentialsFile>",
        "credentials file (not the aws credentials file)"
    )
    .action(function (args, options, logger) {
        let cg = new CreateGroup(args, options);
        cg.action();
    });

// ----------- delete ----------
prog.version(myProgVersion)
    .command("delete", "Delete a file") //.alias("d")
    .argument("<" + CONSTANTS.CLI_USER_ENTERED_FILE_NUMBER + ">", "File number to delete", prog.INT)
    .action(function (args, options, logger) {
        let de = new DeleteFile(args, options);
        de.action();
    });


prog.name("ele").parse(process.argv);