# Sales Roleplay Application Using Google Gemini AI API

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Workflow](#project-workflow)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Usage](#usage)

## Introduction

This project is a sales roleplay application that leverages the power of the Google Gemini AI API, Node.js, Express, JavaScript, HTML, and CSS. The application allows users to engage in a simulated sales conversation, with the AI providing responses to the user's input. The Web Speech API is used to capture the user's voice input, transcribe it into text, send it to the AI, and then convert the AI's text response back into speech.

## Features

- **Voice Input:** Users can speak to the application, which transcribes their speech into text.
- **AI-Powered Responses:** The transcribed text is sent to the Google Gemini AI API, which generates a response.
- **Voice Output:** The AI's response is converted back into speech for the user to hear.
- **Interactive Sales Roleplay:** The application simulates real-world sales conversations.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web framework for Node.js.
- **Google Gemini AI API**: Used for generating AI-powered responses.
- **Web Speech API**: For capturing and synthesizing speech.
- **HTML/CSS**: Front-end development.
- **JavaScript**: Client-side scripting.
- **NPM**: Node Package Manager for managing dependencies.

## Project Workflow

1. **Voice Input Capture**: The application uses the Web Speech API to capture the user's voice input.
2. **Speech-to-Text Conversion**: The captured voice is transcribed into text using the Web Speech API.
3. **Text Sent to AI**: The transcribed text is sent to the Google Gemini AI API.
4. **AI Response**: The AI processes the input and generates a relevant response.
5. **Text-to-Speech Conversion**: The AI's response is converted back into speech using the Web Speech API.
6. **Voice Output**: The synthesized speech is played back to the user, completing the interaction loop.

## Installation

To install and run this project locally, follow these steps:

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/your-username/sales-roleplay.git
    cd sales-roleplay
    ```

2. **Install Dependencies:**

    Make sure you have [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed. Then, install the necessary dependencies:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables:**

    Create a `.env` file in the root of the project and add your Google Gemini API credentials:

    ```bash
    GOOGLE_GEMINI_API_KEY=your_api_key_here
    ```

## Running the Project

To run the project on your local machine:

1. **Start the Server:**

    ```bash
    npm start
    ```

    This will start the Express server, and the application will be accessible at `http://localhost:3000`.

2. **Open in Browser:**

    Open your web browser and go to `http://localhost:3000` to interact with the application.

## Usage

- Click the "Start" button to begin the conversation.
- Speak into your microphone, and your voice will be transcribed into text.
- The application will send the text to the Google Gemini AI API, receive a response, and then speak the response back to you.
