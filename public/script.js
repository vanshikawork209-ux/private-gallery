const fileInput =
  document.getElementById("fileInput");

const gallery =
  document.getElementById("gallery");


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

  formData.append(
    "file",
    file
  );

  try {

    const response =
      await fetch("/upload", {

        method: "POST",

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

    const res =
      await fetch("/files");

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
  document.createElement("button");

deleteBtn.innerText =
  "Delete";

deleteBtn.className =
  "delete-btn";

deleteBtn.onclick =
  async () => {

    try {

      await fetch(

  "/delete?public_id=" +

  encodeURIComponent(
    file.public_id
  ) +

  "&type=" +

  file.type,

  {
    method: "DELETE"
  }
);

      loadGallery();

    } catch (error) {

      console.log(error);
    }
  };
div.appendChild(deleteBtn);

      // IMAGE
      if (
        file.type === "image"
      ) {

        const img =
          document.createElement("img");

        img.src =
          file.url;

        div.appendChild(img);
      }


      // VIDEO
      else if (
        file.type === "video"
      ) {

        const video =
          document.createElement("video");

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


// INITIAL LOAD
loadGallery();
