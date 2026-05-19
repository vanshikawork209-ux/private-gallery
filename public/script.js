 import {
  getAuth,
  onAuthStateChanged
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

const folderSelect =
  document.getElementById(
    "folderSelect"
  );


// FILE SELECT

fileInput.addEventListener(

  "change",

  async () => {

    const file =
      fileInput.files[0];

    if (!file) return;

    await uploadFile(file);
  }
);


// UPLOAD FUNCTION

async function uploadFile(file) {

  try {

    // LOGIN CHECK

    if (!auth.currentUser) {

      console.log(
        "Please login first"
      );

      return;
    }

    const formData =
      new FormData();

    // FILE

    formData.append(
      "file",
      file
    );

    // FOLDER

    formData.append(
      "folder",
      folderSelect.value
    );

    // TOKEN

    const token =
      await auth.currentUser
      .getIdToken();

    const response =
      await fetch("/upload", {

        method:
          "POST",

        headers: {

          Authorization:
            `Bearer ${token}`
        },

        body:
          formData
      });

    const data =
      await response.json();

    console.log(data);

    // CLEAR INPUT

    fileInput.value =
      "";

    // RELOAD GALLERY

    await loadGallery();

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

    // LOGIN CHECK

    if (!auth.currentUser) {

      gallery.innerHTML =
        "";

      return;
    }

    // TOKEN

    const token =
      await auth.currentUser
      .getIdToken();

    const response =
      await fetch(

        "/files",

        {

          headers: {

            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const files =
      await response.json();

    console.log(files);

    // CLEAR GALLERY

    gallery.innerHTML =
      "";

    // NO FILES

    if (!files.length) {

      gallery.innerHTML =
        "<p>No files uploaded yet.</p>";

      return;
    }

    // SHOW FILES

    files.forEach(file => {

      const div =
        document.createElement(
          "div"
        );

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

            const confirmDelete =
              confirm(
                "Delete this file?"
              );

            if (!confirmDelete)
              return;

            const token =
              await auth.currentUser
              .getIdToken();

            await fetch(

              `/delete?public_id=${encodeURIComponent(file.public_id)}&type=${file.type}`,

              {

                method:
                  "DELETE",

                headers: {

                  Authorization:
                    `Bearer ${token}`
                }
              }
            );

            await loadGallery();

          } catch (error) {

            console.log(
              "Delete Error:",
              error
            );
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

        img.style.width =
          "250px";

        img.style.height =
          "250px";

        img.style.objectFit =
          "cover";

        img.style.borderRadius =
          "12px";

        img.style.display =
          "block";

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

        video.style.width =
          "250px";

        video.style.borderRadius =
          "12px";

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

folderSelect.addEventListener(

  "change",

  loadGallery
);


// AUTH STATE

onAuthStateChanged(

  auth,

  (user) => {

    if (user) {

      console.log(
        "User logged in"
      );

      loadGallery();

    } else {

      gallery.innerHTML =
        "";
    }
  }
);