<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Recipe;

class RecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recipes = [
            [
                'title' => 'Gado-gado / Karedok',
                'calories' => 350,
                'protein' => 12,
                'time' => '30 min',
                'image' => 'https://images.unsplash.com/photo-1626804475297-411d8631c368?q=80&w=1200&auto=format',
                'ingredients' => ['Mixed Vegetables', 'Peanut Sauce', 'Tofu', 'Tempeh', 'Crackers'],
                'steps' => ['Boil vegetables', 'Fry tofu and tempeh', 'Mix with peanut sauce', 'Serve with crackers']
            ],
            [
                'title' => 'Steamed Fish',
                'calories' => 250,
                'protein' => 25,
                'time' => '45 min',
                'image' => 'https://asset.kompas.com/crops/tMekp78FJPNFclpYhL-G5RCCAfw=/0x0:1000x667/1200x800/data/photo/2019/12/23/5e0059a46fa44.jpg',
                'ingredients' => ['Fish', 'Banana Leaf', 'Spice Paste', 'Basil'],
                'steps' => ['Marinate fish', 'Wrap in banana leaf', 'Steam until cooked']
            ],
            [
                'title' => 'Sayur Asem (Tamarind Soup)',
                'calories' => 150,
                'protein' => 5,
                'time' => '30 min',
                'image' => 'https://assets.unileversolutions.com/recipes-v3/254263-default.jpg?im=AspectCrop=(720,459);Resize=(720,459)',
                'ingredients' => ['Chayote', 'Long Beans', 'Corn', 'Tamarind', 'Peanuts'],
                'steps' => ['Boil water with corn and peanuts', 'Add spices and vegetables', 'Cook until tender']
            ],
            [
                'title' => 'Clear Spinach & Corn Soup',
                'calories' => 120,
                'protein' => 4,
                'time' => '20 min',
                'image' => 'https://asset.kompas.com/crops/Hr52DtnmZS3TCxhLXco-CSZm2CM=/54x87:854x621/1200x800/data/photo/2022/05/05/62735bb98c0a0.jpg',
                'ingredients' => ['Spinach', 'Corn', 'Garlic', 'Water'],
                'steps' => ['Boil water with corn', 'Add spinach and seasoning', 'Cook briefly']
            ],
            [
                'title' => 'Stir-fried Water Spinach',
                'calories' => 180,
                'protein' => 3,
                'time' => '15 min',
                'image' => 'https://i0.wp.com/resepkoki.id/wp-content/uploads/2019/10/Tumis-Kangkung.jpg?fit=500%2C282&ssl=1',
                'ingredients' => ['Water Spinach', 'Garlic', 'Chili', 'Shrimp Paste (optional)'],
                'steps' => ['Sauté garlic and chili', 'Add water spinach', 'Stir fry quickly on high heat']
            ],
            [
                'title' => 'Vegetable Urap',
                'calories' => 200,
                'protein' => 6,
                'time' => '30 min',
                'image' => 'https://branda.co.id/wp-content/uploads/2025/07/IMG_6077.jpeg',
                'ingredients' => ['Mixed Vegetables', 'Grated Coconut', 'Spices'],
                'steps' => ['Boil vegetables', 'Steam spiced coconut', 'Mix together']
            ],
            [
                'title' => 'Capcay',
                'calories' => 250,
                'protein' => 15,
                'time' => '25 min',
                'image' => 'https://asset.kompas.com/crops/0TAYtSARLhrA8bCNnfQyXeXj2N0=/100x67:900x600/1200x800/data/photo/2021/01/01/5fee5925f248d.jpg',
                'ingredients' => ['Broccoli', 'Carrot', 'Cauliflower', 'Chicken Breast', 'Garlic'],
                'steps' => ['Sauté garlic', 'Add chicken and cook', 'Add vegetables and stir fry']
            ],
            [
                'title' => 'Indonesian Chicken Soup',
                'calories' => 350,
                'protein' => 25,
                'time' => '60 min',
                'image' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Soto_ayam.JPG/1280px-Soto_ayam.JPG',
                'ingredients' => ['Chicken', 'Turmeric', 'Lemongrass', 'Vermicelli', 'Egg'],
                'steps' => ['Boil chicken with herbs', 'Shred chicken', 'Serve with broth and toppings']
            ],
            [
                'title' => 'Batam Style Fish Soup',
                'calories' => 280,
                'protein' => 30,
                'time' => '40 min',
                'image' => 'https://asset.tribunnews.com/npa0lpHqwEULy9PP0EUsENEMYMI=/1200x675/filters:upscale():quality(30):format(webp):focal(0.5x0.5:0.5x0.5)/batam/foto/bank/originals/sdffsd.jpg',
                'ingredients' => ['Fish Fillet', 'Tomato', 'Mustard Greens', 'Fried Shallots'],
                'steps' => ['Prepare fish stock', 'Cook fish in broth', 'Add vegetables']
            ],
            [
                'title' => 'Braised Tofu & Tempe (Bacem)',
                'calories' => 300,
                'protein' => 20,
                'time' => '60 min',
                'image' => 'https://asset.tribunnews.com/npa0lpHqwEULy9PP0EUsENEMYMI=/1200x675/filters:upscale():quality(30):format(webp):focal(0.5x0.5:0.5x0.5)/batam/foto/bank/originals/sdffsd.jpg',
                'ingredients' => ['Tofu', 'Tempeh', 'Palm Sugar', 'Coriander', 'Bay Leaf'],
                'steps' => ['Boil ingredients with spices', 'Cook until water reduces', 'Pan sear lightly']
            ],
            [
                'title' => 'Pecel Sayur',
                'calories' => 350,
                'protein' => 10,
                'time' => '30 min',
                'image' => 'https://asset.kompas.com/crops/1SXpTtcy7b_VWoL5PrFIGOIjHaY=/0x0:0x0/750x500/data/photo/2021/07/06/60e3ef91620b7.jpg',
                'ingredients' => ['Spinach', 'Bean Sprouts', 'Peanut Sauce', 'Kenikir Leaves'],
                'steps' => ['Boil vegetables', 'Prepare peanut sauce', 'Pour sauce over vegetables']
            ],
            [
                'title' => 'Sayur Lodeh (Low Fat)',
                'calories' => 250,
                'protein' => 8,
                'time' => '40 min',
                'image' => 'https://buckets.sasa.co.id/v1/AUTH_Assets/Assets/p/website/medias/page_medias/shutterstock_1689542503_(1).jpg',
                'ingredients' => ['Eggplant', 'Long Beans', 'Low-fat Milk', 'Spices'],
                'steps' => ['Sauté spices', 'Add vegetables', 'Add milk and simmer']
            ],
            [
                'title' => 'Pan Seared Grilled Chicken',
                'calories' => 300,
                'protein' => 35,
                'time' => '30 min',
                'image' => 'https://www.simplywhisked.com/wp-content/uploads/2020/06/Pan-Seared-Chicken-Breast-5.jpg',
                'ingredients' => ['Chicken Breast', 'Turmeric', 'Garlic', 'Lime'],
                'steps' => ['Marinate chicken', 'Heat pan with little oil', 'Sear chicken until cooked']
            ],
            [
                'title' => 'Grilled Mackerel',
                'calories' => 280,
                'protein' => 30,
                'time' => '35 min',
                'image' => 'https://family-friends-food.com/wp-content/uploads/2016/07/2.jpg',
                'ingredients' => ['Mackerel', 'Lime', 'Chili Paste', 'Soy Sauce'],
                'steps' => ['Clean fish', 'Marinate with spices', 'Grill until done']
            ],
            [
                'title' => 'Hard-boiled Eggs Balado',
                'calories' => 200,
                'protein' => 12,
                'time' => '20 min',
                'image' => 'https://islandsunindonesia.com/wp-content/uploads/2021/05/telor-balado.jpg',
                'ingredients' => ['Eggs', 'Red Chili', 'Tomato', 'Shallots'],
                'steps' => ['Boil eggs', 'Sauté chili paste', 'Mix eggs with sauce']
            ],
            [
                'title' => 'Sweet Soy Sauce Chicken',
                'calories' => 350,
                'protein' => 28,
                'time' => '45 min',
                'image' => 'https://asset.kompas.com/crops/IPdQ1GpokjzDUBLjU_tdEOgwEJ8=/0x0:0x0/750x500/data/photo/2020/07/22/5f179e22a9a39.jpg',
                'ingredients' => ['Chicken', 'Sweet Soy Sauce', 'Nutmeg', 'Clove'],
                'steps' => ['Sauté spices', 'Add chicken and water', 'Simmer until tender']
            ],
            [
                'title' => 'Tempeh Steak',
                'calories' => 300,
                'protein' => 18,
                'time' => '30 min',
                'image' => 'https://asset.kompas.com/crops/ArIS3hiL6y_Af2MgpOgpeI7vaCc=/94x30:894x563/1200x800/data/photo/2021/03/08/604593be959c6.jpg',
                'ingredients' => ['Tempeh', 'Black Pepper Sauce', 'Vegetables'],
                'steps' => ['Steam tempeh', 'Grill tempeh', 'Serve with black pepper sauce']
            ],
            [
                'title' => 'Mun Tahu (Minced Chicken)',
                'calories' => 250,
                'protein' => 20,
                'time' => '25 min',
                'image' => 'https://img-global.cpcdn.com/recipes/ff28cf941a263164/600x852cq80/mun-tahu-ayam-jamur-enoki-foto-resep-utama.webp',
                'ingredients' => ['Silken Tofu', 'Minced Chicken', 'Spring Onion', 'Oyster Sauce'],
                'steps' => ['Sauté chicken', 'Add tofu and sauce', 'Simmer until thick']
            ],
            [
                'title' => 'Steamed Fish with Ginger',
                'calories' => 220,
                'protein' => 28,
                'time' => '25 min',
                'image' => 'https://img-global.cpcdn.com/recipes/94cb31faad3897c2/600x852f0.5_0.483797_1.0q80/steamed-fish-with-ginger-sauce-foto-resep-utama.webp',
                'ingredients' => ['White Fish', 'Ginger', 'Soy Sauce', 'Spring Onion'],
                'steps' => ['Prepare fish', 'Top with ginger and soy sauce', 'Steam until flaky']
            ],
            [
                'title' => 'Chicken Satay (Breast)',
                'calories' => 300,
                'protein' => 35,
                'time' => '40 min',
                'image' => 'https://joyfoodsunshine.com/wp-content/uploads/2018/07/chicken-satay-recipe-2.jpg',
                'ingredients' => ['Chicken Breast', 'Peanut Sauce', 'Sweet Soy Sauce'],
                'steps' => ['Cube chicken', 'Skewer and grill', 'Serve with sauce']
            ],
            [
                'title' => 'Boiled/Grilled Shrimp',
                'calories' => 150,
                'protein' => 20,
                'time' => '15 min',
                'image' => 'https://www.allrecipes.com/thmb/7I6qWcCtMzT_PEUlbRSIRDhYsZY=/0x512/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/AR-12775-Spicy-Grilled-Shrimp-DDMFS-4x3-beauty-8ed5ea13f67841c39c12341bacfeb466.jpg',
                'ingredients' => ['Shrimp', 'Lemon', 'Garlic', 'Salt'],
                'steps' => ['Clean shrimp', 'Boil or grill quickly', 'Serve with lemon']
            ],
            [
                'title' => 'Oatmeal with Fresh Fruits',
                'calories' => 350,
                'protein' => 8,
                'time' => '10 min',
                'image' => 'https://www.etsuhealth.org/pictures/blog/oatmeal.png',
                'ingredients' => ['Oats', 'Milk/Water', 'Banana', 'Berries'],
                'steps' => ['Cook oats', 'Top with fruits', 'Serve warm']
            ],
            [
                'title' => 'Whole Wheat Toast & Scrambled Eggs',
                'calories' => 300,
                'protein' => 15,
                'time' => '10 min',
                'image' => 'https://emeals-menubuilder.s3.amazonaws.com/v1/recipes/794138/pictures/large_creamy-herb-scrambled-eggs-on-whole-grain-toast.jpg',
                'ingredients' => ['Whole Wheat Bread', 'Eggs', 'Salt', 'Pepper'],
                'steps' => ['Toast bread', 'Scramble eggs', 'Serve together']
            ],
            [
                'title' => 'Fruit Salad with Yogurt',
                'calories' => 200,
                'protein' => 8,
                'time' => '10 min',
                'image' => 'https://joyfullymad.com/wp-content/uploads/2024/02/creamy-fruit-salad-6.jpg',
                'ingredients' => ['Mixed Fruit', 'Greek Yogurt', 'Honey'],
                'steps' => ['Cut fruit', 'Mix with yogurt', 'Top with honey']
            ],
            [
                'title' => 'Tuna Sandwich',
                'calories' => 350,
                'protein' => 25,
                'time' => '10 min',
                'image' => 'https://www.eatingwell.com/thmb/4L9Jm5eTqI_vvQmwVXJJLKPvYbo=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/spicy-garlicky-tuna-chickpea-sandwich-1x1-276-19a978798325459d809962a7db0ec86c.jpg',
                'ingredients' => ['Canned Tuna', 'Whole Wheat Bread', 'Lettuce', 'Tomato'],
                'steps' => ['Drain tuna', 'Assemble sandwich', 'Serve']
            ],
            [
                'title' => 'Overnight Oats',
                'calories' => 300,
                'protein' => 10,
                'time' => '5 min',
                'image' => 'https://asset.kompas.com/crops/ggLTnoy3vaojKTmpHvAO8oHU-J4=/6x0:967x641/1200x800/data/photo/2024/01/04/65969b0d2fb81.jpg',
                'ingredients' => ['Rolled Oats', 'Milk', 'Chia Seeds', 'Honey'],
                'steps' => ['Mix ingredients', 'Refrigerate overnight', 'Enjoy cold']
            ],
            [
                'title' => 'Banana & Spinach Smoothie',
                'calories' => 200,
                'protein' => 5,
                'time' => '5 min',
                'image' => 'https://www.fannetasticfood.com/wp-content/uploads/2019/07/banana-spinach-smoothie-4-1024x683-578x578.jpg',
                'ingredients' => ['Banana', 'Spinach', 'Milk/Water', 'Honey'],
                'steps' => ['Blend all ingredients', 'Pour into glass', 'Serve']
            ],
            [
                'title' => 'Manado Porridge (Tinutuan)',
                'calories' => 300,
                'protein' => 8,
                'time' => '45 min',
                'image' => 'https://assets.unileversolutions.com/recipes-v3/258612-default.jpg?im=AspectCrop=(720,459);Resize=(720,459)',
                'ingredients' => ['Rice', 'Pumpkin', 'Corn', 'Spinach'],
                'steps' => ['Cook rice with pumpkin', 'Add corn and greens', 'Serve hot']
            ],
            [
                'title' => 'Grilled Chicken Salad Wrap',
                'calories' => 400,
                'protein' => 30,
                'time' => '15 min',
                'image' => 'https://natalieparamore.com/wp-content/uploads/Grilled-Chicken-Caesar-Salad-Wraps-_-Natalie-Paramore-3-768x1024.jpg',
                'ingredients' => ['Tortilla', 'Grilled Chicken', 'Lettuce', 'Tomato'],
                'steps' => ['Warm tortilla', 'Add fillings', 'Wrap']
            ],
            [
                'title' => 'Boiled/Baked Sweet Potato',
                'calories' => 180,
                'protein' => 3,
                'time' => '30 min',
                'image' => 'https://www.allrecipes.com/thmb/iRNlrb4uETpR2uDnXxOc4c8lXmU=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/18249-baked-sweet-potatoes-DDMFS-4x3-ca310a21c01141d3b906da464aa7e27f.jpg',
                'ingredients' => ['Sweet Potato'],
                'steps' => ['Clean potato', 'Boil or bake', 'Serve']
            ],
            [
                'title' => 'Bibimbap (Healthy Version)',
                'calories' => 450,
                'protein' => 20,
                'time' => '30 min',
                'image' => 'https://www.bhf.org.uk/-/media/images/information-support/support/healthy-living/recipes-new/bibimbap_800x600.jpg?rev=c767bcbf06134fc9ad9f86f92b8bb775&la=en&h=600&w=800&hash=561BF49C0B94612D86C592000EBAA0A7',
                'ingredients' => ['Rice', 'Spinach', 'Carrot', 'Bean Sprouts', 'Egg'],
                'steps' => ['Sauté vegetables separately', 'Fry egg', 'Assemble bowl', 'Mix with gochujang']
            ]
        ];

        foreach ($recipes as $recipe) {
            Recipe::create($recipe);
        }
    }
}
