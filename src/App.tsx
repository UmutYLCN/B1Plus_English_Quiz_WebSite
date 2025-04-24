import React, { useState, useEffect } from 'react'
import quizData from './data/questions.json'
import {
  Box,
  Container,
  Flex,
  Text,
  Heading,
  Button,
  Stack,
  HStack,
  Badge,
  Grid,
  GridItem,
  Input,
  Checkbox,
  VStack,
  Textarea,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react'
import { FaCheck, FaInfo, FaClock, FaChevronDown, FaChevronUp, FaVolumeUp, FaFileAlt } from 'react-icons/fa'

function App() {
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedLeftItem, setSelectedLeftItem] = useState<number | null>(null)
  const [completedPairs, setCompletedPairs] = useState<number[]>([])
  const [shuffledRightIndices, setShuffledRightIndices] = useState<number[]>([])
  const [matchFeedback, setMatchFeedback] = useState<{status: 'success' | 'error', index: number | null}>({
    status: 'success',
    index: null
  })
  const [selectWordAnswers, setSelectWordAnswers] = useState<number[]>([])
  const [orderingAnswers, setOrderingAnswers] = useState<string[]>([])
  const [orderingScores, setOrderingScores] = useState<boolean[]>([])
  const [errorCorrectionAnswers, setErrorCorrectionAnswers] = useState<string[]>([])
  const [noErrorChecks, setNoErrorChecks] = useState<boolean[]>([])
  const [errorCorrectionScores, setErrorCorrectionScores] = useState<boolean[]>([])
  const [sentenceRewriteAnswers, setSentenceRewriteAnswers] = useState<{[key: number]: string}>({})
  const [sentenceRewriteScores, setSentenceRewriteScores] = useState<{[key: number]: boolean}>({})
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null)
  const [animationState, setAnimationState] = useState<'correct' | 'incorrect' | null>(null)
  const [wordBoxAnswers, setWordBoxAnswers] = useState<string[]>([])
  const [wordBoxScores, setWordBoxScores] = useState<boolean[]>([])
  const [selectWordChecked, setSelectWordChecked] = useState<boolean>(false)
  const [selectWordCorrectness, setSelectWordCorrectness] = useState<boolean[]>([])
  const [isAudioscriptOpen, setIsAudioscriptOpen] = useState(false)
  const [isContentOpen, setIsContentOpen] = useState(false)

  // Move the useEffect hook to the top level of the component
  useEffect(() => {
    const question = quizData.questions[currentQuestion];
    
    // Initialize word box answers for both word_box_fill and fill_in_blank types
    if ((question.type === 'word_box_fill' || question.type === 'fill_in_blank') && question.sentences) {
      setWordBoxAnswers(Array(question.sentences.length).fill(''));
      setWordBoxScores(Array(question.sentences.length).fill(false));
    }
    
    // Reset collapse states when changing questions
    setIsAudioscriptOpen(false);
    setIsContentOpen(false);
  }, [currentQuestion, quizData.questions]);

  // Simple function to display alerts instead of toast
  const showAlert = (message: string) => {
    alert(message);
  }

  // Reset matching state when starting quiz
  const startQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setScore(0)
    setAnswers([])
    setShowResults(false)
    setSelectedLeftItem(null)
    setCompletedPairs([])
    setSelectWordAnswers([])
    setSelectWordChecked(false)
    setSelectWordCorrectness([])
    setOrderingAnswers(Array(5).fill(''))
    setOrderingScores(Array(5).fill(false))
    setErrorCorrectionAnswers(Array(10).fill(''))
    setNoErrorChecks(Array(10).fill(false))
    setErrorCorrectionScores(Array(10).fill(false))
    setSentenceRewriteAnswers({})
    setSentenceRewriteScores({})
    setIsAudioscriptOpen(false)
    setIsContentOpen(false)
    
    // Initialize the first question if it's a matching type
    if (quizData.questions[0].type === 'matching') {
      initializeMatchingQuestion(0)
    }
  }

  // Initialize matching question by shuffling the right column items
  const initializeMatchingQuestion = (questionIndex: number) => {
    const question = quizData.questions[questionIndex]
    if (question && question.type === 'matching' && question.matchingOptions) {
      const indices = Array.from(Array(question.matchingOptions.length).keys())
      setShuffledRightIndices(shuffleArray([...indices]))
      setSelectedLeftItem(null)
      setCompletedPairs([])
    }
  }

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const handleAnswer = (selectedOption: number) => {
    // Check for correctAnswer or correctAnswers property
    const currentQuestionData = quizData.questions[currentQuestion];
    const isCorrect = 'correctAnswer' in currentQuestionData ? 
      selectedOption === currentQuestionData.correctAnswer : 
      currentQuestionData.correctAnswers && 
      selectedOption === currentQuestionData.correctAnswers[0];
    
    if (isCorrect) {
      setScore(score + 1)
    }
    
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedOption
    setAnswers(newAnswers)
    
    const nextQuestion = currentQuestion + 1
    if (nextQuestion < quizData.questions.length) {
      setTimeout(() => {
        setCurrentQuestion(nextQuestion)
        // Initialize matching question if the next question is a matching type
        if (quizData.questions[nextQuestion].type === 'matching') {
          initializeMatchingQuestion(nextQuestion)
        }
      }, 500)
    } else {
      setShowResults(true)
    }
  }

  const selectLeftItem = (index: number) => {
    if (completedPairs.includes(index)) return
    setSelectedLeftItem(index)
  }

  const selectRightItem = (index: number) => {
    if (selectedLeftItem === null) return
    if (completedPairs.includes(selectedLeftItem)) return
    
    const currentQuestionData = quizData.questions[currentQuestion]
    const originalRightIndex = shuffledRightIndices[index]
    
    // Check if this is the correct match
    if (currentQuestionData.correctAnswers && 
        selectedLeftItem < currentQuestionData.correctAnswers.length &&
        currentQuestionData.correctAnswers[selectedLeftItem] === originalRightIndex) {
      
      // Add to completed pairs
      setCompletedPairs([...completedPairs, selectedLeftItem])
      
      // Show success feedback
      setMatchFeedback({ status: 'success', index });
      setTimeout(() => setMatchFeedback({ status: 'success', index: null }), 1000);
      
      // Clear selected left item
      setSelectedLeftItem(null)
    } else {
      // Show error feedback
      setMatchFeedback({ status: 'error', index });
      setTimeout(() => setMatchFeedback({ status: 'success', index: null }), 1000);
    }
  }

  const isMatchingComplete = () => {
    const question = quizData.questions[currentQuestion]
    if (question.type !== 'matching' || !question.options) return false
    return completedPairs.length === question.options.length
  }

  const handleSelectWord = (sentenceIndex: number, optionIndex: number) => {
    const newAnswers = [...selectWordAnswers]
    newAnswers[sentenceIndex] = optionIndex
    setSelectWordAnswers(newAnswers)
  }

  const handleOrderingInput = (index: number, value: string) => {
    const newAnswers = [...orderingAnswers]
    newAnswers[index] = value
    setOrderingAnswers(newAnswers)
    
    // Check if the answer is correct
    const question = quizData.questions[currentQuestion]
    if (question.type === 'sentence_ordering' && question.correctAnswers) {
      const correctAnswer = question.correctAnswers[index]
      // Ensure we have strings before performing string operations
      const userAnswer = typeof value === 'string' ? value.trim().toLowerCase() : '';
      const correctTrimmed = typeof correctAnswer === 'string' ? correctAnswer.trim().toLowerCase() : '';
      const isCorrect = userAnswer === correctTrimmed
      
      const newScores = [...orderingScores]
      newScores[index] = isCorrect
      setOrderingScores(newScores)
    }
  }

  const handleErrorCorrectionInput = (index: number, value: string) => {
    const newAnswers = [...errorCorrectionAnswers]
    newAnswers[index] = value
    setErrorCorrectionAnswers(newAnswers)
    
    // Check if the answer is correct
    const question = quizData.questions[currentQuestion]
    if (question.type === 'error_correction' && question.corrections && question.hasNoError) {
      const correction = question.corrections[index]
      const hasNoError = question.hasNoError[index]
      
      // If sentence has no error, check against the checkbox
      if (hasNoError) {
        const newScores = [...errorCorrectionScores]
        newScores[index] = noErrorChecks[index] === true
        setErrorCorrectionScores(newScores)
      } else if (correction) {
        // Otherwise compare with the correction
        const userAnswer = typeof value === 'string' ? value.trim().toLowerCase() : '';
        const correctTrimmed = typeof correction === 'string' ? correction.trim().toLowerCase() : '';
        const isCorrect = userAnswer === correctTrimmed
        
        const newScores = [...errorCorrectionScores]
        newScores[index] = isCorrect
        setErrorCorrectionScores(newScores)
      }
    }
  }

  const handleSentenceRewriteInput = (id: number, value: string) => {
    setSentenceRewriteAnswers(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleNoErrorCheck = (index: number, checked: boolean) => {
    const newChecks = [...noErrorChecks]
    newChecks[index] = checked
    setNoErrorChecks(newChecks)
    
    // Also update the scores
    const question = quizData.questions[currentQuestion]
    if (question.type === 'error_correction' && question.hasNoError) {
      const hasNoError = question.hasNoError[index]
      
      const newScores = [...errorCorrectionScores]
      newScores[index] = checked === hasNoError
      setErrorCorrectionScores(newScores)
    }
  }

  const checkSelectWordScore = () => {
    const question = quizData.questions[currentQuestion]
    if (question.type !== 'select_correct_word' || !question.correctAnswers) return 0
    
    let correctCount = 0
    for (let i = 0; i < question.correctAnswers.length; i++) {
      if (selectWordAnswers[i] === question.correctAnswers[i]) {
        correctCount++
      }
    }
    
    return correctCount
  }

  const checkOrderingScore = () => {
    return orderingScores.filter(correct => correct).length
  }

  const checkErrorCorrectionScore = () => {
    return errorCorrectionScores.filter(correct => correct).length
  }

  const checkSentenceRewriteScore = () => {
    return sentenceRewriteScores[currentQuestion] === true ? 1 : 0
  }

  const checkWordBoxScore = () => {
    let score = 0;
    wordBoxAnswers.forEach((answer, idx) => {
      if (answer && wordBoxScores[idx]) {
        score++;
      }
    });
    return score;
  };

  const nextQuestion = () => {
    // Add to score based on question type
    const question = quizData.questions[currentQuestion]
    
    if (question.type === 'matching' && isMatchingComplete()) {
      setScore(score + 1)
    } else if (question.type === 'select_correct_word') {
      setScore(score + checkSelectWordScore())
    } else if (question.type === 'sentence_ordering') {
      setScore(score + checkOrderingScore())
    } else if (question.type === 'error_correction') {
      setScore(score + checkErrorCorrectionScore())
    } else if (question.type === 'sentence_rewrite') {
      setScore(score + checkSentenceRewriteScore())
    } else if (question.type === 'word_box_fill') {
      setScore(score + checkWordBoxScore())
    }
    
    const nextQuestion = currentQuestion + 1
    if (nextQuestion < quizData.questions.length) {
      setCurrentQuestion(nextQuestion)
      // Initialize matching question if the next question is a matching type
      if (quizData.questions[nextQuestion].type === 'matching') {
        initializeMatchingQuestion(nextQuestion)
      }
      
      // Reset state for the new question
      setSelectWordAnswers([])
      setSelectWordChecked(false)
      setSelectWordCorrectness([])
      setOrderingAnswers(Array(5).fill(''))
      setOrderingScores(Array(5).fill(false))
      setErrorCorrectionAnswers(Array(10).fill(''))
      setNoErrorChecks(Array(10).fill(false))
      setErrorCorrectionScores(Array(10).fill(false))
      setSentenceRewriteAnswers({})
      setSentenceRewriteScores({})
      setWordBoxAnswers([])
      setWordBoxScores([])
    } else {
      setShowResults(true)
    }
  }

  const restartQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setScore(0)
    setAnswers([])
    setShowResults(false)
    setSelectedLeftItem(null)
    setCompletedPairs([])
    setSelectWordAnswers([])
    setSelectWordChecked(false)
    setSelectWordCorrectness([])
    setOrderingAnswers(Array(5).fill(''))
    setOrderingScores(Array(5).fill(false))
    setErrorCorrectionAnswers(Array(10).fill(''))
    setNoErrorChecks(Array(10).fill(false))
    setErrorCorrectionScores(Array(10).fill(false))
    setSentenceRewriteAnswers({})
    setSentenceRewriteScores({})
    setWordBoxAnswers(Array(quizData.questions[currentQuestion].sentences?.length || 0).fill(''))
    setWordBoxScores(Array(quizData.questions[currentQuestion].sentences?.length || 0).fill(false))
  }

  const renderMatchingQuestion = () => {
    const question = quizData.questions[currentQuestion]
    
    if (question.type !== 'matching' || !question.options || !question.matchingOptions) {
      return null
    }

  return (
      <Stack direction="column" gap={6} width="full">
        <Box width="full">
          <Badge colorScheme="blue" mb={2} p={1}>Matching Question</Badge>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Match each item from the left column with its correct match in the right column
          </Text>
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            {/* Left Column */}
            <GridItem>
              <Text fontWeight="medium" color="gray.700" mb={3}>Left Column</Text>
              <Stack direction="column" gap={3}>
                {question.options.map((option, index) => (
                  <Box
                    key={index}
                    borderWidth={completedPairs.includes(index) ? "2px" : selectedLeftItem === index ? "2px" : "1px"}
                    borderColor={completedPairs.includes(index) ? "green.300" : selectedLeftItem === index ? "blue.300" : "gray.200"}
                    bg={completedPairs.includes(index) ? "green.50" : selectedLeftItem === index ? "blue.50" : "white"}
                    opacity={completedPairs.includes(index) ? 0.9 : 1}
                    cursor={completedPairs.includes(index) ? "default" : "pointer"}
                    _hover={completedPairs.includes(index) ? {} : { borderColor: "blue.300" }}
                    onClick={() => selectLeftItem(index)}
                    p={3}
                    borderRadius="md"
                  >
                    <HStack>
                      <Flex
                        w="32px"
                        h="32px"
                        borderRadius="full"
                        bg={completedPairs.includes(index) ? "green.100" : "blue.100"}
                        color={completedPairs.includes(index) ? "green.700" : "blue.700"}
                        justify="center"
                        align="center"
                        fontWeight="bold"
                        mr={3}
                      >
                        {index + 1}
                      </Flex>
                      <Text>{option}</Text>
                      
                      {completedPairs.includes(index) && (
                        <Box as={FaCheck} ml="auto" color="green.500" />
                      )}
                    </HStack>
                  </Box>
                ))}
              </Stack>
            </GridItem>
            
            {/* Right Column */}
            <GridItem>
              <Text fontWeight="medium" color="gray.700" mb={3}>Right Column</Text>
              <Stack direction="column" gap={3}>
                {shuffledRightIndices.map((originalIndex, shuffledIndex) => {
                  const isMatched = completedPairs.some(leftIndex => 
                    question.correctAnswers && question.correctAnswers[leftIndex] === originalIndex
                  )
                  const matchedLeftIndex = completedPairs.find(leftIndex => 
                    question.correctAnswers && question.correctAnswers[leftIndex] === originalIndex
                  )
                  
                  return (
                    <Box
                      key={shuffledIndex}
                      borderWidth={isMatched ? "2px" : matchFeedback.index === shuffledIndex ? "2px" : "1px"}
                      borderColor={
                        isMatched ? "green.300" : 
                        matchFeedback.index === shuffledIndex && matchFeedback.status === 'error' ? "red.300" : 
                        "gray.200"
                      }
                      bg={
                        isMatched ? "green.50" : 
                        matchFeedback.index === shuffledIndex && matchFeedback.status === 'error' ? "red.50" : 
                        "white"
                      }
                      opacity={isMatched ? 0.9 : selectedLeftItem === null ? 0.7 : 1}
                      cursor={isMatched || selectedLeftItem === null ? "default" : "pointer"}
                      _hover={isMatched || selectedLeftItem === null ? {} : { borderColor: "blue.300" }}
                      onClick={() => selectRightItem(shuffledIndex)}
                      p={3}
                      borderRadius="md"
                      transition="all 0.2s"
                    >
                      <HStack>
                        <Flex
                          w="32px"
                          h="32px"
                          borderRadius="full"
                          bg={isMatched ? "green.100" : "blue.100"}
                          color={isMatched ? "green.700" : "blue.700"}
                          justify="center"
                          align="center"
                          fontWeight="bold"
                          mr={3}
                        >
                          {String.fromCharCode(65 + shuffledIndex)}
                        </Flex>
                        <Text>{question.matchingOptions[originalIndex]}</Text>
                        
                        {isMatched && matchedLeftIndex !== undefined && (
                          <Flex
                            ml="auto"
                            w="24px"
                            h="24px"
                            borderRadius="full"
                            bg="green.100"
                            color="green.700"
                            justify="center"
                            align="center"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            {matchedLeftIndex + 1}
                          </Flex>
                        )}
                      </HStack>
                    </Box>
                  )
                })}
              </Stack>
            </GridItem>
          </Grid>
        </Box>

        <HStack gap={4} justifyContent="center">
          <Button
            colorScheme="blue"
            disabled={!isMatchingComplete()}
            onClick={nextQuestion}
            size="lg"
            width={{ base: "full", md: "auto" }}
          >
            {isMatchingComplete() ? 'Next Question' : `${completedPairs.length}/${question.options.length} Matches Completed`}
          </Button>
          
          <Button
            colorScheme="gray"
            onClick={nextQuestion}
            size="lg"
            width={{ base: "full", md: "auto" }}
          >
            Skip
          </Button>
        </HStack>
      </Stack>
    )
  }

  const renderSelectWordQuestion = () => {
    const question = quizData.questions[currentQuestion]
    
    if (question.type !== 'select_correct_word' || !question.sentences || !question.options) {
      return null
    }
    
    const checkAnswers = () => {
      if (!question.correctAnswers) return;
      
      // Create array to store which answers are correct
      const correctness = question.sentences.map((_, idx) => {
        return selectWordAnswers[idx] === question.correctAnswers![idx];
      });
      
      setSelectWordCorrectness(correctness);
      setSelectWordChecked(true);
    };
    
    // Function to get button color based on answer status
    const getButtonColorScheme = (sentenceIdx: number, optionIdx: number) => {
      // If answers haven't been checked yet, show selected option in blue
      if (!selectWordChecked) {
        return selectWordAnswers[sentenceIdx] === optionIdx ? "blue" : "gray";
      }
      
      // After checking, show correct/incorrect status
      const isSelected = selectWordAnswers[sentenceIdx] === optionIdx;
      if (!isSelected) return "gray"; // Not selected, stay gray
      
      // Selected option
      return selectWordCorrectness[sentenceIdx] ? "green" : "red";
    };
    
    return (
      <Stack direction="column" gap={6} width="full">
        <Box width="full">
          <Badge colorScheme="blue" mb={2} p={1}>Word Selection</Badge>
          
          {question.example && (
            <Box mb={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontWeight="medium" mb={1}>Example:</Text>
              <Text>{question.example}</Text>
              <Text fontWeight="medium" color="blue.600">
                Correct answer: <Text as="span" fontStyle="italic">{question.exampleAnswer}</Text>
              </Text>
            </Box>
          )}
          
          <Stack gap={6} mt={4}>
            {question.sentences.map((sentence, idx) => (
              <Box 
                key={idx} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="white"
                borderColor={
                  selectWordChecked
                    ? selectWordCorrectness[idx] ? "green.300" : "red.300" 
                    : "gray.200"
                }
              >
                <Text fontWeight="medium" mb={3}>{idx + 1}. {sentence}</Text>
                
                <HStack gap={6}>
                  {question.options[idx].map((option, optIdx) => (
                    <Button 
                      key={optIdx} 
                      onClick={() => !selectWordChecked && handleSelectWord(idx, optIdx)}
                      colorScheme={getButtonColorScheme(idx, optIdx)}
                      variant={selectWordAnswers[idx] === optIdx ? "solid" : "outline"}
                      size="md"
                      disabled={selectWordChecked}
                    >
                      {option}
                    </Button>
                  ))}
                </HStack>
              </Box>
            ))}
          </Stack>
        </Box>
        
        <HStack justify="center" gap={4} mt={4}>
          {!selectWordChecked ? (
            <Button
              colorScheme="teal"
              onClick={checkAnswers}
              size="lg"
              width={{ base: "full", md: "auto" }}
              disabled={selectWordAnswers.length < question.sentences.length}
            >
              Check Answers
            </Button>
          ) : (
            <>
              <Badge colorScheme="green" p={2} fontSize="md">
                Score: {selectWordCorrectness.filter(correct => correct).length}/{question.sentences.length}
              </Badge>
              <Button
                colorScheme="blue"
                onClick={nextQuestion}
                size="lg"
                width={{ base: "full", md: "auto" }}
              >
                Next Question
              </Button>
            </>
          )}
        </HStack>
      </Stack>
    )
  }

  const renderSentenceOrderingQuestion = () => {
    const question = quizData.questions[currentQuestion]
    
    if (question.type !== 'sentence_ordering' || !question.sentences) {
      return null
    }
    
    return (
      <Stack direction="column" gap={6} width="full">
        <Box width="full">
          <Badge colorScheme="blue" mb={2} p={1}>Sentence Ordering</Badge>
          
          {question.example && (
            <Box mb={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontWeight="medium" mb={1}>Example:</Text>
              <Text>{question.example}</Text>
              <Text fontWeight="medium" color="blue.600">
                Correct answer: <Text as="span" fontStyle="italic">{question.exampleAnswer}</Text>
              </Text>
            </Box>
          )}
          
          <Stack gap={6} mt={4}>
            {question.sentences.map((sentence, idx) => (
              <Box key={idx} p={4} borderWidth="1px" borderRadius="md" bg="white">
                <Text fontWeight="medium" mb={3}>{idx + 1}. {sentence}</Text>
                
                <Box>
                  <Text mb={2}>Your answer:</Text>
                  <Input
                    value={orderingAnswers[idx] || ''}
                    onChange={(e) => handleOrderingInput(idx, e.target.value)}
                    placeholder="Type the correct sentence here"
                    borderColor={
                      orderingAnswers[idx] 
                        ? orderingScores[idx] ? "green.300" : "red.300" 
                        : "gray.200"
                    }
                    _hover={{ borderColor: orderingAnswers[idx] ? (orderingScores[idx] ? "green.400" : "red.400") : "gray.300" }}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
        
        <HStack justify="space-between" mt={4}>
          <Badge colorScheme="green" p={2} fontSize="md">
            Score: {checkOrderingScore()}/5
          </Badge>
          
          <Button
            colorScheme="blue"
            onClick={nextQuestion}
            size="lg"
            width={{ base: "full", md: "auto" }}
          >
            Next Question
          </Button>
        </HStack>
      </Stack>
    )
  }

  const renderErrorCorrectionQuestion = () => {
    const question = quizData.questions[currentQuestion]
    
    if (question.type !== 'error_correction' || !question.sentences || !question.hasNoError) {
      return null
    }
    
    return (
      <Stack direction="column" gap={6} width="full">
        <Box width="full">
          <Badge colorScheme="blue" mb={2} p={1}>Error Correction</Badge>
          
          {question.example && (
            <Box mb={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontWeight="medium" mb={1}>Example:</Text>
              <Text>{question.example}</Text>
              <Text fontWeight="medium" color="blue.600">
                Correct answer: <Text as="span" fontStyle="italic">{question.exampleAnswer}</Text>
              </Text>
            </Box>
          )}
          
          <Stack gap={6} mt={4}>
            {question.sentences.map((sentence, idx) => (
              <Box key={idx} p={4} borderWidth="1px" borderRadius="md" bg="white">
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="medium">{idx + 1}. {sentence}</Text>
                  <Button 
                    size="sm"
                    colorScheme={noErrorChecks[idx] ? "green" : "gray"}
                    variant={noErrorChecks[idx] ? "solid" : "outline"}
                    onClick={() => handleNoErrorCheck(idx, !noErrorChecks[idx])}
                  >
                    {noErrorChecks[idx] && <Box as={FaCheck} mr={2} />}
                    No Error (✓)
                  </Button>
                </HStack>
                
                <Box>
                  <Text mb={2}>Correction (leave blank if no error):</Text>
                  <Input
                    value={errorCorrectionAnswers[idx] || ''}
                    onChange={(e) => handleErrorCorrectionInput(idx, e.target.value)}
                    placeholder="Type the corrected sentence here"
                    disabled={noErrorChecks[idx]}
                    borderColor={
                      errorCorrectionAnswers[idx] || noErrorChecks[idx]
                        ? errorCorrectionScores[idx] ? "green.300" : "red.300" 
                        : "gray.200"
                    }
                    _hover={{ 
                      borderColor: (errorCorrectionAnswers[idx] || noErrorChecks[idx]) 
                        ? (errorCorrectionScores[idx] ? "green.400" : "red.400") 
                        : "gray.300" 
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
        
        <HStack justify="space-between" mt={4}>
          <Badge colorScheme="green" p={2} fontSize="md">
            Score: {checkErrorCorrectionScore()}/10
          </Badge>
          
          <Button
            colorScheme="blue"
            onClick={nextQuestion}
            size="lg"
            width={{ base: "full", md: "auto" }}
          >
            Next Question
          </Button>
        </HStack>
      </Stack>
    )
  }

  const renderSentenceRewriteQuestion = () => {
    const question = quizData.questions[currentQuestion]
    
    if (question.type !== 'sentence_rewrite' || !question.sentences) {
      return null
    }

    // Type guard for the example object
    const hasStructuredExample = question.example && 
      typeof question.example === 'object' && 
      'original' in question.example &&
      'partial' in question.example &&
      'answer' in question.example
    
    return (
      <Stack direction="column" gap={6} width="full">
        <Box width="full">
          <Badge colorScheme="blue" mb={2} p={1}>Sentence Rewrite</Badge>
          
          {hasStructuredExample && (
            <Box mb={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontWeight="medium" mb={1}>Example:</Text>
              <Text>{question.example.original}</Text>
              <Text fontStyle="italic" mt={1}>{question.example.partial}</Text>
              <Text fontWeight="medium" color="blue.600" mt={2}>
                Correct answer: <Text as="span" fontStyle="italic">{question.example.answer}</Text>
              </Text>
            </Box>
          )}
          
          <Stack gap={6} mt={4}>
            {question.sentences.map((sentence, idx) => {
              // Type guard for each sentence object
              const isStructuredSentence = 
                typeof sentence === 'object' && 
                'original' in sentence &&
                'partial' in sentence

              if (!isStructuredSentence) return null
              
              return (
                <Box key={idx} p={4} borderWidth="1px" borderRadius="md" bg="white">
                  <Text fontWeight="medium" mb={1}>{idx + 1}. {sentence.original}</Text>
                  <Text fontStyle="italic" color="blue.700" mb={3}>{sentence.partial}</Text>
                  
                  <Box>
                    <Text mb={2}>Your answer:</Text>
                    <Input
                      value={sentenceRewriteAnswers[idx] || ''}
                      onChange={(e) => handleSentenceRewriteInput(idx, e.target.value)}
                      placeholder="Complete the sentence"
                      borderColor={
                        sentenceRewriteAnswers[idx] 
                          ? sentenceRewriteScores[idx] ? "green.300" : "red.300" 
                          : "gray.200"
                      }
                      _hover={{ 
                        borderColor: sentenceRewriteAnswers[idx] 
                          ? (sentenceRewriteScores[idx] ? "green.400" : "red.400") 
                          : "gray.300" 
                      }}
                    />
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
        
        <HStack justify="space-between" mt={4}>
          <Badge colorScheme="green" p={2} fontSize="md">
            Score: {checkSentenceRewriteScore()}/1
          </Badge>
          
          <Button
            colorScheme="blue"
            onClick={nextQuestion}
            size="lg"
            width={{ base: "full", md: "auto" }}
          >
            Next Question
          </Button>
        </HStack>
      </Stack>
    )
  }

  const renderWordBoxFillQuestion = () => {
    const question = quizData.questions[currentQuestion];
    
    const handleWordBoxAnswer = (index: number, value: string) => {
      const newAnswers = [...wordBoxAnswers];
      newAnswers[index] = value;
      setWordBoxAnswers(newAnswers);
      
      // Check if the answer is correct
      const newScores = [...wordBoxScores];
      const correctAnswer = question.answers && (
        Array.isArray(question.answers[index]) 
          ? question.answers[index][0] 
          : question.answers[index]
      );
      newScores[index] = correctAnswer ? value.toLowerCase().trim() === correctAnswer.toLowerCase().trim() : false;
      setWordBoxScores(newScores);
    };
    
    // Handle missing data to prevent errors
    if (!question.sentences || !question.wordBox || !question.answers) {
      return <Text>Question data is incomplete</Text>;
    }
    
    return (
      <Stack gap={6}>
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>Example:</Text>
          {question.example && typeof question.example === 'string' && (
            <Text>
              {question.example.split('______').map((part, i) => (
                i === 0 ? 
                  <React.Fragment key={i}>{part}<Text as="span" fontWeight="bold" color="green.600">{question.exampleAnswer}</Text></React.Fragment> : 
                  <React.Fragment key={i}>{part}</React.Fragment>
              ))}
            </Text>
          )}
        </Box>
        
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>Word Box:</Text>
          <Flex flexWrap="wrap" gap={2}>
            {question.wordBox.map((word: string, idx: number) => (
              <Badge key={idx} p={2} fontSize="md" colorScheme="blue">
                {word}
              </Badge>
            ))}
          </Flex>
        </Box>
        
        <Stack gap={4}>
          {question.sentences.map((sentence: string, idx: number) => {
            const parts = sentence.split('______');
            
            return (
              <Box key={idx} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                <Flex align="center">
                  <Text mr={2}>{idx + 1}.</Text>
                  <Text>{parts[0]}</Text>
                  <Input
                    value={wordBoxAnswers[idx] || ''}
                    onChange={(e) => handleWordBoxAnswer(idx, e.target.value)}
                    placeholder="Enter word"
                    width="150px"
                    borderColor={
                      wordBoxAnswers[idx] 
                        ? wordBoxScores[idx] ? "green.300" : "red.300" 
                        : "gray.200"
                    }
                    _hover={{ 
                      borderColor: wordBoxAnswers[idx] 
                        ? (wordBoxScores[idx] ? "green.400" : "red.400") 
                        : "gray.300" 
                    }}
                    mx={2}
                  />
                  <Text>{parts[1]}</Text>
                </Flex>
              </Box>
            );
          })}
        </Stack>
        
        <HStack justify="space-between" mt={4}>
          <Badge colorScheme="green" p={2} fontSize="md">
            Score: {checkWordBoxScore()}/{question.sentences.length}
          </Badge>
          
          <Button
            colorScheme="blue"
            onClick={nextQuestion}
            size="lg"
            width={{ base: "full", md: "auto" }}
          >
            Next Question
          </Button>
        </HStack>
      </Stack>
    );
  };

  const renderFillInBlankQuestion = () => {
    const question = quizData.questions[currentQuestion];
    
    if (question.type !== 'fill_in_blank' || !question.sentences) {
      return null;
    }
    
    const handleFillInBlankAnswer = (index: number, value: string) => {
      const newAnswers = [...wordBoxAnswers];
      newAnswers[index] = value;
      setWordBoxAnswers(newAnswers);
      
      // Check if the answer is correct
      const newScores = [...wordBoxScores];
      const correctAnswer = question.answers?.[index];
      
      // Check if correctAnswer exists and handle it correctly
      if (correctAnswer) {
        // If it's a string, compare directly
        if (typeof correctAnswer === 'string') {
          newScores[index] = value.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        }
        // If it's an array, check if the value is in the array
        else if (Array.isArray(correctAnswer)) {
          newScores[index] = correctAnswer.some(
            answer => typeof answer === 'string' && value.toLowerCase().trim() === answer.toLowerCase().trim()
          );
        }
      } else {
        newScores[index] = false;
      }
      
      setWordBoxScores(newScores);
    };
    
    return (
      <Stack gap={6}>
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>Example:</Text>
          {typeof question.example === 'string' && (
            <Text>
              {question.example.split('______').map((part, i: number) => (
                i === 0 ? 
                  <React.Fragment key={i}>{part}<Text as="span" fontWeight="bold" color="green.600">{question.exampleAnswer}</Text></React.Fragment> : 
                  <React.Fragment key={i}>{part}</React.Fragment>
              ))}
            </Text>
          )}
        </Box>
        
        <Stack gap={4}>
          {question.sentences.map((sentence: string, idx: number) => {
            // Split on blank marker in the text
            const parts = sentence.split('_______');
            
            return (
              <Box key={idx} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                <Flex align="center" flexWrap="wrap">
                  <Text mr={2}>{idx + 1}.</Text>
                  <Text>{parts[0]}</Text>
                  <Input
                    value={wordBoxAnswers[idx] || ''}
                    onChange={(e) => handleFillInBlankAnswer(idx, e.target.value)}
                    placeholder="Enter word"
                    width="150px"
                    borderColor={
                      wordBoxAnswers[idx] 
                        ? wordBoxScores[idx] ? "green.300" : "red.300" 
                        : "gray.200"
                    }
                    _hover={{ 
                      borderColor: wordBoxAnswers[idx] 
                        ? (wordBoxScores[idx] ? "green.400" : "red.400") 
                        : "gray.300" 
                    }}
                    mx={2}
                  />
                  <Text>{parts[1] || ''}</Text>
                </Flex>
              </Box>
            );
          })}
        </Stack>
        
        <HStack justify="space-between" mt={4}>
          <Badge colorScheme="green" p={2} fontSize="md">
            Score: {checkWordBoxScore()}/{question.sentences.length}
          </Badge>
          
          <Button
            colorScheme="blue"
            onClick={nextQuestion}
            size="lg"
            width={{ base: "full", md: "auto" }}
          >
            Next Question
          </Button>
        </HStack>
      </Stack>
    );
  };

  const renderQuestion = () => {
    const question = quizData.questions[currentQuestion]
    
    if (question.type === 'matching') {
      return renderMatchingQuestion()
    } else if (question.type === 'select_correct_word') {
      return renderSelectWordQuestion()
    } else if (question.type === 'sentence_ordering') {
      return renderSentenceOrderingQuestion()
    } else if (question.type === 'error_correction') {
      return renderErrorCorrectionQuestion()
    } else if (question.type === 'sentence_rewrite') {
      return renderSentenceRewriteQuestion()
    } else if (question.type === 'word_box_fill') {
      return renderWordBoxFillQuestion()
    } else if (question.type === 'fill_in_blank') {
      return renderFillInBlankQuestion()
    }
    
    return (
      <Stack direction="column" gap={4} align="stretch">
        {question.options?.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswer(index)}
            size="lg"
            variant="outline"
            colorScheme="blue"
            justifyContent="flex-start"
            p={6}
            whiteSpace="normal"
            textAlign="left"
            height="auto"
            _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
          >
            {option}
          </Button>
        ))}
      </Stack>
    )
  }

  // Render quiz results
  const renderResults = () => {
    const scorePercentage = Math.round((score / quizData.questions.length) * 100)
    
    return (
      <Stack gap={6} textAlign="center" p={6} bg="white" borderRadius="lg" boxShadow="xl">
        <Heading fontSize="3xl" mb={2}>Quiz Results</Heading>
        
        <Flex justify="center" align="center" direction="column">
          <Box
            position="relative"
            width="150px"
            height="150px"
            bg={scorePercentage >= 70 ? "green.100" : scorePercentage >= 40 ? "orange.100" : "red.100"}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={4}
          >
            <Text fontSize="3xl" fontWeight="bold" color={scorePercentage >= 70 ? "green.600" : scorePercentage >= 40 ? "orange.600" : "red.600"}>
              {scorePercentage}%
            </Text>
          </Box>
          
          <Text fontSize="xl" mb={2}>
            You scored <strong>{score}</strong> out of <strong>{quizData.questions.length}</strong> questions
          </Text>
          
          <Badge 
            fontSize="md" 
            colorScheme={scorePercentage >= 70 ? "green" : scorePercentage >= 40 ? "orange" : "red"}
            p={2}
            borderRadius="md"
          >
            {scorePercentage >= 70 ? "Excellent!" : scorePercentage >= 40 ? "Good effort!" : "Keep practicing!"}
          </Badge>
        </Flex>
        
        <Button
          colorScheme="blue"
          size="lg"
          onClick={restartQuiz}
          mt={6}
        >
          Restart Quiz
        </Button>
      </Stack>
    )
  }

  // Render start screen
  const renderStartScreen = () => {
    return (
      <Stack gap={6} textAlign="center" p={6} bg="white" borderRadius="lg" boxShadow="xl">
        <Heading fontSize="3xl" mb={2}>{quizData.quizTitle}</Heading>
        <Text fontSize="lg">{quizData.description}</Text>
        
        <Stack direction="row" justify="center" gap={6} mt={2}>
          <Flex align="center" direction="column">
            <Flex align="center" mb={1}>
              <FaInfo size="1.2em" color="#4299E1" />
              <Text ml={2} fontWeight="bold">Questions</Text>
            </Flex>
            <Text>{quizData.totalQuestions}</Text>
          </Flex>
          
          <Flex align="center" direction="column">
            <Flex align="center" mb={1}>
              <FaClock size="1.2em" color="#4299E1" />
              <Text ml={2} fontWeight="bold">Time Limit</Text>
            </Flex>
            <Text>{quizData.timeLimit} minutes</Text>
          </Flex>
        </Stack>
        
        <Button
          colorScheme="blue"
          size="lg"
          onClick={startQuiz}
          mt={4}
        >
          Start Quiz
        </Button>
      </Stack>
    )
  }

  // Render collapsible audioscript section if available
  const renderAudioscriptSection = () => {
    const question = quizData.questions[currentQuestion];
    
    if (!question.audioscript) return null;
    
    return (
      <Box mt={4} borderWidth="1px" borderRadius="md" overflow="hidden">
        <Flex 
          p={3} 
          bg="blue.50" 
          alignItems="center" 
          justifyContent="space-between"
          cursor="pointer"
          onClick={() => setIsAudioscriptOpen(!isAudioscriptOpen)}
        >
          <HStack>
            <FaVolumeUp />
            <Text fontWeight="bold">Audioscript</Text>
          </HStack>
          <IconButton
            aria-label={isAudioscriptOpen ? "Collapse" : "Expand"}
            as={isAudioscriptOpen ? FaChevronUp : FaChevronDown}
            size="sm"
            variant="ghost"
          />
        </Flex>
        {isAudioscriptOpen && (
          <Box p={4} bg="gray.50" whiteSpace="pre-line">
            <Text>{question.audioscript}</Text>
          </Box>
        )}
      </Box>
    );
  };

  // Render collapsible content section if available
  const renderContentSection = () => {
    const question = quizData.questions[currentQuestion];
    
    if (!question.content) return null;
    
    return (
      <Box mt={4} borderWidth="1px" borderRadius="md" overflow="hidden">
        <Flex 
          p={3} 
          bg="blue.50" 
          alignItems="center" 
          justifyContent="space-between"
          cursor="pointer"
          onClick={() => setIsContentOpen(!isContentOpen)}
        >
          <HStack>
            <FaFileAlt />
            <Text fontWeight="bold">Reading Text</Text>
          </HStack>
          <IconButton
            aria-label={isContentOpen ? "Collapse" : "Expand"}
            as={isContentOpen ? FaChevronUp : FaChevronDown}
            size="sm"
            variant="ghost"
          />
        </Flex>
        {isContentOpen && (
          <Box p={4} bg="gray.50" whiteSpace="pre-line">
            <Text>{question.content}</Text>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxW="container.md" centerContent py={8}>
      <Box width="100%" p={6} bg="gray.50" borderRadius="xl">
        {showResults ? (
          renderResults()
        ) : !quizStarted ? (
          renderStartScreen()
        ) : (
          <Stack gap={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Badge colorScheme="blue" p={2} borderRadius="md" fontSize="md">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </Badge>
              <Badge colorScheme="green" p={2} borderRadius="md" fontSize="md">
                Score: {score}
              </Badge>
            </Flex>
            
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
              <Heading as="h2" size="lg" mb={4}>
                {quizData.questions[currentQuestion].question}
              </Heading>
              
              {renderAudioscriptSection()}
              {renderContentSection()}
              
              <Box mt={4}>
                {renderQuestion()}
              </Box>
            </Box>
          </Stack>
        )}
      </Box>
    </Container>
  );
}

export default App
