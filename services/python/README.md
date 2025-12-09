# NutriScan AI - Deep Learning Service

This directory contains the Python code for the AI food classification model.

## Prerequisites
- Python 3.8+
- PyTorch
- Flask
- Pillow

## Installation
```bash
pip install torch torchvision flask pillow
```

## Running the API
```bash
python food_classifier.py
```
The API will start at `http://localhost:5000`.

## Integration with Laravel
In `app/Http/Controllers/NutriScanController.php`, un-comment the HTTP request block to send images to this API instead of using the mock data.

```php
$response = Http::attach(
    'image', file_get_contents($path), 'image.jpg'
)->post('http://localhost:5000/predict');

$result = $response->json();
```
