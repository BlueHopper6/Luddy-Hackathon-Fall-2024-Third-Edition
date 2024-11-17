const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middlewares
app.use(express.json());  // to parse JSON request bodies

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
  

// API endpoint to insert contact
app.post('/api/insert', async (req, res) => {
    const {
        poc_product,
        poc_repository,
        poc_firstName,
        poc_lastName,
        poc_email,
        poc_username,
        poc_location,
        poc_role,
    } = req.body;
    
    try
    {
        // Insert the data into the Supabase table
        const { data, error } = await supabase
            .from('points_of_contact')
            .insert([
                {
                    poc_product,
                    poc_repository,
                    poc_firstName,
                    poc_lastName,
                    poc_email,
                    poc_username,
                    poc_location,
                    poc_role,
                },
            ]);

        if (error)
        {
            return res.status(500).send({ error: error.message });
        }

        res.status(201).send({ message: 'Data inserted successfully', data });
    }
    catch(err)
    {
        res.status(500).send({ error: 'Server error' });
    }
});


// API endpoint to get all contacts
app.get('/api/contacts', async (req, res) => {
    try
    {
        const { data, error } = await supabase
            .from('points_of_contact')
            .select('*');

        //console.log(data);  // Log data to check the response from Supabase

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


// API endpoint to get contacts based on query
app.get('/api/query', async (req, res) => {
    const { product, repository } = req.query;

    try
    {
        // Build the query dynamically
        let query = supabase.from('points_of_contact').select('*');

        // Apply the filter if either 'product' or 'repository' is present
        if (product || repository)
        {
            const conditions = [];

            if (product)
            {
                conditions.push(`poc_product.ilike.%${product}%`);
            }

            if (repository)
            {
                conditions.push(`poc_repository.ilike.%${repository}%`);
            }

            // Combine conditions using OR
            query = query.or(conditions.join(','));
        }

        const { data, error } = await query;

        if (error)
        {
            return res.status(500).send({ error: error.message });
        }

        // If no data is found, return an empty array
        if (data.length === 0)
        {
            return res.status(404).json({ message: 'No contacts found', data: [] });
        }

        // Return the data as JSON
        res.json(data);
    }
    catch(err)
    {
        res.status(500).send({ error: 'Server error' });
    }
});

  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});