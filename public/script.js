import {

  getAuth

} from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const auth =
  getAuth();


const fileInput =
  document.getElementById(
    "fileInput"
  );

const gallery =
  document.getElementById(
    "gallery"
  );


// FILE SELECT

fileInput.addEventListener(

  "change",

  () => {

    const file =
      fileInput.files[0];

    if (file) {

      uploadFile(file);
    }
  }
);


// UPLOAD FUNCTION

async function uploadFile(file) {

  const formData =
    new FormData();


  // FILE

  formData.append(
    "file",
    file
  );


  // USER ID

  formData.append(

    "userId",

    localStorage.getItem(
      "userId"
    )
  );


  // FOLDER

  formData.append(

    "folder",

    document.getElementById(
      "folderSelect"
    ).value
  );


  try {

    // FIREBASE TOKEN

    const token =

      await auth.currentUser
      .getIdToken();


    const response =
      await fetch("/upload", {

        method: "POST",

        headers: {

          Authorization:

`Bearer ${token}`
        },

        body: formData
      });

    const data =
      await response.json();

    console.log(data);

    loadGallery();

  } catch (error) {

    console.log(
      "Upload Error:",
      error
    );
  }
}


// LOAD GALLERY

async function loadGallery() {

  try {

    // FIREBASE TOKEN

    const token =

      await auth.currentUser
      .getIdToken();


    const res =
      await fetch(

        "/files?userId=" +

        localStorage.getItem(
          "userId"
        )

        +

        "&folder=" +

        document.getElementById(
          "folderSelect"
        ).value,

        {

          headers: {

            Authorization:

`Bearer ${token}`
          }
        }
      );

    const files =
      await res.json();

    gallery.innerHTML = "";

    files.forEach(file => {

      const div =
        document.createElement("div");

      div.className =
        "gallery-item";


      // DELETE BUTTON

      const deleteBtn =
        document.createElement(
          "button"
        );

      deleteBtn.innerText =
        "Delete";

      deleteBtn.className =
        "delete-btn";

      deleteBtn.onclick =
        async () => {

          try {

            // TOKEN

            const token =

              await auth.currentUser
              .getIdToken();


            await fetch(

              "/delete?public_id=" +

              encodeURIComponent(
                file.public_id
              ) +

              "&type=" +

              file.type,

              {

                method: "DELETE",

                headers: {

                  Authorization:

`Bearer ${token}`
                }
              }
            );

            loadGallery();

          } catch (error) {

            console.log(error);
          }
        };

      div.appendChild(
        deleteBtn
      );


      // IMAGE

      if (
        file.type === "image"
      ) {

        const img =
          document.createElement(
            "img"
          );

        img.src =
          file.url;

        div.appendChild(img);
      }


      // VIDEO

      else if (
        file.type === "video"
      ) {

        const video =
          document.createElement(
            "video"
          );

        video.src =
          file.url;

        video.controls =
          true;

        div.appendChild(video);
      }

      gallery.appendChild(div);
    });

  } catch (error) {

    console.log(
      "Gallery Error:",
      error
    );
  }
}


// FOLDER CHANGE

document.getElementById(

  "folderSelect"

).addEventListener(

  "change",

  loadGallery
);


// INITIAL LOAD

loadGallery();