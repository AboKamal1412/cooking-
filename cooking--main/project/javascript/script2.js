document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer-display');
    const startButton = document.getElementById('start-timer');
    const resetButton = document.getElementById('reset-timer');
    const cookTimeValue = parseInt(document.getElementById('cook-time-value').textContent, 10) * 60; // Convert minutes to seconds
    let timer = cookTimeValue;
    let interval;

    // Function to format time as MM:SS
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Function to start the timer
    const startTimer = () => {
        if (interval) return; // Prevent multiple intervals
        interval = setInterval(() => {
            if (timer > 0) {
                timer--;
                timerDisplay.textContent = formatTime(timer);
            } else {
                clearInterval(interval);
                interval = null;
                timerDisplay.textContent = "Time's up!";
                alert("Cooking time is over!");
            }
        }, 1000);
    };

    // Function to reset the timer
    const resetTimer = () => {
        clearInterval(interval);
        interval = null;
        timer = cookTimeValue;
        timerDisplay.textContent = formatTime(timer);
    };

    // Event listeners for buttons
    startButton.addEventListener('click', startTimer);
    resetButton.addEventListener('click', resetTimer);

    // Initialize the timer display
    timerDisplay.textContent = formatTime(timer);
});