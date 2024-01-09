// A spec that explains how to interact with the endpoint, including authorization methods, and request & response data types

This document outlines the specifications for interacting with the provided API. The API is designed to fetch raw data, transform it, perform calculations, and generate recommendations.

## Authorization

### Raw Data (GET /raw-data)


- **Authorization Method:** Bearer Token
- **Request Type:** GET
- **Endpoint:** `/raw-data`
- **Response Data Type:** JSON

**Request:**
No parameters required.

**Response:**
```json
[
  {
    "farmId": "123456",
    "farmName": "Bonafarm Demo Farm",
    "location": {
      "latitude": 47.12345,
      "longitude": 19.98765
    },
    "crops": [
      {
        "cropId": "crop001",
        "cropName": "Wheat",
        "yield": 1500,
        "area": 10,
        "energyUsage": {
          "electricity": 1200,
          "diesel": 50
        }
      },
      {
        "cropId": "crop002",
        "cropName": "Corn",
        "yield": 2000,
        "area": 15,
        "energyUsage": {
          "electricity": 1800,
          "diesel": 70
        }
      }
    ],
    "livestock": {
      "cattle": {
        "count": 100,
        "averageWeight": 600,
        "energyUsage": {
          "electricity": 5000,
          "diesel": 200
        }
      },
      "poultry": {
        "count": 5000,
        "energyUsage": {
          "electricity": 800,
          "diesel": 30
        }
      }
    },
    "energyUsage": {
      "electricity": 8000,
      "diesel": 300
    }
  }
]
```

### Transform Data (GET /transformed-data)

Authorization Method: Bearer Token
Request Type: GET
Endpoint: /transformed-data
Response Data Type: JSON

**Request:**
No parameters required.

**Response:**
```json
{
  "farmId": "123",
  "farmName": "Sample Farm",
  "crops": [
    {
      "cropId": "456",
      "cropName": "Wheat",
      "area": 50,
      "yield": 200
    },
    {
      "cropId": "789",
      "cropName": "Corn",
      "area": 30,
      "yield": 150
    }
  ],
  "livestock": [
    {
      "livestockId": "101",
      "livestockType": "Cattle",
      "quantity": 100
    },
    {
      "livestockId": "202",
      "livestockType": "Pigs",
      "quantity": 50
    }
  ],
  "energyUsage": {
    "electricity": 5000,
    "fuel": 3000
  }
}
```

### Calculate (POST /calculate)

Authorization Method: Bearer Token
Request Type: POST
Endpoint: /calculate
Request Data Type: JSON
Response Data Type: JSON
Request:
{
  "farmId": "123",
  "farmName": "Sample Farm",
  "crops": [
    {
      "cropId": "456",
      "cropName": "Wheat",
      "area": 50,
      "yield": 200
    },
    {
      "cropId": "789",
      "cropName": "Corn",
      "area": 30,
      "yield": 150
    }
  ],
  "livestock": [
    {
      "livestockId": "101",
      "livestockType": "Cattle",
      "quantity": 100
    },
    {
      "livestockId": "202",
      "livestockType": "Pigs",
      "quantity": 50
    }
  ],
  "energyUsage": {
    "electricity": 5000,
    "fuel": 3000
  }
}

Response:
{
  "carbonEmissions": {
    "total": 1500,  // Total carbon emissions in kgCO2e
    "crops": [
      {
        "cropId": "456",
        "emissions": 800  // Emissions from Wheat in kgCO2e
      },
      {
        "cropId": "789",
        "emissions": 500  // Emissions from Corn in kgCO2e
      }
    ],
    "livestock": [
      {
        "livestockId": "101",
        "emissions": 200  // Emissions from Cattle in kgCO2e
      },
      {
        "livestockId": "202",
        "emissions": 100  // Emissions from Pigs in kgCO2e
      }
    ],
    "energyUsage": {
      "electricity": 300,  // Emissions from electricity usage in kgCO2e
      "fuel": 200  // Emissions from fuel usage in kgCO2e
    }
  },
  "recommendations": {
    "cropRotation": true,
    "livestockManagement": "Implement rotational grazing",
    "energyEfficiency": "Upgrade to energy-efficient equipment"
  }
}



### Recommend (POST /recommend)
Authorization Method: Bearer Token
Request Type: POST
Endpoint: /recommend
Request Data Type: JSON
Response Data Type: JSON
Request:
{
  "farmId": "12345",
  "cropRotation": true,
  "grazingPractices": "Continuous Grazing",
  "equipmentEfficiency": "Outdated",
  "energyUsage": {
    "electricity": 50000, // in kWh
    "fuel": 2000 // in gallons
  },
  // transformed data
  "carbonCalculatorOutput": {
    "totalCO2e": 15000, // in kg
    "perCropCO2e": {
      "corn": 3000, // in kg
      "soybean": 5000, // in kg
      "wheat": 7000 // in kg
    },
    // Additional carbon calculator output data
  },
  // Additional recommendation engine input fields
  "financialIncentives": {
    "subsidies": 20000, // in USD
    "taxCredits": 5000 // in USD
  },
  "sustainabilityImprovements": [
    "Implement no-till farming practices",
    "Upgrade equipment to improve efficiency"
  ]
}


Response:
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
