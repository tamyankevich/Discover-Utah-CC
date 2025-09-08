import requests
from bs4 import BeautifulSoup
import csv
import time
import re

def scrape_ranch_listings(url, output_filename='ranch_listings.csv'):
    """
    Scrape ranch listings from the specified URL and save to CSV
    """
    
    # Headers to make the request look more like a regular browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Make request to the page
        print(f"Fetching data from: {url}")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse the HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all listing cards with the entry-footer class
        listing_cards = soup.find_all('div', class_='entry-footer')
        
        print(f"Found {len(listing_cards)} listings")
        
        # Prepare data for CSV
        listings_data = []
        
        for card in listing_cards:
            try:
                # Extract ranch name
                ranch_name_elem = card.find('h2', class_='mrg-listing-card')
                ranch_name = ranch_name_elem.text.strip() if ranch_name_elem else 'N/A'
                
                # Extract location information
                location_div = card.find('div', class_='prop-location')
                city, state, county = 'N/A', 'N/A', 'N/A'
                
                if location_div:
                    prop_infos = location_div.find_all('span', class_='prop-info')
                    if len(prop_infos) >= 2:
                        city = prop_infos[0].text.strip()
                        state = prop_infos[1].text.strip().replace(',', '').strip()
                    
                    # Extract county (in parentheses)
                    county_elem = location_div.find('span', class_='prop-country')
                    if county_elem:
                        county_text = county_elem.text.strip()
                        # Remove parentheses
                        county = county_text.replace('(', '').replace(')', '')
                
                # Extract price
                price_elem = card.find('span', class_='prop-price')
                price = price_elem.text.strip() if price_elem else 'N/A'
                
                # Extract acres
                acres_elem = card.find('span', class_='prop-acres')
                acres = acres_elem.text.strip() if acres_elem else 'N/A'
                
                # Extract acre type (Deeded Acres, etc.)
                acre_type_elem = card.find('span', class_='prop-add-options')
                acre_type = acre_type_elem.text.strip() if acre_type_elem else 'N/A'
                
                # Extract URL from sibling <a> element
                listing_url = 'N/A'
                # Look for sibling <a> element or parent container with <a>
                parent = card.parent
                if parent:
                    # Check if parent has an <a> tag
                    a_elem = parent.find('a')
                    if a_elem and a_elem.get('href'):
                        href = a_elem.get('href')
                        # Make URL absolute if it's relative
                        if href.startswith('/'):
                            listing_url = f"https://www.mirrranchgroup.com{href}"
                        elif href.startswith('http'):
                            listing_url = href
                        else:
                            listing_url = f"https://www.mirrranchgroup.com/{href}"
                
                # Clean up the data
                price_clean = price.replace('$', '').replace(',', '') if price != 'N/A' else 'N/A'
                acres_clean = acres.replace('+/-', '').strip() if acres != 'N/A' else 'N/A'
                
                # Add to listings data
                listings_data.append({
                    'Ranch Name': ranch_name,
                    'City': city,
                    'State': state,
                    'County': county,
                    'Price': price,
                    'Price (Clean)': price_clean,
                    'Acres': acres_clean,
                    'Acre Type': acre_type,
                    'Full Location': f"{city}, {state} ({county})" if all([city, state, county]) != 'N/A' else 'N/A',
                    'Listing URL': listing_url
                })
                
                print(f"✓ Extracted: {ranch_name} - {city}, {state}")
                
            except Exception as e:
                print(f"Error processing a listing: {e}")
                continue
        
        # Write to CSV
        if listings_data:
            fieldnames = ['Ranch Name', 'City', 'State', 'County', 'Price', 'Price (Clean)', 
                         'Acres', 'Acre Type', 'Full Location', 'Listing URL']
            
            with open(output_filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(listings_data)
            
            print(f"\n✅ Successfully saved {len(listings_data)} listings to {output_filename}")
            
            # Print summary
            print("\nSample of extracted data:")
            for i, listing in enumerate(listings_data[:3]):  # Show first 3 listings
                print(f"{i+1}. {listing['Ranch Name']} - {listing['Full Location']} - {listing['Price']} - {listing['Acres']} {listing['Acre Type']}")
                
        else:
            print("❌ No listings found. The page structure might have changed.")
            
        return listings_data
        
    except requests.RequestException as e:
        print(f"❌ Error fetching the webpage: {e}")
        return []
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return []

def scrape_multiple_pages(base_url, max_pages=10, output_filename='ranch_listings_all.csv'):
    """
    Scrape multiple pages if pagination exists
    """
    all_listings = []
    
    for page in range(1, max_pages + 1):
        # You might need to adjust this URL pattern based on how pagination works
        if page == 1:
            url = base_url
        else:
            url = f"{base_url}&page={page}"  # Adjust pagination pattern as needed
        
        print(f"\n--- Scraping page {page} ---")
        listings = scrape_ranch_listings(url, f"temp_page_{page}.csv")
        
        if not listings:
            print(f"No listings found on page {page}, stopping...")
            break
            
        all_listings.extend(listings)
        
        # Be respectful - add a small delay between requests
        time.sleep(2)
    
    # Save all listings to one file
    if all_listings:
        fieldnames = ['Ranch Name', 'City', 'State', 'County', 'Price', 'Price (Clean)', 
                     'Acres', 'Acre Type', 'Full Location', 'Listing URL']
        
        with open(output_filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_listings)
        
        print(f"\n🎉 Successfully saved {len(all_listings)} total listings to {output_filename}")
    
    return all_listings

# Main execution
if __name__ == "__main__":
    # URL from your message
    url = "https://www.mirrranchgroup.com/ranches-for-sale/chris-corroon-listings/?agent=chris-corroon"
    
    # Option 1: Scrape single page
    print("=== Scraping Chris Corroon Ranch Listings ===")
    listings = scrape_ranch_listings(url, 'chris_corroon_ranch_listings.csv')
    
    # Option 2: If you want to try multiple pages (uncomment below)
    # listings = scrape_multiple_pages(url, max_pages=5, output_filename='chris_corroon_all_listings.csv')
    
    print(f"\nScript completed. Found {len(listings)} total listings.")