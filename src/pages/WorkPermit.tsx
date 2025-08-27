// import React, { useEffect, useState } from 'react';
// import './WorkPermit.css';
// import { getWorkPermit } from '../queries/getWorkPermit';
// import { WorkPermit as WorkPermitType } from '../types';

// const WorkPermit: React.FC = () => {
//   const [workPermit, setWorkPermit] = useState<WorkPermitType | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchWorkPermit = async () => {
//       try {
//         const data = await getWorkPermit();
//         setWorkPermit(data);
//       } catch (error) {
//         console.error('Error fetching work permit:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWorkPermit();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="work-permit-container">
//       <h1>Work Permit Information</h1>
//       <p><strong>Visa Status:</strong> {workPermit?.visaStatus}</p>
//       <p><strong>Expiry Date:</strong> {workPermit?.expiryDate}</p>
//       <p><strong>Summary:</strong> {workPermit?.summary}</p>
//       <p><strong>Additional Info:</strong> {workPermit?.additionalInfo}</p>
//     </div>
//   );
// };

// export default WorkPermit;

export {};

