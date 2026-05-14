const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();


// SESSION
app.use(session({

  secret: "mysecretkey",

  resave: false,

  saveUninitialized: true
}));


// MIDDLEWARE
app.use(express.static("public"));

app.use("/uploads",
  express.static("uploads"));

app.use(express.json());


// LOGIN
app.post("/login", (req, res) => {

  const { password } = req.body;

  if (password === "1234") {

    req.session.loggedIn = true;

    res.json({
      success: true
    });

  } else {

    res.json({
      success: false
    });
  }
});


// CHECK AUTH
app.get("/check-auth", (req, res) => {

  res.json({
    loggedIn:
      req.session.loggedIn || false
  });
});


// LOGOUT
app.post("/logout", (req, res) => {

  req.session.destroy();

  res.json({
    success: true
  });
});


// AUTH MIDDLEWARE
function auth(req, res, next) {

  if (req.session.loggedIn) {

    next();

  } else {

    res.status(401).json({
      error: "Unauthorized"
    });
  }
}


// STORAGE
const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );
  }
});


const upload = multer({
  storage: storage
});


// UPLOAD
app.post(
  "/upload",
  auth,
  upload.single("file"),
  (req, res) => {

    res.json({
      message: "File uploaded"
    });
  }
);


// GET FILES
app.get("/files", auth, (req, res) => {

  fs.readdir("./uploads", (err, files) => {

    if (err) {

      return res.status(500).json({
        error: "Cannot read uploads folder"
      });
    }

    res.json(files);
  });
});


// DELETE FILE
app.delete(
  "/delete/:name",
  auth,
  (req, res) => {

    const filePath =
      "./uploads/" + req.params.name;

    fs.unlink(filePath, (err) => {

      if (err) {

        return res.status(500).json({
          error: "Delete failed"
        });
      }

      res.json({
        message: "Deleted"
      });
    });
  }
);


// SERVER
app.listen(3000, () => {

  console.log(
    "Server running on http://localhost:3000"
  );
});