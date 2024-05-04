import { v2 as cloudinary } from 'cloudinary';
import { config } from './config';

cloudinary.config({
    cloud_name: config.cloudnary_cloud_name,
    api_key: config.cloudnary_api_key,
    api_secret: config.cloudnary_api_secret
});

export default cloudinary;
