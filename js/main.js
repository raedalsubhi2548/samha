// Improved Code for js/main.js

// Function to initialize the application
function initializeApp() {
    const button = document.getElementById('submit-button');
    button.addEventListener('click', handleSubmit);
}

// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault();
    const inputField = document.querySelector('#input-field');
    const userInput = inputField.value.trim();

    if (validateInput(userInput)) {
        processInput(userInput);
    } else {
        displayError('Input is not valid.');
    }
}

// Function to validate user input
function validateInput(input) {
    return input.length > 0;
}

// Function to process input
function processInput(input) {
    console.log('Processing: ', input);
    // Further processing logic here
}

// Function to display an error message
function displayError(message) {
    const errorElement = document.querySelector('#error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);