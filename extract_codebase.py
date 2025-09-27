#!/usr/bin/env python3
"""
Codebase Extractor Script
Extracts all relevant files from the Quiz-SRS codebase and combines them into a single text file.
"""

import os
import json
from pathlib import Path
from datetime import datetime
import re

class CodebaseExtractor:
    def __init__(self, root_dir=".", output_file="COMPLETE_CODEBASE.txt"):
        self.root_dir = Path(root_dir)
        self.output_file = output_file
        self.excluded_dirs = {
            'node_modules', '.next', 'dist', 'coverage', 'test-results', 
            'playwright-report', '.git', '__pycache__', '.pytest_cache'
        }
        self.excluded_files = {
            'package-lock.json', 'pnpm-lock.yaml', 'tsconfig.tsbuildinfo',
            'graph.png', '.DS_Store', 'Thumbs.db'
        }
        self.important_extensions = {
            '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md', '.mjs', '.config.js'
        }
        
        # Always include files from public directory
        self.public_dir = self.root_dir / "public"
        
    def should_include_file(self, file_path):
        """Determine if a file should be included in the extraction."""
        # Always include files from public directory (JSON and MD files)
        if self.public_dir in file_path.parents or file_path.parent == self.public_dir:
            if file_path.suffix in ['.json', '.md']:
                return True
        
        # Skip excluded directories
        if any(part in self.excluded_dirs for part in file_path.parts):
            return False
            
        # Skip excluded files
        if file_path.name in self.excluded_files:
            return False
            
        # Only include important file types
        if file_path.suffix not in self.important_extensions:
            return False
            
        # Skip very large files (>1MB)
        try:
            if file_path.stat().st_size > 1024 * 1024:
                return False
        except OSError:
            return False
            
        return True
    
    def get_file_content(self, file_path):
        """Safely read file content with error handling."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    return f.read()
            except Exception as e:
                return f"[ERROR: Could not read file - {str(e)}]"
        except Exception as e:
            return f"[ERROR: Could not read file - {str(e)}]"
    
    def format_file_header(self, file_path, relative_path):
        """Create a formatted header for each file."""
        file_size = file_path.stat().st_size
        lines = len(self.get_file_content(file_path).split('\n'))
        
        return f"""
{'='*80}
FILE: {relative_path}
SIZE: {file_size:,} bytes | LINES: {lines:,}
{'='*80}
"""
    
    def extract_package_info(self):
        """Extract package.json information."""
        package_file = self.root_dir / "package.json"
        if package_file.exists():
            try:
                with open(package_file, 'r') as f:
                    package_data = json.load(f)
                
                info = f"""
