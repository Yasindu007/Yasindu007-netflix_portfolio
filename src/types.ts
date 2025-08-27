// types.ts

// export interface ProfileBanner {
//   backgroundImage: { url: string };
//   headline: string;
//   resumeLink: {
//     url: string;
//   };
  
//   linkedinLink: string;
//   profileSummary: string;
// }


// export interface WorkPermit {
//   visaStatus: string;
//   expiryDate: Date;
//   summary: string;
//   additionalInfo: string;
// }
// export interface ProfileBanner {
//   headline: string;
//   resumeLink: { url: string };   // ✅ remove the `string |` union
//   linkedinLink: string;
//   profileSummary: { value: string };
// }
// export interface ProfileBanner {
//   headline: string;
//   resumeLink: { url: string };
//   linkedinLink: string;
//   profileSummary: { value: string };
// }
// export interface ProfileBanner {
//   backgroundImage: { url: string };
//   headline: string;
//   resumeLink: { url: string };
//   linkedinLink: string;
//   profileSummary: { value: string };
// }
export interface ProfileBanner {
  backgroundImage: { url: string };
  headline: string;
  resumeLink: { url: string };
  linkedinLink: string;
  profileSummary: { value: string };
}
// export interface ImageAsset {
//   url: string;
//   title: string | null;
//   alt: string | null;
// }

// (leave other interfaces below if you need them)


export interface TimelineItem {
  timelineType: 'work' | 'education';
  name: string;
  title: string;
  techStack: string;
  summaryPoints: string[];
  dateRange: string;
}

export interface Project {
  title: string;
  description: string;
  techUsed: string;
  image: { url: string };
}

export interface Certification {
  title: string;
  issuer: string;
  issuedDate: string;
  link: string;
  iconName: string;
}

export interface ContactMe {
  profilePicture: { url: string };
  name: string;
  title: string;
  summary: string;
  companyUniversity: string;
  linkedinLink: string;
  email: string;
  phoneNumber: string;
}

export interface Skill { 
  name: string;
  category: string;
  description: string;
  icon: string;
}
