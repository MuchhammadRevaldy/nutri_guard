import sys
import json
import torch
from torchvision import models, transforms
from PIL import Image
import os

# Fix for "could not create a primitive" error on some CPU environments
# This disables the MKL-DNN backend which can be unstable on certain VPS hardware
torch.backends.mkldnn.enabled = False


# 1. Food-101 Class Names
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

# 2. Nutrition Database (Approximations per serving)
NUTRITION_DB = {
    'apple_pie': {'cal': 296, 'prot': 2.4, 'carb': 43, 'fat': 13, 'sod': 180, 'sug': 20},
    'baby_back_ribs': {'cal': 600, 'prot': 40, 'carb': 25, 'fat': 38, 'sod': 900, 'sug': 20},
    'baklava': {'cal': 334, 'prot': 4, 'carb': 30, 'fat': 22, 'sod': 75, 'sug': 18},
    'beef_carpaccio': {'cal': 150, 'prot': 20, 'carb': 2, 'fat': 7, 'sod': 300, 'sug': 0},
    'beef_tartare': {'cal': 240, 'prot': 22, 'carb': 5, 'fat': 15, 'sod': 450, 'sug': 1},
    'beet_salad': {'cal': 180, 'prot': 4, 'carb': 15, 'fat': 12, 'sod': 350, 'sug': 10},
    'beignets': {'cal': 280, 'prot': 4, 'carb': 35, 'fat': 14, 'sod': 80, 'sug': 15},
    'bibimbap': {'cal': 550, 'prot': 20, 'carb': 85, 'fat': 15, 'sod': 700, 'sug': 8},
    'bread_pudding': {'cal': 306, 'prot': 6, 'carb': 48, 'fat': 10, 'sod': 250, 'sug': 28},
    'breakfast_burrito': {'cal': 650, 'prot': 25, 'carb': 60, 'fat': 35, 'sod': 1200, 'sug': 4},
    'bruschetta': {'cal': 180, 'prot': 4, 'carb': 20, 'fat': 9, 'sod': 220, 'sug': 2},
    'caesar_salad': {'cal': 350, 'prot': 10, 'carb': 12, 'fat': 28, 'sod': 600, 'sug': 3},
    'cannoli': {'cal': 260, 'prot': 5, 'carb': 22, 'fat': 16, 'sod': 90, 'sug': 14},
    'caprese_salad': {'cal': 250, 'prot': 12, 'carb': 6, 'fat': 20, 'sod': 300, 'sug': 3},
    'carrot_cake': {'cal': 415, 'prot': 4, 'carb': 50, 'fat': 22, 'sod': 320, 'sug': 30},
    'ceviche': {'cal': 180, 'prot': 22, 'carb': 8, 'fat': 6, 'sod': 600, 'sug': 2},
    'cheesecake': {'cal': 401, 'prot': 7, 'carb': 32, 'fat': 28, 'sod': 210, 'sug': 22},
    'cheese_plate': {'cal': 450, 'prot': 25, 'carb': 10, 'fat': 35, 'sod': 800, 'sug': 1},
    'chicken_curry': {'cal': 420, 'prot': 28, 'carb': 15, 'fat': 25, 'sod': 950, 'sug': 5},
    'chicken_quesadilla': {'cal': 520, 'prot': 30, 'carb': 40, 'fat': 28, 'sod': 1100, 'sug': 3},
    'chicken_wings': {'cal': 480, 'prot': 35, 'carb': 5, 'fat': 35, 'sod': 1050, 'sug': 1},
    'chocolate_cake': {'cal': 424, 'prot': 5, 'carb': 55, 'fat': 21, 'sod': 350, 'sug': 35},
    'chocolate_mousse': {'cal': 250, 'prot': 4, 'carb': 20, 'fat': 18, 'sod': 80, 'sug': 16},
    'churros': {'cal': 270, 'prot': 3, 'carb': 32, 'fat': 15, 'sod': 150, 'sug': 12},
    'clam_chowder': {'cal': 380, 'prot': 12, 'carb': 25, 'fat': 24, 'sod': 980, 'sug': 4},
    'club_sandwich': {'cal': 590, 'prot': 32, 'carb': 45, 'fat': 28, 'sod': 1300, 'sug': 8},
    'crab_cakes': {'cal': 310, 'prot': 22, 'carb': 12, 'fat': 20, 'sod': 750, 'sug': 2},
    'creme_brulee': {'cal': 320, 'prot': 4, 'carb': 18, 'fat': 26, 'sod': 80, 'sug': 16},
    'croque_madame': {'cal': 680, 'prot': 35, 'carb': 42, 'fat': 40, 'sod': 1400, 'sug': 6},
    'cup_cakes': {'cal': 305, 'prot': 3, 'carb': 38, 'fat': 16, 'sod': 200, 'sug': 25},
    'deviled_eggs': {'cal': 140, 'prot': 6, 'carb': 1, 'fat': 12, 'sod': 220, 'sug': 1},
    'donuts': {'cal': 270, 'prot': 4, 'carb': 30, 'fat': 15, 'sod': 280, 'sug': 14},
    'dumplings': {'cal': 220, 'prot': 8, 'carb': 30, 'fat': 7, 'sod': 550, 'sug': 2},
    'edamame': {'cal': 120, 'prot': 11, 'carb': 10, 'fat': 5, 'sod': 15, 'sug': 2},
    'eggs_benedict': {'cal': 650, 'prot': 25, 'carb': 30, 'fat': 48, 'sod': 1100, 'sug': 2},
    'escargots': {'cal': 220, 'prot': 15, 'carb': 3, 'fat': 16, 'sod': 400, 'sug': 0},
    'falafel': {'cal': 333, 'prot': 13, 'carb': 32, 'fat': 18, 'sod': 294, 'sug': 5},
    'filet_mignon': {'cal': 350, 'prot': 40, 'carb': 0, 'fat': 20, 'sod': 150, 'sug': 0},
    'fish_and_chips': {'cal': 690, 'prot': 30, 'carb': 65, 'fat': 35, 'sod': 1200, 'sug': 3},
    'foie_gras': {'cal': 460, 'prot': 11, 'carb': 4, 'fat': 44, 'sod': 70, 'sug': 0},
    'french_fries': {'cal': 365, 'prot': 4, 'carb': 48, 'fat': 17, 'sod': 270, 'sug': 0},
    'french_onion_soup': {'cal': 380, 'prot': 15, 'carb': 25, 'fat': 22, 'sod': 1200, 'sug': 8},
    'french_toast': {'cal': 400, 'prot': 12, 'carb': 50, 'fat': 18, 'sod': 450, 'sug': 18},
    'fried_calamari': {'cal': 350, 'prot': 18, 'carb': 25, 'fat': 20, 'sod': 600, 'sug': 1},
    'fried_rice': {'cal': 450, 'prot': 15, 'carb': 55, 'fat': 20, 'sod': 900, 'sug': 4},
    'frozen_yogurt': {'cal': 160, 'prot': 5, 'carb': 35, 'fat': 1, 'sod': 80, 'sug': 28},
    'garlic_bread': {'cal': 200, 'prot': 4, 'carb': 22, 'fat': 11, 'sod': 280, 'sug': 1},
    'gnocchi': {'cal': 380, 'prot': 8, 'carb': 65, 'fat': 10, 'sod': 450, 'sug': 2},
    'greek_salad': {'cal': 280, 'prot': 8, 'carb': 12, 'fat': 22, 'sod': 550, 'sug': 5},
    'grilled_cheese_sandwich': {'cal': 440, 'prot': 16, 'carb': 35, 'fat': 26, 'sod': 950, 'sug': 4},
    'grilled_salmon': {'cal': 350, 'prot': 35, 'carb': 0, 'fat': 22, 'sod': 150, 'sug': 0},
    'guacamole': {'cal': 150, 'prot': 2, 'carb': 8, 'fat': 13, 'sod': 200, 'sug': 1},
    'gyoza': {'cal': 240, 'prot': 9, 'carb': 30, 'fat': 8, 'sod': 550, 'sug': 2},
    'hamburger': {'cal': 540, 'prot': 30, 'carb': 40, 'fat': 28, 'sod': 980, 'sug': 8},
    'hot_and_sour_soup': {'cal': 160, 'prot': 8, 'carb': 18, 'fat': 6, 'sod': 1200, 'sug': 5},
    'hot_dog': {'cal': 290, 'prot': 10, 'carb': 25, 'fat': 17, 'sod': 750, 'sug': 4},
    'huevos_rancheros': {'cal': 480, 'prot': 20, 'carb': 45, 'fat': 24, 'sod': 850, 'sug': 4},
    'hummus': {'cal': 170, 'prot': 5, 'carb': 15, 'fat': 10, 'sod': 260, 'sug': 0},
    'ice_cream': {'cal': 270, 'prot': 5, 'carb': 32, 'fat': 15, 'sod': 90, 'sug': 25},
    'lasagna': {'cal': 600, 'prot': 30, 'carb': 45, 'fat': 32, 'sod': 1100, 'sug': 8},
    'lobster_bisque': {'cal': 420, 'prot': 15, 'carb': 18, 'fat': 32, 'sod': 1250, 'sug': 6},
    'lobster_roll_sandwich': {'cal': 550, 'prot': 28, 'carb': 42, 'fat': 30, 'sod': 1300, 'sug': 4},
    'macaroni_and_cheese': {'cal': 500, 'prot': 20, 'carb': 55, 'fat': 22, 'sod': 850, 'sug': 6},
    'macarons': {'cal': 160, 'prot': 2, 'carb': 18, 'fat': 8, 'sod': 5, 'sug': 15},
    'miso_soup': {'cal': 80, 'prot': 6, 'carb': 8, 'fat': 3, 'sod': 800, 'sug': 2},
    'mussels': {'cal': 250, 'prot': 20, 'carb': 8, 'fat': 14, 'sod': 650, 'sug': 0},
    'nachos': {'cal': 650, 'prot': 20, 'carb': 65, 'fat': 35, 'sod': 1400, 'sug': 3},
    'omelette': {'cal': 320, 'prot': 22, 'carb': 4, 'fat': 24, 'sod': 450, 'sug': 2},
    'onion_rings': {'cal': 480, 'prot': 5, 'carb': 55, 'fat': 26, 'sod': 600, 'sug': 4},
    'oysters': {'cal': 120, 'prot': 14, 'carb': 8, 'fat': 4, 'sod': 300, 'sug': 0},
    'pad_thai': {'cal': 650, 'prot': 25, 'carb': 85, 'fat': 22, 'sod': 1300, 'sug': 15},
    'paella': {'cal': 550, 'prot': 30, 'carb': 60, 'fat': 20, 'sod': 900, 'sug': 3},
    'pancakes': {'cal': 450, 'prot': 10, 'carb': 75, 'fat': 12, 'sod': 850, 'sug': 18},
    'panna_cotta': {'cal': 350, 'prot': 6, 'carb': 25, 'fat': 25, 'sod': 60, 'sug': 22},
    'peking_duck': {'cal': 520, 'prot': 25, 'carb': 15, 'fat': 40, 'sod': 1100, 'sug': 8},
    'pho': {'cal': 450, 'prot': 25, 'carb': 60, 'fat': 12, 'sod': 1600, 'sug': 5},
    'pizza': {'cal': 285, 'prot': 12, 'carb': 36, 'fat': 10, 'sod': 640, 'sug': 4},
    'pork_chop': {'cal': 350, 'prot': 32, 'carb': 0, 'fat': 24, 'sod': 120, 'sug': 0},
    'poutine': {'cal': 750, 'prot': 25, 'carb': 70, 'fat': 45, 'sod': 1400, 'sug': 2},
    'prime_rib': {'cal': 650, 'prot': 45, 'carb': 0, 'fat': 50, 'sod': 200, 'sug': 0},
    'pulled_pork_sandwich': {'cal': 580, 'prot': 30, 'carb': 55, 'fat': 26, 'sod': 1250, 'sug': 18},
    'ramen': {'cal': 450, 'prot': 20, 'carb': 65, 'fat': 18, 'sod': 1800, 'sug': 5},
    'ravioli': {'cal': 380, 'prot': 15, 'carb': 50, 'fat': 14, 'sod': 550, 'sug': 3},
    'red_velvet_cake': {'cal': 450, 'prot': 4, 'carb': 58, 'fat': 24, 'sod': 320, 'sug': 38},
    'risotto': {'cal': 420, 'prot': 10, 'carb': 55, 'fat': 18, 'sod': 700, 'sug': 2},
    'samosa': {'cal': 260, 'prot': 6, 'carb': 32, 'fat': 14, 'sod': 350, 'sug': 2},
    'sashimi': {'cal': 150, 'prot': 25, 'carb': 2, 'fat': 5, 'sod': 100, 'sug': 0},
    'scallops': {'cal': 180, 'prot': 28, 'carb': 6, 'fat': 4, 'sod': 400, 'sug': 0},
    'seaweed_salad': {'cal': 130, 'prot': 3, 'carb': 15, 'fat': 7, 'sod': 750, 'sug': 4},
    'shrimp_and_grits': {'cal': 550, 'prot': 25, 'carb': 45, 'fat': 30, 'sod': 1100, 'sug': 4},
    'spaghetti_bolognese': {'cal': 550, 'prot': 26, 'carb': 65, 'fat': 20, 'sod': 950, 'sug': 8},
    'spaghetti_carbonara': {'cal': 620, 'prot': 24, 'carb': 60, 'fat': 32, 'sod': 1050, 'sug': 3},
    'spring_rolls': {'cal': 180, 'prot': 5, 'carb': 24, 'fat': 8, 'sod': 320, 'sug': 2},
    'steak': {'cal': 550, 'prot': 48, 'carb': 0, 'fat': 40, 'sod': 200, 'sug': 0},
    'strawberry_shortcake': {'cal': 350, 'prot': 4, 'carb': 45, 'fat': 17, 'sod': 220, 'sug': 25},
    'sushi': {'cal': 320, 'prot': 12, 'carb': 55, 'fat': 5, 'sod': 650, 'sug': 8},
    'tacos': {'cal': 450, 'prot': 22, 'carb': 35, 'fat': 24, 'sod': 800, 'sug': 3},
    'takoyaki': {'cal': 280, 'prot': 10, 'carb': 35, 'fat': 12, 'sod': 550, 'sug': 4},
    'tiramisu': {'cal': 480, 'prot': 8, 'carb': 42, 'fat': 30, 'sod': 150, 'sug': 25},
    'tuna_tartare': {'cal': 220, 'prot': 25, 'carb': 5, 'fat': 12, 'sod': 380, 'sug': 1},
    'waffles': {'cal': 420, 'prot': 8, 'carb': 48, 'fat': 22, 'sod': 550, 'sug': 14}
}

