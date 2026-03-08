const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const axios = require('axios');
const UserProfile = require('./models/UserProfile');
const { crossReferenceLocation } = require('./services/retailAi');

dotenv.config();

const app = express();
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// ElevenLabs TTS and Cloudinary Storage
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  
  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      data: {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer'
    });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'gramco_audio' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(response.data);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Profile Routes
app.post('/api/profile', async (req, res) => {
  try {
    const profile = new UserProfile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Retail AI Route
app.post('/api/location-search', async (req, res) => {
  const { locationName, userId } = req.body;
  
  try {
    const profile = await UserProfile.findById(userId);
    const result = await crossReferenceLocation(locationName, profile ? profile.healthInfo : {});
    res.json({ result });
  } catch (error) {
    console.error('Retail AI error:', error);
    res.status(500).json({ error: 'Failed to cross-reference location' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
