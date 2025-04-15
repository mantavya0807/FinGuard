#!/usr/bin/env python3
import time
import re
from pymongo import MongoClient
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

# ----- MONGODB ATLAS SETUP -----
# Replace the placeholder URI with your MongoDB Atlas connection string.
MONGO_URI = "mongodb+srv://manas1:hardpass@cluster0.hzb6xlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "card_rewards"
REWARDS_COLLECTION_NAME = "rewards"
OFFERS_COLLECTION_NAME = "offers"

def get_mongodb_collection():
    """Initialize MongoDB client and return the rewards collection."""
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[REWARDS_COLLECTION_NAME]
    return collection

def get_offers_collection():
    """Initialize MongoDB client and return the offers collection."""
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    offers_collection = db[OFFERS_COLLECTION_NAME]
    return offers_collection

def insert_reward(collection, card_name, category, reward, full_text, extra_fields=None):
    """Inserts a reward document into the rewards collection."""
    document = {
        "card_name": card_name,
        "category": category,
        "reward": reward,
        "full_text": full_text,
    }
    if extra_fields:
        document.update(extra_fields)
    collection.insert_one(document)

def insert_offer(collection, card_name, category, offer, full_text, extra_fields=None):
    """Inserts an offer document (for statement credits) into the offers collection."""
    document = {
        "card_name": card_name,
        "category": category,
        "offer": offer,
        "full_text": full_text,
    }
    if extra_fields:
        document.update(extra_fields)
    collection.insert_one(document)

# ----- CATEGORY STANDARDIZATION -----
def standardize_category(text):
    """
    Map the raw category text to one of the allowed final standardized categories.
    Allowed categories:
      Groceries
      U.S. Online Retail Purchases
      Gas
      other purchases
      Streaming Subscriptions
      Transit
      Food Services
      Hotels
      Capital One Hotels
      wholesale Clubs
      drugstore
    """
    if not text or text.strip() == "":
        return "other purchases"
    cat = text.lower().strip()
    # Treat "all purchases" as non-specific → other purchases.
    if cat in ["all purchases", "all"]:
        return "other purchases"
    # Capture both "grocery" and "groceries"
    if "grocer" in cat:
        return "Groceries"
    if "online retail" in cat or ("online" in cat and "retail" in cat):
        return "U.S. Online Retail Purchases"
    if "gas" in cat or "fuel" in cat:
        return "Gas"
    if "streaming" in cat:
        return "Streaming Subscriptions"
    if "transit" in cat:
        return "Transit"
    # For food-related terms, include dining, restaurants, food ordering.
    if "restaurant" in cat or "dine" in cat or ("food" in cat and "grocer" not in cat):
        return "Food Services"
    # Check for "capital one hotel" before generic "hotel" check
    if "capital one hotel" in cat:
        return "Capital One Hotels"
    if "hotel" in cat:
        return "Hotels"
    if "wholesale" in cat or "club" in cat:
        return "Wholesale Clubs"
    if "drugstore" in cat or "pharmacy" in cat:
        return "drugstore"
    return "Other purchases"

