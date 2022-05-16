const router = require("express").Router()

/**
 * Only a test file do not use in production
 */

//50 * 1024 * 1024 is 50 mb
router.post('/', function(req, res) {
    //console.log(req.files.sampleFile)
    let sampleFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    if(!req.body.type){
        return res.status(400).send('No type');
    }
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    uploadPath = __dirname + '/upload/' + sampleFile.name;
  
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
      if (err)
        return res.status(500).send(err);
  
      res.send('File uploaded!');
    });
  });

  module.exports = router