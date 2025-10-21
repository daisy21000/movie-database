document.addEventListener("DOMContentLoaded", () => {
    const connectBtn = document.getElementById("submit-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");
    const loginScreen = document.getElementById("login-screen");
    const mainUI = document.getElementById("main-ui");
    const apiKeyInput = document.getElementById("inputPassword5");
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    let apiKey = null;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Bearer " + apiKey, // Will be set later
        },
    };

<<<<<<< HEAD
      document.addEventListener('DOMContentLoaded', () => {
        const connectBtn = document.getElementById('submit-btn')
        const disconnectBtn = document.getElementById('disconnect-btn')
        const loginScreen = document.getElementById('login-screen')
        const mainUI = document.getElementById('main-ui')
        const apiKeyInput = document.getElementById('inputPassword5')

        connectBtn.addEventListener('click', () => {
          const apiKey = apiKeyInput.value.trim()
          if (apiKey) {
            
            window.userApiKey = apiKey
=======
    if (document.cookie.includes("userApiKey=")) {
        apiKey = document.cookie
            .split("; ")
            .find((row) => row.startsWith("userApiKey="))
            .split("=")[1];
        loginScreen.classList.add("hidden");
        mainUI.classList.remove("hidden");
        options.headers.Authorization = "Bearer " + apiKey;
    }
    connectBtn.addEventListener("click", async () => {
        apiKey = apiKeyInput.value.trim();
        let isKeyValid = false;
        options.headers.Authorization = "Bearer " + apiKey;
        try {
            const response = await fetch(
                "https://api.themoviedb.org/3/authentication",
                options
            );
            const data = await response.json();
            if (data.success) {
                isKeyValid = true;
            }
        } catch (err) {
            console.error(err);
        }
        if (isKeyValid) {
            // Store it globally if needed
            document.cookie = `userApiKey=${apiKey}; path=/`;
>>>>>>> main

            // Toggle visibility
            loginScreen.classList.add("hidden");
            mainUI.classList.remove("hidden");
        } else {
            alert("Please enter a valid API key.");
        }
    });

    disconnectBtn.addEventListener("click", () => {
        apiKey = null;
        document.cookie =
            "userApiKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        apiKeyInput.value = "";

        mainUI.classList.add("hidden");
        loginScreen.classList.remove("hidden");
    });

    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // Encode and trim input
        let query = encodeURIComponent(searchInput.value.trim());
        try {
            // Query API
            const response = await fetch(
                `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
                options
            );
            const data = await response.json();
            console.log(data);
            // Iterate over results
            for (let movie of data.results) {
                // Get more details of the movie
                const detailsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`,
                    options
                );
                const detailsData = await detailsResponse.json();
                // Store info in variables
                let title = detailsData.title;
                let imageUrl = `https://image.tmdb.org/t/p/w500${detailsData.poster_path}`;
                let overview = detailsData.overview;
                let releaseYear = detailsData.release_date.split("-")[0];
                let genres = [];
                for (let genre of detailsData.genres) {
                    genres.push(genre.name);
                }
                let rating = detailsData.vote_average;

                // Get cast info
                const creditsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}/credits?language=en-US`,
                    options
                );
                const creditsData = await creditsResponse.json();
                let cast = [];
                for (let castMember of creditsData.cast) {
                    cast.push(castMember.name);
                }
                let director = "";
                for (let crewMember of creditsData.crew) {
                    if (crewMember.job === "Director") {
                        director = crewMember.name;
                        break;
                    }
                }

                // Console log for testing
                console.log(
                    `Title: ${title}, Image URL: ${imageUrl}, Overview: ${overview}, Release Year: ${releaseYear}, Genres: ${genres.join(
                        ", "
                    )}, Rating: ${rating}, Cast: ${cast.join(
                        ", "
                    )}, Director: ${director}`
                );
            }
        } catch (err) {
            console.error(err);
        }
    });
});
