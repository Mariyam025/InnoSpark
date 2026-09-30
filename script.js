document.addEventListener("DOMContentLoaded", () => {

    const views = document.querySelectorAll(".app-view");
    const navLinks = document.querySelectorAll(".nav-view");
    const viewButtons = document.querySelectorAll("[data-view]");

    const ideaItems = document.querySelectorAll(".idea-item");
    const categoryButtons =
        document.querySelectorAll(".category-pill");

    const searchInput =
        document.getElementById("ideaSearch");

    const searchButton =
        document.getElementById("searchButton");

    const sortIdeas =
        document.getElementById("sortIdeas");

    const visibleIdeaCount =
        document.getElementById("visibleIdeaCount");

    const noResults =
        document.getElementById("noResults");

    const clearSearch =
        document.getElementById("clearSearch");

    const bookmarkList =
        document.getElementById("bookmarkList");

    const bookmarkCount =
        document.getElementById("bookmarkCount");


    let selectedCategory = "all";


    

    function showView(viewId) {

        views.forEach(view => {

            view.classList.remove("active-view");

        });


        const target =
            document.getElementById(viewId);

        if (target) {

            target.classList.add("active-view");

        }


        navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.view === viewId
            );

        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        const navbar =
            document.getElementById("mainNavbar");

        if (
            navbar.classList.contains("show") &&
            window.bootstrap
        ) {

            bootstrap.Collapse
                .getOrCreateInstance(navbar)
                .hide();

        }

    }


    viewButtons.forEach(button => {

        button.addEventListener("click", event => {

            const view =
                button.dataset.view;

            if (!view) {
                return;
            }

            event.preventDefault();

            showView(view);

        });

    });


    

    function filterIdeas() {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        let count = 0;


        ideaItems.forEach(item => {

            const category =
                item.dataset.category.toLowerCase();

            const title =
                item.dataset.title.toLowerCase();

            const text =
                item.textContent.toLowerCase();


            const categoryMatch =
                selectedCategory === "all" ||
                item.dataset.category === selectedCategory;


            const searchMatch =
                searchTerm === "" ||
                title.includes(searchTerm) ||
                category.includes(searchTerm) ||
                text.includes(searchTerm);


            if (
                categoryMatch &&
                searchMatch
            ) {

                item.classList.remove("d-none");

                count++;

            } else {

                item.classList.add("d-none");

            }

        });


        visibleIdeaCount.textContent = count;

        noResults.classList.toggle(
            "d-none",
            count !== 0
        );

    }


    searchInput.addEventListener(
        "input",
        filterIdeas
    );


    searchButton.addEventListener(
        "click",
        filterIdeas
    );


    clearSearch.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            selectedCategory = "all";

            categoryButtons.forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.category === "all"
                );

            });

            filterIdeas();

        }
    );


    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(btn => {

                    btn.classList.remove("active");

                });


                button.classList.add("active");

                selectedCategory =
                    button.dataset.category;

                filterIdeas();

            }
        );

    });


    

    sortIdeas.addEventListener(
        "change",
        () => {

            const grid =
                document.getElementById("ideasGrid");

            const cards =
                [...grid.querySelectorAll(".idea-item")];


            const mode =
                sortIdeas.value;


            if (mode === "title") {

                cards.sort((a, b) =>
                    a.dataset.title.localeCompare(
                        b.dataset.title
                    )
                );

            }


            if (mode === "stage") {

                const order = {
                    "Concept": 1,
                    "Prototype": 2,
                    "Launched": 3
                };

                cards.sort((a, b) =>
                    order[a.dataset.stage] -
                    order[b.dataset.stage]
                );

            }


            cards.forEach(card =>
                grid.appendChild(card)
            );

            filterIdeas();

        }
    );


    

    let bookmarks =
        JSON.parse(
            localStorage.getItem(
                "innosparkBookmarks"
            ) || "[]"
        );


    function saveBookmarks() {

        localStorage.setItem(
            "innosparkBookmarks",
            JSON.stringify(bookmarks)
        );

    }


    function updateBookmarkButtons() {

        document
            .querySelectorAll(".bookmark-button")
            .forEach(button => {

                const name =
                    button.dataset.bookmark;

                const saved =
                    bookmarks.includes(name);

                button.classList.toggle(
                    "saved",
                    saved
                );


                button.innerHTML = saved
                    ? '<i class="bi bi-bookmark-fill"></i>'
                    : '<i class="bi bi-bookmark"></i>';

            });

    }


    function renderBookmarks() {

        bookmarkCount.textContent =
            `${bookmarks.length} saved`;


        if (bookmarks.length === 0) {

            bookmarkList.innerHTML = `
                <div class="empty-bookmark">
                    <i class="bi bi-bookmark-star"></i>
                    <p>Bookmark ideas you want to revisit.</p>
                </div>
            `;

            return;

        }


        bookmarkList.innerHTML =
            bookmarks.map(name => {

                const item =
                    [...ideaItems].find(
                        card =>
                            card.dataset.title === name
                    );

                if (!item) {
                    return "";
                }

                return `
                    <div class="bookmark-item">

                        <div>
                            <strong>${name}</strong>

                            <small>
                                ${item.dataset.category}
                                ·
                                ${item.dataset.stage}
                            </small>
                        </div>

                        <button
                            class="btn btn-sm btn-outline-neon remove-bookmark"
                            data-name="${name}">

                            Remove

                        </button>

                    </div>
                `;

            }).join("");


        document
            .querySelectorAll(".remove-bookmark")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        bookmarks =
                            bookmarks.filter(
                                item =>
                                    item !==
                                    button.dataset.name
                            );

                        saveBookmarks();

                        updateBookmarkButtons();

                        renderBookmarks();

                        showToast(
                            "Idea removed from bookmarks."
                        );

                    }
                );

            });

    }


    document
        .querySelectorAll(".bookmark-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const name =
                        button.dataset.bookmark;


                    if (bookmarks.includes(name)) {

                        bookmarks =
                            bookmarks.filter(
                                item =>
                                    item !== name
                            );

                        showToast(
                            "Removed from bookmarks."
                        );

                    } else {

                        bookmarks.push(name);

                        showToast(
                            "Idea saved to bookmarks."
                        );

                    }


                    saveBookmarks();

                    updateBookmarkButtons();

                    renderBookmarks();

                }
            );

        });


    updateBookmarkButtons();

    renderBookmarks();


    

    function updateStats() {

        document.getElementById(
            "totalIdeas"
        ).textContent =
            document.querySelectorAll(
                ".idea-item"
            ).length;


        document.getElementById(
            "prototypeCount"
        ).textContent =
            document.querySelectorAll(
                '[data-stage="Prototype"]'
            ).length;


        document.getElementById(
            "collaboratorCount"
        ).textContent =
            document.querySelectorAll(
                ".collaborator-badge:not(:has(.bi-check-circle-fill))"
            ).length;

    }


    updateStats();


    

    const ideaModal =
        document.getElementById("ideaModal");


    let currentModalIdea = "";


    ideaModal.addEventListener(
        "show.bs.modal",
        event => {

            const button =
                event.relatedTarget;


            const title =
                button.dataset.title;

            const creator =
                button.dataset.creator;

            const stage =
                button.dataset.stage;

            const category =
                button.dataset.category;

            const problem =
                button.dataset.problem;

            const solution =
                button.dataset.solution;

            const audience =
                button.dataset.audience;


            currentModalIdea = title;


            document.getElementById(
                "ideaModalLabel"
            ).textContent = title;


            document.getElementById(
                "modalCreator"
            ).textContent = creator;


            document.getElementById(
                "modalStage"
            ).textContent = stage;


            document.getElementById(
                "modalProblem"
            ).textContent = problem;


            document.getElementById(
                "modalSolution"
            ).textContent = solution;


            document.getElementById(
                "modalAudience"
            ).textContent = audience;


            const modalCategory =
                document.getElementById(
                    "modalCategory"
                );


            modalCategory.textContent =
                category;


            modalCategory.className =
                "category-badge";


            if (category === "AI & DeepTech") {

                modalCategory.classList.add(
                    "category-ai"
                );

            } else if (
                category === "Social Impact"
            ) {

                modalCategory.classList.add(
                    "category-social"
                );

            } else if (
                category ===
                "Business, Health & Lifestyle"
            ) {

                modalCategory.classList.add(
                    "category-business"
                );

            } else {

                modalCategory.classList.add(
                    "category-creative"
                );

            }


            const stageElement =
                document.getElementById(
                    "modalStage"
                );


            stageElement.className =
                "stage-badge";


            if (stage === "Prototype") {

                stageElement.classList.add(
                    "stage-prototype"
                );

            } else if (
                stage === "Launched"
            ) {

                stageElement.classList.add(
                    "stage-launched"
                );

            } else {

                stageElement.classList.add(
                    "stage-concept"
                );

            }


            document.getElementById(
                "connectTeam"
            ).href =
                `mailto:innovator@innospark.example?subject=${encodeURIComponent(
                    "Interested in " + title
                )}`;


            updateModalBookmark();

        }
    );


    function updateModalBookmark() {

        const button =
            document.getElementById(
                "modalBookmark"
            );


        const saved =
            bookmarks.includes(
                currentModalIdea
            );


        button.classList.toggle(
            "saved",
            saved
        );


        button.innerHTML = saved
            ? '<i class="bi bi-bookmark-fill"></i> Saved'
            : '<i class="bi bi-bookmark"></i> Save';

    }


    document
        .getElementById("modalBookmark")
        .addEventListener(
            "click",
            () => {

                if (
                    bookmarks.includes(
                        currentModalIdea
                    )
                ) {

                    bookmarks =
                        bookmarks.filter(
                            item =>
                                item !==
                                currentModalIdea
                        );

                    showToast(
                        "Removed from bookmarks."
                    );

                } else {

                    bookmarks.push(
                        currentModalIdea
                    );

                    showToast(
                        "Idea saved."
                    );

                }


                saveBookmarks();

                updateBookmarkButtons();

                renderBookmarks();

                updateModalBookmark();

            }
        );



    let currentUser =
        JSON.parse(
            sessionStorage.getItem(
                "innosparkUser"
            ) || "null"
        );


    const loginNavButton =
        document.getElementById(
            "loginNavButton"
        );

    const userNav =
        document.getElementById(
            "userNav"
        );


    function updateAuthUI() {

        if (currentUser) {

            loginNavButton.classList.add(
                "d-none"
            );

            userNav.classList.remove(
                "d-none"
            );


            const initials =
                currentUser.name
                    .split(" ")
                    .map(word => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();


            document.getElementById(
                "navAvatar"
            ).textContent = initials;


            document.getElementById(
                "navUserName"
            ).textContent =
                currentUser.name.split(" ")[0];


            document.getElementById(
                "profileAvatar"
            ).textContent =
                initials;


            document.getElementById(
                "profileName"
            ).textContent =
                currentUser.name;


            document.getElementById(
                "profileDepartment"
            ).textContent =
                currentUser.department ||
                "Student Innovator";

        } else {

            loginNavButton.classList.remove(
                "d-none"
            );

            userNav.classList.add(
                "d-none"
            );

        }

    }


    updateAuthUI();


    

    document
        .getElementById("loginForm")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "loginEmail"
                    ).value.trim();


                const password =
                    document.getElementById(
                        "loginPassword"
                    ).value;


                if (
                    !email ||
                    !password
                ) {

                    return;

                }


                currentUser = {

                    name:
                        email
                            .split("@")[0]
                            .replace(/[._-]/g, " "),

                    email,

                    department:
                        "Student Innovator"

                };


                sessionStorage.setItem(
                    "innosparkUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                updateAuthUI();

                bootstrap.Modal
                    .getInstance(
                        document.getElementById(
                            "authModal"
                        )
                    )
                    .hide();


                showToast(
                    "Welcome back to InnoSpark!"
                );

            }
        );


    

    document
        .getElementById("registerForm")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const name =
                    document.getElementById(
                        "registerName"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "registerEmail"
                    ).value.trim();


                const department =
                    document.getElementById(
                        "registerDepartment"
                    ).value.trim();


                const password =
                    document.getElementById(
                        "registerPassword"
                    ).value;


                if (
                    !name ||
                    !email ||
                    !department ||
                    password.length < 6
                ) {

                    showToast(
                        "Please complete all fields."
                    );

                    return;

                }


                currentUser = {

                    name,
                    email,
                    department

                };


                sessionStorage.setItem(
                    "innosparkUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                updateAuthUI();


                bootstrap.Modal
                    .getInstance(
                        document.getElementById(
                            "authModal"
                        )
                    )
                    .hide();


                showToast(
                    "Your InnoSpark account is ready!"
                );


                showView("profile");

            }
        );


    
    document
        .querySelectorAll(".auth-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".auth-tab"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    tab.classList.add("active");


                    const loginForm =
                        document.getElementById(
                            "loginForm"
                        );

                    const registerForm =
                        document.getElementById(
                            "registerForm"
                        );


                    if (
                        tab.dataset.auth ===
                        "login"
                    ) {

                        loginForm.classList.remove(
                            "d-none"
                        );

                        registerForm.classList.add(
                            "d-none"
                        );

                        document.getElementById(
                            "authTitle"
                        ).textContent =
                            "Welcome back";

                    } else {

                        loginForm.classList.add(
                            "d-none"
                        );

                        registerForm.classList.remove(
                            "d-none"
                        );

                        document.getElementById(
                            "authTitle"
                        ).textContent =
                            "Join InnoSpark";

                    }

                }
            );

        });


    

    document
        .getElementById("userNavButton")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "userDropdown"
                    )
                    .classList.toggle(
                        "d-none"
                    );

            }
        );


    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            () => {

                currentUser = null;

                sessionStorage.removeItem(
                    "innosparkUser"
                );

                updateAuthUI();

                document
                    .getElementById(
                        "userDropdown"
                    )
                    .classList.add(
                        "d-none"
                    );

                showToast(
                    "You have been logged out."
                );

                showView("dashboard");

            }
        );




    document
        .getElementById("editProfileButton")
        .addEventListener(
            "click",
            () => {

                if (!currentUser) {

                    const modal =
                        new bootstrap.Modal(
                            document.getElementById(
                                "authModal"
                            )
                        );

                    modal.show();

                    showToast(
                        "Please login first."
                    );

                    return;

                }


                document.getElementById(
                    "editName"
                ).value =
                    currentUser.name;


                document.getElementById(
                    "editDepartment"
                ).value =
                    currentUser.department;


                const modal =
                    new bootstrap.Modal(
                        document.getElementById(
                            "profileModal"
                        )
                    );

                modal.show();

            }
        );


    document
        .getElementById("profileForm")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                currentUser.name =
                    document.getElementById(
                        "editName"
                    ).value.trim();


                currentUser.department =
                    document.getElementById(
                        "editDepartment"
                    ).value.trim();


                sessionStorage.setItem(
                    "innosparkUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                updateAuthUI();


                bootstrap.Modal
                    .getInstance(
                        document.getElementById(
                            "profileModal"
                        )
                    )
                    .hide();


                showToast(
                    "Profile updated successfully."
                );

            }
        );


    

    const ideaForm =
        document.getElementById(
            "ideaForm"
        );


    ideaForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!currentUser) {

                showToast(
                    "Please login before submitting an idea."
                );


                new bootstrap.Modal(
                    document.getElementById(
                        "authModal"
                    )
                ).show();


                return;

            }


            if (!ideaForm.checkValidity()) {

                event.stopPropagation();

                ideaForm.classList.add(
                    "was-validated"
                );

                return;

            }


            const title =
                document.getElementById(
                    "ideaTitle"
                ).value.trim();


            const category =
                document.getElementById(
                    "ideaCategory"
                ).value;


            const stage =
                document.getElementById(
                    "ideaStage"
                ).value;


            const problem =
                document.getElementById(
                    "problemStatement"
                ).value.trim();


            const solution =
                document.getElementById(
                    "solutionStatement"
                ).value.trim();


            const audience =
                document.getElementById(
                    "targetMarket"
                ).value.trim();


            const lookingForTeam =
                document.getElementById(
                    "cofounderCheck"
                ).checked;


            const initials =
                currentUser.name
                    .split(" ")
                    .map(word => word[0])
                    .join("")
                    .slice(0,2)
                    .toUpperCase();


            const newCard =
                document.createElement("div");


            newCard.className =
                "col idea-item";


            newCard.dataset.category =
                category;


            newCard.dataset.title =
                title;


            newCard.dataset.stage =
                stage;


            const categoryClass =
                category === "AI & DeepTech"
                    ? "category-ai"
                    : category === "Social Impact"
                    ? "category-social"
                    : category ===
                      "Business, Health & Lifestyle"
                    ? "category-business"
                    : "category-creative";


            const stageClass =
                stage === "Prototype"
                    ? "stage-prototype"
                    : stage === "Launched"
                    ? "stage-launched"
                    : "stage-concept";


            newCard.innerHTML = `

                <article class="idea-card">

                    <div class="card-top">

                        <span class="category-badge ${categoryClass}">
                            ${category}
                        </span>

                        <button
                            class="bookmark-button"
                            data-bookmark="${title}">

                            <i class="bi bi-bookmark"></i>

                        </button>

                    </div>

                    <span class="stage-badge ${stageClass}">
                        ${stage}
                    </span>

                    <h3 class="idea-title">
                        ${title}
                    </h3>

                    <p class="idea-summary">
                        ${solution}
                    </p>

                    <div class="collaborator-badge">

                        <i class="bi bi-${lookingForTeam
                            ? "people-fill"
                            : "person-check-fill"}"></i>

                        ${lookingForTeam
                            ? "Looking for Collaborators"
                            : "Team Status: Open"}

                    </div>

                    <div class="creator-row">

                        <div class="creator-avatar">
                            ${initials}
                        </div>

                        <div>

                            <small>
                                Created by
                            </small>

                            <strong>
                                ${currentUser.name}
                            </strong>

                        </div>

                    </div>

                    <button
                        class="btn btn-card w-100 mt-4"
                        data-bs-toggle="modal"
                        data-bs-target="#ideaModal"
                        data-title="${title}"
                        data-creator="${currentUser.name}"
                        data-stage="${stage}"
                        data-category="${category}"
                        data-problem="${problem}"
                        data-solution="${solution}"
                        data-audience="${audience}">

                        View Deep Dive
                        <i class="bi bi-arrow-up-right"></i>

                    </button>

                </article>

            `;


            document
                .getElementById("ideasGrid")
                .prepend(newCard);


            addBookmarkListener(
                newCard.querySelector(
                    ".bookmark-button"
                )
            );


            ideaForm.reset();

            ideaForm.classList.remove(
                "was-validated"
            );


            updateStats();


            showView("dashboard");


            showToast(
                "Your innovation has been published!"
            );


            addActivity(
                `Submitted "${title}"`,
                "Your new innovation is now visible."
            );

        }
    );


    function addBookmarkListener(button) {

        button.addEventListener(
            "click",
            () => {

                const name =
                    button.dataset.bookmark;


                if (bookmarks.includes(name)) {

                    bookmarks =
                        bookmarks.filter(
                            item =>
                                item !== name
                        );

                } else {

                    bookmarks.push(name);

                }


                saveBookmarks();

                updateBookmarkButtons();

                renderBookmarks();

            }
        );

    }


    

    function addActivity(title, description) {

        const activityList =
            document.getElementById(
                "activityList"
            );


        const activity =
            document.createElement("div");


        activity.className =
            "activity-item";


        activity.innerHTML = `

            <i class="bi bi-check-circle-fill"></i>

            <div>

                <strong>
                    ${title}
                </strong>

                <small>
                    ${description}
                </small>

            </div>

        `;


        activityList.prepend(activity);

    }



    function updateMyIdeas() {

        const list =
            document.getElementById(
                "myIdeasList"
            );

        const count =
            document.getElementById(
                "myIdeaCount"
            );


        if (!currentUser) {

            count.textContent =
                "Login required";

            return;

        }


        const ownIdeas =
            [...document.querySelectorAll(
                ".idea-item"
            )].filter(
                item =>
                    item.querySelector(
                        ".creator-row strong"
                    )?.textContent.trim() ===
                    currentUser.name
            );


        count.textContent =
            `${ownIdeas.length} projects`;


        if (ownIdeas.length === 0) {

            list.innerHTML = `

                <div class="empty-profile">

                    <i class="bi bi-lightbulb"></i>

                    <h3>
                        No submitted ideas yet
                    </h3>

                    <p>
                        Share your first innovation.
                    </p>

                    <button
                        class="btn btn-neon"
                        data-view="submit">

                        Submit Your First Idea

                    </button>

                </div>

            `;

            list
                .querySelector("[data-view]")
                .addEventListener(
                    "click",
                    () => showView("submit")
                );

            return;

        }


        list.innerHTML =
            ownIdeas.map(item => `

                <div class="bookmark-item">

                    <div>

                        <strong>
                            ${item.dataset.title}
                        </strong>

                        <small>
                            ${item.dataset.category}
                            ·
                            ${item.dataset.stage}
                        </small>

                    </div>

                </div>

            `).join("");

    }


    updateMyIdeas();


    

    function showToast(message) {

        const container =
            document.getElementById(
                "toastContainer"
            );


        const toast =
            document.createElement("div");


        toast.className =
            "toast show inno-toast";

        toast.setAttribute(
            "role",
            "alert"
        );


        toast.innerHTML = `

            <div class="d-flex">

                <div class="toast-body">

                    <i class="bi bi-check-circle-fill me-2"
                       style="color:#00F2FE"></i>

                    ${message}

                </div>

                <button
                    type="button"
                    class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast">
                </button>

            </div>

        `;


        container.appendChild(toast);


        setTimeout(() => {

            toast.remove();

        }, 3200);

    }

});