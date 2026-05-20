import os
from YFinance import YFinance
import psycopg2
import pandas as pd
conn = psycopg2.connect(database="zephyr_capital",
                            host=os.environ.get("DB_HOST", "localhost"),
                            user="postgres",
                            password=os.environ.get("DB_PASSWORD", ""),
                            port="5432") 
cursor = conn.cursor()



















cursor.execute("""
SELECT ticker FROM ports.stocks WHERE sector = 'undefined';                
""")

# technology
# financial-services
# healthcare
# consumer-cyclical
# basic-materials
# utilities
# consumer-defensive
# industrials
# real-estate
# energy
# communication-services

# put("Communication", "XLC");
# put("Consumer Discretionary", "XLY");
# put("Consumer Staples", "XLP");
# put("Energy", "XLE");
# put("Financials", "XLF");
# put("Health Care", "XLV");
# put("Industrials", "XLI");
# put("Materials", "XLB");
# put("Real Estate", "XLRE");
# put("Technology", "XLK");
# put("Utilities", "XLU");
# put("General", "SPY");


sector_map ={
    "technology": "Technology",
    "financial-services": "Financials",
    "healthcare": "Health Care",
    "consumer-cyclical": "Consumer Discretionary",
    "basic-materials": "Materials",
    "utilities": "Utilities",
    "consumer-defensive": "Consumer Staples",
    "industrials": "Industrials",
    "real-estate": "Real Estate",   
    "energy": "Energy",
    "communication-services": "Communication",
}



d = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]
# print(columns)
df = pd.DataFrame(d, columns=columns)
stocks = list(df['ticker'])
print(len(stocks))
i = 10
for stock in stocks:
    try:
        sector = YFinance(stock).info['sectorKey']
        sector = sector_map[sector]
        cursor.execute(f"""
        UPDATE ports.stocks
        SET sector = '{sector}'
        WHERE ticker = '{stock}';
        """)
        print(sector)
    except:
        pass
    i += 1
    if i % 10 == 0:
        print("committing")
        conn.commit()


# print(YFinance("XLF").info['sectorKey'])

