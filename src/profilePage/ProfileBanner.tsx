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

  const handlePlayClick = () => {
    const url = typeof bannerData.resumeLink === 'string'
      ? bannerData.resumeLink
      : bannerData.resumeLink?.url;

    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleLinkedinClick = () => {
    if (bannerData.linkedinLink) {
      window.open(bannerData.linkedinLink, '_blank');
    }
  };

  return (
    <div className="profile-banner">
      <div className="banner-content">
        <h1 className="banner-headline" id="headline">
          {bannerData.headline}
        </h1>
        <p className="banner-description">
          {(bannerData.profileSummary?.value as any)?.document?.children?.[0]?.children?.[0]?.value || 'No summary available.'}
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
