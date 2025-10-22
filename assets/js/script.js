document.addEventListener("DOMContentLoaded", () => {
    const connectBtn = document.getElementById("submit-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");
    const loginScreen = document.getElementById("login-screen");
    const mainUI = document.getElementById("main-ui");
    const apiKeyInput = document.getElementById("inputPassword5");
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const searchResults = document.getElementById("search-results");
    const movieCardTemplate = document.getElementById("movie-card-template");
    const movieModal = document.getElementById("movie-modal");
    const trendingMoviesSection = document.getElementById("trending-grid");
    const topRatedMoviesSection = document.getElementById("top-rated-grid");

    let apiKey = null;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Bearer " + apiKey, // Will be set later
        },
    };

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

    const getMovieAccountStates = async (movieId) => {
        const accountStatesResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/account_states`,
            options
        );
        const accountStatesData = await accountStatesResponse.json();

        return accountStatesData;
    };

    const getMovieDetails = async (movieId) => {
        // Get more details of the movie
        const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
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
            `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
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
        return {
            title,
            imageUrl,
            overview,
            releaseYear,
            genres,
            rating,
            cast,
            director,
            movieId,
        };
    };

    const createMovieCard = (movieDetails) => {
        let cardClone = movieCardTemplate.content.cloneNode(true);
        let movieCard = cardClone.querySelector(".movie-card");
        movieCard.querySelector(".movie-poster").src = movieDetails.imageUrl;
        movieCard.querySelector(".movie-poster").alt =
            movieDetails.title + " Poster";
        movieCard.querySelector(".movie-title").innerText = movieDetails.title;
        movieCard.querySelector(".release-year").innerText =
            movieDetails.releaseYear;

        movieCard.addEventListener("click", async () => {
            let movieRating = await getMovieRating(movieDetails.movieId);
            console.log(movieRating);
            movieModal.querySelector(".modal-poster").src =
                movieDetails.imageUrl;
            movieModal.querySelector(".modal-poster").alt =
                movieDetails.title + " Poster";
            movieModal.querySelector(".modal-title").innerText =
                movieDetails.title;
            movieModal.querySelector(
                ".modal-release-year"
            ).innerText += `: ${movieDetails.releaseYear}`;
            movieModal.querySelector(
                ".modal-overview"
            ).innerText += `: ${movieDetails.overview}`;
            movieModal.querySelector(
                ".modal-director"
            ).innerText += `: ${movieDetails.director}`;
            movieModal.querySelector(
                ".modal-cast"
            ).innerText += `: ${movieDetails.cast.join(", ")}`;
            movieModal.querySelector(
                ".modal-genre"
            ).innerText += `: ${movieDetails.genres.join(", ")}`;
            movieModal.querySelector(
                ".modal-rating"
            ).innerText += `: ${movieDetails.rating}`;
            movieModal.querySelector(
                ".modal-user-rating"
            ).innerText += `: Not Rated`;
            movieModal.classList.remove("hidden");
            // Close button handler
            movieModal
                .querySelector(".btn.btn-outline-primary")
                .addEventListener("click", async () => {
                    console.log(data);
                    let movieRating = prompt("Rate this movie (1-10):");

                    if (movieRating && movieRating >= 1 && movieRating <= 10) {
                        movieModal.querySelector(
                            ".modal-user-rating"
                        ).innerText = `User Rating: ${movieRating}`;
                    }
                });

            movieModal
                .querySelector(".close-btn")
                .addEventListener("click", () => {
                    movieModal.classList.add("hidden");
                    // Reset modal content
                    movieModal.querySelector(".modal-release-year").innerText =
                        "Release Year";
                    movieModal.querySelector(".modal-overview").innerText =
                        "Overview";
                    movieModal.querySelector(".modal-director").innerText =
                        "Director";
                    movieModal.querySelector(".modal-cast").innerText = "Cast";
                    movieModal.querySelector(".modal-genre").innerText =
                        "Genre";
                    movieModal.querySelector(".modal-rating").innerText =
                        "Rating";
                    movieModal.querySelector(".modal-user-rating").innerText =
                        "User Rating";
                });
        });
        return movieCard;
    };

    const appendCard = (movieCard, container) => {
        container.appendChild(movieCard);
    };

    const generateTrendingMovies = async () => {
        try {
            const response = await fetch(
                "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
                options
            );
            const data = await response.json();
            for (let movie of data.results) {
                let movieDetails = await getMovieDetails(movie.id);
                let movieCard = createMovieCard(movieDetails);
                appendCard(movieCard, trendingMoviesSection);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generateTopRatedMovies = async () => {
        try {
            const response = await fetch(
                "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
                options
            );
            const data = await response.json();
            for (let movie of data.results) {
                let movieDetails = await getMovieDetails(movie.id);
                let movieCard = createMovieCard(movieDetails);
                appendCard(movieCard, topRatedMoviesSection);
            }
        } catch (err) {
            console.error(err);
        }
    };

    searchForm.addEventListener("submit", async (e) => {
        searchResults.innerHTML = ""; // Clear previous results
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
                let movieDetails = await getMovieDetails(movie.id);
                let movieCard = createMovieCard(movieDetails);
                appendCard(movieCard, searchResults);
            }
        } catch (err) {
            console.error(err);
        }
    });

    generateTrendingMovies();
    generateTopRatedMovies();
});
