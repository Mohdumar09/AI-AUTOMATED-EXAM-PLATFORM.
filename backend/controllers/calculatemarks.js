const calculateMarks = (questions, userResponses) => {
  let totalMarks = 0;

  questions.forEach((question, index) => {
    // Assuming userResponses[index] contains the user's selected option for this question
    const userAnswer = userResponses[index];

    // Find the correct option
    const correctOption = question.options.find((option) => option.isCorrect);

    // Check if the user's answer matches the correct option
    if (correctOption && correctOption.optionText === userAnswer) {
      totalMarks += question.ansmarks;
    }
  });

  return totalMarks;
};
