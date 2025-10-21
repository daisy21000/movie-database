
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
    