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

const logoutBtn =
  document.getElementById("logoutBtn");

const loginScreen =
  document.getElementById("loginScreen");

const passwordInput =
  document.getElementById("passwordInput");


// CHECK LOGIN
async function checkAuth() {

  const res =
    await fetch("/check-auth");

  const data =
    await res.json();

  if (data.loggedIn) {

    loginScreen.style.display =
      "none";

    logoutBtn.style.display =
      "block";

    loadGallery();
  }
}

checkAuth();


// LOGIN
async function login() {

  const password =
    passwordInput.value;

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

    loginScreen.style.display =
      "none";

    logoutBtn.style.display =
      "block";

    loadGallery();

  } else {

    alert("Wrong password");
  }
}


// LOGOUT
async function logout() {

  await fetch("/logout", {
    method: "POST"
  });

  location.reload();
}


// FILE INPUT
fileInput.addEventListener(
  "change",
  () => {

    uploadFile(
      fileInput.files[0]
    );
  }
);


// DRAG EVENTS
dropArea.addEventListener(
  "dragover",
  (e) => {

    e.preventDefault();

    dropArea.classList.add(
      "dragover"
    );
  }
);

dropArea.addEventListener(
  "dragleave",
  () => {

    dropArea.classList.remove(
      "dragover"
    );
  }
);

dropArea.addEventListener(
  "drop",
  (e) => {

    e.preventDefault();

    dropArea.classList.remove(
      "dragover"
    );

    const file =
      e.dataTransfer.files[0];

    uploadFile(file);
  }
);


// UPLOAD
async function uploadFile(file) {

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

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
    document.getElementById(
      "gallery"
    );

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

      await fetch(
        "/delete/" +
        file.public_id,

        {
          method: "DELETE"
        }
      );

      loadGallery();
    };

    div.appendChild(deleteBtn);


    // IMAGE
    if (
      file.type === "image"
    ) {

      const img =
        document.createElement(
          "img"
        );

      img.src = file.url;

      img.onclick = () => {

        modal.style.display =
          "flex";

        modalImg.src =
          file.url;
      };

      div.appendChild(img);
    }


    // VIDEO
    if (
      file.type === "video"
    ) {

      const video =
        document.createElement(
          "video"
        );

      video.src = file.url;

      video.controls = true;

      div.appendChild(video);
    }

    gallery.appendChild(div);
  });
}


// CLOSE MODAL
closeModal.onclick = () => {

  modal.style.display =
    "none";
};