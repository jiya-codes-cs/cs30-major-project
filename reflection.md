# Reflection for CompSci 30 project

## What advice would you give to yourself if you were to start this project like this again?
- Start by picking the right Machine Learning Model (choices - tenserflow(hard), ml5(easy but glitchy), mediapipe(medium difficulty and best)).

- I would suggest myself to first of all familiarize myself with the mediapipe syntax and watch videos on how people have approched this project via.

- Setting up variables like ROTATION_SPEED and PINCH_THRESHOLD at the start makes it much easier to tune the feel of the hand tracking without hunting through the logic.

## Did you complete everything in your needs to have list?
- Yes, the core interface is functional. I successfully integrated the the webcam feed and the mediapipe hand-tracking library.

- Interactive Alphabet Wheel: The wheel rotates based on specific finger states (index/thumb vs. index/middle/thumb) and allows for letter selection.

- Word Game Logic: I implemented the "CAKE" word challenge wher the system locks if a pinched letter is correct or wrong.

- Color Picker: The drop-down menu for changing the wheel's letter color works using a 2 second hover setection mechanism. 

## What was the hardest part of the project?
- Pinch Detection Math: Using Pythagorean theorem to calculate the distance between the thumb and the index finger tips was tricky and I did needed a little halp for that part from AI to help me give ideas on how to approach that idea.

- Wheel Indexing: Mapping the WheelRotation (which is in Raadians) to a specific index in 26 letter alphabet array especially handeling the negative nubers when spinning backwards.

- Hand Detection Sensitivity Settings: Finding the balance in minDetectionConfidence function so the hand doesn't flicker but still responds quickly responds to fast movements.


## Were there any problems that you could not solve?
- Haptic Jiggle vs. Performance: While the "Haptic Jiggle Algorithm" works visually I wanted it to trigger an actual phone vibration but browser security settings make it difficult to trigger haptics without a direct click from the user.

- Occlusion issues: If the thumb goes behind the palm, AI looses the track of the "pinch" which can sometimes make selecting the letter frustrating for the user if the hand isn't perfectly flat onto the camera.

- Light Sensitivity: In darker environments the red landmark dots become shaky which affects the rotation speed. I partially fixed the problem by adding a small buffer to the "finger open" detection.