# ----- SCRAPING FUNCTION -----
def get_raw_page_text(url):
    """Uses Selenium to retrieve the fully rendered page text."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    service = Service('/opt/homebrew/bin/chromedriver')
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.get(url)
    time.sleep(5)  # Wait for full page load
    html = driver.page_source
    driver.quit()
    soup = BeautifulSoup(html, 'html.parser')
    raw_text = soup.get_text(" ", strip=True)
    return raw_text

# ----- EXTRACTION FUNCTIONS -----
def clean_reward_data(raw_text, card_name):
    """
    Cleans the raw text and extracts reward details.
    Returns a list of dictionaries with keys:
       reward_type, category, reward, full_text, and optionally limit.
    """
    # Remove extraneous symbols.
    cleaned_text = raw_text.replace("¤", " ").replace("‡", " ").replace("♦︎", " ")
    limit_pattern = re.compile(r"up to \$([\d,]+)", re.IGNORECASE)
    extracted_rewards = []
    seen = set()

    # --- Branch for Discover It Student Card ---
    if card_name == "Discover It Student Card":
        discover_pattern = re.compile(
            r"Where\s+can\s+you\s+get\s+5%\s+cash\s+back\s+today\?\s*[A-Za-z0-9\.\s-]+\s+(?P<category>.+?)\s+Earn\s+5%\s+Cashback\s+Bonus",
            re.IGNORECASE
        )
        for match in discover_pattern.finditer(cleaned_text):
            rec_category = re.sub(r'\s+', ' ', match.group("category").strip())
            record = {
                "reward_type": "discover_cashback_5",
                "reward": "5%",
                "category": standardize_category(rec_category),
                "full_text": match.group(0).strip()
            }
            limit_match = limit_pattern.search(match.group(0))
            record["limit"] = limit_match.group(1) if limit_match else None
            dedup_key = ("discover_cashback_5", record["reward"], record["category"])
            if dedup_key not in seen:
                seen.add(dedup_key)
                extracted_rewards.append(record)
        discover_pattern_1 = re.compile(
            r"earn\s+1%\s+cash\s+back\s+on\s+all\s+other\s+purchases",
            re.IGNORECASE
        )
        for match in discover_pattern_1.finditer(cleaned_text):
            record = {
                "reward_type": "discover_cashback_1",
                "reward": "1%",
                "category": standardize_category("All Purchases"),
                "full_text": match.group(0).strip()
            }
            dedup_key = ("discover_cashback_1", record["reward"], record["category"])
            if dedup_key not in seen:
                seen.add(dedup_key)
                extracted_rewards.append(record)
        return extracted_rewards

    # --- Branch for Chase Freedom Unlimited ---
    if card_name == "Chase Freedom Unlimited":
        freedom_patterns = [
            { 
                'type': 'freedom',
                'category': "Dining at Restaurants",  # will map to Food Services
                'pattern': re.compile(
                    r"Earn\s+(?P<percent>\d+)%\s+on\s+dining\s+at\s+restaurants(?:,\s+including\s+takeout\s+and\s+eligible\s+delivery\s+services)?\.?",
                    re.IGNORECASE
                )
            },
            { 
                'type': 'freedom',
                'category': "Drugstore Purchases",  # should map to drugstore
                'pattern': re.compile(
                    r"Earn\s+(?P<percent>\d+)%\s+on\s+drugstore\s+purchases\.?",
                    re.IGNORECASE
                )
            },
            { 
                'type': 'freedom',
                'category': "Travel Purchased through Chase TravelSM",  # no matching allowed category; defaults to other purchases
                'pattern': re.compile(
                    r"Earn\s+(?P<percent>\d+)%\s+on\s+travel\s+purchased\s+through\s+Chase\s+TravelSM\.?",
                    re.IGNORECASE
                )
            },
            { 
                'type': 'freedom',
                'category': "All Other Purchases",
                'pattern': re.compile(
                    r"Earn\s+(?P<percent>\d+(\.\d+)?)%\s+on\s+all\s+other\s+purchases\*?",
                    re.IGNORECASE
                )
            }
        ]
        for rp in freedom_patterns:
            for match in rp['pattern'].finditer(cleaned_text):
                percent = match.group("percent").strip()
                record = {
                    "reward_type": "freedom",
                    "reward": f"{percent}%",
                    "category": standardize_category(rp['category']),
                    "full_text": match.group(0).strip()
                }
                limit_match = limit_pattern.search(match.group(0))
                record["limit"] = limit_match.group(1) if limit_match else None
                dedup_key = ("freedom", record["reward"], record["category"])
                if dedup_key not in seen:
                    seen.add(dedup_key)
                    extracted_rewards.append(record)
        return extracted_rewards

    # --- Branch for CapitalOne Savor Card ---
    if card_name == "CapitalOne Savor Card":
        reward_patterns = [
            { 
                'type': 'cashback_savor',
                'pattern': re.compile(
                    r"Earn\s+unlimited\s+(?P<percent>\d+)%\s+cash\s+back\s+on\s+(?P<category>[^,]+)",
                    re.IGNORECASE
                )
            },
            { 
                'type': 'cashback_savor_travel',
                'pattern': re.compile(
                    r"Earn\s+unlimited\s+(?P<percent>\d+)%\s+cash\s+back\s+on\s+hotels\s+and\s+rental\s+cars\s+booked\s+through\s+Capital\s+One\s+Travel",
                    re.IGNORECASE
                ),
                "category": "Capital One Hotels"
            },
            { 
                'type': 'cashback_savor_grocery',
                'pattern': re.compile(
                    r"Earn\s+unlimited\s+(?P<percent>\d+)%\s+cash\s+back\s+at\s+grocery\s+stores",
                    re.IGNORECASE
                ),
                "category": "Groceries"
            },
            { 
                'type': 'cashback_savor_other',
                'pattern': re.compile(
                    r"Earn\s+unlimited\s+(?P<percent>\d+)%\s+cash\s+back\s+on\s+all\s+other\s+purchases",
                    re.IGNORECASE
                ),
                "category": "other purchases"
            }
        ]
        for rp in reward_patterns:
            for match in rp['pattern'].finditer(cleaned_text):
                reward_type = rp['type']
                percent = match.group("percent").strip()
                record = {'reward_type': reward_type, 'full_text': match.group(0).strip()}
                record["reward"] = f"{percent}%"
                if "category" in rp:
                    record["category"] = standardize_category(rp["category"])
                elif "category" in match.groupdict() and match.group("category"):
                    recat = re.sub(r'\s+', ' ', match.group("category").strip())
                    record["category"] = standardize_category(recat)
                else:
                    record["category"] = "other purchases"
                limit_match = limit_pattern.search(match.group(0))
                record["limit"] = limit_match.group(1) if limit_match else None
                dedup_key = (reward_type, record.get("reward"), record.get("category"))
                if dedup_key not in seen:
                    seen.add(dedup_key)
                    extracted_rewards.append(record)
        return extracted_rewards

    # --- Branch for CapitalOne Quicksilver Rewards ---
    if card_name == "CapitalOne Quicksilver Rewards":
        reward_patterns = [
            { 
                'type': 'cashback_quicksilver',
                'pattern': re.compile(
                    r"Earn\s+unlimited\s+(?P<percent>\d+(\.\d+)?)%\s+cash\s+back\s+on\s+every\s+purchase",
                    re.IGNORECASE
                )
            }
        ]
        for rp in reward_patterns:
            for match in rp['pattern'].finditer(cleaned_text):
                percent = match.group("percent").strip()
                record = {
                    "reward_type": "cashback_quicksilver",
                    "reward": f"{percent}%",
                    "category": standardize_category("All Purchases"),
                    "full_text": match.group(0).strip()
                }
                limit_match = limit_pattern.search(match.group(0))
                record["limit"] = limit_match.group(1) if limit_match else None
                dedup_key = ("cashback_quicksilver", record["reward"], record["category"])
                if dedup_key not in seen:
                    seen.add(dedup_key)
                    extracted_rewards.append(record)
        return extracted_rewards

    # --- Fallback branch for other cards (e.g., Amex cards) ---
    reward_patterns = [
        { 
            'type': 'cashback', 
            'pattern': re.compile(
                r"(?P<percent>\d+)%\s*CASH\s+BACK\s+On\s+(?P<category>[^0-9]+?)(?=\s+\d+%\s*CASH\s+BACK|\Z)",
                re.IGNORECASE | re.DOTALL
            )
        },
        { 
            'type': 'points', 
            'pattern': re.compile(
                r"(?P<multiplier>\d+X)\s+(?P<points>POINTS)\s+On\s+(?P<category>[^0-9]+?)(?=\s+\d+X\s+(?:POINTS|MEMBERSHIP\s+REWARDS\s+POINTS)|\Z)",
                re.IGNORECASE | re.DOTALL
            )
        },
        { 
            'type': 'welcome_points', 
            'pattern': re.compile(
                r"Earn\s+(?P<points_count>[\d,]+)\s+(?:Membership\s+Rewards\s+®?\s*Points|Points)",
                re.IGNORECASE
            )
        },
        { 
            'type': 'credit', 
            'pattern': re.compile(
                r"(?P<credit>\$\d+)\s+.*?statement\s+credit",
                re.IGNORECASE
            )
        }
    ]
    for rp in reward_patterns:
        for match in rp['pattern'].finditer(cleaned_text):
            reward_type = rp['type']
            record = {'reward_type': reward_type, 'full_text': match.group(0).strip()}
            if reward_type in ['cashback']:
                percent = match.group("percent").strip()
                record["reward"] = f"{percent}%"
                if "category" in match.groupdict():
                    recat = match.group("category").strip()
                    record["category"] = standardize_category(recat)
                else:
                    record["category"] = "other purchases"
            elif reward_type == 'points':
                multiplier = match.group("multiplier").strip()
                record["reward"] = f"{multiplier} POINTS"
                record["category"] = standardize_category(match.group("category").strip())
            elif reward_type == 'welcome_points':
                record["reward"] = f"Earn {match.group('points_count').strip()} Points"
                record["category"] = "other purchases"
            elif reward_type == 'credit':
                record["reward"] = f"{match.group('credit').strip()} statement credit"
                record["category"] = standardize_category("")
            limit_match = limit_pattern.search(match.group(0))
            record["limit"] = limit_match.group(1) if limit_match else None
            if reward_type in ['cashback', 'points']:
                dedup_key = (reward_type, record.get("reward"), record.get("category"))
            elif reward_type in ['welcome_points', 'credit']:
                dedup_key = (reward_type, record.get("reward"))
            else:
                dedup_key = (reward_type, record.get("full_text"))
            if dedup_key not in seen:
                seen.add(dedup_key)
                extracted_rewards.append(record)
    return extracted_rewards

# ----- MAIN WORKFLOW -----
def main():
    # Mapping of card URLs to their names.
    card_mapping = {
        "https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/": "AMEX Blue Cash Everyday Card",
        "https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/": "AMEX Blue Cash Preferred Card",
        "https://www.capitalone.com/credit-cards/savor/": "CapitalOne Savor Card",
        "https://www.capitalone.com/credit-cards/quicksilver/": "CapitalOne Quicksilver Rewards",
        "https://www.discover.com/credit-cards/student-credit-card/it-card.html?sc=RJUK&cmpgnid=ls-dca-ir-student-it-RJUK-dtop-396&irgwc=1&sid=09471138&pid=354997&aid=568217&source=Affiliates&sku=110&iq_id=_ec2gixkq6skaxlpblvls2umxo222x01am3utmhsp00#calender-link": "Discover It Student Card",
        "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited?CELL=6TKV": "Chase Freedom Unlimited"
    }
    
    rewards_collection = get_mongodb_collection()
    offers_collection = get_offers_collection()
    # Clear out any previous data in the collections at the start of each run
    rewards_collection.delete_many({})
    offers_collection.delete_many({})
    total_rewards = 0
    total_offers = 0
    
    for url, card_name in card_mapping.items():
        print(f"Scraping raw text from {card_name}: {url}")
        raw_text = get_raw_page_text(url)
        print("Extracting reward details...\n")
        rewards = clean_reward_data(raw_text, card_name)
        
        if rewards:
            print(f"Rewards extracted from {card_name}:")
            for record in rewards:
                category = standardize_category(record.get("category", ""))
                reward_value = record.get("reward", "")
                full_text = record.get("full_text", "")
                print(f" - Card: {card_name}")
                print(f"   Category/Company: {category}")
                print(f"   Reward: {reward_value}")
                if record.get("limit"):
                    print(f"   Spending Limit: ${record.get('limit')}")
                else:
                    print("   Spending Limit: Not specified")
                print(f"   Full text: {full_text}")
                print("-----")
                extra_fields = {k: v for k, v in record.items() if k not in ["reward", "category", "full_text", "reward_type"]}
                # If reward type is credit (statement credit), insert into offers collection.
                if record["reward_type"] == "credit":
                    insert_offer(offers_collection, card_name, category, reward_value, full_text, extra_fields)
                    total_offers += 1
                else:
                    insert_reward(rewards_collection, card_name, category, reward_value, full_text, extra_fields)
                    total_rewards += 1
        else:
            print(f"No reward data extracted from {card_name}. Please check the regex patterns.\n")
    
        print(f"\nTotal rewards extracted and inserted so far: {total_rewards}")
        print(f"Total offers extracted and inserted so far: {total_offers}\n")
    
if __name__ == "__main__":
    while True:
        print("Starting a new scraping run...")
        main()
        print("Scraping run complete. Waiting 6 hours until the next run...\n")
        time.sleep(6 * 60 * 60)  # Sleep for 6 hours (6 * 60 minutes * 60 seconds)
