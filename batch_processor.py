#!/usr/bin/env python3
"""
Batch Music Processor
Process multiple music URLs from various sources
"""

import os
import json
import time
from datetime import datetime
from cli_converter import CLIMusicConverter

class BatchProcessor:
    def __init__(self, output_dir="./downloads"):
        self.converter = CLIMusicConverter()
        self.output_dir = output_dir
        self.log_file = os.path.join(output_dir, "batch_log.json")
        self.results = []
        
    def load_urls_from_file(self, file_path):
        """Load URLs from a text file"""
        urls = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if line and not line.startswith('#'):  # Skip empty lines and comments
                        urls.append({
                            'url': line,
                            'line_number': line_num,
                            'status': 'pending'
                        })
            print(f"Loaded {len(urls)} URLs from {file_path}")
            return urls
        except Exception as e:
            print(f"Error loading URLs from {file_path}: {e}")
            return []
    
    def load_urls_from_json(self, json_path):
        """Load URLs from a JSON file with metadata"""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
                elif 'urls' in data:
                    return data['urls']
                else:
                    print("Invalid JSON format")
                    return []
        except Exception as e:
            print(f"Error loading JSON from {json_path}: {e}")
            return []
    
    def save_progress(self):
        """Save current progress to log file"""
        try:
            log_data = {
                'timestamp': datetime.now().isoformat(),
                'total_urls': len(self.results),
                'completed': len([r for r in self.results if r['status'] == 'completed']),
                'failed': len([r for r in self.results if r['status'] == 'failed']),
                'results': self.results
            }
            
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving progress: {e}")
    
    def process_batch(self, urls, format_type='wav', quality='best', delay=2):
        """Process a batch of URLs"""
        print(f"Starting batch processing of {len(urls)} URLs")
        print(f"Format: {format_type}, Quality: {quality}")
        print(f"Output directory: {self.output_dir}")
        print("-" * 50)
        
        self.results = urls.copy()
        
        for i, url_data in enumerate(self.results, 1):
            url = url_data['url']
            print(f"\n[{i}/{len(self.results)}] Processing: {url}")
            
            try:
                # Update status
                url_data['status'] = 'processing'
                url_data['start_time'] = datetime.now().isoformat()
                
                # Download
                result = self.converter.download_audio(
                    url, self.output_dir, format_type, quality
                )
                
                if result:
                    url_data['status'] = 'completed'
                    url_data['output_file'] = result
                    url_data['end_time'] = datetime.now().isoformat()
                    print(f"✓ Success: {os.path.basename(result)}")
                else:
                    url_data['status'] = 'failed'
                    url_data['error'] = 'Download failed'
                    url_data['end_time'] = datetime.now().isoformat()
                    print(f"✗ Failed: {url}")
                
                # Save progress after each download
                self.save_progress()
                
                # Delay between downloads to be respectful
                if i < len(self.results) and delay > 0:
                    print(f"Waiting {delay} seconds before next download...")
                    time.sleep(delay)
                    
            except Exception as e:
                url_data['status'] = 'failed'
                url_data['error'] = str(e)
                url_data['end_time'] = datetime.now().isoformat()
                print(f"✗ Error: {e}")
                self.save_progress()
        
        # Final summary
        self.print_summary()
    
    def print_summary(self):
        """Print processing summary"""
        completed = len([r for r in self.results if r['status'] == 'completed'])
        failed = len([r for r in self.results if r['status'] == 'failed'])
        total = len(self.results)
        
        print("\n" + "=" * 50)
        print("BATCH PROCESSING SUMMARY")
        print("=" * 50)
        print(f"Total URLs: {total}")
        print(f"Completed: {completed}")
        print(f"Failed: {failed}")
        print(f"Success rate: {(completed/total*100):.1f}%")
        
        if failed > 0:
            print("\nFailed URLs:")
            for result in self.results:
                if result['status'] == 'failed':
                    print(f"  - {result['url']}: {result.get('error', 'Unknown error')}")
        
        print(f"\nLog saved to: {self.log_file}")
    
    def resume_from_log(self, format_type='wav', quality='best', delay=2):
        """Resume processing from a previous log file"""
        if not os.path.exists(self.log_file):
            print(f"No log file found at {self.log_file}")
            return
        
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                log_data = json.load(f)
            
            self.results = log_data['results']
            pending_urls = [r for r in self.results if r['status'] in ['pending', 'failed']]
            
            if not pending_urls:
                print("No pending URLs to process")
                return
            
            print(f"Resuming processing of {len(pending_urls)} pending URLs")
            self.process_batch(pending_urls, format_type, quality, delay)
            
        except Exception as e:
            print(f"Error resuming from log: {e}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Batch process music URLs')
    parser.add_argument('input_file', help='Text file with URLs or JSON file with metadata')
    parser.add_argument('-f', '--format', choices=['wav', 'aiff'], default='wav',
                       help='Output format (default: wav)')
    parser.add_argument('-q', '--quality', choices=['best', 'high', 'medium'], default='best',
                       help='Audio quality (default: best)')
    parser.add_argument('-o', '--output', default='./downloads',
                       help='Output directory (default: ./downloads)')
    parser.add_argument('-d', '--delay', type=int, default=2,
                       help='Delay between downloads in seconds (default: 2)')
    parser.add_argument('--resume', action='store_true',
                       help='Resume from previous log file')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output, exist_ok=True)
    
    processor = BatchProcessor(args.output)
    
    if args.resume:
        processor.resume_from_log(args.format, args.quality, args.delay)
    else:
        # Determine file type and load URLs
        if args.input_file.endswith('.json'):
            urls = processor.load_urls_from_json(args.input_file)
        else:
            urls = processor.load_urls_from_file(args.input_file)
        
        if urls:
            processor.process_batch(urls, args.format, args.quality, args.delay)
        else:
            print("No URLs to process")

if __name__ == "__main__":
    main()
