export const API_URL = 'http://10.100.97.4:5000';

export const submitIssue = async (data: {
  category: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  photo: string | null;
}) => {
  const response = await fetch(`${API_URL}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getIssues = async () => {
  const response = await fetch(`${API_URL}/issues`);
  return response.json();
};