const express = require('express');
const app = express();
const PORT = 3000;

app.get('/api/data', (req, res) => {
    const jsonData = {
        success: true,
        message: "Data retrieved successfully!",
        data: {
            id: 1,
            name: "John Doe",
            role: "Developer"
        }
    };

    // Automatically sets Content-Type to application/json and sends data
    res.json(jsonData);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
