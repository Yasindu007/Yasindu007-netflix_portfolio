import React from 'react';
import './Recommendations.css';
import chrisProfilePic from '../images/chris.jpg'; // Adjust the path based on your directory structure

const Recommendations: React.FC = () => {
  return (
    <div className='timeline-container'>
      <div className="recommendation-card">
        <div className="recommendation-header">
          <img src={chrisProfilePic} alt="Ms. Tharushi Perera" className="profile-pic" />
          <div>
            <h3>Tharushi Perera</h3>
            <p>Lecturer – Machine Learning & Data Mining</p>
            <p className="date">March 2026</p>
          </div>
        </div>
        <div className="recommendation-body">
          <p>✨ "It is my pleasure to recommend Yasindu De Silva, a highly motivated and talented student currently pursuing Software Development at IIT Sri Lanka. I have had the opportunity to work with Yasindu during the Machine Learning and Data Mining module, where he consistently demonstrated strong analytical thinking and technical capability."</p>
          <p>"Yasindu has shown great enthusiasm for modern technologies, including full-stack development, cloud computing, and API design. He has hands-on experience with React, Node.js, and AWS, and has successfully built and deployed real-world applications. His ability to quickly learn new technologies—such as Golang for backend development—sets him apart from his peers."</p>
          <p>💼 "Beyond technical skills, Yasindu is a proactive learner and an excellent team player. He communicates effectively, takes initiative in projects, and consistently strives to improve his work. His dedication and problem-solving mindset make him a valuable contributor in any development environment."</p>
          <p>🌟 "I strongly believe Yasindu has the potential to excel as a Software Engineer, and I confidently recommend him for internships and future professional opportunities."</p>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
