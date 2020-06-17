# HelloEle

A simple file copy tool from command prompt(terminal) using file-index **No more copy pasting or remembering long file urls**.
You can upload download files with commands like.

You can also find this doc on https://helloele.com/howto

	$ ele upload project-abc-version123.txt
This will return a file-number example :  421  .  To download this file using file-number

	$ ele download 421


## Requirements

For development, you will only need Node.js and a node global package, npm installed in your environement.

### Usage & Configuration
- #### installation 
  You can install ele by running 
      $ sudo npm install -g helloele
	  
- #### create-group 
  To use ele you first need to create a group and provide your AWS S3 storage credentials (these credentails are stored in your computer never sent to helloeele server). 
      $ ele create-group avengers-group

This command asks for your AWS S3 compatable storage credentials (Tested with AWS S3, DigitalOcean Spaces, BackBlaze). And it will produces a group file example:- **avengers-group.ini**

You as group admin share this file with other members in your group with email or other means. Once the memebers received this file, they can join the group as.

	$ ele join avengers-group.ini

Now you can upload download files between your group by simply using file-indexes.

To upload a file called "project-xyz-version123.zip"
	$ ele upload project-xyz-version123.zip
> this will return a file-number ex:-  101

Your group memebers can download this file by running

	$ ele download 101

Thats all, please share your feedback and suggestions.


