/* =================================
   SHIKSHA MARG JAVASCRIPT
================================= */


/* ================================
   MOBILE MENU
================================ */

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn) {

    menuBtn.addEventListener("click", function () {

        navMenu.classList.toggle("show");

    });

}


/* ================================
   PAGE ELEMENTS
================================ */

const homePage = document.getElementById("homePage");
const blogPage = document.getElementById("blogPage");

const allBlogs = document.querySelectorAll(".full-blog");


/* ================================
   OPEN BLOG
================================ */

function openBlog() {

    const hash = window.location.hash;

    if (hash.startsWith("#blog-")) {

        const blogId = hash.substring(1);

        const selectedBlog = document.getElementById(blogId);

        if (selectedBlog) {

            homePage.style.display = "none";

            blogPage.classList.add("active");

            allBlogs.forEach(function (blog) {

                blog.classList.remove("active");

            });

            selectedBlog.classList.add("active");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;
        }
    }


    /* ============================
       SHOW HOME
    ============================ */

    homePage.style.display = "block";

    blogPage.classList.remove("active");

    allBlogs.forEach(function (blog) {

        blog.classList.remove("active");

    });

}


/* ================================
   HASH CHANGE
================================ */

window.addEventListener("hashchange", openBlog);


/* ================================
   FIRST LOAD
================================ */

openBlog();


/* ================================
   CLOSE MOBILE MENU
================================ */

document.querySelectorAll(".nav a").forEach(function (link) {

    link.addEventListener("click", function () {

        navMenu.classList.remove("show");

    });

});


/* ================================
   RATING SYSTEM
================================ */

const stars = document.querySelectorAll(".stars button");
const ratingText = document.getElementById("ratingText");

let selectedRating = 0;


stars.forEach(function (star) {

    star.addEventListener("click", function () {

        selectedRating = Number(
            this.getAttribute("data-rating")
        );


        stars.forEach(function (item) {

            const itemRating = Number(
                item.getAttribute("data-rating")
            );

            if (itemRating <= selectedRating) {

                item.classList.add("selected");

            } else {

                item.classList.remove("selected");

            }

        });


        const messages = {
            1: "Aapne 1 star diya.",
            2: "Aapne 2 stars diye.",
            3: "Aapne 3 stars diye.",
            4: "Aapne 4 stars diye.",
            5: "Aapne 5 stars diye. Thank you!"
        };


        ratingText.textContent =
            messages[selectedRating];

    });

});


/* ================================
   FEEDBACK
================================ */

const submitFeedback =
    document.getElementById("submitFeedback");

const feedbackText =
    document.getElementById("feedbackText");

const feedbackMessage =
    document.getElementById("feedbackMessage");


if (submitFeedback) {

    submitFeedback.addEventListener("click", function () {

        const feedback =
            feedbackText.value.trim();


        if (selectedRating === 0) {

            feedbackMessage.textContent =
                "Please pehle rating select karein.";

            feedbackMessage.style.color = "#d97706";

            return;
        }


        if (feedback === "") {

            feedbackMessage.textContent =
                "Please apna feedback likhein.";

            feedbackMessage.style.color = "#d97706";

            return;
        }


        feedbackMessage.textContent =
            "Thank you! Aapka feedback submit ho gaya.";

        feedbackMessage.style.color = "#16803c";


        feedbackText.value = "";

    });

}


/* ================================
   SHARE BLOG
================================ */

const shareBtn =
    document.getElementById("shareBtn");


if (shareBtn) {

    shareBtn.addEventListener("click", async function () {

        const shareData = {

            title: document.title,

            text: "Shiksha Marg ka ye educational blog padhiye.",

            url: window.location.href

        };


        if (navigator.share) {

            try {

                await navigator.share(shareData);

            } catch (error) {

                console.log("Share cancelled.");

            }

        } else {

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert(
                    "Blog link copy ho gaya!"
                );

            } catch (error) {

                alert(
                    "Link copy nahi ho paya."
                );

            }

        }

    });

}


/* ================================
   COPY LINK
================================ */

const copyBtn =
    document.getElementById("copyBtn");

const copyMessage =
    document.getElementById("copyMessage");


if (copyBtn) {

    copyBtn.addEventListener("click", async function () {

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );

            copyMessage.textContent =
                "Blog link copy ho gaya!";

        } catch (error) {

            copyMessage.textContent =
                "Link copy nahi ho paya.";

        }

    });

}


/* ================================
   CURRENT YEAR
================================ */

const year =
    document.getElementById("year");

if (year) {

    year.textContent =
        new Date().getFullYear();

}