// Initialize globals.
let totalCharCount = 0,
	totalPenalties = 0,
	totalWordCount = 0
percentAccuracy = 0

// Array of possible texts on which user will be tested.
const sampleTexts = [
	"Glamour cannot exist without personal social envy being a common and widespread emotion. The industrial society which has moved towards democracy and then stopped half way is the ideal society for generating such an emotion. The pursuit of individual happiness has been acknowledged as a universal right. Yet the existing social condition make the individual feel powerless. He lives in the contradiction between what he is and what he would like to be. Either he then becomes fully conscious of the contradiction and its causes, and so joins the political struggle for a full democracy which entails, amongst other things, the overthrow of capitalism; or else he lives, continually subject to an envy which, compounded with his sense of powerlessness, dissolves into recurrent day-dreams.",
	"We believe that we can change the things around us in accordance with our desires. We believe it because otherwise we can see no favourable outcome. We do not think of the outcome which generally comes to pass and is also favourable: we do not succeed in changing things in accordance with our desires, but gradually our desires change. The situation that we hoped to change because it was intolerable becomes unimportant to us. We have failed to surmount the obstacle, as we were absolutely determined to do, but life has taken us round it, led us beyond it, and then if we turn round to gaze into the distance of the past, we can barely see it, so imperceptible has it become.",
	"The most important things are the hardest to say. They are the things you get ashamed of, because words diminish them. Words shrink things that seemed limitless when they were in your head to no more than living size when they're brought out. But it's more than that, isn't it? The most important things lie too close to wherever your secret heart is buried, like landmarks to a treasure your enemies would love to steal away. And you may make revelations that cost you dearly only to have people look at you in a funny way, not understanding what you've said at all, or why you thought it was so important that you almost cried while you were saying it. That's the worst, I think. When the secret stays locked within not for want of a teller but for want of an understanding ear."
]

const timer = document.getElementById("timer"),
	timeLeft = document.getElementById("time-left"),
	inputField = document.getElementById("input-field"),
	template = document.getElementById("template"),
	results = document.getElementById("results"),
	startButton = document.getElementById("start-button"),
	text = sampleTexts[getRandomInt(0, sampleTexts.length)],
	splitText = text.split(" ")

