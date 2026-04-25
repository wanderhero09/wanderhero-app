import {BASE_URL} from './theme';

const api = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {'Content-Type': 'application/json'},
    ...options,
  });
  return res.json();
};

export const login = (username: string, password: string) =>
  api('/login', {method: 'POST', body: JSON.stringify({username, password})});

export const register = (username: string, password: string, email?: string) =>
  api('/register', {method: 'POST', body: JSON.stringify({username, password, email})});

export const getFeed = () => api('/feed');
export const getProfile = (username: string) => api(`/profile/${username}`);
export const getAvatar = (username: string) => api(`/avatar/${username}`);
export const getUserPosts = (username: string) => api(`/user/${username}`);

export const likePost = (id: string, username: string) =>
  api('/like', {method: 'POST', body: JSON.stringify({id, username})});

export const addComment = (id: string, username: string, text: string) =>
  api('/comment', {method: 'POST', body: JSON.stringify({id, username, text})});

export const deletePost = (id: string) =>
  api('/delete-post', {method: 'DELETE', body: JSON.stringify({id})});

export const getMessages = (user1: string, user2: string) =>
  api(`/messages/${user1}/${user2}`);

export const getDialogs = (username: string) => api(`/dialogs/${username}`);

export const sendMessage = (from: string, to: string, text?: string, fileUrl?: string) =>
  api('/send-message', {method: 'POST', body: JSON.stringify({from, to, text, fileUrl})});

export const readMessages = (from: string, to: string) =>
  api('/read', {method: 'POST', body: JSON.stringify({from, to})});

export const follow = (follower: string, target: string) =>
  api('/follow', {method: 'POST', body: JSON.stringify({follower, target})});

export const unfollow = (follower: string, target: string) =>
  api('/unfollow', {method: 'POST', body: JSON.stringify({follower, target})});

export const getStatus = (user: string) => api(`/status/${user}`);
export const setOnline = (username: string) =>
  api('/online', {method: 'POST', body: JSON.stringify({username})});

export const updateProfile = (data: Record<string, string>) =>
  api('/update-profile', {method: 'POST', body: JSON.stringify(data)});

export const changePassword = (username: string, oldPassword: string, newPassword: string) =>
  api('/change-password', {method: 'POST', body: JSON.stringify({username, oldPassword, newPassword})});

export const uploadFile = async (
  fileUri: string, fileName: string, mimeType: string,
  username: string, fileType: string, source = 'post', caption = '',
  onProgress?: (p: number) => void,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', {uri: fileUri, name: fileName, type: mimeType} as any);
    formData.append('username', username);
    formData.append('type', fileType);
    formData.append('source', source);
    formData.append('caption', caption);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/upload`);
    if (onProgress) xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error('Parse error')); } };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
};
