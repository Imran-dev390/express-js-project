// const multer = require("multer");

// const { v4: uuidv4 } = require("uuid");
// const path = require("path");
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/images')
//     },
//     filename: function (req, file, cb) {
//       const unique = uuidv4();
//       cb(null, unique + path.extname(file.originalname));
//     }
//   })
  
//   const upload = multer({ storage: storage })

//   module.exports = upload;

const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Optional: You can filter file types here
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Optional: limit file size to 5MB
  }
});

module.exports = upload;
