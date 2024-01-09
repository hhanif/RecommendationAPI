// A spec that explains how to interact with the endpoint, including authorization methods, and request & response data types

This document outlines the specifications for interacting with the provided API. The API is designed to fetch raw data, transform it, perform calculations, and generate recommendations.

The API we will review together is /Recommend API call. This is the final API in Lasso's recommendation engine. By this point, the user will have logged in, pulled farming data from external 3rd-party APIs, submitted it to an external carbon calculator, sent us back the results, and with the API below, we will take that data, input it into our recommendation engine, and send back recommendations on how to cut their carbon emission on their farm and what financial incentives they have to perform these projects.

## Authorization

### Recommend (POST /recommend)

- **Authorization Method:** Bearer Token
- **Request Type:** POST
- **Endpoint:** `/recommend`
- **Request Data Type:** JSON
- **Response Data Type:** JSON

**Request:**
```json
[
  {
    "farmId": "12345",
    "cropRotation": true,
    "grazingPractices": "Continuous Grazing",
    "equipmentEfficiency": "Outdated",
    "energyUsage": {
      "electricity": 50000, // in kWh
      "fuel": 2000 // in gallons
    },
    "carbonCalculatorOutput": {
      "totalCO2e": 15000, // in kg
      "perCropCO2e": {
        "corn": 3000, // in kg
        "soybean": 5000, // in kg
        "wheat": 7000 // in kg
      },
    },
    "financialIncentives": {
      "subsidies": 20000, // in USD
      "taxCredits": 5000 // in USD
    },
    "sustainabilityImprovements": [
      "Implement no-till farming practices",
      "Upgrade equipment to improve efficiency"
    ]
  }
]


Response:
[
  {
    "recommendationId": "1704667346087"
  }
]


### Recommend (GET /Recommend)

- **Authorization Method:** Bearer Token
- **Request Type:** GET
- **Endpoint:** `/recommend/{recommendationId}`
- **Response Data Type:** JSON

**Request:**
```json
// No request body for GET request; include recommendationId in the URL

```

**Response:**
```json
[
  {
    "recommendations": [
      {
        "action": "Adopt Crop Rotation",
        "description": "Implement a crop rotation strategy to enhance soil health and reduce carbon emissions from continuous cropping.",
        "financialIncentive": {
          "type": "Grant",
          "amount": 5000,
          "currency": "USD"
        }
      },
      {
        "action": "Implement Rotational Grazing",
        "description": "Adopt rotational grazing practices for livestock to improve land sustainability and decrease carbon emissions.",
        "financialIncentive": {
          "type": "Subsidy",
          "amount": 3000,
          "currency": "USD"
        }
      },
      {
        "action": "Upgrade to Energy-Efficient Equipment",
        "description": "Replace outdated farm equipment with energy-efficient alternatives to reduce energy consumption and emissions.",
        "financialIncentive": {
          "type": "Tax Credit",
          "amount": 2000,
          "currency": "USD"
        }
      }
    ]
  }
]
```
