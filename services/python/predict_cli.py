import sys
import json
import os
import urllib.request
import torch
from torchvision import models, transforms
from PIL import Image

# Fix for "could not create a primitive" error on some CPU environments
torch.backends.mkldnn.enabled = False


# ============================================================
# 1. Food-101 Class Names
# ============================================================
CLASSES = [
    'apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare',
    'beet_salad', 'beignets', 'bibimbap', 'bread_pudding', 'breakfast_burrito',
    'bruschetta', 'caesar_salad', 'cannoli', 'caprese_salad', 'carrot_cake',
    'ceviche', 'cheesecake', 'cheese_plate', 'chicken_curry', 'chicken_quesadilla',
    'chicken_wings', 'chocolate_cake', 'chocolate_mousse', 'churros', 'clam_chowder',
    'club_sandwich', 'crab_cakes', 'creme_brulee', 'croque_madame', 'cup_cakes',
    'deviled_eggs', 'donuts', 'dumplings', 'edamame', 'eggs_benedict',
    'escargots', 'falafel', 'filet_mignon', 'fish_and_chips', 'foie_gras',
    'french_fries', 'french_onion_soup', 'french_toast', 'fried_calamari', 'fried_rice',
    'frozen_yogurt', 'garlic_bread', 'gnocchi', 'greek_salad', 'grilled_cheese_sandwich',
    'grilled_salmon', 'guacamole', 'gyoza', 'hamburger', 'hot_and_sour_soup',
    'hot_dog', 'huevos_rancheros', 'hummus', 'ice_cream', 'lasagna',
    'lobster_bisque', 'lobster_roll_sandwich', 'macaroni_and_cheese', 'macarons', 'miso_soup',
    'mussels', 'nachos', 'omelette', 'onion_rings', 'oysters',
    'pad_thai', 'paella', 'pancakes', 'panna_cotta', 'peking_duck',
    'pho', 'pizza', 'pork_chop', 'poutine', 'prime_rib',
    'pulled_pork_sandwich', 'ramen', 'ravioli', 'red_velvet_cake', 'risotto',
    'samosa', 'sashimi', 'scallops', 'seaweed_salad', 'shrimp_and_grits',
    'spaghetti_bolognese', 'spaghetti_carbonara', 'spring_rolls', 'steak', 'strawberry_shortcake',
    'sushi', 'tacos', 'takoyaki', 'tiramisu', 'tuna_tartare',
    'waffles'
]

