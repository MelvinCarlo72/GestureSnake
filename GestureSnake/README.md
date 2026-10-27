# GestureSnake

Classic Snake, except you steer it with hand gestures instead of arrow keys. Built with
p5.js for the game loop and rendering, and a [Teachable Machine](https://teachablemachine.withgoogle.com/)
image model (run through ml5.js/TensorFlow.js) reading your webcam to classify gestures
in real time and feed them into the snake's direction.

## How it works
- `sketch.js` loads a Teachable Machine model from the browser and streams webcam input into it
- Each predicted gesture maps to a direction, which drives the `Snake` class in `snake.js`
- `p5.js` / `p5.sound.min.js` handle the grid, drawing, and game loop

## Tech stack
- p5.js (rendering/game loop) + p5.sound
- ml5.js (TensorFlow.js wrapper) for running the Teachable Machine model
- Vanilla JavaScript

## Run it
Needs a webcam. Serve it over HTTP (not `file://`, since the browser will block camera
access) — e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---
Built by Melvin Carlo Villanueva.
