import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Lobby from './components/Lobby';
import Quiz from './components/Quiz';
import Leaderboard from './components/Leaderboard';
import Modal from './components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from "@vercel/analytics/react";

const socket = io('https://quizforge-server.onrender.com');

const Footer = () => {
  return (
    <footer className="footer-watermark">
      <p>
        © 2025 | Forged by{' '}
        <a href="https://www.linkedin.com/in/harish-s3/" target="_blank" rel="noopener noreferrer">
          Harish
        </a>
      </p>
    </footer>
  );
};

function App() {
  const [page, setPage] = useState('home');
  const [username, setUsername] = useState('');
  const [socketId, setSocketId] = useState(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomData, setRoomData] = useState({ users: [] });
  const [quizData, setQuizData] = useState({ questions: [], settings: {} });
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [isQuizReady, setIsQuizReady] = useState(false);

  const showErrorModal = (message) => setModal({ isOpen: true, title: "Heads Up!", message });
  const showSuccessModal = (message) => setModal({ isOpen: true, title: "Success!", message });

  const handleCreateRoom = () => {
    if (username.trim()) socket.emit('create-room', username);
    else showErrorModal('Please enter a username first!');
  };

  const handleJoinRoom = () => {
    if (username.trim() && roomCodeInput.trim()) {
      socket.emit('join-room', { roomCode: roomCodeInput, username });
    } else {
      showErrorModal('Please enter a username and a room code!');
    }
  };

  useEffect(() => {
    const onConnect = () => setSocketId(socket.id);
    
    // --- THIS IS THE NEW, SUPERIOR LISTENER ---
    // It handles creating, joining, and user list updates all in one event.
    const onRoomUpdate = (data) => {
        setRoomData(data); // Always update with the full, correct room data
        
        // Logic to prevent being kicked from the quiz back to the lobby
        if (page !== 'quiz') { 
            setPage('lobby');
        }

        // Only reset quiz readiness when first entering a lobby from home
        if (page === 'home' && data.hostId === socketId) {
            setIsQuizReady(false);
        }
    };
    
    const onGameStarted = ({ questions, settings }) => {
        setQuizData({ questions, settings });
        setPage('quiz');
    };
    const onUpdateLeaderboard = (updatedUsers) => setRoomData(prevData => ({ ...prevData, users: updatedUsers }));
    const onError = (data) => showErrorModal(data.message);
    const onQuizGenerated = () => {
        showSuccessModal("Your quiz has been forged! You can now start the game when you're ready.");
        setIsQuizReady(true);
    };

    socket.on('connect', onConnect);
    socket.on('room-updated', onRoomUpdate); // Replaces room-created, join-success, and update-user-list
    socket.on('error', onError);
    socket.on('game-started', onGameStarted);
    socket.on('update-leaderboard', onUpdateLeaderboard);
    socket.on('quiz-generated-successfully', onQuizGenerated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('room-updated', onRoomUpdate);
      socket.off('error', onError);
      socket.off('game-started', onGameStarted);
      socket.off('update-leaderboard', onUpdateLeaderboard);
      socket.off('quiz-generated-successfully', onQuizGenerated);
    };
  }, [page, socketId]); // Added page and socketId as dependencies for robust state logic
  
  const HomePage = (
      <motion.div className="homepage-container" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}}>
        <h1>QuizForge</h1>
        <p>Forge knowledge into competition.</p>
        <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div className="home-actions">
          <input type="text" placeholder="Enter Room Code" value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value)} />
          <button className="join-button" onClick={handleJoinRoom}>Join Game</button>
        </div>
        <div className="divider">or</div>
        <button className="create-button" onClick={handleCreateRoom}>Create New Game</button>
      </motion.div>
  );

  return (
    <div className="app-container">
      <Analytics />
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({...modal, isOpen: false})} 
        title={modal.title} 
        message={modal.message} 
      />
      <AnimatePresence mode="wait">
        {page === 'home' && (
            <motion.div key="home" exit={{ opacity: 0, scale: 0.8 }}>{HomePage}</motion.div>
        )}
        
        {page === 'lobby' && (
          <motion.div key="lobby" exit={{ opacity: 0, scale: 0.8 }}>
            <Lobby
              socket={socket} roomCode={roomData.roomCode} users={roomData.users}
              hostId={roomData.hostId} socketId={socketId}
              showErrorModal={showErrorModal}
              isQuizReady={isQuizReady}
            />
          </motion.div>
        )}

        {page === 'quiz' && (
          <motion.div key="quiz" className="quiz-page-layout" initial={{opacity:0}} animate={{opacity:1}}>
            <Quiz
              socket={socket} roomCode={roomData.roomCode} questions={quizData.questions}
              settings={quizData.settings} users={roomData.users} socketId={socketId}
            />
            <Leaderboard users={roomData.users} />
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
export default App;