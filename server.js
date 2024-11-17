const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middlewares
app.use(express.json());  // to parse JSON request bodies

// API endpoint to get all contacts (for testing purposes)
app.get('/api/contacts', async (req, res) => {
    try
    {
        const { data, error } = await supabase
            .from('points_of_contact')
            .select('*');

        console.log(data);  // Log data to check the response from Supabase

        if (error)
        {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    }
    catch(error)
    {
        res.status(500).json({ error: error.message });
    }
});
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});