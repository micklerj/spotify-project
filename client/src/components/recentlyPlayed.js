import React, { useEffect, useRef } from 'react';
import './styles/recentlyPlayed.css';
import musicNote from '../assets/musicNote.png';

const DisplayRecentlyPlayed = ({ songTitle }) => {
  const titleRef = useRef(null);

  useEffect(() => {
    const titleElement = titleRef.current;
    if (!titleElement) return;

    const animateTitle = () => {
      const titleWidth = titleElement.scrollWidth;
      const containerWidth = titleElement.parentElement.clientWidth;
      const scrollDistance = titleWidth - containerWidth;

      titleElement.style.transition = 'none';
      titleElement.style.transform = 'translateX(0)';

      setTimeout(() => {
        titleElement.style.transition = 'transform 5s linear';
        titleElement.style.transform = `translateX(-${scrollDistance}px)`;
      }, 1000);

      setTimeout(() => {
        titleElement.style.transition = 'transform 5s linear';
        titleElement.style.transform = 'translateX(0)';
      }, 7000);
    };

    animateTitle();
    const intervalId = setInterval(animateTitle, 12000);

    return () => clearInterval(intervalId);
  }, [songTitle]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img className="musiic-note-icon" alt='musicNote' src= {musicNote}/>
      <div className="song-title-container">
        <div className="title-wrapper">
          <div className="song-title" ref={titleRef}>
            {songTitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayRecentlyPlayed;
