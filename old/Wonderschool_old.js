// QuickBooks API credentials
const quickbooksClientId = process.env.QUICKBOOKS_CLIENT_ID;
const quickbooksClientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
const quickbooksRedirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
const quickbooksAccessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;

// QuickBooks API endpoint
const quickbooksApiEndpoint =
  "https://sandbox-quickbooks.api.intuit.com/v3/company/YOUR_COMPANY_ID/query";

// Helper function to map data based on airflow mappings
function mapDataWithAirflow(entry, airtableMappings) {
  const transformedEntry = {};

  // Iterate through Airflow mappings and apply transformations
  airflowMappings.forEach((mapping) => {
    const airflowField = mapping.airflowField;
    const mappedField = mapping.mappedField;

    // Perform mapping based on airflow field and mapped field
    transformedEntry[mappedField] = entry[airflowField];
  });

  return transformedEntry;
}

app.get("/raw-data", async (req, res) => {
  try {
    // Make a request to Bonafarm API
    const response = await axios.get(bonafarmApiEndpoint, {
      headers: {
        Authorization: `Bearer ${bonafarmApiKey}`,
      },
      params: {
        // Add any required parameters for your specific QuickBooks API endpoint
      },
    });

    // Cache the raw data
    rawDataCache = response.data;

    // Send the raw data to the client
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching raw data from Bonafarm:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/transformed-data", async (req, res) => {
  try {
    // Check if raw data is available
    if (!rawDataCache) {
      res
        .status(400)
        .json({ error: "Raw data not fetched. Please fetch raw data first." });
      return;
    }

    // Check if transformed data is already cached
    if (transformedDataCache) {
      res.json(transformedDataCache);
      return;
    }

    // Make a request to Apache Airflow for data transformation
    const airflowResponse = await axios.get(airflowTransformEndpoint, {
      params: {
        rawData: rawDataCache,
      },
    });

    // Cache the transformed data
    transformedDataCache = airflowResponse.data;

    // Send the transformed data to the client
    res.json(transformedDataCache);
  } catch (error) {
    console.error(
      "Error transforming data with Apache Airflow:",
      error.message,
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/calculate", async (req, res) => {
  try {
    // Access request body and send transformed data to the carbon calculator
    const { data } = req.body;

    // Make a POST request to the carbon calculator API
    const carbonCalculatorResponse = await axios.post(
      carbonCalculatorApiEndpoint,
      { transformedData: data },
      // Add any necessary headers or authentication for the carbon calculator / CoolFarm API
      {
        headers: {
          Authorization: `Bearer ${coolFarmApiKey}`,
        },
      },
    );

    // Cache the calculated data
    calculatedDataCache = carbonCalculatorResponse.data;

    // Send the response from the carbon calculator to the client
    res.json(carbonCalculatorResponse.data);
  } catch (error) {
    console.error(
      "Error sending data to the carbon calculator:",
      error.message,
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});
