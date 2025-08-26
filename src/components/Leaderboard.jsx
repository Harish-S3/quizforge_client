import React from 'react';
import { motion } from 'framer-motion';

function Leaderboard({ users }) {
  // Always show users sorted by score
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <motion.div 
        className="leaderboard-container"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h4>Leaderboard</h4>
      <ul>
        {sortedUsers.map((user, index) => (
          <motion.li 
            key={user.id}
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="player-name">
              <span className={`rank rank-${index + 1}`}>{index + 1}.</span> {user.username}
            </span>
            <span className="player-score">{user.score}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default Leaderboard;