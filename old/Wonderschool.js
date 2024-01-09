// index.js

const express = require("express");
const axios = require("axios");
const AWS = require("aws-sdk");

const app = express();
const port = 3000;

// Configure AWS SDK with your DynamoDB credentials
AWS.config.update({
  region: process.env.DYNAMODB_REGION,
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
  secretAccessKey: process.env.DYNAMODB_SECRET_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// In-memory cache for various stages of data
let rawDataCache = null;
let transformedDataCache = null;
let calculatedDataCache = null;
let recommendationCache = null;

// Bonafarm API credentials
const bonafarmApiKey = process.env.BONAFARM_API_KEY;
const bonafarmApiEndpoint = "https://api.bonafarm.com/v1/data";
// CoolFarm API credentials
const coolFarmApiKey = process.env.COOLFARM_API_KEY;
const coolFarmApiEndpoint = "https://api.coolfarm.com/v1/calculate";
// Apache Airflow endpoint for data transformation
const airflowTransformEndpoint =
  "http://your-airflow-server/transform-endpoint"; // Replace with your Apache Airflow endpoint
// DynamoDB table name
const dynamoDBTableName = process.env.DYNAMODB_TABLE_NAME;

// Middleware to parse JSON requests
app.use(express.json());

// Recommendation Engine (Hypothetical Algorithm)
function recommend(data) {
  // Replace this with your recommendation algorithm
  const recommendation = data.reduce((result, entry) => {
    // Hypothetical calculation: sum of amounts and assign a category
    result.totalAmount = (result.totalAmount || 0) + entry.amount;
    result.category = entry.category || "Default Category";
    return result;
  }, {});

  return recommendation;
}

// Helper function to fetch data from an API with caching
async function fetchDataWithCache(
  apiEndpoint,
  cacheKey,
  headers = {},
  params = {},
) {
  // Check if data is already available in the cache
  if (cacheKey && app.locals.cache && app.locals.cache[cacheKey]) {
    console.log(`Returning cached data for ${cacheKey}`);
    return app.locals.cache[cacheKey];
  }

  try {
    // Make a request to the API
    const response = await axios.get(apiEndpoint, { headers, params });

    // Cache the data
    if (cacheKey) {
      app.locals.cache = app.locals.cache || {};
      app.locals.cache[cacheKey] = response.data;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${apiEndpoint}:`, error.message);
    throw error;
  }
}

// Define a route to fetch raw data from Bonafarm API
app.get("/raw-data", async (req, res) => {
  try {
    // Make a request to Bonafarm API
    // Fetch data with caching
    rawDataCache = await fetchDataWithCache(
      bonafarmApiEndpoint,
      "rawDataCache",
      {
        Authorization: `Bearer ${bonafarmApiKey}`,
      },
    );

    // Send the cached raw data to the client
    res.json(rawDataCache);
  } catch (error) {
    console.error("Error fetching raw data from Bonafarm:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to transform data using Apache Airflow
app.get("/transformed-data", async (req, res) => {
  try {
    // Check if raw data is available
    if (!rawDataCache) {
      res
        .status(400)
        .json({ error: "Raw data not fetched. Please fetch raw data first." });
      return;
    }
    //Make a request to Apache Airflow to fetch transformed data transformation + caching
    transformedDataCache = await fetchDataWithCache(
      airflowTransformEndpoint,
      "transformedDataCache",
      {},
      {
        rawData: rawDataCache,
      },
    );

    res.json(transformedDataCache);
  } catch (error) {
    console.error(
      "Error transforming data with Apache Airflow:",
      error.message,
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for calculations (send data to carbon calculator CoolFarm API)
app.post("/calculate", async (req, res) => {
  try {
    // Access request body and send transformed data to the carbon calculator
    const { data } = req.body;

    // Fetch calculated data with caching
    calculatedDataCache = await fetchDataWithCache(
      coolFarmApiEndpoint,
      "calculatedDataCache",
      {
        Authorization: `Bearer ${coolFarmApiKey}`,
      },
      { transformedData: data },
    );

    res.json(calculatedDataCache);
  } catch (error) {
    console.error(
      "Error sending data to the carbon calculator:",
      error.message,
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to trigger the recommendation engine
app.post("/recommend", (req, res) => {
  try {
    // Extract data from the request body
    const { calculatedData } = req.body;

    // Calculate recommendation based on provided data
    const recommendation = recommend(calculatedData);

    // Cache the recommendation data
    recommendationCache = recommendation;

    // Send the recommendation to the client
    res.json(recommendation);
  } catch (error) {
    console.error("Error generating recommendation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to store final results or recommendations
app.post("/store-recommendation", async (req, res) => {
  try {
    // Access request body and store data in DynamoDB or any other storage mechanism
    const { recommendationData } = req.body;

    // Optionally, you can store recommendationData in DynamoDB or any other storage mechanism
    await storeDataInDynamoDB(recommendationData);

    res.json({ message: "Recommendation data stored successfully." });
  } catch (error) {
    console.error("Error storing recommendation data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to store data in DynamoDB
async function storeDataInDynamoDB(data) {
  const params = {
    TableName: Lasso_Farms,
    Item: {
      // Define the primary key and other attributes based on your DynamoDB table schema
      id: "unique_id", // Replace with a unique identifier for each entry
      data: data,
    },
  };

  try {
    await dynamodb.put(params).promise();
    console.log("Data stored in DynamoDB successfully.");
  } catch (error) {
    console.error("Error storing data in DynamoDB:", error.message);
    throw error;
  }
}

// Define a route to store transformed data in DynamoDB
app.post("/store-transformed-data", async (req, res) => {
  try {
    // Access request body and store data in DynamoDB
    const { transformedData } = req.body;

    // Store the transformed data into DynamoDB
    await storeDataInDynamoDB(transformedData);

    res.json({ message: "Transformed data stored successfully in DynamoDB." });
  } catch (error) {
    console.error("Error storing transformed data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to store calculated data in DynamoDB
app.post("/store-calculated-data", async (req, res) => {
  try {
    // Access request body and store data in DynamoDB
    const { calculatedData } = req.body;

    // Store the calculated data into DynamoDB
    await storeDataInDynamoDB(calculatedData);

    res.json({ message: "Calculated data stored successfully in DynamoDB." });
  } catch (error) {
    console.error("Error storing calculated data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
