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
    const ratingSlider = document.getElementById("rating-slider");
    const ratingValue = document.getElementById("rating-value");
    const addFavoritesBtn = document.getElementById("add-favorites-btn");
    const addWatchlistBtn = document.getElementById("add-watchlist-btn");
    const favoritesSection = document.getElementById("favorites-grid");
    const watchlistSection = document.getElementById("watchlist-grid");
    const emptyFavorites = document.getElementById("empty-favorites");
    const emptyWatchlist = document.getElementById("empty-watchlist");
    const removeFavoritesBtn = document.getElementById("remove-favorites-btn");
    const removeWatchlistBtn = document.getElementById("remove-watchlist-btn");

    let apiKey = null;
    let accountId = null;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Bearer " + apiKey, // Will be set later
        },
    };

    const getAccountDetails = async () => {
        const response = await fetch(
            "https://api.themoviedb.org/3/account",
            options
        );
        const data = await response.json();
        accountId = data.id;
    };

    if (document.cookie.includes("userApiKey=")) {
        apiKey = document.cookie
            .split("; ")
            .find((row) => row.startsWith("userApiKey="))
            .split("=")[1];

        // Question mark operator to avoid null errors in watchlist/favorites page
        loginScreen?.classList.add("hidden");
        mainUI?.classList.remove("hidden");
        options.headers.Authorization = "Bearer " + apiKey;
        getAccountDetails();
    }

    connectBtn?.addEventListener("click", async () => {
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

            await getAccountDetails();

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

    // Function to get account states for a movie
    const getMovieAccountStates = async (movieId) => {
        const accountStatesResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/account_states`,
            options
        );

        const accountStatesData = await accountStatesResponse.json();
        return accountStatesData;
    };

    // Function to set a movie's rating
    const setMovieRating = async (movieId, rating) => {
        const ratingResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/rating`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({ value: rating }),
            }
        );

        const ratingData = await ratingResponse.json();
        return ratingData;
    };

    const getFavorites = async () => {
        // Fetch favorite movies from API
        const response = await fetch(
            `https://api.themoviedb.org/3/account/${accountId}/favorite/movies`,
            options
        );
        const data = await response.json();
        return data;
    };

    const addToFavorites = async (movieId) => {
        const response = await fetch(
            `https://api.themoviedb.org/3/account/${accountId}/favorite`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({
                    media_type: "movie",
                    media_id: movieId,
                    favorite: true,
                }),
            }
        );

        const data = await response.json();
        return data;
    };

    const isInFavorites = async (movieId) => {
        const data = await getFavorites();
        for (let movie of data.results) {
            if (movie.id === movieId) {
                return true;
            }
        }
        return false;
    };

    const removeFromFavorites = async (movieId) => {
        const response = await fetch(
            `https://api.themoviedb.org/3/account/${accountId}/favorite`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({
                    media_type: "movie",
                    media_id: movieId,
                    favorite: false,
                }),
            }
        );

        const data = await response.json();
        return data;
    };

    const getWatchlist = async () => {
        // Fetch watchlist movies from API
        const response = await fetch(
            `https://api.themoviedb.org/3/account/${accountId}/watchlist/movies`,
            options
        );
        const data = await response.json();
        return data;
    };

    const addToWatchlist = async (movieId) => {
        const response = await fetch(
            `https://api.themoviedb.org/3/account/${accountId}/watchlist`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({
                    media_type: "movie",
                    media_id: movieId,
                    watchlist: true,
                }),
            }
        );

        const data = await response.json();
        return data;
    };

    const isInWatchlist = async (movieId) => {
        const data = await getWatchlist();
        for (let movie of data.results) {
            if (movie.id === movieId) {
                return true;
            }
        }
        return false;
    };

    const removeFromWatchlist = async (movieId) => {
        const response = await fetch(
            `https://api.themoviedb.org/3/account/${accountId}/watchlist`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({
                    media_type: "movie",
                    media_id: movieId,
                    watchlist: false,
                }),
            }
        );

        const data = await response.json();
        return data;
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
            let movieRating = await getMovieAccountStates(movieDetails.movieId);
            let ratingDisplay = movieModal.querySelector(".rating-label");

            document.getElementById("rating").value = movieRating.rated.value;
            ratingDisplay.innerText = `Your Rating: ${
                document.getElementById("rating").value
            }`;

            movieModal.querySelector(".modal-poster").src =
                movieDetails.imageUrl;
            movieModal.querySelector(".modal-poster").alt =
                movieDetails.title + " Poster";
            movieModal.querySelector(".modal-title").innerText =
                movieDetails.title;
            movieModal.querySelector(
                ".modal-release-year"
            ).innerText += `${movieDetails.releaseYear}`;
            movieModal.querySelector(
                ".modal-overview"
            ).innerText += `${movieDetails.overview}`;
            movieModal.querySelector(
                ".modal-director"
            ).innerText += `${movieDetails.director}`;
            movieModal.querySelector(
                ".modal-cast"
            ).innerText += `${movieDetails.cast.join(", ")}`;
            movieModal.querySelector(
                ".modal-genre"
            ).innerText += `${movieDetails.genres.join(", ")}`;
            movieModal.querySelector(
                ".modal-rating"
            ).innerText += `${movieDetails.rating}`;

            // Check if the user has rated the movie through the movieRating object
            if (movieRating && movieRating.rated.value) {
                movieModal.querySelector(
                    ".modal-user-rating"
                ).innerText += `${movieRating.rated.value}`;
            } else {
                movieModal.querySelector(
                    ".modal-user-rating"
                ).innerText += `Not Rated`;
            }

            movieModal.classList.remove("hidden");

            // Rate slider handler
            const rateSliderHandler = () => {
                const slider = movieModal.querySelector(".rating-slider");
                ratingDisplay.innerText = `Your Rating: ${slider.value}`;
            };

            movieModal
                .querySelector(".rating-slider")
                .addEventListener("input", rateSliderHandler);

            // Save Rating handler
            const saveRatingHandler = async () => {
                const userRating = document.getElementById("rating").value;
                const UserRatingDisplay = movieModal.querySelector(".modal-user-rating");
                const ThoughtsBox = movieModal.querySelector(".comment-box");
                UserRatingDisplay.innerText = `${userRating}`;

                // Check if the movie rating was successful and it was saved then notify the user
                let movieRatingResponse = await setMovieRating(movieDetails.movieId, userRating);
                if (movieRatingResponse.success) {
                    alert(`Your rating of ${userRating} for ${movieDetails.title} has been saved!`);
                    ThoughtsBox.value = ``;
                } else {
                    alert(`There was an error saving your rating for ${movieDetails.title}. Please try again.`);
                }
            };

            movieModal.querySelector(".save-rating-btn").addEventListener("click", saveRatingHandler);

            const addFavoritesBtnListener = async () => {
                let inFavorites = await isInFavorites(movieDetails.movieId);
                if (inFavorites) {
                    alert(`${movieDetails.title} is already in Favorites!`);
                } else {
                    await addToFavorites(movieDetails.movieId);
                    alert(`${movieDetails.title} added to Favorites!`);
                }
            };
            const addWatchlistBtnListener = async () => {
                let inWatchlist = await isInWatchlist(movieDetails.movieId);
                if (inWatchlist) {
                    alert(`${movieDetails.title} is already in Watchlist!`);
                } else {
                    await addToWatchlist(movieDetails.movieId);
                    alert(`${movieDetails.title} added to Watchlist!`);
                }
            };
            const removeFavoritesBtnListener = async () => {
                await removeFromFavorites(movieDetails.movieId);
                alert(`${movieDetails.title} removed from Favorites!`);
                location.reload();
            };
            const removeWatchlistBtnListener = async () => {
                await removeFromWatchlist(movieDetails.movieId);
                alert(`${movieDetails.title} removed from Watchlist!`);
                location.reload();
            };
            let inFavorites = await isInFavorites(movieDetails.movieId);
            if (inFavorites) {
                addFavoritesBtn.classList.add("hidden");
                // Remove from Favorites handler
                removeFavoritesBtn?.addEventListener(
                    "click",
                    removeFavoritesBtnListener
                );
            } else {
                removeFavoritesBtn.classList.add("hidden");
                // Add to Favorites handler
                addFavoritesBtn?.addEventListener(
                    "click",
                    addFavoritesBtnListener
                );
            }
            let inWatchlist = await isInWatchlist(movieDetails.movieId);
            if (inWatchlist) {
                addWatchlistBtn.classList.add("hidden");
                // Remove from Watchlist handler
                removeWatchlistBtn?.addEventListener(
                    "click",
                    removeWatchlistBtnListener
                );
            } else {
                removeWatchlistBtn.classList.add("hidden");
                // Add to Watchlist handler
                addWatchlistBtn?.addEventListener(
                    "click",
                    addWatchlistBtnListener
                );
            }
            // Close button handler
            movieModal
                .querySelector(".close-btn")
                .addEventListener("click", () => {
                    movieModal.classList.add("hidden");
                    // Reset modal content
                    movieModal.querySelector(".modal-release-year").innerText ="";
                    movieModal.querySelector(".modal-overview").innerText = "";
                    movieModal.querySelector(".modal-director").innerText = "";
                    movieModal.querySelector(".modal-cast").innerText = "";
                    movieModal.querySelector(".modal-genre").innerText = "";
                    movieModal.querySelector(".modal-rating").innerText = "";
                    movieModal.querySelector(".modal-user-rating").innerText ="";
                    movieModal.querySelector(".comment-box").value ="";

                    movieModal.querySelector(".save-rating-btn").removeEventListener("click", saveRatingHandler);
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

    const displayFavorites = async () => {
        const data = await getFavorites();
        if (data.results.length !== 0) {
            emptyFavorites.classList.add("hidden");
            for (let movie of data.results) {
                let movieDetails = await getMovieDetails(movie.id);
                let movieCard = createMovieCard(movieDetails);
                appendCard(movieCard, favoritesSection);
            }
        }
    };

    const displayWatchlist = async () => {
        const data = await getWatchlist();
        if (data.results.length !== 0) {
            emptyWatchlist.classList.add("hidden");
            for (let movie of data.results) {
                let movieDetails = await getMovieDetails(movie.id);
                let movieCard = createMovieCard(movieDetails);
                appendCard(movieCard, watchlistSection);
            }
        }
    };

    searchForm?.addEventListener("submit", async (e) => {
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
            // Iterate over results
            for (let movie of data.results) {
                let filterRating = parseFloat(ratingValue.textContent);
                let movieRating = movie.vote_average;
                let movieDetails = await getMovieDetails(movie.id);
                let movieCard = createMovieCard(movieDetails);

                // If the user has a set rating filter, apply it and then check if the movie rating is lower then their set value
                if (filterRating > 0 && movieRating > filterRating) {
                    continue;
                } else {
                    appendCard(movieCard, searchResults);
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Rating slider event listener to update rating value display
    ratingSlider?.addEventListener("input", function () {
        ratingValue.textContent = parseFloat(this.value).toFixed(1);
    });

    if (favoritesSection && watchlistSection) {
        displayFavorites();
        displayWatchlist();
    } else {
        generateTrendingMovies();
        generateTopRatedMovies();
    }
});
