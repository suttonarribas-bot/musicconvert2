#!/usr/bin/env python3
"""
Music Converter Launcher
Simple launcher script to choose between GUI and CLI modes
"""

import sys
import os
import subprocess

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import yt_dlp
        import pydub
        import tkinter
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def main():
    print("Music Converter Launcher")
    print("=" * 25)
    
    if not check_dependencies():
        return
    
    print("\nChoose an option:")
    print("1. GUI Mode (Graphical Interface)")
    print("2. CLI Mode (Command Line)")
    print("3. Batch Processing")
    print("4. Setup/Install Dependencies")
    print("5. Exit")
    
    while True:
        try:
            choice = input("\nEnter your choice (1-5): ").strip()
            
            if choice == '1':
                print("Starting GUI mode...")
                subprocess.run([sys.executable, "music_converter.py"])
                break
                
            elif choice == '2':
                print("Starting CLI mode...")
                print("Usage examples:")
                print("  python cli_converter.py 'https://www.youtube.com/watch?v=VIDEO_ID'")
                print("  python cli_converter.py --help")
                break
                
            elif choice == '3':
                print("Starting batch processing...")
                print("Usage examples:")
                print("  python batch_processor.py example_urls.txt")
                print("  python batch_processor.py example_batch.json")
                break
                
            elif choice == '4':
                print("Running setup...")
                subprocess.run([sys.executable, "setup.py"])
                break
                
            elif choice == '5':
                print("Goodbye!")
                break
                
            else:
                print("Invalid choice. Please enter 1-5.")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
