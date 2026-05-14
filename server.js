require("dotenv").config();

const express =
  require("express");

const multer =
  require("multer");

const session =
  require("express-session");

const cloudinary =
  require("cloudinary").v2;

const {
  CloudinaryStorage
} = require(
  "multer-storage-cloudinary"
);

const app = express();


// CLOUDINARY CONFIG
cloudinary.config({

  cloud_name:
    process.env.CLOUD_NAME,

  api_key:
    process.env.API_KEY,

  api_secret:
    process.env.API_SECRET
});


// MIDDLEWARE
app.use(express.json());

app.use(express.static("public"));

app.use(session({

  secret: "mysecretkey",

  resave: false,

  saveUninitialized: true
}));


// AUTH FUNCTION
function auth(
  req,
  res,
  next
) {

  if (
    req.session.loggedIn
  ) {

    next();

  } else {

    res.status(401).json({

      error: "Unauthorized"
    });
  }
}


// LOGIN
app.post(
  "/login",
  (req, res) => {

    const {
      password
    } = req.body;

    if (
      password === "1234"
    ) {

      req.session.loggedIn =
        true;

      res.json({
        success: true
      });

    } else {

      res.json({
        success: false
      });
    }
  }
);


// CHECK AUTH
app.get(
  "/check-auth",
  (req, res) => {

    res.json({

      loggedIn:
        req.session.loggedIn
        || false
    });
  }
);


// LOGOUT
app.post(
  "/logout",
  (req, res) => {

    req.session.destroy();

    res.json({
      success: true
    });
  }
);


// CLOUDINARY STORAGE
const storage =
  new CloudinaryStorage({

    cloudinary:
      cloudinary,

    params: async (
      req,
      file
    ) => ({

      folder:
        "private-gallery",

      resource_type:
        "auto"
    })
  });

const upload =
  multer({

    storage
  });


// UPLOAD ROUTE
app.post(
  "/upload",
  auth,
  upload.single("file"),

  (req, res) => {

    res.json({

      success: true
    });
  }
);


// GET FILES
app.get(
  "/files",
  auth,

  async (
    req,
    res
  ) => {

    try {

      const result =
        await cloudinary.search
        .expression(
          "folder:private-gallery"
        )
        .sort_by(
          "created_at",
          "desc"
        )
        .max_results(100)
        .execute();

      const files =
        result.resources.map(
          file => ({

            url:
              file.secure_url,

            type:
              file.resource_type,

            public_id:
              file.public_id
          })
        );

      res.json(files);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        error:
          "Cannot fetch files"
      });
    }
  }
);


// DELETE ROUTE
app.delete(
  "/delete/:id",
  auth,

  async (
    req,
    res
  ) => {

    try {

      await cloudinary
      .uploader
      .destroy(

        req.params.id,

        {
          resource_type:
            "image"
        }
      );

      res.json({
        success: true
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        error:
          "Delete failed"
      });
    }
  }
);


// SERVER
const PORT =
  process.env.PORT
  || 3000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(

      `Server running on port ${PORT}`
    );
  }
);