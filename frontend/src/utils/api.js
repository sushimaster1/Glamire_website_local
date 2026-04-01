export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
