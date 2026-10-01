
import {
  auth,
  db,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp
} from "./firebase.js";

const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const postForm = document.getElementById("postForm");
const loginMessage = document.getElementById("loginMessage");
const resetMessage = document.getElementById("resetMessage");
const formMessage = document.getElementById("formMessage");
const postsList = document.getElementById("postsList");
const logoutBtn = document.getElementById("logoutBtn");
const cancelEdit = document.getElementById("cancelEdit");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

let editingId = null;

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "crimson" : "green";
}

// Admin login
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  showMessage(loginMessage, "Logging in...");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showMessage(
      loginMessage,
      "Login failed: " + error.code,
      true
    );
  }
});

// Password reset
resetPasswordBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    showMessage(resetMessage, "Please enter your email first.", true);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showMessage(
      resetMessage,
      "Reset email sent. Check your inbox and Spam folder."
    );
  } catch (error) {
    showMessage(
      resetMessage,
      "Could not send reset email: " + error.code,
      true
    );
  }
});

// Check admin status
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loginSection.hidden = false;
    dashboard.hidden = true;
    logoutBtn.hidden = true;
    return;
  }

  try {
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists() || adminSnap.data().enabled !== true) {
      await signOut(auth);
      showMessage(
        loginMessage,
        "This account is not an enabled admin.",
        true
      );
      return;
    }

    loginSection.hidden = true;
    dashboard.hidden = false;
    logoutBtn.hidden = false;

    document.getElementById("welcome").textContent =
      "Logged in as " + user.email;

    await loadPosts();
  } catch (error) {
    showMessage(
      loginMessage,
      "Admin verification failed: " + error.code,
      true
    );
    await signOut(auth);
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// Add or update post
postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const rawUrl = document.getElementById("officialUrl").value.trim();
  let officialUrl = "";

  if (rawUrl) {
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== "https:") {
        throw new Error("HTTPS required");
      }
      officialUrl = url.href;
    } catch {
      showMessage(
        formMessage,
        "Please enter a valid HTTPS URL.",
        true
      );
      return;
    }
  }

  const post = {
    title: document.getElementById("title").value.trim(),
    category: document.getElementById("category").value,
    qualification: document.getElementById("qualification").value.trim(),
    lastDate: document.getElementById("lastDate").value,
    description: document.getElementById("description").value.trim(),
    officialUrl,
    updatedAt: serverTimestamp()
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), post);
      showMessage(formMessage, "Post updated successfully!");
    } else {
      await addDoc(collection(db, "posts"), {
        ...post,
        createdAt: serverTimestamp()
      });
      showMessage(formMessage, "Post published successfully!");
    }

    resetForm();
    await loadPosts();
  } catch (error) {
    showMessage(
      formMessage,
      "Could not save post: " + error.code,
      true
    );
  }
});

// Reset form
function resetForm() {
  postForm.reset();
  editingId = null;
  document.getElementById("formTitle").textContent = "Add New Post";
  document.getElementById("saveBtn").textContent = "Publish Post";
  cancelEdit.hidden = true;
}

cancelEdit.addEventListener("click", resetForm);

// Load posts
async function loadPosts() {
  postsList.textContent = "Loading posts...";

  try {
    const snapshot = await getDocs(
      query(collection(db, "posts"), orderBy("createdAt", "desc"))
    );

    document.getElementById("totalPosts").textContent = snapshot.size;
    postsList.replaceChildren();

    if (snapshot.empty) {
      postsList.textContent = "No posts yet.";
      return;
    }

    snapshot.forEach((postDoc) => {
      const post = postDoc.data();

      const card = document.createElement("article");
      card.className = "post-card";

      const heading = document.createElement("h3");
      heading.textContent = post.title || "Untitled";

      const category = document.createElement("p");
      category.textContent = "Category: " + (post.category || "");

      const date = document.createElement("p");
      date.textContent = "Last date: " + (post.lastDate || "Not set");

      const edit = document.createElement("button");
      edit.textContent = "Edit";

      edit.addEventListener("click", () => {
        editingId = postDoc.id;

        document.getElementById("title").value = post.title || "";
        document.getElementById("category").value = post.category || "jobs";
        document.getElementById("qualification").value =
          post.qualification || "";
        document.getElementById("lastDate").value = post.lastDate || "";
        document.getElementById("description").value =
          post.description || "";
        document.getElementById("officialUrl").value =
          post.officialUrl || "";

        document.getElementById("formTitle").textContent = "Edit Post";
        document.getElementById("saveBtn").textContent = "Update Post";
        cancelEdit.hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      const remove = document.createElement("button");
      remove.textContent = "Delete";
      remove.className = "danger";

      remove.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this post?")) {
          return;
        }

        try {
          await deleteDoc(doc(db, "posts", postDoc.id));
          await loadPosts();
        } catch (error) {
          alert("Could not delete post: " + error.code);
        }
      });

      card.append(heading, category, date, edit, remove);
      postsList.append(card);
    });
  } catch (error) {
    postsList.textContent =
      "Could not load posts: " + error.code;
  }
}