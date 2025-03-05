// based on: https://medium.com/@paulohfev/problem-solving-how-to-create-an-excerpt-fdb048687928

function createExcerpt (content, maxWords = 100, trailChars = '...') {
  const listOfWords = content.trim().split(' ')
  const truncatedContent = listOfWords.slice(0, maxWords).join(' ')
  const excerpt = truncatedContent + trailChars
  const output = listOfWords.length > maxWords ? excerpt : content
  return output
}

export default createExcerpt
