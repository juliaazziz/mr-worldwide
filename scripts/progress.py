"""
scripts/progress.py

Generates summary into stdout to be embedded into README.md.
"""
import numpy as np
import pandas as pd

FILENAME = "data/MrWorldwide.csv"
TOTAL_COUNTRIES = 196

def main():
    raw = pd.read_csv(FILENAME, skipfooter=3, engine='python')
    raw.columns = ['Country','Title','Author','Genre','Date','Language',
                    'Rating','Female_Author']
    raw['Country'] = raw['Country'].str.strip()

    raw['Rating'] = (
        raw['Rating'].astype(str)
        .str.replace(',', '.', regex=False)
        .replace('nan', np.nan)
        .pipe(pd.to_numeric, errors='coerce')
    )

    raw['Date'] = pd.to_datetime(raw['Date'], dayfirst=True, errors='coerce')

    raw['Female_Author'] = raw['Female_Author'].notna().astype(int)

    read       = raw[raw['Date'].notna()].copy()    # books actually finished
    rated      = read[read['Rating'].notna()].copy()

    n_read    = len(read)
    pct_done  = n_read / TOTAL_COUNTRIES * 100
    avg_rating = rated['Rating'].mean()
    female_pct = read['Female_Author'].mean() * 100
    lang_es    = (read['Language'] == 'Español').sum()
    lang_en    = (read['Language'] == 'Inglés').sum()

    filled = int(pct_done / 2)
    bar    = '█' * filled + '░' * (50 - filled)

    print("```\r")
    print(f' Countries read:      {n_read:>4} / {TOTAL_COUNTRIES}  ({pct_done:.1f}%)\r')
    print(f' Average rating:        {avg_rating:.2f} / 5.00\r')
    print(f' Female authors:        {female_pct:.0f}% of books read\r')
    print(f' In spanish:            {lang_es} books\r')
    print(f' In english:            {lang_en} books\r')
    print(f'\n  Progress: [{bar}] {pct_done:.1f}%\n')
    print("```\r")

if __name__ == "__main__":
    main()