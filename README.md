# English Quiz App

This is a simple web application for testing English language skills. The app displays questions from a JSON file and tracks user scores.

## Features

- Start screen with quiz information (number of questions, time limit)
- Questions with multiple-choice answers
- Score tracking
- Results page with feedback

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS

## How to Use

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. To build for production: `npm run build`

## Customizing the Quiz

To customize the quiz with your own questions:

1. Edit the file `src/data/questions.json`
2. Follow the same format for each question:
   - `id`: Unique identifier for the question
   - `question`: The question text
   - `options`: Array of possible answers
   - `correctAnswer`: Index of the correct answer (0-based)

You can also modify:
- `quizTitle`: The title of the quiz
- `description`: Description of the quiz
- `totalQuestions`: Total number of questions
- `timeLimit`: Time limit in minutes

## PDF to JSON Conversion

To convert your PDF of English exam questions to the required JSON format:
1. Extract the questions and answers from your PDF
2. Format them according to the JSON structure in `src/data/questions.json`
3. Replace the sample data with your own questions
