export const getNQuestions = (quesCount, quesList)=>{
  if (quesCount >= quesList.length) return quesList;  // edge case
  const startIndex = Math.floor(Math.random()*quesList.length);
  const questions = [];
   for (let i = 0; i < quesCount; i++) {
    const index = (startIndex + i) % quesList.length;
    questions.push(quesList[index]);
  }
  return questions;
}

export const CustomError = (statusCode, message)=>{
  const error = new Error(message);
  error.status = statusCode;
  return error;
}

// Fisher–Yates shuffle
export const shuffleArray = (array)=>{
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  }
}