PROJECT: {package_data.get('name', 'Unknown')}
VERSION: {package_data.get('version', 'Unknown')}
DESCRIPTION: {package_data.get('description', 'No description')}
SCRIPTS: {len(package_data.get('scripts', {}))} scripts
DEPENDENCIES: {len(package_data.get('dependencies', {}))} runtime, {len(package_data.get('devDependencies', {}))} dev
"""
                return info
            except Exception as e:
                return f"[ERROR: Could not read package.json - {str(e)}]"
        return "[ERROR: package.json not found]"
    
    def get_directory_structure(self):
        """Get a tree-like directory structure."""
        def build_tree(path, prefix="", max_depth=3, current_depth=0):
            if current_depth >= max_depth:
                return ""
            
            result = f"{prefix}📁 {path.name}/\n"
            
            try:
                items = sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
                for i, item in enumerate(items):
                    if item.name.startswith('.'):
                        continue
                        
                    is_last = i == len(items) - 1
                    new_prefix = prefix + ("└── " if is_last else "├── ")
                    
                    if item.is_dir():
                        if item.name not in self.excluded_dirs:
                            result += build_tree(item, new_prefix, max_depth, current_depth + 1)
                    else:
                        if self.should_include_file(item):
                            result += f"{new_prefix}📄 {item.name}\n"
            except PermissionError:
                result += f"{prefix}    [Permission Denied]\n"
            
            return result
        
        return build_tree(self.root_dir)
    
    def extract_codebase(self):
        """Main extraction method."""
        print("🔍 Starting codebase extraction...")
        
        # Get all relevant files
        relevant_files = []
        for root, dirs, files in os.walk(self.root_dir):
            # Remove excluded directories from dirs to prevent walking into them
            dirs[:] = [d for d in dirs if d not in self.excluded_dirs]
            
            for file in files:
                file_path = Path(root) / file
                if self.should_include_file(file_path):
                    relevant_files.append(file_path)
        
        print(f"📁 Found {len(relevant_files)} relevant files")
        
        # Sort files by type and path for better organization
        def sort_key(file_path):
            # Prioritize important files
            priority = {
                'package.json': 0,
                'tsconfig.json': 1,
                'next.config.mjs': 2,
                'tailwind.config.ts': 3,
                'eslint.config.js': 4,
                'vitest.config.ts': 5,
                'playwright.config.ts': 6,
                'app/layout.tsx': 7,
                'app/page.tsx': 8,
                'types/quiz-types.ts': 9,
            }
            
            relative_path = str(file_path.relative_to(self.root_dir))
            
            # Prioritize public files (JSON and MD) after core config files
            if relative_path.startswith('public/'):
                if file_path.suffix == '.json':
                    return (10, relative_path)  # JSON files first
                elif file_path.suffix == '.md':
                    return (11, relative_path)  # MD files second
            
            return (priority.get(relative_path, 999), relative_path)
        
        relevant_files.sort(key=sort_key)
        
        # Start building the output
        output_content = f"""
{'='*100}
QUIZ-SRS COMPLETE CODEBASE EXTRACTION
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Total Files: {len(relevant_files)}
{'='*100}

{self.extract_package_info()}

{'='*100}
DIRECTORY STRUCTURE
{'='*100}
{self.get_directory_structure()}

{'='*100}
FILE CONTENTS
{'='*100}
"""
        
        # Process each file
        for i, file_path in enumerate(relevant_files, 1):
            relative_path = str(file_path.relative_to(self.root_dir))
            print(f"📄 Processing {i}/{len(relevant_files)}: {relative_path}")
            
            # Add file header
            output_content += self.format_file_header(file_path, relative_path)
            
            # Add file content
            content = self.get_file_content(file_path)
            output_content += content
            
            # Add separator
            output_content += f"\n\n{'─'*80}\n"
        
        # Add summary
        output_content += f"""
{'='*100}
EXTRACTION SUMMARY
{'='*100}
Total Files Processed: {len(relevant_files)}
Extraction Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Output File: {self.output_file}

File Types Included:
{self.get_file_type_summary(relevant_files)}

This file contains the complete codebase for the Quiz-SRS application,
including all source code, configuration files, and documentation.
{'='*100}
"""
        
        # Write to output file
        print(f"💾 Writing to {self.output_file}...")
        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write(output_content)
        
        print(f"✅ Extraction complete! Output saved to {self.output_file}")
        print(f"📊 Total size: {os.path.getsize(self.output_file):,} bytes")
    
    def get_file_type_summary(self, files):
        """Get a summary of file types."""
        type_counts = {}
        for file_path in files:
            ext = file_path.suffix or 'no extension'
            type_counts[ext] = type_counts.get(ext, 0) + 1
        
        summary = ""
        for ext, count in sorted(type_counts.items()):
            summary += f"  {ext}: {count} files\n"
        
        return summary

def main():
    """Main function."""
    print("🚀 Quiz-SRS Codebase Extractor")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("package.json"):
        print("❌ Error: package.json not found. Please run this script from the project root.")
        return
    
    extractor = CodebaseExtractor()
    extractor.extract_codebase()

if __name__ == "__main__":
    main()
