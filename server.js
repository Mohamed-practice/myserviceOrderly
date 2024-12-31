const express = require('express');
const { execSync } = require('child_process');

const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 4500;

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

//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

function commitAndPush() {
  const timestamp = new Date().toISOString();

  try {
    // Initialize git if not already initialized
    execSync('git init');

    // Configure git user info (required for commits if not already configured)
    execSync('git config user.email "mohammedimrancr7@gmail.com"');
    execSync('git config user.name "Mohamed-practice"');

    // Create and checkout main branch if it doesn't exist
    execSync('git checkout main || git checkout -b main');

    // Stage and commit changes - using specific paths
    execSync('git add "./data/*"');
    execSync('git add "./server.js"');
    execSync('git add "./package.json"');
    execSync('git commit -m "Data update: ' + timestamp + '"');

    // Push changes (assumes a remote is already configured)
    execSync('git push -u origin main');

    console.log('Successfully pushed data changes to GitHub');
  } catch (error) {
    console.error('Error details:', error.stdout?.toString(), error.stderr?.toString());
  }
}



// Middleware to allow all origins and preflight requests
app.use((req, res, next) => {
  res.set({
      "Access-Control-Allow-Origin": "*",   // Allow all origins
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE", // Specify allowed methods
      "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token, X-Requested-With", // Include necessary headers
  });

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});


const allowedOrigins = [
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'http://localhost:8080',
  'http://localhost:8100',
  "https://myipl2024.pages.dev"
];

// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
};

// Enable preflight requests for all routes
app.options('*', cors(corsOptions));


app.use(bodyParser.json());

let workData = require('./data/workData.json');
let personalData = require('./data/personalData.json');

// Function to save data back to JSON files
const saveWorkData = () => {
  try{
    fs.writeFileSync(
      require('path').join(__dirname, 'data/workData.json'),
      JSON.stringify(workData, null, 2)
    );
  }catch(error){
    console.error('Error saving data:', error);
  }

};

const savePesonalData = () => {
  try{
    fs.writeFileSync(
      require('path').join(__dirname, 'data/personalData.json'),
      JSON.stringify(personalData, null, 2)
    );
  }catch(error){
    console.error('Error saving data:', error);
  }

};

// Get routes
app.get('/api/workdata',cors(corsOptions), (req, res) => {
  res.json(workData);
});

app.get('/api/personaldata',cors(corsOptions), (req, res) => {
  res.json(personalData);
});

// Post routes
app.post('/api/workdata', cors(corsOptions),(req, res) => {
  const newData = req.body;
  workData.push(newData);
  saveWorkData();
  res.status(201).send({ message: 'Work data added successfully', data: newData });
});

app.post('/api/personaldata',cors(corsOptions), (req, res) => {
  const newData = req.body;
  personalData.push(newData);
  savePesonalData();
  res.status(201).send({ message: 'Personal data added successfully', data: newData });
});

// Delete routes
app.delete('/api/workdata/:index', cors(corsOptions),(req, res) => {
  const index = parseInt(req.params.index, 10);
  if(index === 999)
  {
    commitAndPush();
    return;
  }
  if (index >= 0 && index < workData.length) {
    const deletedItem = workData.splice(index, 1); // Remove the item by index
    saveWorkData();
    res.status(200).send({ message: 'Work data removed successfully', data: deletedItem });
  } else {
    res.status(404).send({ message: 'Work data not found at the provided index' });
  }
});

app.delete('/api/personaldata/:index',cors(corsOptions), (req, res) => {
  const index = parseInt(req.params.index, 10); // Parse the index from URL
  if (index >= 0 && index < personalData.length) {
    const deletedItem = personalData.splice(index, 1); // Remove the item by index
    savePesonalData();
    res.status(200).send({ message: 'Personal data removed successfully', data: deletedItem });
  } else {
    res.status(404).send({ message: 'Personal data not found at the provided index' });
  }
});

// Put routes for updating existing data
app.put('/api/workdata/:index', cors(corsOptions), (req, res) => {
  const index = parseInt(req.params.index, 10);
  const updatedData = req.body;
  
  if (index >= 0 && index < workData.length) {
    workData[index] = updatedData;
    saveWorkData();
    res.status(200).send({ 
      message: 'Work data updated successfully', 
      data: updatedData 
    });
  } else {
    res.status(404).send({ 
      message: 'Work data not found at the provided index' 
    });
  }
});

app.put('/api/personaldata/:index', cors(corsOptions), (req, res) => {
  const index = parseInt(req.params.index, 10);
  const updatedData = req.body;
  
  if (index >= 0 && index < personalData.length) {
    personalData[index] = updatedData;
    savePesonalData();
    res.status(200).send({ 
      message: 'Personal data updated successfully', 
      data: updatedData 
    });
  } else {
    res.status(404).send({ 
      message: 'Personal data not found at the provided index' 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


