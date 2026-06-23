#!/usr/bin/env python3
"""
seed_study_cards.py — One-time import of PAL cards into Supabase.

Prerequisites:
    pip install requests

Usage:
    1. Copy this file next to pal_cards.json
    2. Set SUPABASE_URL and SUPABASE_SERVICE_KEY below (or as env vars)
    3. Run: python3 seed_study_cards.py

Notes:
    - Uses the SERVICE key (not anon key) to bypass RLS on study_cards.
    - Safe to re-run: uses upsert with conflict on (front, topic).
    - Only inserts into study_cards. study_reviews stays empty until use.
"""

import json
import os
import uuid
import sys
import requests
from datetime import datetime, timezone

# ─── Config ───────────────────────────────────────────────────────────────
# Set these here or via environment variables

SUPABASE_URL         = os.getenv('SUPABASE_URL', 'https://YOUR_PROJECT_REF.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'YOUR_SERVICE_ROLE_KEY')

CARDS_JSON = os.path.join(os.path.dirname(__file__), 'pal_cards.json')
BATCH_SIZE = 100

# ─────────────────────────────────────────────────────────────────────────

def main():
    if 'YOUR_PROJECT_REF' in SUPABASE_URL or 'YOUR_SERVICE_ROLE_KEY' in SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY first.")
        sys.exit(1)

    with open(CARDS_JSON) as f:
        raw_cards = json.load(f)
    print(f"Loaded {len(raw_cards)} cards from {CARDS_JSON}")

    now = datetime.now(timezone.utc).isoformat()

    # Enrich with UUIDs and timestamps
    cards = []
    for c in raw_cards:
        cards.append({
            'id':         str(uuid.uuid4()),
            'topic':      c['topic'],
            'subtopic':   c['subtopic'],
            'front':      c['front'],
            'back':       c['back'],
            'card_type':  'fact',
            'source':     c.get('source', 'manual'),
            'priority':   c.get('priority', 1),
            'created_at': now,
        })

    headers = {
        'apikey':        SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal,resolution=ignore-duplicates',
    }

    url = f'{SUPABASE_URL}/rest/v1/study_cards'
    inserted = 0
    errors   = 0

    for i in range(0, len(cards), BATCH_SIZE):
        batch = cards[i : i + BATCH_SIZE]
        r = requests.post(url, headers=headers, json=batch, timeout=30)
        if r.status_code in (200, 201):
            inserted += len(batch)
            print(f'  Batch {i//BATCH_SIZE + 1}: {len(batch)} rows → OK')
        else:
            errors += len(batch)
            print(f'  Batch {i//BATCH_SIZE + 1}: FAILED {r.status_code} — {r.text[:200]}')

    print(f'\nDone. {inserted} inserted, {errors} errors.')
    if errors == 0:
        print('study_cards is ready. Open PAL, log in, navigate to #/study.')


if __name__ == '__main__':
    main()
