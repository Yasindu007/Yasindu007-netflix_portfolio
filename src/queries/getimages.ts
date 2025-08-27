import datoCMSClient from './datoCMSClient';
import { ImageAsset } from '../types';

interface ImageGalleryResponse {
  image: {
    assets: ImageAsset[];
  };
}

export async function getImages(): Promise<ImageGalleryResponse['image']> {
  const GET_IMAGES = `
    query {
      image {
        assets {
          url
          title
          alt
        }
      }
    }
  `;
  const data = await datoCMSClient.request<ImageGalleryResponse>(GET_IMAGES);
  return data.image;
}