const fileInput =
  document.getElementById("fileInput");

const dropArea =
  document.getElementById("dropArea");

const modal =
  document.getElementById("modal");

const modalImg =
  document.getElementById("modalImg");

const closeModal =
  document.getElementById("closeModal");


// FILE INPUT
fileInput.addEventListener("change", () => {

  uploadFile(fileInput.files[0]);
});


// DRAG OVER
dropArea.addEventListener("dragover", (e) => {

  e.preventDefault();

  dropArea.classList.add("dragover");
});


// DRAG LEAVE
dropArea.addEventListener("dragleave", () => {

  dropArea.classList.remove("dragover");
});


// DROP
dropArea.addEventListener("drop", (e) => {

  e.preventDefault();

  dropArea.classList.remove("dragover");

  const file =
    e.dataTransfer.files[0];

  uploadFile(file);
});


// UPLOAD
async function uploadFile(file) {

  const formData = new FormData();

  formData.append("file", file);

  await fetch("/upload", {

    method: "POST",

    body: formData
  });

  loadGallery();
}


// LOAD GALLERY
async function loadGallery() {

  const res =
    await fetch("/files");

  const files =
    await res.json();

  const gallery =
    document.getElementById("gallery");

  gallery.innerHTML = "";

  files.forEach(file => {

    const ext =
      file.split(".").pop().toLowerCase();

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

      await fetch(
        "/delete/" + file,
        {
          method: "DELETE"
        }
      );

      loadGallery();
    };

    div.appendChild(deleteBtn);


    // IMAGE
    if (
      ["jpg", "jpeg", "png", "gif", "webp"]
      .includes(ext)
    ) {

      const img =
        document.createElement("img");

      img.src =
        "/uploads/" + file;

      img.onclick = () => {

        modal.style.display =
          "flex";

        modalImg.src =
          img.src;
      };

      div.appendChild(img);
    }


    // VIDEO
    if (
      ["mp4", "webm"]
      .includes(ext)
    ) {

      const video =
        document.createElement("video");

      video.src =
        "/uploads/" + file;

      video.controls = true;

      div.appendChild(video);
    }

    gallery.appendChild(div);
  });
}


// CLOSE MODAL
closeModal.onclick = () => {

  modal.style.display = "none";
};


// LOGIN
async function login() {

  const password =
    document.getElementById(
      "passwordInput"
    ).value;

  const res =
    await fetch("/login", {

      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        password
      })
    });

  const data =
    await res.json();

  if (data.success) {

    document.getElementById(
      "loginScreen"
    ).style.display = "none";

    loadGallery();

  } else {

    alert("Wrong Password");
  }
}


// CHECK AUTH
async function checkAuth() {

  const res =
    await fetch("/check-auth");

  const data =
    await res.json();

  if (data.loggedIn) {

    document.getElementById(
      "loginScreen"
    ).style.display = "none";

    loadGallery();
  }
}


// LOGOUT
async function logout() {

  await fetch("/logout", {

    method: "POST"
  });

  location.reload();
}


// START
checkAuth();