# Fallback
DEFAULT_NUTRI = {'cal': 300, 'prot': 15, 'carb': 30, 'fat': 12, 'sod': 400, 'sug': 5}

def load_model(model_path):
    try:
        # Fix deprecation warning: use weights=None instead of pretrained=False
        model = models.resnet50(weights=None)
        num_ftrs = model.fc.in_features
        model.fc = torch.nn.Linear(num_ftrs, 101)
        
        # Fix PyTorch 2.6+ security change: explicit weights_only=False
        state_dict = torch.load(model_path, map_location=torch.device('cpu'), weights_only=False)
        if 'state_dict' in state_dict:
            state_dict = state_dict['state_dict']
            
        model.load_state_dict(state_dict, strict=False)
        model.eval()
        return model
    except Exception as e:
        print(json.dumps({'error': f"Model Load Error: {str(e)}"}))
        return None

def predict(image_path, model_path):
    if not os.path.exists(model_path):
        print(json.dumps({'error': f'Model file not found at {model_path}'}))
        return

    model = load_model(model_path)
    if not model:
        return

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    image = None
    input_tensor = None
    
    try:
        # Step 1: Open Image
        try:
            image = Image.open(image_path).convert('RGB')
        except Exception as e:
            raise RuntimeError(f"Image Open Failed: {e}")

        # Step 2: Transform
        try:
            input_tensor = transform(image).unsqueeze(0)
        except Exception as e:
            raise RuntimeError(f"Transform Failed: {e}")
            
        # Step 3: Inference
        try:
            with torch.no_grad():
                outputs = model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted_idx = torch.max(probabilities, 1)
        except Exception as e:
            raise RuntimeError(f"Inference Failed (Torch {torch.__version__}): {e}")
            
        class_idx = predicted_idx.item()
        conf_score = confidence.item() * 100
        
        # --- CONFIDENCE HANDLING ---
        # Jangan hentikan alur; tetap tampilkan hasil dengan penanda Low Confidence
        low_confidence = conf_score < 20
        # ----------------------------
        
        class_name = CLASSES[class_idx]
        
        # --- LOCALIZATION HACKS ---
        # Map Western classes to Indonesian equivalents
        display_name = class_name.replace('_', ' ').title()
        
        if class_name == 'chicken_wings':
            display_name = 'Ayam Goreng'
        elif class_name == 'fried_rice':
            display_name = 'Nasi Goreng'
        elif class_name == 'grilled_salmon':
            display_name = 'Ikan Bakar'
        elif class_name == 'pho':
            display_name = 'Soto Ayam' 
        elif 'spaghetti' in class_name:
            display_name = class_name.replace('_', ' ').title() 
        
        # Get nutrition (using original class_name key)
        nutri = NUTRITION_DB.get(class_name, DEFAULT_NUTRI)
        
        # Generate dynamic tags
        tags = [display_name]
        if low_confidence:
            tags.append('Low Confidence')
        if nutri['cal'] > 500: tags.append('High Calorie')
        if nutri['prot'] > 20: tags.append('High Protein')
        if nutri['carb'] < 20: tags.append('Low Carb')
        
        result = {
            'food_name': display_name,
            'confidence': round(conf_score, 1),
            'tags': tags,
            'nutrition': {
                'calories': nutri['cal'],
                'protein': nutri['prot'],
                'carbs': nutri['carb'],
                'fat': nutri['fat'],
                'sodium': nutri['sod'],
                'sugar': nutri['sug']
            },
            'portion': '1 serving',
            'debug_info': f"Torch {torch.__version__} (MKLDNN Disabled)"
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': f'Prediction Logic Error: {str(e)}'}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Usage: python predict_cli.py <image_path>'}))
    else:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_file = os.path.join(current_dir, 'food101_model.pth')
        # Allow override for testing
        if len(sys.argv) > 2:
            model_file = sys.argv[2]
            
        predict(sys.argv[1], model_file)
