import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Lobby({ roomCode, users, hostId, socketId, socket, showErrorModal }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuizReady, setIsQuizReady] = useState(false);
  
  // --- ROYAL DECREE 1: The default is now higher ---
  const [questionCount, setQuestionCount] = useState(10); // A solid default
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [activeTab, setActiveTab] = useState('file');
  
  const isHost = hostId === socketId;

  useEffect(() => {
    // The success modal is now triggered from App.jsx, keeping this component clean.
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleGenerateQuiz = () => {
    const qCount = parseInt(questionCount);
    const tPerQ = parseInt(timePerQuestion);
    
    // --- ROYAL DECREE 2: The validation law is updated ---
    if (isNaN(qCount) || qCount < 5 || qCount > 30) { // The new limit is 30
      showErrorModal("Number of questions must be between 5 and 30.");
      return;
    }
    if (isNaN(tPerQ) || tPerQ < 10 || tPerQ > 60) {
      showErrorModal("Time per question must be between 10 and 60 seconds.");
      return;
    }
    
    setIsGenerating(true);
    setIsQuizReady(false);
    const settings = { questionCount: qCount, timePerQuestion: tPerQ, roomCode };
    
    if (activeTab === 'file') {
        if (!file) {
            setIsGenerating(false);
            showErrorModal("Please select a file first!");
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(settings).forEach(key => formData.append(key, settings[key]));
        fetch('https://quizforge-server.onrender.com/generate-quiz-from-file', { method: 'POST', body: formData })
          .catch(() => setIsGenerating(false));
    } else { // 'text'
        if (!pastedText.trim()) {
            setIsGenerating(false);
            showErrorModal("Please paste some text first!");
            return;
        }
        fetch('https://quizforge-server.onrender.com/generate-quiz-from-text', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pastedText, ...settings }),
        }).catch(() => setIsGenerating(false));
    }
  };
  
  const handleStartGame = () => socket.emit('start-game', roomCode);

  const HostControls = () => (
    <motion.div className="host-controls-container" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
      <h3>Quiz Master Controls</h3>
      
      <div className="settings-grid">
        <div className="setting-item">
          <label>Questions</label>
          {/* --- ROYAL DECREE 3: The input limit is updated --- */}
          <input type="number" min="5" max="30" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} disabled={isGenerating}/>
        </div>
        <div className="setting-item">
          <label>Time (sec)</label>
          <input type="number" min="10" max="60" value={timePerQuestion} onChange={(e) => setTimePerQuestion(e.target.value)} disabled={isGenerating}/>
        </div>
      </div>
      
      <div className="input-source-tabs">
        <button onClick={() => setActiveTab('file')} className={activeTab === 'file' ? 'active' : ''}>Upload File</button>
        <button onClick={() => setActiveTab('text')} className={activeTab === 'text' ? 'active' : ''}>Paste Text</button>
      </div>

      <div className="input-area">
        {activeTab === 'file' ? (
          <div className="file-input-wrapper">
            <input type="file" id="fileUpload" accept=".pdf,.docx,.txt" onChange={handleFileChange} disabled={isGenerating}/>
            <label htmlFor="fileUpload" className="file-input-label">Choose File</label>
            <span className="file-name-display">{fileName || "No file chosen"}</span>
          </div>
        ) : (
          <textarea rows="5" placeholder="Paste your notes here..." value={pastedText} onChange={(e) => setPastedText(e.target.value)} disabled={isGenerating}/>
        )}
      </div>

      {isQuizReady ? (
        <motion.button 
          className="start-game-button"
          onClick={handleStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Game for Everyone!
        </motion.button>
      ) : (
        <button className="generate-quiz-button" onClick={handleGenerateQuiz} disabled={isGenerating}>
          {isGenerating ? 'Forging Quiz...' : 'Generate Quiz'}
        </button>
      )}
    </motion.div>
  );

  return (
    <motion.div className="lobby-container" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="room-code-display">
            <p>Share Room Code</p>
            <span>{roomCode}</span>
        </div>
        <div className="player-list">
            <h4>Players Joined</h4>
            <ul>
                {users.map(user => (
                    <motion.li key={user.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        {user.username} {user.id === hostId && '👑'}
                    </motion.li>
                ))}
            </ul>
        </div>
        {isHost ? <HostControls /> : <p className="waiting-message">Waiting for the Quiz Master to start the game...</p>}
    </motion.div>
  );
}
export default Lobby;