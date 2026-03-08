import axios from 'axios';

const BLAND_AI_API_KEY = process.env.EXPO_PUBLIC_BLAND_AI_API_KEY || process.env.BLAND_AI_API_KEY;

/**
 * Sanitizes a phone number to E.164 format.
 * Preserves the leading '+' if present, and strips all other non-numeric characters.
 */
const sanitizePhoneNumber = (phoneNumber: string) => {
  const isInternational = phoneNumber.startsWith('+');
  const digits = phoneNumber.replace(/\D/g, '');
  return `${isInternational ? '+' : ''}${digits}`;
};

export const makeCall = async (
  phoneNumber: string,
  task: string,
  userName: string
) => {
  const sanitizedNumber = sanitizePhoneNumber(phoneNumber);
  console.log('Initiating call to:', sanitizedNumber);

  try {
    const response = await axios.post(
      'https://api.bland.ai/v1/calls',
      {
        phone_number: sanitizedNumber,
        task: task,
        voice: 'maya',
        first_sentence: `Hello, I am calling on behalf of ${userName}.`,
        wait_for_greeting: true,
        record: true,
        answered_by_enabled: true,
        noise_cancellation: true,
        interruption_threshold: 100,
        max_duration: 10,
      },
      {
        headers: {
          authorization: BLAND_AI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Bland AI error:', error);
    throw error;
  }
};
export const getCallDetails = async (callId: string) => {
  try {
    const response = await axios.get(
      `https://api.bland.ai/v1/calls/${callId}`,
      {
        headers: {
          authorization: BLAND_AI_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Bland AI details error:', error);
    throw error;
  }
};
