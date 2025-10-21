
      document.addEventListener('DOMContentLoaded', () => {
        const connectBtn = document.getElementById('submit-btn')
        const disconnectBtn = document.getElementById('disconnect-btn')
        const loginScreen = document.getElementById('login-screen')
        const mainUI = document.getElementById('main-ui')
        const apiKeyInput = document.getElementById('inputPassword5')

        connectBtn.addEventListener('click', () => {
          const apiKey = apiKeyInput.value.trim()
          if (apiKey) {
            // Store it globally if needed
            window.userApiKey = apiKey

            // Toggle visibility
            loginScreen.classList.add('hidden')
            mainUI.classList.remove('hidden')
          } else {
            alert('Please enter a valid API key.')
          }
        })

        disconnectBtn.addEventListener('click', () => {
          window.userApiKey = null
          apiKeyInput.value = ''

          mainUI.classList.add('hidden')
          loginScreen.classList.remove('hidden')
        })
      })
    
document.addEventListener("DOMContentLoaded", () => {
    const connectBtn = document.getElementById("submit-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");
    const loginScreen = document.getElementById("login-screen");
    const mainUI = document.getElementById("main-ui");
    const apiKeyInput = document.getElementById("inputPassword5");
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
});
