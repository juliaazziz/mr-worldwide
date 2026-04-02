"""
notebooks/utils/load_data.py

Load and clean data.
"""

import numpy as np
import pandas as pd
from regions import REGIONS

def load_data(filename):
    raw = pd.read_csv(filename, skipfooter=3, engine='python')
    raw.columns = ['Country','Title','Author','Genre','Date','Language',
                    'Rating','Female_Author','Purchased','Borrowed','Borrowed2']
    raw['Country'] = raw['Country'].str.strip()

    raw['Rating'] = (
        raw['Rating'].astype(str)
        .str.replace(',', '.', regex=False)
        .replace('nan', np.nan)
        .pipe(pd.to_numeric, errors='coerce')
    )

    raw['Date'] = pd.to_datetime(raw['Date'], dayfirst=True, errors='coerce')
    raw['Region'] = raw['Country'].map(REGIONS)

    raw['Female_Author'] = raw['Female_Author'].notna().astype(int)

    return raw