# ============================================================
# 2. Local Nutrition Database
#    Digunakan sebagai FALLBACK jika Gemini API gagal/tidak tersedia.
#    Nilai rata-rata per 1 porsi standar (sumber: data ilmiah umum).
#    JANGAN HAPUS — ini cadangan offline yang penting.
# ============================================================
LOCAL_NUTRITION_DB = {
    'apple_pie':               {'cal': 296, 'prot': 2.4, 'carb': 43,  'fat': 13,  'sod': 180,  'sug': 20,  'fib': 1.5},
    'baby_back_ribs':          {'cal': 600, 'prot': 40,  'carb': 25,  'fat': 38,  'sod': 900,  'sug': 20,  'fib': 0},
    'baklava':                 {'cal': 334, 'prot': 4,   'carb': 30,  'fat': 22,  'sod': 75,   'sug': 18,  'fib': 1},
    'beef_carpaccio':          {'cal': 150, 'prot': 20,  'carb': 2,   'fat': 7,   'sod': 300,  'sug': 0,   'fib': 0},
    'beef_tartare':            {'cal': 240, 'prot': 22,  'carb': 5,   'fat': 15,  'sod': 450,  'sug': 1,   'fib': 0},
    'beet_salad':              {'cal': 180, 'prot': 4,   'carb': 15,  'fat': 12,  'sod': 350,  'sug': 10,  'fib': 3},
    'beignets':                {'cal': 280, 'prot': 4,   'carb': 35,  'fat': 14,  'sod': 80,   'sug': 15,  'fib': 1},
    'bibimbap':                {'cal': 550, 'prot': 20,  'carb': 85,  'fat': 15,  'sod': 700,  'sug': 8,   'fib': 4},
    'bread_pudding':           {'cal': 306, 'prot': 6,   'carb': 48,  'fat': 10,  'sod': 250,  'sug': 28,  'fib': 1},
    'breakfast_burrito':       {'cal': 650, 'prot': 25,  'carb': 60,  'fat': 35,  'sod': 1200, 'sug': 4,   'fib': 3},
    'bruschetta':              {'cal': 180, 'prot': 4,   'carb': 20,  'fat': 9,   'sod': 220,  'sug': 2,   'fib': 2},
    'caesar_salad':            {'cal': 350, 'prot': 10,  'carb': 12,  'fat': 28,  'sod': 600,  'sug': 3,   'fib': 2},
    'cannoli':                 {'cal': 260, 'prot': 5,   'carb': 22,  'fat': 16,  'sod': 90,   'sug': 14,  'fib': 0},
    'caprese_salad':           {'cal': 250, 'prot': 12,  'carb': 6,   'fat': 20,  'sod': 300,  'sug': 3,   'fib': 1},
    'carrot_cake':             {'cal': 415, 'prot': 4,   'carb': 50,  'fat': 22,  'sod': 320,  'sug': 30,  'fib': 2},
    'ceviche':                 {'cal': 180, 'prot': 22,  'carb': 8,   'fat': 6,   'sod': 600,  'sug': 2,   'fib': 1},
    'cheesecake':              {'cal': 401, 'prot': 7,   'carb': 32,  'fat': 28,  'sod': 210,  'sug': 22,  'fib': 0},
    'cheese_plate':            {'cal': 450, 'prot': 25,  'carb': 10,  'fat': 35,  'sod': 800,  'sug': 1,   'fib': 0},
    'chicken_curry':           {'cal': 420, 'prot': 28,  'carb': 15,  'fat': 25,  'sod': 950,  'sug': 5,   'fib': 2},
    'chicken_quesadilla':      {'cal': 520, 'prot': 30,  'carb': 40,  'fat': 28,  'sod': 1100, 'sug': 3,   'fib': 2},
    'chicken_wings':           {'cal': 480, 'prot': 35,  'carb': 5,   'fat': 35,  'sod': 1050, 'sug': 1,   'fib': 0},
    'chocolate_cake':          {'cal': 424, 'prot': 5,   'carb': 55,  'fat': 21,  'sod': 350,  'sug': 35,  'fib': 2},
    'chocolate_mousse':        {'cal': 250, 'prot': 4,   'carb': 20,  'fat': 18,  'sod': 80,   'sug': 16,  'fib': 1},
    'churros':                 {'cal': 270, 'prot': 3,   'carb': 32,  'fat': 15,  'sod': 150,  'sug': 12,  'fib': 1},
    'clam_chowder':            {'cal': 380, 'prot': 12,  'carb': 25,  'fat': 24,  'sod': 980,  'sug': 4,   'fib': 1},
    'club_sandwich':           {'cal': 590, 'prot': 32,  'carb': 45,  'fat': 28,  'sod': 1300, 'sug': 8,   'fib': 3},
    'crab_cakes':              {'cal': 310, 'prot': 22,  'carb': 12,  'fat': 20,  'sod': 750,  'sug': 2,   'fib': 0},
    'creme_brulee':            {'cal': 320, 'prot': 4,   'carb': 18,  'fat': 26,  'sod': 80,   'sug': 16,  'fib': 0},
    'croque_madame':           {'cal': 680, 'prot': 35,  'carb': 42,  'fat': 40,  'sod': 1400, 'sug': 6,   'fib': 2},
    'cup_cakes':               {'cal': 305, 'prot': 3,   'carb': 38,  'fat': 16,  'sod': 200,  'sug': 25,  'fib': 0},
    'deviled_eggs':            {'cal': 140, 'prot': 6,   'carb': 1,   'fat': 12,  'sod': 220,  'sug': 1,   'fib': 0},
    'donuts':                  {'cal': 270, 'prot': 4,   'carb': 30,  'fat': 15,  'sod': 280,  'sug': 14,  'fib': 1},
    'dumplings':               {'cal': 220, 'prot': 8,   'carb': 30,  'fat': 7,   'sod': 550,  'sug': 2,   'fib': 1},
    'edamame':                 {'cal': 120, 'prot': 11,  'carb': 10,  'fat': 5,   'sod': 15,   'sug': 2,   'fib': 4},
    'eggs_benedict':           {'cal': 650, 'prot': 25,  'carb': 30,  'fat': 48,  'sod': 1100, 'sug': 2,   'fib': 1},
    'escargots':               {'cal': 220, 'prot': 15,  'carb': 3,   'fat': 16,  'sod': 400,  'sug': 0,   'fib': 0},
    'falafel':                 {'cal': 333, 'prot': 13,  'carb': 32,  'fat': 18,  'sod': 294,  'sug': 5,   'fib': 4},
    'filet_mignon':            {'cal': 350, 'prot': 40,  'carb': 0,   'fat': 20,  'sod': 150,  'sug': 0,   'fib': 0},
    'fish_and_chips':          {'cal': 690, 'prot': 30,  'carb': 65,  'fat': 35,  'sod': 1200, 'sug': 3,   'fib': 3},
    'foie_gras':               {'cal': 460, 'prot': 11,  'carb': 4,   'fat': 44,  'sod': 70,   'sug': 0,   'fib': 0},
    'french_fries':            {'cal': 365, 'prot': 4,   'carb': 48,  'fat': 17,  'sod': 270,  'sug': 0,   'fib': 3},
    'french_onion_soup':       {'cal': 380, 'prot': 15,  'carb': 25,  'fat': 22,  'sod': 1200, 'sug': 8,   'fib': 2},
    'french_toast':            {'cal': 400, 'prot': 12,  'carb': 50,  'fat': 18,  'sod': 450,  'sug': 18,  'fib': 2},
    'fried_calamari':          {'cal': 350, 'prot': 18,  'carb': 25,  'fat': 20,  'sod': 600,  'sug': 1,   'fib': 1},
    'fried_rice':              {'cal': 450, 'prot': 15,  'carb': 55,  'fat': 20,  'sod': 900,  'sug': 4,   'fib': 2},
    'frozen_yogurt':           {'cal': 160, 'prot': 5,   'carb': 35,  'fat': 1,   'sod': 80,   'sug': 28,  'fib': 0},
    'garlic_bread':            {'cal': 200, 'prot': 4,   'carb': 22,  'fat': 11,  'sod': 280,  'sug': 1,   'fib': 1},
    'gnocchi':                 {'cal': 380, 'prot': 8,   'carb': 65,  'fat': 10,  'sod': 450,  'sug': 2,   'fib': 2},
    'greek_salad':             {'cal': 280, 'prot': 8,   'carb': 12,  'fat': 22,  'sod': 550,  'sug': 5,   'fib': 3},
    'grilled_cheese_sandwich': {'cal': 440, 'prot': 16,  'carb': 35,  'fat': 26,  'sod': 950,  'sug': 4,   'fib': 2},
    'grilled_salmon':          {'cal': 350, 'prot': 35,  'carb': 0,   'fat': 22,  'sod': 150,  'sug': 0,   'fib': 0},
    'guacamole':               {'cal': 150, 'prot': 2,   'carb': 8,   'fat': 13,  'sod': 200,  'sug': 1,   'fib': 4},
    'gyoza':                   {'cal': 240, 'prot': 9,   'carb': 30,  'fat': 8,   'sod': 550,  'sug': 2,   'fib': 1},
    'hamburger':               {'cal': 540, 'prot': 30,  'carb': 40,  'fat': 28,  'sod': 980,  'sug': 8,   'fib': 2},
    'hot_and_sour_soup':       {'cal': 160, 'prot': 8,   'carb': 18,  'fat': 6,   'sod': 1200, 'sug': 5,   'fib': 1},
    'hot_dog':                 {'cal': 290, 'prot': 10,  'carb': 25,  'fat': 17,  'sod': 750,  'sug': 4,   'fib': 1},
    'huevos_rancheros':        {'cal': 480, 'prot': 20,  'carb': 45,  'fat': 24,  'sod': 850,  'sug': 4,   'fib': 5},
    'hummus':                  {'cal': 170, 'prot': 5,   'carb': 15,  'fat': 10,  'sod': 260,  'sug': 0,   'fib': 4},
    'ice_cream':               {'cal': 270, 'prot': 5,   'carb': 32,  'fat': 15,  'sod': 90,   'sug': 25,  'fib': 0},
    'lasagna':                 {'cal': 600, 'prot': 30,  'carb': 45,  'fat': 32,  'sod': 1100, 'sug': 8,   'fib': 3},
    'lobster_bisque':          {'cal': 420, 'prot': 15,  'carb': 18,  'fat': 32,  'sod': 1250, 'sug': 6,   'fib': 0},
    'lobster_roll_sandwich':   {'cal': 550, 'prot': 28,  'carb': 42,  'fat': 30,  'sod': 1300, 'sug': 4,   'fib': 2},
    'macaroni_and_cheese':     {'cal': 500, 'prot': 20,  'carb': 55,  'fat': 22,  'sod': 850,  'sug': 6,   'fib': 2},
    'macarons':                {'cal': 160, 'prot': 2,   'carb': 18,  'fat': 8,   'sod': 5,    'sug': 15,  'fib': 0},
    'miso_soup':               {'cal': 80,  'prot': 6,   'carb': 8,   'fat': 3,   'sod': 800,  'sug': 2,   'fib': 1},
    'mussels':                 {'cal': 250, 'prot': 20,  'carb': 8,   'fat': 14,  'sod': 650,  'sug': 0,   'fib': 0},
    'nachos':                  {'cal': 650, 'prot': 20,  'carb': 65,  'fat': 35,  'sod': 1400, 'sug': 3,   'fib': 4},
    'omelette':                {'cal': 320, 'prot': 22,  'carb': 4,   'fat': 24,  'sod': 450,  'sug': 2,   'fib': 0},
    'onion_rings':             {'cal': 480, 'prot': 5,   'carb': 55,  'fat': 26,  'sod': 600,  'sug': 4,   'fib': 2},
    'oysters':                 {'cal': 120, 'prot': 14,  'carb': 8,   'fat': 4,   'sod': 300,  'sug': 0,   'fib': 0},
    'pad_thai':                {'cal': 650, 'prot': 25,  'carb': 85,  'fat': 22,  'sod': 1300, 'sug': 15,  'fib': 2},
    'paella':                  {'cal': 550, 'prot': 30,  'carb': 60,  'fat': 20,  'sod': 900,  'sug': 3,   'fib': 2},
    'pancakes':                {'cal': 450, 'prot': 10,  'carb': 75,  'fat': 12,  'sod': 850,  'sug': 18,  'fib': 2},
    'panna_cotta':             {'cal': 350, 'prot': 6,   'carb': 25,  'fat': 25,  'sod': 60,   'sug': 22,  'fib': 0},
    'peking_duck':             {'cal': 520, 'prot': 25,  'carb': 15,  'fat': 40,  'sod': 1100, 'sug': 8,   'fib': 0},
    'pho':                     {'cal': 450, 'prot': 25,  'carb': 60,  'fat': 12,  'sod': 1600, 'sug': 5,   'fib': 2},
    'pizza':                   {'cal': 285, 'prot': 12,  'carb': 36,  'fat': 10,  'sod': 640,  'sug': 4,   'fib': 2},
    'pork_chop':               {'cal': 350, 'prot': 32,  'carb': 0,   'fat': 24,  'sod': 120,  'sug': 0,   'fib': 0},
    'poutine':                 {'cal': 750, 'prot': 25,  'carb': 70,  'fat': 45,  'sod': 1400, 'sug': 2,   'fib': 3},
    'prime_rib':               {'cal': 650, 'prot': 45,  'carb': 0,   'fat': 50,  'sod': 200,  'sug': 0,   'fib': 0},
    'pulled_pork_sandwich':    {'cal': 580, 'prot': 30,  'carb': 55,  'fat': 26,  'sod': 1250, 'sug': 18,  'fib': 2},
    'ramen':                   {'cal': 450, 'prot': 20,  'carb': 65,  'fat': 18,  'sod': 1800, 'sug': 5,   'fib': 2},
    'ravioli':                 {'cal': 380, 'prot': 15,  'carb': 50,  'fat': 14,  'sod': 550,  'sug': 3,   'fib': 2},
    'red_velvet_cake':         {'cal': 450, 'prot': 4,   'carb': 58,  'fat': 24,  'sod': 320,  'sug': 38,  'fib': 1},
    'risotto':                 {'cal': 420, 'prot': 10,  'carb': 55,  'fat': 18,  'sod': 700,  'sug': 2,   'fib': 1},
    'samosa':                  {'cal': 260, 'prot': 6,   'carb': 32,  'fat': 14,  'sod': 350,  'sug': 2,   'fib': 3},
    'sashimi':                 {'cal': 150, 'prot': 25,  'carb': 2,   'fat': 5,   'sod': 100,  'sug': 0,   'fib': 0},
    'scallops':                {'cal': 180, 'prot': 28,  'carb': 6,   'fat': 4,   'sod': 400,  'sug': 0,   'fib': 0},
    'seaweed_salad':           {'cal': 130, 'prot': 3,   'carb': 15,  'fat': 7,   'sod': 750,  'sug': 4,   'fib': 2},
    'shrimp_and_grits':        {'cal': 550, 'prot': 25,  'carb': 45,  'fat': 30,  'sod': 1100, 'sug': 4,   'fib': 2},
    'spaghetti_bolognese':     {'cal': 550, 'prot': 26,  'carb': 65,  'fat': 20,  'sod': 950,  'sug': 8,   'fib': 4},
    'spaghetti_carbonara':     {'cal': 620, 'prot': 24,  'carb': 60,  'fat': 32,  'sod': 1050, 'sug': 3,   'fib': 3},
    'spring_rolls':            {'cal': 180, 'prot': 5,   'carb': 24,  'fat': 8,   'sod': 320,  'sug': 2,   'fib': 2},
    'steak':                   {'cal': 550, 'prot': 48,  'carb': 0,   'fat': 40,  'sod': 200,  'sug': 0,   'fib': 0},
    'strawberry_shortcake':    {'cal': 350, 'prot': 4,   'carb': 45,  'fat': 17,  'sod': 220,  'sug': 25,  'fib': 2},
    'sushi':                   {'cal': 320, 'prot': 12,  'carb': 55,  'fat': 5,   'sod': 650,  'sug': 8,   'fib': 1},
    'tacos':                   {'cal': 450, 'prot': 22,  'carb': 35,  'fat': 24,  'sod': 800,  'sug': 3,   'fib': 3},
    'takoyaki':                {'cal': 280, 'prot': 10,  'carb': 35,  'fat': 12,  'sod': 550,  'sug': 4,   'fib': 1},
    'tiramisu':                {'cal': 480, 'prot': 8,   'carb': 42,  'fat': 30,  'sod': 150,  'sug': 25,  'fib': 1},
    'tuna_tartare':            {'cal': 220, 'prot': 25,  'carb': 5,   'fat': 12,  'sod': 380,  'sug': 1,   'fib': 0},
    'waffles':                 {'cal': 420, 'prot': 8,   'carb': 48,  'fat': 22,  'sod': 550,  'sug': 14,  'fib': 2},
}

