require("dotenv").config();

const express =
  require("express");

const multer =
  require("multer");

const cloudinary =
  require("cloudinary").v2;

const admin =
  require("firebase-admin");

const {
  CloudinaryStorage
} = require(
  "multer-storage-cloudinary"
);

const path =
  require("path");

const app =
  express();


// FIREBASE ADMIN

admin.initializeApp({

  credential:
    admin.credential.cert({

      projectId:
        process.env.FIREBASE_PROJECT_ID,

      clientEmail:
        process.env.FIREBASE_CLIENT_EMAIL,

      privateKey:
        process.env
          .FIREBASE_PRIVATE_KEY
          .replace(/\\n/g, "\n")
    })
});


// CLOUDINARY CONFIG

cloudinary.config({

  cloud_name:
    process.env.CLOUD_NAME,

  api_key:
    process.env.API_KEY,

  api_secret:
    process.env.API_SECRET
});


// VERIFY USER

async function verifyUser(
  req,
  res,
  next
) {

  try {

    const token =
      req.headers.authorization
        ?.split("Bearer ")[1];

    if (!token) {

      return res.status(401)
        .json({

          error:
            "No token"
        });
    }

    const decodedToken =
      await admin.auth()
        .verifyIdToken(token);

    req.user =
      decodedToken;

    next();

  } catch (error) {

    console.log(error);

    res.status(401).json({

      error:
        "Unauthorized"
    });
  }
}


// STORAGE
   const storage =
        new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file
    ) => {

      return {

        folder:
          `private-gallery/${req.user.uid}`,

        resource_type:
          "auto"
      };
    }
  });

const upload =
  multer({
    storage
  });    
        



// MIDDLEWARE

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

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

  verifyUser,

  upload.single("file"),

  (req, res) => {

    console.log(
      "UPLOAD SUCCESS"
    );

    console.log(req.file);

    res.json({

      success: true,

      file: req.file
    });
  }
);


// GET FILES
app.get(
  "/files",
  verifyUser,
  async (req, res) => {

    try {

      const userId =
        req.user.uid;

      const result =
        await cloudinary.api.resources({

          type: "upload",

          prefix:
            `private-gallery/${userId}`,

          max_results: 100
        });

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

  verifyUser,

  async (req, res) => {

    try {

      const publicId =
        req.query.public_id;

      const resourceType =
        req.query.type ||
        "image";

      // USER SECURITY

      if (
        !publicId.startsWith(
          `private-gallery/${req.user.uid}`
        )
      ) {

        return res.status(403)
          .json({

            error:
              "Unauthorized delete"
          });
      }

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