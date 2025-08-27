import React, { useEffect, useState } from 'react';
import './Skills.css';
import { getSkills } from '../queries/getSkills';

import { FaReact, FaNodeJs, FaAws, FaDocker, FaJava, FaGitAlt } from 'react-icons/fa';
import { SiRubyonrails, SiTypescript, SiPostgresql, SiMysql, SiKubernetes, SiGooglecloud, SiSpringboot, SiPhp, SiNetlify, SiHeroku, SiRabbitmq, SiImessage, SiHtml5, SiCss3, SiJavascript, SiJsonwebtokens as SiJwt, SiGo, SiJson,SiMongodb, SiPython } from 'react-icons/si';
import { Skill } from '../types';
 

const iconMap: { [key: string]: JSX.Element } = {
  'ruby on rails': <SiRubyonrails />,
  'python': <SiPython />,
  'git': <FaGitAlt />,
  'html5': <SiHtml5 />,
  'css3': <SiCss3 />,
  'javascript': <SiJavascript />,
  'node.js': <FaNodeJs />,
  'springboot': <SiSpringboot />,
  'java': <FaJava />,
  'php': <SiPhp />,
  'react': <FaReact />,
  'typescript': <SiTypescript />,
  'aws': <FaAws />,
  'docker': <FaDocker />,
  'postgresql': <SiPostgresql />,
  'mysql': <SiMysql />,
  'kubernetes': <SiKubernetes />,
  'google cloud': <SiGooglecloud />,
  'heroku': <SiHeroku />,
  'netlify': <SiNetlify />,
  'rabbitmq': <SiRabbitmq />,
  'imessage': <SiImessage />,
  'jwt': <SiJwt />,
  'go': <SiGo />,
  'json': <SiJson />,
  'mongodb': <SiMongodb />,
};


const Skills: React.FC = () => {

  const [skillsData, setSkillsData] = useState<Skill[]>([]);

  useEffect(() => {
    async function fetchSkills() {
      const data = await getSkills();
      setSkillsData(data);
    }

    fetchSkills()
  }, []);

  if (skillsData.length === 0) return <div>Loading...</div>;

  const skillsByCategory = skillsData.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});


  return (
    <div className="skills-container">
      {Object.keys(skillsByCategory).map((category, index) => (
        <div key={index} className="skill-category">
          <h3 className="category-title">{category}</h3>
          <div className="skills-grid">
            {skillsByCategory[category].map((skill: any, idx: number) => (
              <div key={idx} className="skill-card">
                <div className="icon">{iconMap[skill.icon] || <FaReact />}</div>
                <h3 className="skill-name">
                  {skill.name.split('').map((letter: any, i: number) => (
                    <span key={i} className="letter" style={{ animationDelay: `${i * 0.05}s` }}>
                      {letter}
                    </span>
                  ))}
                </h3>
                <p className="skill-description">{((skill.description as any)?.value)?.document?.children?.[0]?.children?.[0]?.value || 'No description available.'}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skills;
