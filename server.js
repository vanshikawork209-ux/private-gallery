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


// FILE SELECT

fileInput.addEventListener(

  "change",

  async () => {

    const file =
      fileInput.files[0];

    if (!file) return;

    await uploadFile(file);

    fileInput.value = "";
  }
);


// UPLOAD FUNCTION

async function uploadFile(file) {

  if (!auth.currentUser) {

    console.log(
      "Login required"
    );

    return;
  }

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  try {

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

    if (!auth.currentUser)
      return;

    const token =
      await auth.currentUser
      .getIdToken();

    const res =
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
      await res.json();

    gallery.innerHTML =
      "";

    if (!files.length) {

      gallery.innerHTML =
        "<p>No files uploaded yet.</p>";

      return;
    }

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

        img.style.width =
          "200px";

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
          "200px";

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


// LOGIN STATE

onAuthStateChanged(

  auth,

  (user) => {

    if (user) {

      loadGallery();

    } else {

      gallery.innerHTML =
        "";
    }
  }
);