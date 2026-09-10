import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let cachedCloudinaryResources = [];

/**
 * Fetches real images directly from the user's Cloudinary account
 */
export async function fetchRealCloudinaryImages() {
  try {
    const res = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'urban_intelligence',
      max_results: 50
    });

    if (res && res.resources && res.resources.length > 0) {
      cachedCloudinaryResources = res.resources.map((r) => r.secure_url);
      console.log(`[Cloudinary] Loaded ${cachedCloudinaryResources.length} real assets from urban_intelligence folder`);
    } else {
      // Fallback to recent uploads in account
      const allRes = await cloudinary.api.resources({
        type: 'upload',
        max_results: 30
      });
      cachedCloudinaryResources = allRes.resources.map((r) => r.secure_url);
    }
    return cachedCloudinaryResources;
  } catch (err) {
    console.error('[Cloudinary] Failed to list resources from Cloudinary API:', err.message);
    // Return known real Cloudinary URLs from the user's account
    return [
      'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978174/urban_intelligence/road_defects/qkwqisy6pgoylcuxuhjx.png',
      'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978179/urban_intelligence/road_defects/muwuafar65b4s65hkkhc.jpg',
      'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978190/urban_intelligence/road_defects/lcei34iewy9poeeqqpxv.jpg',
      'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978763/urban_intelligence/road_defects/dky7ydefkh7oclhbftua.jpg'
    ];
  }
}

/**
 * Returns a real Cloudinary image URL from the user's Cloudinary cloud
 */
export function getRealCloudinaryImage(index = 0) {
  const fallback = [
    'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978174/urban_intelligence/road_defects/qkwqisy6pgoylcuxuhjx.png',
    'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978179/urban_intelligence/road_defects/muwuafar65b4s65hkkhc.jpg',
    'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978190/urban_intelligence/road_defects/lcei34iewy9poeeqqpxv.jpg',
    'https://res.cloudinary.com/dlglm1rwk/image/upload/v1788978763/urban_intelligence/road_defects/dky7ydefkh7oclhbftua.jpg'
  ];

  const pool = cachedCloudinaryResources.length > 0 ? cachedCloudinaryResources : fallback;
  return pool[index % pool.length];
}

export default cloudinary;
