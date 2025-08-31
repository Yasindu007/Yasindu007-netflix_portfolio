import React, { useEffect, useState } from 'react';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { MdOutlineWork as WorkIcon } from 'react-icons/md';
import { IoSchool as SchoolIcon } from 'react-icons/io5';
import './WorkExperience.css';
import { TimelineItem } from '../types';
import { getTimeline } from '../queries/getTimeline';
import { FaCalendar, FaStar as StarIcon } from 'react-icons/fa';

// Helper function to extract year from date range for sorting
const extractEndYear = (dateRange: string): number => {
  // Handle "Present" or "Current" cases
  if (
    dateRange.toLowerCase().includes('present') ||
    dateRange.toLowerCase().includes('current')
  ) {
    return new Date().getFullYear();
  }

  // Extract the last year mentioned in the date range
  // This handles formats like "2020-2023", "Jan 2020 - Dec 2023", "2020 - 2023", etc.
  const yearMatches = dateRange.match(/\d{4}/g);
  if (yearMatches && yearMatches.length > 0) {
    return parseInt(yearMatches[yearMatches.length - 1]);
  }

  // Fallback: return 0 if no year found
  return 0;
};

const WorkExperience: React.FC = () => {
  const [timeLineData, setTimeLineData] = useState<TimelineItem[] | null>(null);

  useEffect(() => {
    async function fetchTimelineItem() {
      const data = await getTimeline();

      // Sort the data by date range (most recent first)
      const sortedData = data.sort((a, b) => {
        const yearA = extractEndYear(a.dateRange);
        const yearB = extractEndYear(b.dateRange);
        return yearB - yearA; // Descending order (most recent first)
      });

      setTimeLineData(sortedData);
    }
    fetchTimelineItem();
  }, []);

  if (!timeLineData) return <div>Loading...</div>;

  return (
    <>
      <div className="timeline-container">
        <h2 className="timeline-title">
          <FaCalendar style={{ marginRight: '10px' }} /> Work Experience &
          Education Timeline
        </h2>
      </div>
      <VerticalTimeline>
        {timeLineData.map((item, index) => (
          <VerticalTimelineElement
            key={index}
            className={`vertical-timeline-element--${item.timelineType}`}
            date={item.dateRange}
            icon={item.timelineType === 'work' ? <WorkIcon /> : <SchoolIcon />}
          >
            {item.timelineType === 'work' ? (
              <div>
                <h3 className="vertical-timeline-element-title">
                  {item.title}
                </h3>
                <h4 className="vertical-timeline-element-subtitle">
                  {item.name}
                </h4>
                <p className="vertical-timeline-element-tech">
                  🔧 {item.techStack}
                </p>
                <p>{item.summaryPoints}</p>
              </div>
            ) : (
              <div>
                <h3 className="vertical-timeline-element-title">{item.name}</h3>
                <h4 className="vertical-timeline-element-subtitle">
                  {item.title}
                </h4>
                <p>{item.summaryPoints}</p>
              </div>
            )}
          </VerticalTimelineElement>
        ))}
        <VerticalTimelineElement icon={<StarIcon />} />
      </VerticalTimeline>
    </>
  );
};

export default WorkExperience;
