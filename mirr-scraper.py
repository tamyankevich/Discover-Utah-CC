import requests
from bs4 import BeautifulSoup
import csv
import time
import re
import os
from urllib.parse import urljoin, urlparse

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

def sanitize_folder_name(name):
    """
    Sanitize folder name by removing/replacing invalid characters
    """
    # Remove or replace invalid characters for folder names
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        name = name.replace(char, '_')
    # Remove extra spaces and limit length
    name = re.sub(r'\s+', '_', name.strip())
    return name[:100]  # Limit to 100 characters

def scrape_property_images(listing_url, ranch_name, base_folder='ranch_images'):
    """
    Scrape images from individual property page
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print(f"Scraping images from: {listing_url}")
        response = requests.get(listing_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Create folder for this property first
        safe_ranch_name = sanitize_folder_name(ranch_name)
        property_folder = os.path.join(base_folder, safe_ranch_name)
        os.makedirs(property_folder, exist_ok=True)
        
        image_urls = []
        
        # Method 1: Look for gallery image wrappers
        gallery_divs = soup.find_all('div', class_='mrg-gallery-image-wrapper')
        
        if gallery_divs:
            print(f"Found {len(gallery_divs)} gallery wrapper divs")
            
            # Extract image URLs from data-lazy-bg attributes
            for i, div in enumerate(gallery_divs):
                try:
                    # Look for the inner div with data-lazy-bg attribute
                    image_div = div.find('div', class_='mrg-gallery-image')
                    if image_div and image_div.get('data-lazy-bg'):
                        image_url = image_div.get('data-lazy-bg')
                        
                        # Skip video thumbnails if you only want photos
                        if 'youtube.com' in image_url:
                            print(f"  Skipping video thumbnail: {image_url}")
                            continue
                        
                        # Make URL absolute
                        image_url = urljoin(listing_url, image_url)
                        image_urls.append(image_url)
                        
                        # Download the image
                        download_image(image_url, property_folder, f"image_{i+1:02d}")
                        
                except Exception as e:
                    print(f"Error processing image {i+1}: {e}")
                    continue
        
        # Method 2: If no gallery wrappers found, look for any divs with background-image
        if not image_urls:
            print("No gallery wrappers found, searching for background-image divs...")
            all_divs_with_bg = soup.find_all('div', style=re.compile(r'background-image'))
            
            if all_divs_with_bg:
                print(f"Found {len(all_divs_with_bg)} divs with background-image")
                
                for i, div in enumerate(all_divs_with_bg):
                    try:
                        style = div.get('style', '')
                        url_match = re.search(r'background-image:\s*url\([\'"]?(.*?)[\'"]?\)', style)
                        if url_match:
                            image_url = url_match.group(1)
                            # Skip placeholder images
                            if 'placeholder' in image_url.lower() or 'default' in image_url.lower():
                                continue
                            
                            # Make URL absolute
                            image_url = urljoin(listing_url, image_url)
                            
                            # Avoid duplicates
                            if image_url not in image_urls:
                                image_urls.append(image_url)
                                
                                # Download the image
                                download_image(image_url, property_folder, f"image_{i+1:02d}")
                                
                    except Exception as e:
                        print(f"Error processing background image {i+1}: {e}")
                        continue
        
        # Method 3: Look for regular <img> tags as fallback
        if not image_urls:
            print("No background images found, searching for <img> tags...")
            img_tags = soup.find_all('img', src=True)
            
            if img_tags:
                print(f"Found {len(img_tags)} img tags")
                
                for i, img in enumerate(img_tags):
                    try:
                        src = img.get('src')
                        if src and not any(skip in src.lower() for skip in ['placeholder', 'logo', 'icon', 'thumb']):
                            # Make URL absolute
                            image_url = urljoin(listing_url, src)
                            
                            # Avoid duplicates
                            if image_url not in image_urls:
                                image_urls.append(image_url)
                                
                                # Download the image
                                download_image(image_url, property_folder, f"image_{i+1:02d}")
                                
                    except Exception as e:
                        print(f"Error processing img tag {i+1}: {e}")
                        continue
        
        if not image_urls:
            print(f"No images found for {ranch_name}")
            return []
        
        print(f"Successfully processed {len(image_urls)} images for {ranch_name}")
        return image_urls
        
    except Exception as e:
        print(f"Error scraping images for {ranch_name}: {e}")
        return []

def download_image(image_url, folder_path, base_filename):
    """
    Download an image from URL and save to specified folder
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(image_url, headers=headers)
        response.raise_for_status()
        
        # Get file extension from URL
        parsed_url = urlparse(image_url)
        file_ext = os.path.splitext(parsed_url.path)[1]
        if not file_ext:
            file_ext = '.jpg'  # Default to jpg if no extension
        
        filename = f"{base_filename}{file_ext}"
        filepath = os.path.join(folder_path, filename)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✓ Downloaded: {filename}")
        return True
        
    except Exception as e:
        print(f"  ❌ Failed to download {image_url}: {e}")
        return False

