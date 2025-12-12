import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import FamilyMemberCircle from '@/Components/Dashboard/FamilyMemberCircle';
import FoodLogItem from '@/Components/Dashboard/FoodLogItem';
import WeeklyTrendChart from '@/Components/Charts/WeeklyTrendChart';
import MacroDonutChart from '@/Components/Charts/MacroDonutChart';
import PrimaryButton from '@/Components/PrimaryButton';
import InviteMemberModal from '@/Components/Modals/InviteMemberModal';
import ManageMembersModal from '@/Components/Modals/ManageMembersModal';
import Modal from '@/Components/Modal';

export default function Dashboard({ auth, familyMembers, todaysLogs, dailyStats, weeklyChartData, success }) {

    // Default stats if empty
    const stats = dailyStats || { calories: 0, protein: 0, carbs: 0, fat: 0, goal_calories: 2000 };

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Recommended meals list for random suggestion
    const recommendedMeals = [
        {
            name: 'Gado-gado / Karedok',
            calories: 350,
            protein: 12,
            time: '30 min',
            image: 'https://images.unsplash.com/photo-1626804475297-411d8631c368?q=80&w=1200&auto=format',
            ingredients: ['Mixed Vegetables (Spinach, Bean Sprouts, Cabbage)', 'Peanut Sauce', 'Tofu', 'Tempeh', 'Cucumber', 'Crackers'],
            steps: [
                'Blanch the spinach, bean sprouts, and cabbage in boiling water for 2-3 minutes until tender but crisp. Drain well.',
                'Cut tofu and tempeh into cubes. Pan-fry or air-fry them until golden brown.',
                'Slice the fresh cucumber and prepare the peanut sauce (mix store-bought paste with hot water or make from scratch).',
                'Arrange the boiled vegetables, fresh cucumber, tofu, and tempeh on a plate.',
                'Pour the peanut sauce generously over the salad and toss lightly to coat.',
                'Serve immediately with a sprinkle of crushed crackers for texture.'
            ]
        },
        {
            name: 'Steamed Fish (Pepes Ikan)',
            calories: 250,
            protein: 25,
            time: '45 min',
            image: 'https://asset.kompas.com/crops/tMekp78FJPNFclpYhL-G5RCCAfw=/0x0:1000x667/1200x800/data/photo/2019/12/23/5e0059a46fa44.jpg',
            ingredients: ['Fish Fillet or Whole Fish', 'Banana Leaves', 'Shallots & Garlic', 'Turmeric & Ginger', 'Chili', 'Basil Leaves'],
            steps: [
                'Blend shallots, garlic, turmeric, ginger, and chili into a smooth paste. Season with salt and sugar.',
                'Clean the fish and coat it thoroughly with the spice paste. Let it marinate for 15 minutes.',
                'Place the fish on a clean banana leaf. Add a handful of fresh basil leaves on top.',
                'Wrap the fish securely in the banana leaf and secure the ends with toothpicks.',
                'Steam the wrapped fish for 25-30 minutes until fully cooked and fragrant.',
                'Optional: Briefly grill the packet over a flame for a smoky aroma before serving.'
            ]
        },
        {
            name: 'Sayur Asem (Tamarind Soup)',
            calories: 150,
            protein: 5,
            time: '30 min',
            image: 'https://assets.unileversolutions.com/recipes-v3/254263-default.jpg?im=AspectCrop=(720,459);Resize=(720,459)',
            ingredients: ['Chayote', 'Long Beans', 'Sweet Corn', 'Tamarind', 'Peanuts', 'Melinjo'],
            steps: [
                'Bring a pot of water to a boil. Add the peanuts and corn first, cooking until they start to soften.',
                'Stir in the tamarind paste (dissolved in water) and the ground spice mix (chili, shallot, garlic, galangal).',
                'Add the chayote and melinjo. Cook for another 5 minutes.',
                'Finally, add the long beans and any leafy greens. Season with salt and a pinch of sugar.',
                'Cook for 2-3 more minutes until all vegetables are tender. Serve hot.'
            ]
        },
        {
            name: 'Clear Spinach & Corn Soup',
            calories: 120,
            protein: 4,
            time: '20 min',
            image: 'https://asset.kompas.com/crops/Hr52DtnmZS3TCxhLXco-CSZm2CM=/54x87:854x621/1200x800/data/photo/2022/05/05/62735bb98c0a0.jpg',
            ingredients: ['Spinach Bunch', 'Sweet Corn Kernels', 'Garlic (sliced)', 'Fingerroot (Temu Kunci)', 'Water'],
            steps: [
                'Boil water in a pot. Add the sliced garlic and crushed fingerroot (temu kunci) for aroma.',
                'Add the sweet corn kernels and cook for 5 minutes until sweet and tender.',
                'Season with salt and a teaspoon of sugar to taste.',
                'Add the spinach leaves and cook for only 1-2 minutes to prevent overcooking.',
                'Turn off the heat immediately and serve fresh to keep the spinach green.'
            ]
        },
        {
            name: 'Stir-fried Water Spinach',
            calories: 180,
            protein: 3,
            time: '15 min',
            image: 'https://i0.wp.com/resepkoki.id/wp-content/uploads/2019/10/Tumis-Kangkung.jpg?fit=500%2C282&ssl=1',
            ingredients: ['Water Spinach (Kangkung)', 'Garlic', 'Red Chili', 'Oyster Sauce', 'Shrimp Paste (optional)'],
            steps: [
                'Wash the water spinach thoroughly and snap into bite-sized pieces.',
                'Heat a wok with 1 tbsp of oil. Sauté sliced garlic and chili (and shrimp paste if using) until fragrant.',
                'Turn up the heat to high. Add the water spinach and toss quickly.',
                'Add a splash of water and a tablespoon of oyster sauce. Stir-fry for 1-2 minutes.',
                'Remove from heat while the stems are still crunchy. Serve hot.'
            ]
        },
        {
            name: 'Vegetable Urap',
            calories: 200,
            protein: 6,
            time: '30 min',
            image: 'https://branda.co.id/wp-content/uploads/2025/07/IMG_6077.jpeg',
            ingredients: ['Spinach', 'Bean Sprouts', 'Cabbage', 'Grated Coconut', 'Chili & Garlic Paste', 'Lime Leaf'],
            steps: [
                'Prepare the dressing: Mix grated coconut with chili paste, garlic, brown sugar, and lime leaf. Steam this mixture for 15 minutes to cook it.',
                'Blanch the spinach, bean sprouts, and cabbage separately in boiling water until tender-crisp. Drain well.',
                'In a large bowl, toss the boiled vegetables with the steamed spiced coconut.',
                'Mix thoroughly until every vegetable piece is coated with the savory coconut topping.',
                'Serve at room temperature.'
            ]
        },
        {
            name: 'Capcay',
            calories: 250,
            protein: 15,
            time: '25 min',
            image: 'https://asset.kompas.com/crops/0TAYtSARLhrA8bCNnfQyXeXj2N0=/100x67:900x600/1200x800/data/photo/2021/01/01/5fee5925f248d.jpg',
            ingredients: ['Broccoli', 'Carrot', 'Cauliflower', 'Chicken Breast', 'Garlic', 'Cornstarch', 'Oyster Sauce'],
            steps: [
                'Slice the chicken breast thinly and chop all vegetables into bite-sized pieces.',
                'Heat oil in a pan and sauté minced garlic until golden.',
                'Add the chicken and stir-fry until completely cooked (white).',
                'Add the carrots and cauliflower, cook for 2 minutes, then add broccoli and softer vegetables.',
                'Pour in water mixed with oyster sauce and salt. Thicken the sauce with a cornstarch slurry if desired.',
                'Cook until sauce bubbles and veggies are tender.'
            ]
        },
        {
            name: 'Indonesian Chicken Soup (Soto)',
            calories: 350,
            protein: 25,
            time: '60 min',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Soto_ayam.JPG/1280px-Soto_ayam.JPG',
            ingredients: ['Chicken', 'Turmeric', 'Lemongrass', 'Ginger', 'Vermicelli', 'Boiled Egg', 'Bean Sprouts'],
            steps: [
                'Boil the chicken in water. Skim off any foam.',
                'Sauté the spice paste (turmeric, garlic, shallot, ginger, candlenut) with lemongrass and lime leaves until fragrant.',
                'Add the sautéed spices to the boiling chicken pot. Simmer until chicken is tender.',
                'Remove chicken, shred the meat, and set aside.',
                'To serve, place vermicelli, bean sprouts, and shredded chicken in a bowl. Pour the hot turmeric broth over it.',
                'Top with a boiled egg half and a squeeze of lime.'
            ]
        },
        {
            name: 'Batam Style Fish Soup',
            calories: 280,
            protein: 30,
            time: '40 min',
            image: 'https://asset.tribunnews.com/npa0lpHqwEULy9PP0EUsENEMYMI=/1200x675/filters:upscale():quality(30):format(webp):focal(0.5x0.5:0.5x0.5)/batam/foto/bank/originals/sdffsd.jpg',
            ingredients: ['White Fish Fillet', 'Green Tomatoes', 'Mustard Greens', 'Fried Shallots', 'Fish Sauce'],
            steps: [
                'Slice the fish fillets thinly. Marinate with a little lime juice and salt.',
                'Boil water with sliced ginger and garlic. Add fish sauce and salt to taste.',
                'Add the fish slices to the boiling broth. They will cook very quickly (2-3 minutes).',
                'Add the mustard greens and green tomatoes for freshness.',
                'Remove from heat immediately. Serve garnished with generous fried shallots (bawang goreng).'
            ]
        },
        {
            name: 'Braised Tofu & Tempe (Bacem)',
            calories: 300,
            protein: 20,
            time: '60 min',
            image: 'https://www.finnafood.com/blog/wp-content/uploads/2023/11/cara-membuat-tahu-bacem.webp',
            ingredients: ['Firm Tofu', 'Tempeh', 'Coconut Water', 'Palm Sugar', 'Coriander Seeds', 'Galangal'],
            steps: [
                'Cut tofu and tempeh into thick slices.',
                'In a pot, combine coconut water, palm sugar, coriander, garlic, shallots, galangal, and bay leaves.',
                'Add the tofu and tempeh. Ensure they are submerged.',
                'Simmer on low heat until the liquid reduces completely and is absorbed by the tofu/tempeh.',
                'Pan-sear the braised pieces on a non-stick pan with a tiny bit of oil for a caramelized finish.'
            ]
        },
        {
            name: 'Pecel Sayur',
            calories: 350,
            protein: 10,
            time: '30 min',
            image: 'https://asset.kompas.com/crops/1SXpTtcy7b_VWoL5PrFIGOIjHaY=/0x0:0x0/750x500/data/photo/2021/07/06/60e3ef91620b7.jpg',
            ingredients: ['Spinach', 'Bean Sprouts', 'Kenikir Leaves', 'Long Beans', 'Peanut Sauce Block'],
            steps: [
                'Rinse all vegetables thoroughly.',
                'Boil each vegetable type separately until cooked but still retaining color.',
                'Dissolve the instant pecel peanut sauce block in hot water until it reaches a creamy consistency.',
                'Drain the vegetables well and arrange them on a serving plate.',
                'Pour the warm peanut sauce over the vegetables just before eating.'
            ]
        },
        {
            name: 'Sayur Lodeh (Low Fat)',
            calories: 250,
            protein: 8,
            time: '40 min',
            image: 'https://buckets.sasa.co.id/v1/AUTH_Assets/Assets/p/website/medias/page_medias/shutterstock_1689542503_(1).jpg',
            ingredients: ['Eggplant', 'Chayote', 'Long Beans', 'Low-fat Milk or Fiber Creme', 'Turmeric & Coriander'],
            steps: [
                'Sauté the blended spices (shallot, garlic, candlenut, turmeric) until fragrant.',
                'Add water and bring to a boil.',
                'Add the harder vegetables first (chayote, corn), then the softer ones (eggplant, leaves).',
                'Stir in the low-fat milk or Fiber Creme instead of thick coconut milk.',
                'Simmer gently for 5 minutes, stirring constantly to prevent the "milk" from breaking. Season and serve.'
            ]
        },
        {
            name: 'Pan Seared Grilled Chicken',
            calories: 300,
            protein: 35,
            time: '30 min',
            image: 'https://www.simplywhisked.com/wp-content/uploads/2020/06/Pan-Seared-Chicken-Breast-5.jpg',
            ingredients: ['Chicken Breast', 'Turmeric Powder', 'Garlic Powder', 'Lime Juice', 'Salt & Pepper'],
            steps: [
                'Clean the chicken breast and pat dry. Pound slightly for even thickness.',
                'Rub with lime juice, turmeric, garlic powder, salt, and pepper. Let sit for 10 minutes.',
                'Heat a non-stick pan over medium heat with a spray of oil.',
                'Place chicken in the pan. Cook for 6-8 minutes on one side without moving it to get a nice crust.',
                'Flip and cook for another 5-6 minutes until internal temp reaches 165°F (74°C). Rest before slicing.'
            ]
        },
        {
            name: 'Grilled Mackerel (Ikan Bakar)',
            calories: 280,
            protein: 30,
            time: '35 min',
            image: 'https://family-friends-food.com/wp-content/uploads/2016/07/2.jpg',
            ingredients: ['Fresh Mackerel (Ikan Kembung)', 'Lime', 'Sweet Soy Sauce', 'Chili Paste', 'Margarin'],
            steps: [
                'Clean the mackerel and make slits on the sides. Drizzle with lime juice to remove odor.',
                'Mix the grill sauce: sweet soy sauce, chili paste, and a bit of melted margarine/oil.',
                'Brush the sauce all over the fish.',
                'Grill the fish on a pan or charcoal grill. Brush with more sauce every time you flip.',
                'Cook until the flesh is opaque and skin is charred. Serve with fresh chili sambal.'
            ]
        },
        {
            name: 'Hard-boiled Eggs Balado',
            calories: 200,
            protein: 12,
            time: '20 min',
            image: 'https://islandsunindonesia.com/wp-content/uploads/2021/05/telor-balado.jpg',
            ingredients: ['Eggs', 'Curly Red Chilies', 'Shallots & Garlic', 'Tomato', 'Lime Leaf'],
            steps: [
                'Boil the eggs for 10 minutes (hard boiled). Peel and set aside.',
                'Blend the red chilies, tomato, shallots, and garlic (leave it slightly coarse for texture).',
                'Sauté the chili paste with lime leaves in a little oil until the oil separates and it smells cooked (not raw).',
                'Add salt and a pinch of sugar.',
                'Toss the boiled eggs in the chili sauce and cook for 1 minute to coat completely.'
            ]
        },
        {
            name: 'Sweet Soy Sauce Chicken (Semur)',
            calories: 350,
            protein: 28,
            time: '45 min',
            image: 'https://asset.kompas.com/crops/IPdQ1GpokjzDUBLjU_tdEOgwEJ8=/0x0:0x0/750x500/data/photo/2020/07/22/5f179e22a9a39.jpg',
            ingredients: ['Chicken Pieces', 'Sweet Soy Sauce', 'Nutmeg', 'Cloves', 'Cinnamon', 'White Pepper'],
            steps: [
                'Sauté minced garlic and shallots until golden.',
                'Add the chicken pieces and sear until the surface changes color.',
                'Pour in water and add sweet soy sauce, nutmeg, cloves, cinnamon, salt, and pepper.',
                'Bring to a boil, then lower heat to a simmer.',
                'Cook for 30 minutes until the sauce thickens and chicken is tender.'
            ]
        },
        {
            name: 'Tempeh Steak',
            calories: 300,
            protein: 18,
            time: '30 min',
            image: 'https://asset.kompas.com/crops/ArIS3hiL6y_Af2MgpOgpeI7vaCc=/94x30:894x563/1200x800/data/photo/2021/03/08/604593be959c6.jpg',
            ingredients: ['Tempeh Block', 'Black Pepper Sauce', 'Carrots', 'Green Beans', 'Cornstarch'],
            steps: [
                'Steam the block of tempeh for 15 minutes to remove the raw bean taste.',
                'Marinate the steamed tempeh with garlic and salt. Grill on a pan until browned.',
                'Prepare the sauce: sauté onions, add water, black pepper, oyster sauce, and soy sauce. Thicken with cornstarch.',
                'Boil the carrots and green beans as sides.',
                'Pour the black pepper sauce over the grilled tempeh and serve with the veggies.'
            ]
        },
        {
            name: 'Mun Tahu (Minced Chicken)',
            calories: 250,
            protein: 20,
            time: '25 min',
            image: 'https://img-global.cpcdn.com/recipes/ff28cf941a263164/600x852cq80/mun-tahu-ayam-jamur-enoki-foto-resep-utama.webp',
            ingredients: ['Silken Tofu', 'Minced Chicken Breast', 'Spring Onions', 'Garlic', 'Oyster Sauce'],
            steps: [
                'Sauté minced garlic and ginger until fragrant.',
                'Add the minced chicken and cook until white and crumbly.',
                'Add diced silken tofu and water/broth. Season with oyster sauce, soy sauce, and sesame oil.',
                'Simmer gently to avoid breaking the tofu.',
                'Thicken the sauce with cornstarch slurry and toss in chopped spring onions.'
            ]
        },
        {
            name: 'Steamed Fish with Ginger',
            calories: 220,
            protein: 28,
            time: '25 min',
            image: 'https://img-global.cpcdn.com/recipes/94cb31faad3897c2/600x852f0.5_0.483797_1.0q80/steamed-fish-with-ginger-sauce-foto-resep-utama.webp',
            ingredients: ['White Fish Fillet', 'Ginger (matchsticks)', 'Soy Sauce', 'Spring Onion', 'Sesame Oil'],
            steps: [
                'Place fish on a heat-proof plate. Top generously with ginger matchsticks.',
                'Steam the fish for 8-10 minutes depending on thickness.',
                'Drain any excess fishy water from the plate.',
                'Drizzle with soy sauce and sesame oil. Top with fresh spring onions.',
                'Pour smoking hot oil over the scallions and ginger to release their aroma (optional, or just serve).'
            ]
        },
        {
            name: 'Chicken Satay (Breast)',
            calories: 300,
            protein: 35,
            time: '40 min',
            image: 'https://joyfoodsunshine.com/wp-content/uploads/2018/07/chicken-satay-recipe-2.jpg',
            ingredients: ['Chicken Breast', 'Sweet Soy Sauce', 'Lime', 'Garlic', 'Peanut Sauce'],
            steps: [
                'Cut chicken breast into 2cm cubes.',
                'Marinate with crushed garlic, coriander, and sweet soy sauce for 20 minutes.',
                'Thread the chicken onto bamboo skewers.',
                'Grill on a pan or charcoal grill, turning frequently until charred and cooked.',
                'Serve with a side of peanut sauce, sliced shallots, and lime.'
            ]
        },
        {
            name: 'Boiled/Grilled Shrimp',
            calories: 150,
            protein: 20,
            time: '15 min',
            image: 'https://www.allrecipes.com/thmb/7I6qWcCtMzT_PEUlbRSIRDhYsZY=/0x512/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/AR-12775-Spicy-Grilled-Shrimp-DDMFS-4x3-beauty-8ed5ea13f67841c39c12341bacfeb466.jpg',
            ingredients: ['Fresh Shrimp', 'Lemon / Lime', 'Garlic Butter (optional)', 'Parsley'],
            steps: [
                'Clean shrimp (devein) but keep shells on for flavor (optional).',
                'Season with salt, pepper, and lemon juice.',
                'Boil: Drop into boiling salted water for 3 minutes until pink.',
                'Grill: Brush with a little garlic butter and grill for 2 minutes per side.',
                'Serve immediately with lemon wedges.'
            ]
        },
        {
            name: 'Oatmeal with Fresh Fruits',
            calories: 350,
            protein: 8,
            time: '10 min',
            image: 'https://www.etsuhealth.org/pictures/blog/oatmeal.png',
            ingredients: ['Rolled Oats', 'Milk or Water', 'Banana', 'Berries', 'Honey/Cinnamon'],
            steps: [
                'Combine oats and liquid in a pot. Bring to a boil.',
                'Reduce heat and simmer for 5 minutes, stirring occasionally until creamy.',
                'Pour into a bowl.',
                'Slice bananas and wash berries.',
                'Top the oatmeal with fruits, a sprinkle of cinnamon, and a drizzle of honey.'
            ]
        },
        {
            name: 'Whole Wheat Toast & Scrambled Eggs',
            calories: 300,
            protein: 15,
            time: '10 min',
            image: 'https://emeals-menubuilder.s3.amazonaws.com/v1/recipes/794138/pictures/large_creamy-herb-scrambled-eggs-on-whole-grain-toast.jpg',
            ingredients: ['Whole Wheat Bread', 'Eggs', 'Milk', 'Chives', 'Salt & Pepper'],
            steps: [
                'Whisk eggs with a splash of milk, salt, and pepper.',
                'Heat a non-stick pan over low-medium heat. Pour in the eggs.',
                'Gently push the eggs across the pan with a spatula until soft curds form. Do not overcook.',
                'Toast the whole wheat bread until golden.',
                'Serve the soft scrambled eggs on top of the toast, garnished with chives.'
            ]
        },
        {
            name: 'Fruit Salad with Yogurt',
            calories: 200,
            protein: 8,
            time: '10 min',
            image: 'https://joyfullymad.com/wp-content/uploads/2024/02/creamy-fruit-salad-6.jpg',
            ingredients: ['Apple', 'Melon', 'Grapes', 'Greek Yogurt', 'Honey', 'Mint'],
            steps: [
                'Wash and dice all fruits into uniform bite-sized pieces.',
                'Place fruit in a large bowl.',
                'Add a generous scoop of Greek yogurt.',
                'Drizzle with honey.',
                'Toss gently to coat the fruit in yogurt. Garnish with mint leaves.'
            ]
        },
        {
            name: 'Tuna Sandwich',
            calories: 350,
            protein: 25,
            time: '10 min',
            image: 'https://www.eatingwell.com/thmb/4L9Jm5eTqI_vvQmwVXJJLKPvYbo=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/spicy-garlicky-tuna-chickpea-sandwich-1x1-276-19a978798325459d809962a7db0ec86c.jpg',
            ingredients: ['Canned Tuna (in water)', 'Whole Wheat Bread', 'Cucumber', 'Tomato', 'Lettuce', 'Light Mayo/Yogurt'],
            steps: [
                'Drain the liquid from the canned tuna thoroughly.',
                'Mix tuna with a tablespoon of light mayonnaise or greek yogurt, salt, and pepper.',
                'Toast the bread lightly.',
                'Layer lettuce, tomato slices, and cucumber on one slice.',
                'Add the tuna mixture and top with the second slice. Cut in half.'
            ]
        },
        {
            name: 'Overnight Oats',
            calories: 300,
            protein: 10,
            time: '5 min',
            image: 'https://asset.kompas.com/crops/ggLTnoy3vaojKTmpHvAO8oHU-J4=/6x0:967x641/1200x800/data/photo/2024/01/04/65969b0d2fb81.jpg',
            ingredients: ['Rolled Oats', 'Milk (Dairy/Plant)', 'Chia Seeds', 'Honey', 'Yogurt'],
            steps: [
                'In a jar, combine oats, milk, yogurt, and chia seeds.',
                'Stir well to ensure no dry clumps remain.',
                'Stir in honey or maple syrup for sweetness.',
                'Cover and refrigerate for at least 6 hours or overnight.',
                'In the morning, top with fresh fruit or nuts and eat cold.'
            ]
        },
        {
            name: 'Banana & Spinach Smoothie',
            calories: 200,
            protein: 5,
            time: '5 min',
            image: 'https://www.fannetasticfood.com/wp-content/uploads/2019/07/banana-spinach-smoothie-4-1024x683-578x578.jpg',
            ingredients: ['Frozen Banana', 'Fresh Spinach', 'Milk/Water', 'Honey', 'Protein Powder (optional)'],
            steps: [
                'Add liquid (milk/water) to the blender first to help blending.',
                'Add the spinach and blend briefly to break it down.',
                'Add the frozen banana chunks and honey.',
                'Blend on high until completely smooth and creamy.',
                'Pour into a glass and drink immediately.'
            ]
        },
        {
            name: 'Manado Porridge (Tinutuan)',
            calories: 300,
            protein: 8,
            time: '45 min',
            image: 'https://assets.unileversolutions.com/recipes-v3/258612-default.jpg?im=AspectCrop=(720,459);Resize=(720,459)',
            ingredients: ['Rice', 'Pumpkin/Squash', 'Sweet Corn', 'Spinach/Water Spinach', 'Basil'],
            steps: [
                'Cook rice with plenty of water and pumpkin chunks until the rice breaks down into porridge and pumpkin is soft.',
                'Mash the pumpkin into the porridge for a yellow color.',
                'Add corn kernels and cook for 5 minutes.',
                'Stir in the spinach and basil leaves until wilted.',
                'Season with salt and serve hot, ideally with sambal roa (optional).'
            ]
        },
        {
            name: 'Grilled Chicken Salad Wrap',
            calories: 400,
            protein: 30,
            time: '15 min',
            image: 'https://natalieparamore.com/wp-content/uploads/Grilled-Chicken-Caesar-Salad-Wraps-_-Natalie-Paramore-3-768x1024.jpg',
            ingredients: ['Whole Wheat Tortilla', 'Grilled Chicken Breast', 'Romaine Lettuce', 'Tomato', 'Yogurt Dressing'],
            steps: [
                'Warm the tortilla slightly in a dry pan to make it pliable.',
                'Slice leftover grilled chicken breast into strips.',
                'Lay lettuce and diced tomatoes in the center of the tortilla.',
                'Top with chicken strips and drizzle with yogurt dressing.',
                'Fold in the sides and roll up tightly. Slice diagonally.'
            ]
        },
        {
            name: 'Boiled/Baked Sweet Potato',
            calories: 180,
            protein: 3,
            time: '30 min',
            image: 'https://www.allrecipes.com/thmb/iRNlrb4uETpR2uDnXxOc4c8lXmU=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/18249-baked-sweet-potatoes-DDMFS-4x3-ca310a21c01141d3b906da464aa7e27f.jpg',
            ingredients: ['Sweet Potato', 'Cinnamon (optional)'],
            steps: [
                'Wash the sweet potato well, scrubbing the skin.',
                'To Boil: Place in a pot of water, bring to boil, and cook for 20-30 mins until a fork slides in easily.',
                'To Bake: Prick with a fork, place on baking sheet, bake at 400°F (200°C) for 45-60 mins.',
                'Split open and enjoy plain or with a dash of cinnamon.'
            ]
        },
        {
            name: 'Bibimbap (Healthy Version)',
            calories: 450,
            protein: 20,
            time: '30 min',
            image: 'https://www.bhf.org.uk/-/media/images/information-support/support/healthy-living/recipes-new/bibimbap_800x600.jpg?rev=c767bcbf06134fc9ad9f86f92b8bb775&la=en&h=600&w=800&hash=561BF49C0B94612D86C592000EBAA0A7',
            ingredients: ['Brown Rice', 'Spinach', 'Carrots (julienned)', 'Bean Sprouts', 'Egg', 'Gochujang'],
            steps: [
                'Cook brown rice.',
                'Quickly sauté each vegetable (spinach, carrots, sprouts) separately with a drop of sesame oil and salt.',
                'Fry an egg sunny-side up.',
                'Place rice in a bowl. Arrange vegetables in contrasting colors on top.',
                'Place the egg in the center. Add a dollop of gochujang.',
                'Mix everything thoroughly before eating.'
            ]
        }
    ];

    const [recommended, setRecommended] = useState(recommendedMeals[0]);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const hasLogs = todaysLogs && todaysLogs.length > 0;

    useEffect(() => {
        if (success) {
            setShowSuccessModal(true);
        }
    }, [success]);

    // Randomize today's recommended meal on load
    useEffect(() => {
        const idx = Math.floor(Math.random() * recommendedMeals.length);
        setRecommended(recommendedMeals[idx]);
    }, []);

    const refreshRecommendation = () => {
        const random = recommendedMeals[Math.floor(Math.random() * recommendedMeals.length)];
        setRecommended(random);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="px-6 space-y-8">

                    {/* 1. Family Monitoring Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-2xl p-6 relative">
                        {/* Header with Settings Button */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Family Monitoring</h3>
                            <button
                                onClick={() => setShowManageModal(true)}
                                className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <span className="text-sm font-medium">Edit</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>

                        {/* Family List - Added p-4 to fix clipping issues */}
                        <div className="flex items-center space-x-8 overflow-x-auto p-4 -mx-4">
                            {familyMembers.map((member, index) => (
                                <FamilyMemberCircle
                                    key={member.id}
                                    name={member.name}
                                    active={index === 0} // Highlight first one for now
                                    ageCategory={member.age_category}
                                />
                            ))}

                            {/* Add Member Button */}
                            <div
                                className="flex flex-col items-center space-y-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={() => setShowInviteModal(true)}
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-gray-500">Add New</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href={route('nutriscan.index')} className="flex items-center justify-center gap-3 p-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="text-left">
                                <div className="font-bold text-lg">Scan Food</div>
                                <div className="text-sm opacity-90">Log your meal with a photo</div>
                            </div>
                        </Link>

                        <Link href={route('fitchef.index')} className="flex items-center justify-center gap-3 p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform hover:scale-[1.02]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <div className="text-left">
                                <div className="font-bold text-lg">Generate Recipe</div>
                                <div className="text-sm opacity-90">AI-powered meal suggestions</div>
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 3. Weekly Trends Chart */}
                        {/* 3. Weekly Trends Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Weekly Trends</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total calorie intake</p>
                                </div>
                                <Link href={route('report')} className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-full transition-colors font-medium text-gray-600 dark:text-gray-300">
                                    View Details &rarr;
                                </Link>
                            </div>
                            <WeeklyTrendChart chartData={weeklyChartData} />
                        </div>

                        {/* 4. Macro Nutrients */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Protein</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.protein)}g <span className="text-sm font-normal text-gray-400">/ 110g</span></div>
                                </div>
                                <MacroDonutChart value={stats.protein} total={110} color="#059669" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Carbs</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.carbs)}g <span className="text-sm font-normal text-gray-400">/ 250g</span></div>
                                </div>
                                <MacroDonutChart value={stats.carbs} total={250} color="#f97316" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fat</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.fat)}g <span className="text-sm font-normal text-gray-400">/ 70g</span></div>
                                </div>
                                <MacroDonutChart value={stats.fat} total={70} color="#3b82f6" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 5. Today's Log */}
                        <div className={`lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm ${hasLogs ? '' : 'min-h-64'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Log</h3>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{stats.calories} <span className="text-gray-400 font-normal">/ {stats.goal_calories}</span> kcal</div>
                            </div>

                            <div className={`${hasLogs ? 'space-y-2' : 'space-y-2 h-full flex items-center justify-center'}`}>
                                {hasLogs ? (
                                    todaysLogs.map((log) => (
                                        <FoodLogItem
                                            key={log.id}
                                            name={log.name}
                                            calories={log.calories}
                                            time={log.eaten_at}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">No meals logged today yet.</div>
                                )}
                            </div>
                        </div>

                        {/* 6. Recommended Meal */}
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">Today's Recommended Meal</h3>
                                <button
                                    onClick={refreshRecommendation}
                                    className="text-gray-400 hover:text-emerald-400 transition-colors p-1 rounded-full hover:bg-gray-700/50"
                                    title="Get another recommendation"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </button>
                            </div>

                            <div className="relative group">
                                <img
                                    src={recommended.image}
                                    alt={recommended.name}
                                    className="w-full h-40 md:h-44 object-cover rounded-xl mb-4 shadow-sm"
                                />
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{recommended.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-2 items-center">
                                <span>{recommended.calories} kcal</span>
                                <span>•</span>
                                <span>{recommended.protein}g Protein</span>
                                <span>•</span>
                                <span>{recommended.time}</span>
                            </div>

                            <button
                                onClick={() => setShowRecipeModal(true)}
                                className="mt-4 block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-colors text-center"
                            >
                                View Recipe
                            </button>
                        </div>
                    </div>

                </div>

                <InviteMemberModal show={showInviteModal} onClose={() => setShowInviteModal(false)} />
                <ManageMembersModal show={showManageModal} onClose={() => setShowManageModal(false)} members={familyMembers} />

                {/* Recipe Detail Modal */}
                <Modal show={showRecipeModal} onClose={() => setShowRecipeModal(false)}>
                    <div className="p-6 pt-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{recommended.name}</h2>
                            <button onClick={() => setShowRecipeModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <img src={recommended.image} alt={recommended.name} className="w-full h-56 object-cover rounded-2xl" />
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-orange-50 dark:bg-orange-900/30 px-4 py-2 rounded-xl text-center">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{recommended.calories}</div>
                                <div className="text-xs text-orange-600/70 dark:text-orange-400/70 uppercase font-bold">kcal</div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl text-center">
                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{recommended.protein}g</div>
                                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 uppercase font-bold">Protein</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl text-center">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{recommended.time}</div>
                                <div className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase font-bold">Time</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h3>
                                <ul className="grid grid-cols-2 gap-2">
                                    {recommended.ingredients && recommended.ingredients.map((ing, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preparation</h3>
                                <ol className="space-y-3 relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-5">
                                    {recommended.steps && recommended.steps.map((step, idx) => (
                                        <li key={idx} className="relative text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            <span className="absolute -left-[27px] top-0 w-6 h-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* Success Modal */}
                {/* Custom Modal for Flash Messages */}
                <Modal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="sm">
                    <div className="p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                            <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Saved!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{success}</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
                        >
                            Awesome
                        </button>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
