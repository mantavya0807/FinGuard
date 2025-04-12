import sys
import dotenv
import os
import google.generativeai as genai
from typing import Dict, Any, Optional
from checkscam import IPQS # Assuming IPQS class is in checkscam.py
from checkgambling import checkgambling # Assuming function is in checkgambling.py


def configure_gemini():
    dotenv.load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)


def generate_nudge(url: str) -> Optional[str]:
    scam_checker = IPQS()
    scam_results = scam_checker.checkscam(url)
    gambling_result = checkgambling(url)



    # --- Determine if a nudge is needed ---
    is_gambling = gambling_result is True # Treat only explicit True as gambling
    
    # Extract positive scam findings
    detected_threats = {k for k, v in scam_results.items() if v is True}
    
    # If not gambling AND no threats detected, no nudge needed
    if not is_gambling and not detected_threats:
        print("No significant risks detected. No nudge generated.", file=sys.stderr) # Optional debug info
        return None

    # --- Prepare inputs for the prompt ---
    gambling_status = "Yes" if is_gambling else "No"
    if gambling_result is None or isinstance(gambling_result, str):
         gambling_status = "Unknown" # Handle error/uncertainty case

    threat_summary = "None"
    if detected_threats:
        # Format threats nicely, e.g., "Unsafe, Phishing, Malware"
        threat_summary = ", ".join(sorted(list(threat_threat.capitalize() for threat_threat in detected_threats)))

    # --- Construct the Prompt ---
    prompt = f"""
    Context:
    - Website URL: {url}
    - Primary Activity Identified as Gambling: {gambling_status}
    - Detected Security Flags: {threat_summary}

    Task:
    Generate a brief, user-friendly nudge message (1-2 sentences max) for a web user based *only* on the context above.

    Instructions for the nudge:
    - Purpose: To make the user aware of potential risks without causing panic or being overly technical. It's a gentle 'heads-up'.
    - Tone: Cautious, helpful, simple language.
    - Content Priority:
        1. If security flags (like unsafe, spamming, malware, phishing, suspicious) are detected, the nudge *must* focus on warning about these risks and advise caution or avoidance. Mentioning gambling is secondary or omitted if security flags are present.
        2. If *only* gambling is identified (no security flags), the nudge should mention it looks like a gambling site and advise caution, especially regarding financial activity.
        3. If gambling status is Unknown but security flags exist, focus only on the security flags.
    - Do NOT: Mention the specific tools used (like IPQS or Gemini), use jargon, or output anything other than the nudge message itself.

    Generate the nudge message now:
    """


    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')


        response = model.generate_content(prompt)

        # --- Process Response ---
        nudge_message = response.text.strip()

        if not nudge_message:
             print(f"Warning: Gemini returned an empty response for nudge generation for {url}.", file=sys.stderr)
             return None 

        return nudge_message

    except Exception as e:
        print(f"Error during Gemini API call for nudge generation ({url}): {e}", file=sys.stderr)
        
        return None # Indicate failure to generate nudge


if __name__ == '__main__':

    configure_gemini()

    # def dummy_checkscam(url):
    #     if "badsite-phishing" in url:
    #         return {"unsafe": True, "phishing": True, "spamming": False, "malware": False, "suspicious": True}
    #     elif "badsite-malware" in url:
    #          return {"unsafe": True, "phishing": False, "spamming": False, "malware": True, "suspicious": False}
    #     else:
    #         return {"unsafe": False, "phishing": False, "spamming": False, "malware": False, "suspicious": False}

    # def dummy_checkgambling(url):
    #     if "gamblingsite" in url:
    #         return True
    #     elif "casinosite" in url:
    #          return True
    #     elif "badsitex" in url:
    #          return "Something prolly went wrong"
    #     else:
    #         return False 

    # # --- Test Cases ---
    # urls_to_test = [
    #     "https://example-gamblingsite.com",
    #     "https://example-clean-news.com",
    #     "https://example-badsite-phishing.com",
    #     "https://example-gamblingsite-with-malware.com", 
    #     "https://example-badsitex.org"
    # ]

    # Adjust dummy_checkscam for the combined case
    # def dummy_checkscam_combined(url):
    #      if "badsite-phishing" in url:
    #         return {"unsafe": True, "phishing": True, "spamming": False, "malware": False, "suspicious": True}
    #      elif "gamblingsite-with-malware" in url:
    #          return {"unsafe": True, "phishing": False, "spamming": False, "malware": True, "suspicious": False}
    #      elif "badsite-malware" in url: # Keep this distinct if needed
    #           return {"unsafe": True, "phishing": False, "spamming": False, "malware": True, "suspicious": False}
    #      else:
    #         return {"unsafe": False, "phishing": False, "spamming": False, "malware": False, "suspicious": False}


    # for test_url in urls_to_test:
    #     print(f"\n--- Checking: {test_url} ---")
        # from checkscam import IPQS # Assuming IPQS class is in checkscam.py
        # from checkgambling import checkgambling # Assuming function is in checkgambling.py
        # scam_checker = IPQS()
        # current_scam_results = scam_checker.checkscam(test_url)
        # current_gambling_result = checkgambling(test_url)



        # Using test functions for this example:
        # current_scam_results = dummy_checkscam_combined(test_url)
        # current_gambling_result = dummy_checkgambling(test_url)

    from checkscam import IPQS # Assuming IPQS class is in checkscam.py
    from checkgambling import checkgambling # Assuming function is in checkgambling.py
    

    test_url = "apple.com"

    # print(f"Scan Results: {current_scam_results}")
    # print(f"Gambling Result: {current_gambling_result}")

    nudge = generate_nudge(test_url)

    if nudge:
        print(f"Nudge Generated: {nudge}")
    else:
        print("No nudge generated (or error occurred).")