const axios = require('axios');

const BLAND_API_URL = 'https://api.bland.ai/v1/calls';

const makeReservationCall = async (phoneNumber, taskDetails, userProfile) => {
  try {
    const response = await axios.post(
      BLAND_API_URL,
      {
        phone_number: phoneNumber,
        task: `You are an AI assistant for ${userProfile.firstName} ${userProfile.lastName}. 
               Call the business and execute the following task: ${taskDetails}.
               User Profile Details: ${JSON.stringify(userProfile)}.
               If making a reservation, use the name ${userProfile.firstName} ${userProfile.lastName}, 
               and confirm the status back to the system.`,
        voice: 'nat', // Natural sounding voice
        record: true,
      },
      {
        headers: {
          'Authorization': process.env.BLAND_AI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Bland AI call error:', error);
    throw error;
  }
};

module.exports = { makeReservationCall };
