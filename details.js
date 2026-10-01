
import { db, doc, getDoc } from "./firebase.js";

const detailsCard = document.getElementById("detailsCard");

const categoryNames = {
  jobs: "Latest Jobs",
  results: "Results",
  admit: "Admit Cards",
  admission: "Admissions"
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function showMessage(message) {
  detailsCard.replaceChildren(
    createElement("p", "error", message)
  );
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (!postId) {
    showMessage("Post ID is missing. Please go back to the homepage.");
    return;
  }

  try {
    const postRef = doc(db, "posts", postId);
    const snapshot = await getDoc(postRef);

    if (!snapshot.exists()) {
      showMessage("This post was not found.");
      return;
    }

    const post = snapshot.data();

    detailsCard.replaceChildren();

    const category = createElement(
      "div",
      "detail-category",
      categoryNames[post.category] || "Update"
    );

    const title = createElement(
      "h1",
      "detail-title",
      post.title || "Untitled Update"
    );

    const infoTable = createElement("table", "detail-table");
    const tbody = document.createElement("tbody");

    function addRow(label, value) {
      if (!value) return;

      const row = document.createElement("tr");
      const heading = createElement("th", "", label);
      const cell = createElement("td", "", value);

      row.appendChild(heading);
      row.appendChild(cell);
      tbody.appendChild(row);
    }

    addRow("Category", categoryNames[post.category] || "Update");
    addRow("Qualification", post.qualification);
    addRow("Last Date", post.lastDate);

    if (tbody.children.length > 0) {
      infoTable.appendChild(tbody);
    }

    const descriptionHeading = createElement(
      "h2",
      "detail-subheading",
      "Post Details"
    );

    const description = createElement(
      "div",
      "detail-description",
      post.description || "No description available."
    );

    detailsCard.appendChild(category);
    detailsCard.appendChild(title);

    if (tbody.children.length > 0) {
      detailsCard.appendChild(infoTable);
    }

    detailsCard.appendChild(descriptionHeading);
    detailsCard.appendChild(description);

    const officialUrl = safeHttpsUrl(post.url || "");

    if (officialUrl) {
      const link = createElement(
        "a",
        "official-button",
        "Visit Official Website"
      );

      link.href = officialUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      detailsCard.appendChild(link);
    }
  } catch (error) {
    console.error("Error loading post:", error);
    showMessage("Unable to load this post. Please refresh the page.");
  }
}

loadDetails();