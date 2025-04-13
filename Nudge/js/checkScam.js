require('dotenv').config();
const axios = require('axios');

class IPQS {
  constructor() {
    this.key = process.env.IPQS_Key;
  }
  
  async checkScam(url, vars = {}) {
    try {
      const encodedUrl = encodeURIComponent(url);
      const apiUrl = `https://www.ipqualityscore.com/api/json/url/${this.key}/${encodedUrl}`;
      
      const response = await axios.get(apiUrl, { params: vars });
      const result = response.data;
      
      const output = { "unsafe": result.unsafe};
      
      // Add specific threat fields if they are true
      for (const field of ["spamming", "malware", "phishing", "suspicious"]) {
        if (result[field] === true) {
          output[field] = true;
        }
      }
      console.log(result)
      return output;
    } catch (error) {
      console.error(`Error checking URL ${url}: ${error.message}`);
      return { "error": error.message };
    }
  }
}

module.exports = { IPQS };

// Main execution if called directly
if (require.main === module) {
  const URL = 'http://alpha1company.ng'; // test a suspicious website
  
  const additionalParams = {
    strictness: 0,
    fast: 1
  };
  
  const ipqs = new IPQS();
  
  ipqs.checkScam(URL, additionalParams)
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
    });
}   