function getRandomInt(min, max) {
	;(min = Math.ceil(min)), (max = Math.floor(max))
	return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

function enableInput(inputField) {
	inputField.disabled = false
	inputField.style.backgroundColor = "white"
	inputField.classList.remove("disabled")
	inputField.focus()
}

function displayText(splitText) {
	let templateStr = '<span id="current" class="word">' + splitText[0] + "</span> "
	for (let i = 1; i < splitText.length; i++)
		templateStr += ' <span class="word">' + splitText[i] + "</span>"
	template.innerHTML = templateStr
}

function startTimer() {
	let seconds_left = 60, // start with 60 seconds
		interval = setInterval(() => {
			timeLeft.innerHTML = --seconds_left
			if (seconds_left <= 30) timer.style.color = "orange"
			if (seconds_left <= 10) timer.style.color = "red"
			if (seconds_left <= 0) {
				clearInterval(interval)
				timeUp()
			}
		}, 1000) // 1-second intervals
}

function timeUp() {
	// When time remaining reaches zero...
	disableInput() // Disable input field.
	calculateScores() // Calculate user's scores.
	displayResults() // Show the results div with updated scores.
	document.getElementById("start-button").style.display = "none"
	document.getElementById("reset-button").innerHTML = "Try Again"
}

function disableInput() {
	inputField.disabled = true
	inputField.style.backgroundColor = "#f3f4f4"
	inputField.classList.add("disabled")
}

function getUserInput(currentIndex, inputField, splitText) {
	const highlighted = document.getElementById("current")
	inputField.addEventListener("keydown", function(event) {
		// Every time user presses spacebar...
		if (event.which === 32) {
			// If not at the end of the template...
			if (currentIndex + 1 < splitText.length) {
				let thisWord = inputField.value.trim()
				if (thisWord !== "") {
					// Only execute if they typed something
					// Update total character and word counts.
					totalCharCount += thisWord.length
					totalWordCount++
					// Update the user's total score.
					totalPenalties += getWordPenalty(currentIndex, splitText, thisWord)
					// Highlight the next word to be typed, and shift words as needed.
					updateSampleText(++currentIndex, splitText)
					inputField.value = "" // Clear the input field
				}
			} else {
				inputField.value = ""
				template.innerHTML = "Congrats! You reached the end of the test."
			}
		}
	})
}

function createCompoundString(words) {
	let compoundString = ""
	for (let i = 0; i < words.length; i++)
		compoundString += ' <span class="word">' + words[i] + "</span>"
	return compoundString
}

function inRange(num, lower, upper) {
	// Returns true IFF 'num' is within a specified range (lower inclusive, upper exclusive)
	return num >= lower && num < upper
}

function updateSampleText(currentIndex, splitText, offset) {
	// Wrap the current word in a span for highlighting.
	let currentWord = splitText[currentIndex],
		currentStr = ' <span id="current" class="word">' + currentWord + "</span> "

	let precedingWords, precedingWordsStr, followingWords, followingWordsStr, templateStr

	let rangeLower = 0,
		rangeUpper = 30

	// Build arrays containing words preceding and following the current word
	if (inRange(currentIndex, 0, 30)) {
		precedingWords = splitText.slice(0, currentIndex)
	} else if (inRange(currentIndex, 0 + 30, 30 + 30)) {
		precedingWords = splitText.slice(0 + 30, currentIndex)
	} else if (inRange(currentIndex, 0 + 60, 30 + 60)) {
		precedingWords = splitText.slice(0 + 60, currentIndex)
	} else if (inRange(currentIndex, 0 + 90, 30 + 90)) {
		precedingWords = splitText.slice(0 + 90, currentIndex)
	} else if (inRange(currentIndex, 0 + 120, 30 + 120)) {
		precedingWords = splitText.slice(0 + 120, currentIndex)
	}
	followingWords = splitText.slice(currentIndex + 1, splitText.length)

	// Turn those arrays into strings.
	precedingStr = createCompoundString(precedingWords)
	followingStr = createCompoundString(followingWords)

	// Concatenate the strings and display the updated template on the page.
	templateStr = precedingStr + currentStr + followingStr
	template.innerHTML = templateStr
}

function getWordPenalty(currentIndex, splitText, thisWord) {
	let userWord = thisWord,
		actualWord = splitText[currentIndex]

	if (userWord.length === 0 || actualWord.length === 0) return 0

	// Calculate the Levenshtein distance between what the user typed and what they should've typed.
	let matrix = []
	for (
		let i = 0;
		i <= actualWord.length;
		i++ // increment along the first column of each row
	)
		matrix[i] = [i]
	for (
		let j = 0;
		j <= userWord.length;
		j++ // increment each column in the first row
	)
		matrix[0][j] = j
	// Fill in the rest of the matrix
	for (i = 1; i <= actualWord.length; i++) {
		for (j = 1; j <= userWord.length; j++) {
			if (actualWord.charAt(i - 1) === userWord.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
			else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					Math.min(
						matrix[i][j - 1] + 1, // insertion
						matrix[i - 1][j] + 1
					)
				) // deletion
			}
		}
	}
	let levenshteinDist = matrix[actualWord.length][userWord.length]
	return levenshteinDist
}

function calculateScores(charCount, penaltyCount) {
	percentAccuracy = Math.round(((totalCharCount - totalPenalties) / totalCharCount) * 100)
}

function displayResults() {
	if (percentAccuracy < 0 || isNaN(percentAccuracy)) percentAccuracy = 0
	results.style.display = "block"
	results.innerHTML = `
		<ul>
			<li id="speed"><strong>Speed</strong>: ${totalWordCount} words per minute</li>
			<li id="accuracy"><strong>Accuracy</strong>: ${percentAccuracy} percent</li>
		</ul>`
}

document.addEventListener("DOMContentLoaded", function(event) {
	let currentIndex = 0
	let started = false
	// Begin test when user presses the spacebar (simulating start button click)
	window.addEventListener("keydown", function(event) {
		if (event.which === 32 && started === false) {
			event.preventDefault()
			started = true
			startButton.click()
		}
	})
	// Or begin test when user actually clicks the start button
	startButton.addEventListener("click", function() {
		started = true
		startButton.style.display = "none" // don't allow multiple timers going
		enableInput(inputField)
		displayText(splitText)
		startTimer()
		// While time remains, collect user input and keep track of score.
		getUserInput(currentIndex, inputField, splitText)
	})
})