def scrape_listings_with_images(url, output_filename='ranch_listings_with_images.csv', download_images=True):
    """
    Enhanced version that scrapes listings and their images
    """
    # First, scrape the main listings
    listings = scrape_ranch_listings(url, output_filename)
    
    if not listings or not download_images:
        return listings
    
    print(f"\n=== Starting image scraping for {len(listings)} properties ===")
    
    # Create base images folder
    base_folder = 'ranch_images'
    os.makedirs(base_folder, exist_ok=True)
    
    # Process each listing for images
    for i, listing in enumerate(listings):
        if listing['Listing URL'] != 'N/A':
            print(f"\n[{i+1}/{len(listings)}] Processing images for: {listing['Ranch Name']}")
            
            # Scrape images for this property
            image_urls = scrape_property_images(
                listing['Listing URL'], 
                listing['Ranch Name'], 
                base_folder
            )
            
            # Add image count to listing data
            listing['Image Count'] = len(image_urls)
            
            # Be respectful - add delay between requests
            time.sleep(3)
        else:
            print(f"\n[{i+1}/{len(listings)}] Skipping {listing['Ranch Name']} - No listing URL")
            listing['Image Count'] = 0
    
    # Update CSV with image counts
    fieldnames = ['Ranch Name', 'City', 'State', 'County', 'Price', 'Price (Clean)', 
                 'Acres', 'Acre Type', 'Full Location', 'Listing URL', 'Image Count']
    
    with open(output_filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(listings)
    
    print(f"\n🎉 Completed scraping {len(listings)} listings with images!")
    return listings

# Main execution
if __name__ == "__main__":
    # URL from your message
    url = "https://www.mirrranchgroup.com/ranches-for-sale/chris-corroon-listings/?agent=chris-corroon"
    
    print("=== Scraping Chris Corroon Ranch Listings with Images ===")
    
    # Choose your scraping method:
    
    # Option 1: Scrape listings AND download all images (RECOMMENDED)
    listings = scrape_listings_with_images(url, 'chris_corroon_ranch_listings_with_images.csv', download_images=True)
    
    # Option 2: Scrape only listings without images (uncomment to use instead)
    # listings = scrape_ranch_listings(url, 'chris_corroon_ranch_listings.csv')
    
    # Option 3: Multiple pages with images (uncomment to use instead)
    # listings = scrape_multiple_pages(url, max_pages=5, output_filename='chris_corroon_all_listings.csv')
    
    total_images = sum(listing.get('Image Count', 0) for listing in listings)
    print(f"\n🎉 Script completed!")
    print(f"📋 Found {len(listings)} total listings")
    print(f"🖼️  Downloaded {total_images} total images")
    print(f"📁 Images organized in 'ranch_images/' folder by property name")