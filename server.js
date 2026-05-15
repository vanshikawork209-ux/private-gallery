require("dotenv").config();

const express =
  require("express");

const multer =
  require("multer");

const cloudinary =
  require("cloudinary").v2;

const {
  CloudinaryStorage
} = require(
  "multer-storage-cloudinary"
);

const path =
  require("path");

const app =
  express();


// CLOUDINARY CONFIG
cloudinary.config({

  cloud_name:
    process.env.CLOUD_NAME,

  api_key:
    process.env.API_KEY,

  api_secret:
    process.env.API_SECRET
});


// STORAGE
const storage =
  new CloudinaryStorage({

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


// MIDDLEWARE
app.use(express.json());

app.use(express.static("public"));


// HOME
app.get("/", (req, res) => {

  res.sendFile(

    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});


// UPLOAD
app.post(

  "/upload",

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

  async (req, res) => {

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


// DELETE
app.delete(

  "/delete",

  async (req, res) => {

    try {

      const publicId =

        req.query.public_id;

      const resourceType =

        req.query.type || "image";


      await cloudinary
      .uploader
      .destroy(

        publicId,

        {
          resource_type:
            resourceType
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
    
        



// START SERVER
const PORT =
  process.env.PORT || 3000;

app.listen(

  PORT,

  "0.0.0.0",

  () => {

    console.log(

      `Server running on port ${PORT}`
    );
  }
);
