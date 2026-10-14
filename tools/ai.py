import torch
import torch.nn as nn
import torch.optim as optim
import json
import os
import re

AI_PATH = "data/intert_model.pt"
PT, JS = "data/net.pt", "data/voc.json"
CL = ["portfolio", "market", "rate", "advice", "greet", "other"]
DataSet = [("портфель",0),("акции",0),("инвестиции",0),
     ("рынок",1),("биржа",1),("золото",1),
     ("ставка",2),("цб",2),("центробанк",2),
     ("совет",3),("что купить",3),("ребаланс",3),
     ("привет",4),("здравствуй",4),("хай",4),
     ("помоги",5),("что умеешь",5),("спасибо",5)]

class Net(nn.Module):
    def __init__(self, v):
        super().__init__()
        self.e = nn.EmbeddingBag(v, 16, mode='mean') # 16 - размер эмбеддинга (хватит)
        self.f = nn.Sequential(nn.Linear(16, 32), nn.ReLU(), nn.Linear(32, 6))
    def forward(self, x, o): return self.f(self.e(x, o))

tok = lambda t: re.findall(r'[а-яa-z0-9]+', t.lower())

def voc(d):
    v = {'':0}
    for t,_ in d:
        for w in tok(t):
            if w not in v: v[w] = len(v)
    return(v)

def train():
    global net, v
    v = voc(D); net = Net(len(v)); opt = optim.Adam(net.parameters(), 0.05)
    #300 прогонов на 18 фраз
    for _ in range(300):
        for t, l in D:
            x = torch.tensor([v.get(w,0) for w in tok(t)] or [0])
            o, y = torch.tensor([0]), torch.tensor([l])
            opt.zero_grad()
            loss = nn.CrossEntropyLoss()(net(x, o), y)
            loss.backward(); opt.step()
    os.makedirs("data", exist_ok=True)
    torch.save(net.state_dict(), PT); json.dump(v, open(JS, 'w'))

def load():
    global net, v
    if 'net' in globals(): return
    if os.path.exists(PT):
        v = json.load(open(JS)); net = Net(len(v))
        net.load_state_dict(torch.load(PT, map_location='cpu')); net.eval()
    else: train(); net.eval()

def predict(t):
    load()
    x = torch.tensor([v.get(w,0) for w in tok(t)] or [0])
    with torch.no_grad(): return CL[net(x, torch.tensor([0])).argmax()]

def ask(q):
    try: ctx = json.load(open('data/ai_input.json'))
    except: ctx = {}
    
    i = predict(q)
    if i == "portfolio": return ctx.get('broker_report', 'Нет отчета')[:200]
    if i == "market": 
        try: return f"Цена: {__import__('pandas').read_csv('data/tgld.csv').tail(1).iloc[0].get('close')}"
        except: return "Нет рынка"
    if i == "rate": 
        try: return "Ставка: " + open('data/key_rate.txt').read().split('\n')[1]
        except: return "Нет ставки"
    if i == "advice": return "Диверсифицируй и держи."
    if i == "greet": return "Привет."
    return "Я умею: портфель, рынок, ставка."

net, v = None, None
