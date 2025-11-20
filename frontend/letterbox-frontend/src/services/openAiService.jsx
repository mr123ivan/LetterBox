import axios from 'axios';

const API_URL = '/api/ai/';

const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.token;
};



const rewriteLetter = async ({ letterContent, tone }) => {
  const token = getToken();
  const response = await axios.post(
    API_URL + 'rewrite',
    { letterContent, tone },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const chatLetter = async ({ message, tone, length }) => {
  const token = getToken();
  const response = await axios.post(
    API_URL + 'chat',
    { message, tone, length },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const openAiService = {
  rewriteLetter,
  chatLetter,
};

export default openAiService;