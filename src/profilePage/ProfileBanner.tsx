import React, { useEffect, useState } from 'react';
import './ProfileBanner.css';
import PlayButton from '../components/PlayButton';
import MoreInfoButton from '../components/MoreInfoButton';
import { getProfileBanner } from '../queries/getProfileBanner';
import { ProfileBanner as ProfileBannerType } from '../types';

const ProfileBanner: React.FC = () => {
  const [bannerData, setBannerData] = useState<ProfileBannerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProfileBanner();
        setBannerData(data);
      } catch (err) {
        console.error("Failed to fetch profile banner:", err);
        setError("Sorry, we couldn't load the profile information.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="profile-banner-loading">Loading...</div>;
  if (error) return <div className="profile-banner-error">{error}</div>;
  if (!bannerData) return <div className="profile-banner-loading">No data available.</div>;

  const handlePlayClick = async () => {
    const url = typeof bannerData.resumeLink === 'string'
      ? bannerData.resumeLink
      : bannerData.resumeLink?.url;

    if (url) {
      // First, open the resume in a new tab. This is the primary action.
      window.open(url, '_blank');

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok.');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', 'Malith De Silva CV.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        // The download might fail (e.g., CORS), but the tab is already open.
        // We can just log a warning as the primary action has already succeeded.
        console.warn('Resume auto-download failed, but it was opened in a new tab.', error);
      }
    }
  };

  const handleLinkedinClick = () => {
    if (bannerData.linkedinLink) {
      window.open(bannerData.linkedinLink, '_blank');
    }
  };

  const summaryText = (bannerData.profileSummary?.value as any)?.document?.children?.[0]?.children?.[0]?.value;

  return (
    <div className="profile-banner">
      <div className="banner-content">
        <h1 className="banner-headline" id="headline">
          {bannerData.headline}
        </h1>
        <p className="banner-description">
          {summaryText || 'No summary available.'}
        </p>
        <div className="banner-buttons">
          <PlayButton onClick={handlePlayClick} label="Resume" />
          <MoreInfoButton onClick={handleLinkedinClick} label="LinkedIn" />
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;
