const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");
let storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, "uploads/"),
  filename: (req, file, callback) => {
    const uniquename = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    callback(null, uniquename);
  },
});

let upload = multer({
  storage,
  limit: { filesize: 100 * 1024 * 1024 },
}).single("myfile");

router.post("/", (req, res) => {
  //validate request

  // store file

  upload(req, res, async (err) => {
    if (!req.file) {
      return res.json({ error: "all fields are required!" });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    //store to database

    const file = new File({
      filename: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });

  // response -> link
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;

  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required ! " });
  }

  const file = await File.findOne({ uuid: uuid });

  if (file.sender) {
    return res.status(422).send({ error: "email already sent ! " });
  }

  file.sender = emailFrom;
  file.receiver = emailTo;

  const response = await file.save();

  /// send email

  const sendmail = require("../services/emailservice");
  sendmail({
    from: emailFrom,  
    to: emailTo,
    subject: "file sharing app",
    text: `${emailFrom} shared the file with you`,
    html: require("../services/innertemplate")({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: file.size / 1000 + " KB",
      expires: "24 hrs",
    }),
  });

  return res.send({success : " true"});
});
module.exports = router;