DEFAULT_LOCAL_NUTRITION = {'cal': 300, 'prot': 15, 'carb': 30, 'fat': 12, 'sod': 400, 'sug': 5, 'fib': 2}


# ============================================================
# 3. Groq API — Sumber nutrisi UTAMA
#    Menggunakan llama-3.1-8b-instant (cepat, gratis, akurat).
#    Mengembalikan dict atau None jika gagal (timeout, error, dll).
# ============================================================
def get_nutrition_from_groq(food_name, api_key):
    if not api_key:
        return None

    prompt = (
        f"Berikan estimasi nilai nutrisi untuk 1 porsi standar '{food_name}'.\n"
        "Kembalikan HANYA JSON tanpa markdown, tanpa teks lain, persis format ini:\n"
        '{"calories":300,"protein":15.0,"carbs":30.0,"fat":12.0,"fiber":2.0,"sodium":400.0,"sugar":5.0}\n'
        "Satuan: calories=kkal (integer), protein/carbs/fat/fiber/sugar=gram (float), sodium=mg (float)."
    )

    payload = json.dumps({
        "model":      "llama-3.1-8b-instant",
        "messages":   [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens":  150,
    }).encode("utf-8")

    try:
        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type":  "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent":    "groq-python/0.11.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        text = result["choices"][0]["message"]["content"].strip()

        # Bersihkan markdown code block jika ada
        if "```" in text:
            parts = text.split("```")
            text = parts[1] if len(parts) > 1 else parts[0]
            if text.lower().startswith("json"):
                text = text[4:]
        text = text.strip()

        data = json.loads(text)

        if not all(k in data for k in ("calories", "protein", "carbs", "fat")):
            return None

        return {
            "cal":  int(data.get("calories", 0)),
            "prot": float(data.get("protein",  0)),
            "carb": float(data.get("carbs",    0)),
            "fat":  float(data.get("fat",      0)),
            "fib":  float(data.get("fiber",    0)),
            "sod":  float(data.get("sodium",   0)),
            "sug":  float(data.get("sugar",    0)),
        }

    except Exception:
        return None


# ============================================================
# 4. Model loader
# ============================================================
def load_model(model_path):
    try:
        model = models.resnet50(weights=None)
        model.fc = torch.nn.Linear(model.fc.in_features, 101)
        state_dict = torch.load(model_path, map_location=torch.device("cpu"), weights_only=False)
        if "state_dict" in state_dict:
            state_dict = state_dict["state_dict"]
        model.load_state_dict(state_dict, strict=False)
        model.eval()
        return model
    except Exception as e:
        print(json.dumps({"error": f"Model Load Error: {str(e)}"}))
        return None


# ============================================================
# 5. Prediction pipeline
# ============================================================
def predict(image_path, model_path):
    if not os.path.exists(model_path):
        print(json.dumps({"error": f"Model file not found: {model_path}"}))
        return

    model = load_model(model_path)
    if not model:
        return

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    try:
        image        = Image.open(image_path).convert("RGB")
        input_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs    = model(input_tensor)
            probs      = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probs, 1)

        class_idx  = predicted_idx.item()
        conf_score = confidence.item() * 100
        class_name = CLASSES[class_idx]

        # Lokalisasi nama untuk display
        LOCALIZE = {
            "chicken_wings": "Ayam Goreng",
            "fried_rice":    "Nasi Goreng",
            "grilled_salmon":"Ikan Bakar",
            "pho":           "Soto Ayam",
            "dumplings":     "Dim Sum",
            "spring_rolls":  "Lumpia",
        }
        display_name = LOCALIZE.get(class_name, class_name.replace("_", " ").title())

        # ── Ambil nutrisi dari Groq (utama) ───────────────────────────
        api_key = os.environ.get("GROQ_API_KEY", "")
        nutri   = get_nutrition_from_groq(display_name, api_key)
        source  = "groq"

        if nutri is None:
            # ── Fallback: Local Nutrition DB (jika Gemini gagal) ──────
            # Uncomment baris di bawah jika ingin paksa pakai local DB:
            # nutri = LOCAL_NUTRITION_DB.get(class_name, DEFAULT_LOCAL_NUTRITION)
            nutri  = LOCAL_NUTRITION_DB.get(class_name, DEFAULT_LOCAL_NUTRITION)
            source = "local_db"
        # ──────────────────────────────────────────────────────────────

        low_confidence = conf_score < 20
        tags = [display_name]
        if low_confidence:      tags.append("Low Confidence")
        if nutri["cal"]  > 500: tags.append("High Calorie")
        if nutri["prot"] > 20:  tags.append("High Protein")
        if nutri["carb"] < 20:  tags.append("Low Carb")

        result = {
            "food_name":  display_name,
            "confidence": round(conf_score, 1),
            "tags":       tags,
            "nutrition": {
                "calories": nutri["cal"],
                "protein":  nutri["prot"],
                "carbs":    nutri["carb"],
                "fat":      nutri["fat"],
                "fiber":    nutri["fib"],
                "sodium":   nutri["sod"],
                "sugar":    nutri["sug"],
            },
            "portion":    "1 serving",
            "source":     source,
            "debug_info": f"Torch {torch.__version__} | Nutrition: {source}",
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": f"Prediction Error: {str(e)}"}))


# ============================================================
# 6. Entry point
# ============================================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python predict_cli.py <image_path>"}))
    else:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_file  = os.path.join(current_dir, "food101_model.pth")
        if len(sys.argv) > 2:
            model_file = sys.argv[2]
        predict(sys.argv[1], model_file)
