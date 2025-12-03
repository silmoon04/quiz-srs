#!/usr/bin/env python3
"""
Script to merge processed batch files back into the original quiz
"""

import json
import os
from pathlib import Path

# Get script directory
script_dir = Path(__file__).parent
project_root = script_dir.parent

# Read the original quiz
quiz_path = project_root / "public" / "default-quiz.json"
with open(quiz_path, 'r', encoding='utf-8') as f:
    quiz = json.load(f)

# Read all processed batch files
batch_dir = project_root / "temp-batches"
processed_dir = batch_dir / "processed"

if not processed_dir.exists():
    print("No processed directory found. Run subagents first.")
    exit(1)

processed_files = sorted(processed_dir.glob("*.json"))
print(f"Found {len(processed_files)} processed batch files")

updated_count = 0

for file_path in processed_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        batch = json.load(f)
    
    for pq in batch['questions']:
        chapter_index = pq['chapterIndex']
        question_index = pq['questionIndex']
        
        if chapter_index >= len(quiz['chapters']):
            print(f"Chapter {chapter_index} not found")
            continue
        
        chapter = quiz['chapters'][chapter_index]
        
        if question_index >= len(chapter['questions']):
            print(f"Question {question_index} not found in chapter {chapter_index}")
            continue
        
        question = chapter['questions'][question_index]
        
        if question['questionId'] != pq['questionId']:
            print(f"Question ID mismatch: expected {pq['questionId']}, got {question['questionId']}")
            continue
        
        # Update the question
        question['options'] = pq['options']
        question['explanationText'] = pq['explanationText']
        updated_count += 1

print(f"Updated {updated_count} questions")

# Write the updated quiz
output_path = project_root / "public" / "default-quiz.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(quiz, f, indent=2, ensure_ascii=False)
print(f"Written updated quiz to {output_path}")

# Validate
total_questions = sum(len(ch['questions']) for ch in quiz['chapters'])
print(f"\nValidation:")
print(f"- Total chapters: {len(quiz['chapters'])}")
print(f"- Total questions: {total_questions}")

# Check for any issues
issues = 0
for ci, chapter in enumerate(quiz['chapters']):
    for qi, q in enumerate(chapter['questions']):
        # Check correctOptionIds reference valid options
        option_ids = [o['optionId'] for o in q['options']]
        for correct_id in q['correctOptionIds']:
            if correct_id not in option_ids:
                print(f"Invalid correctOptionId {correct_id} in {q['questionId']}")
                issues += 1
        
        # Check for duplicate option IDs
        if len(set(option_ids)) != len(option_ids):
            print(f"Duplicate option IDs in {q['questionId']}")
            issues += 1

if issues == 0:
    print("- No validation issues found")
else:
    print(f"- Found {issues} validation issues")
