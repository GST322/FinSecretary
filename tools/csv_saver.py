import os
import pandas as pd

def save_all(df_tgld, df_gold, gld_hist, iau_hist, tlt_hist, cbr_date, cbr_value):
    os.makedirs("data", exist_ok=True)
    
    df_tgld.to_csv("data/tgld.csv", index=False)
    df_gold.to_csv("data/gold.csv", index=False)
    gld_hist.to_csv("data/gld.csv")
    iau_hist.to_csv("data/iau.csv")
    tlt_hist.to_csv("data/tlt.csv")
    
    with open("data/key_rate.txt", "w") as f:
        f.write(f"{cbr_date}\n{cbr_value}")
    
    print("\n=== Сохранено в data/ ===")