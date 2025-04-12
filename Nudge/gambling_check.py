import sys
import dotenv
import os
import google.generativeai as genai
import argparse

def configure_gemini():
    dotenv.load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)


def is_gambling_website(url: str) -> int | None:

    # Using a faster/cheaper model suitable for classification tasks.
    # You could also use 'gemini-pro' or other models.
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    # Construct a precise prompt asking for a binary classification (0 or 1)
    # Emphasize the output format strictly.
    prompt = f"""
    Analyze the website content accessible at the following URL: {url}

    Is the primary purpose of this website related to gambling activities?
    Gambling activities include, but are not limited to: online casinos,
    sports betting, poker sites, lottery sites, bingo sites, or sites
    offering games of chance for money.

    Please respond with ONLY the single digit '1' if YES (it is primarily a gambling website).
    Please respond with ONLY the single digit '0' if NO (it is not primarily a gambling website).

    Do not provide any explanation, reasoning, or additional text. Your entire response must be '1' or '0'.
    """
    response = model.generate_content(prompt)


    # --- Response Processing ---
            # Accessing the text safely
    result_text = response.text.strip()


    if result_text == '1':
        return 1
    elif result_text == '0':
        return 0
    else:

        print(f"Warning: Unexpected response format from Gemini API for {url}: '{result_text}'. Expected '1' or '0'.", file=sys.stderr)

        return "Something prolly went wrong" 

# --- Main Execution ---
if __name__ == "__main__":
    website_url = "https://www.betmgm.com"
    # print(url)

    configure_gemini()

    classification_result = is_gambling_website(website_url)

    # Output the result
    if classification_result is not None:
        print(classification_result)
    else:
        print(f"Failed to classify URL: {website_url}", file=sys.stderr)
        sys.exit(1)