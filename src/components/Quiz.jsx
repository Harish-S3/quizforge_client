import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toBlob } from 'html-to-image';
import Leaderboard from './Leaderboard'; // Import the dedicated leaderboard

const QuizEndScreen = ({ users, socketId }) => {
    const leaderboardRef = useRef(null);
    const sortedUsers = [...users].sort((a, b) => b.score - a.score);
    const currentUser = users.find(u => u.id === socketId);
    const currentUserRank = currentUser ? sortedUsers.findIndex(u => u.id === socketId) + 1 : 0;

    const getMessage = (rank) => {
        if (!rank) return "The quiz has ended!";
        if (rank === 1) return `Incredible! You are the Quiz Champion! 🏆`;
        if (rank === 2) return `Magnificent! You secured second place! 🥈`;
        if (rank === 3) return `Outstanding! You're on the podium! 🥉`;
        return `Well played! You finished #${rank}.`;
    };

    const handleShare = async () => {
        if (!leaderboardRef.current) return;
        try {
            const imageBlob = await toBlob(leaderboardRef.current, { cacheBust: true, backgroundColor: '#1e1e1e' });
            const file = new File([imageBlob], 'quiz-results.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'QuizForge Results!',
                    text: 'Look how I did on this quiz!',
                    files: [file],
                });
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(imageBlob);
                link.download = 'quiz-results.png';
                link.click();
                alert("Image downloaded! Share it from your device.");
            }
        } catch (error) {
            console.error("Share failed:", error);
            alert("Oops, sharing failed!");
        }
    };
    
    return (
      <motion.div 
        className="quiz-container end-screen"
        initial={{opacity: 0, scale: 0.8}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 0.5, type: "spring"}}
      >
        <h2>Tournament Over!</h2>
        <p className="congrats-message">{getMessage(currentUserRank)}</p>
        <div ref={leaderboardRef} className="final-leaderboard-capture-area">
          <Leaderboard users={users} />
        </div>
        <div className="end-buttons">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-again" onClick={() => window.location.reload()}>Play Again</motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-share" onClick={handleShare}>Share Results</motion.button>
        </div>
      </motion.div>
    );
};


function Quiz({ questions, settings, users, socket, roomCode, socketId }) {
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const timeLimit = settings.timePerQuestion || 20;
    
    // --- FIX: Logic to handle quiz conclusion ---
    // Instead of hiding the 'Next' button, we now explicitly check if the quiz is over
    const isQuizOver = qIndex >= questions.length;

    useEffect(() => {
      // Reset start time and selection for each new question
      setQuestionStartTime(Date.now());
      setSelected(null);
    }, [qIndex]);

    const handleSelect = (idx) => {
        if (selected === null) {
            setSelected(idx);
            socket.emit('submit-answer', { 
                roomCode, 
                questionIndex: qIndex, 
                answerIndex: idx, 
                timeTaken: (Date.now() - questionStartTime) / 1000 
            });
        }
    };
    
    // --- FIX: A single, reliable function to advance state ---
    const handleAdvance = () => {
        if (!isQuizOver) {
            setQIndex(q => q + 1);
        }
    };
    
    if (isQuizOver) {
        return <QuizEndScreen users={users} socketId={socketId} />;
    }
    
    const currentQuestion = questions[qIndex];
    
    return (
        <div className="quiz-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                  <motion.div 
                    key={`timer-${qIndex}`}
                    className="timer-bar" 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: timeLimit, ease: "linear" }}
                    onAnimationComplete={handleAdvance}
                  />
                  <div className="quiz-header">
                      <span>Question {qIndex + 1} / {questions.length}</span>
                  </div>
                  <h3 className="question-text">{currentQuestion.question}</h3>
                  <div className="options-grid">
                      {currentQuestion.options.map((option, index) => {
                          let className = "option-button";
                          if (selected !== null) {
                              if (index === currentQuestion.correctAnswer) className += ' correct';
                              else if (index === selected) className += ' incorrect';
                              else className += ' disabled';
                          }
                          return (
                              <motion.button 
                                  key={index} className={className} onClick={() => handleSelect(index)}
                                  disabled={selected !== null}
                                  whileHover={{scale: selected === null ? 1.05 : 1}}
                              >{option}</motion.button>
                          );
                      })}
                  </div>
                  {/* --- FIX: Show next button to keep flow consistent until the end --- */}
                  {selected !== null && !isQuizOver &&
                      <motion.button className="btn-next" onClick={handleAdvance}
                          initial={{opacity: 0}} animate={{opacity: 1}}
                      >Next</motion.button>
                  }
              </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default Quiz;