#!/usr/bin/env python3
"""
Script to batch process quiz question updates
Each batch modifies 3 questions to improve incorrect option quality
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

# Create batches directory
batch_dir = project_root / "temp-batches"
batch_dir.mkdir(exist_ok=True)

# Create processed directory
processed_dir = batch_dir / "processed"
processed_dir.mkdir(exist_ok=True)

# Collect all questions with their chapter index
all_questions = []

for chapter_index, chapter in enumerate(quiz['chapters']):
    for question_index, question in enumerate(chapter['questions']):
        all_questions.append({
            'chapterIndex': chapter_index,
            'questionIndex': question_index,
            'question': question
        })

print(f"Total questions: {len(all_questions)}")

# Create batches of 3 questions each
BATCH_SIZE = 3
batches = []

for i in range(0, len(all_questions), BATCH_SIZE):
    batches.append(all_questions[i:i + BATCH_SIZE])

print(f"Total batches: {len(batches)}")

# Write each batch to a separate file
for batch_index, batch in enumerate(batches):
    batch_data = {
        'batchIndex': batch_index,
        'questions': [
            {
                'chapterIndex': b['chapterIndex'],
                'questionIndex': b['questionIndex'],
                'questionId': b['question']['questionId'],
                'questionText': b['question']['questionText'],
                'options': b['question']['options'],
                'correctOptionIds': b['question']['correctOptionIds'],
                'explanationText': b['question']['explanationText']
            }
            for b in batch
        ]
    }
    
    batch_file = batch_dir / f"batch-{batch_index:02d}.json"
    with open(batch_file, 'w', encoding='utf-8') as f:
        json.dump(batch_data, f, indent=2, ensure_ascii=False)
    print(f"Created {batch_file}")

print(f"\nBatch files created in {batch_dir}/")
print("After processing, run merge-batches.py to combine results.")
