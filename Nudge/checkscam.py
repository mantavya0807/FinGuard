import requests
import json
import urllib.parse
import dotenv
import os
#import openai

dotenv.load_dotenv()

class IPQS:
    key = os.getenv('IPQS_Key')
    
    def checkscam(self, url: str, vars: dict = {}) -> dict:
    
        api_url = 'https://www.ipqualityscore.com/api/json/url/%s/%s' % (self.key, urllib.parse.quote_plus(url))
        response = requests.get(api_url, params=vars)
        

        result = json.loads(response.text)
        

        output = {"unsafe": result.get("unsafe", False)}
        

        for field in ["spamming", "malware", "phishing", "suspicious"]:
            if result.get(field, False):
                output[field] = True
        
        return output

if __name__ == "__main__":

    URL = 'http://alpha1company.ng' #test a sus website

    strictness = 0
    additional_params = {
        'strictness': strictness,
        'fast': 1
    }
    
    ipqs = IPQS()
    result = ipqs.checkscam(URL, additional_params)
    
    print(result)
