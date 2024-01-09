// index.js
// Please note: Due to the recommendation engine being Lasso's newest product, I can not provide actual code. So I have provided simplified / pseudo-code.

const express = require("express");
const axios = require("axios");
const AWS = require("aws-sdk");

const app = express();
const port = 3000;

// Configure AWS SDK with DynamoDB credentials
AWS.config.update({
  region: process.env.DYNAMODB_REGION,
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
  secretAccessKey: process.env.DYNAMODB_SECRET_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Recommendation Engine (Hypothetical Algorithm)
function recommend(data) {
  // Replace this with actual recommendation algorithm
  const recommendation = data.reduce((result, entry) => {
    // Hypothetical calculation: sum of amounts and assign a category
    result.totalAmount = (result.totalAmount || 0) + entry.amount;
    result.category = entry.category || "Default Category";
    return result;
  }, {});

  return recommendation;
}

// DynamoDB table name
const dynamoDBTableName = process.env.DYNAMODB_TABLE_NAME;

// In-memory cache for recommendation data
let recommendationCache = {};

// Middleware to parse JSON requests
app.use(express.json());

// Define a route to trigger the recommendation engine and store results
app.post("/recommend", async (req, res) => {
  try {
    // Extract data from the request body
    const { rawData, calculatedData } = req.body;

    // Ensure both rawData and calculatedData are provided
    if (!rawData || !calculatedData) {
      res
        .status(400)
        .json({ error: "Both rawData and calculatedData are required." });
      return;
    }

    // Combine raw data and calculated data for recommendation
    const recommendationData = combineDataForRecommendation(
      rawData,
      calculatedData,
    );

    // Calculate recommendation based on combined data
    const recommendation = recommend(recommendationData);

    // Generate a unique recommendation ID (simple example, replace with your logic)
    const recommendationId = Date.now().toString();

    // Cache the recommendation data
    recommendationCache[recommendationId] = recommendation;

    // store recommendationData in DynamoDB
    await storeDataInDynamoDB(recommendationId, recommendation);

    // Send the recommendation ID to the client
    res.json({ recommendationId });
  } catch (error) {
    console.error("Error generating recommendation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to fetch detailed recommendations based on recommendation ID
app.get("/recommend/:id", async (req, res) => {
  try {
    // Extract recommendation ID from the request parameters
    const { id } = req.params;

    // Check if the recommendation ID exists in the cache
    if (!recommendationCache[id]) {
      res.status(404).json({ error: "Recommendation not found" });
      return;
    }

    // Send the detailed recommendation to the client
    res.json({ recommendations: [recommendationCache[id]] });
  } catch (error) {
    console.error("Error fetching detailed recommendation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to combine raw data and calculated data for recommendation
function combineDataForRecommendation(rawData, calculatedData) {
  // Combine relevant fields from rawData and calculatedData

  // Example: Combine fields "cropType" from rawData and "emissionReduction" from calculatedData
  const combinedData = rawData.map((entry, index) => ({
    cropType: entry.cropType,
    emissionReduction: calculatedData[index].emissionReduction,
    // Add more fields as needed
  }));

  return combinedData;
}

// Helper function to store data in DynamoDB
async function storeDataInDynamoDB(id, data) {
  const params = {
    TableName: dynamoDBTableName,
    Item: {
      id,
      data,
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
