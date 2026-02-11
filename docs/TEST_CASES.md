
# Quick Test Cases for ServiceFlow

Use these inputs to verify the app's functionality.

### Test Case 1: The Burger Script
*   **Type:** Script Card
*   **Input (Text):** "Our burger is 8oz Wagyu beef, brioche bun, aged cheddar, bacon jam, and arugula. It comes with truffle fries. Upsell suggestion: Add a fried egg."
*   **Expected Output:** A structured script text ("May I recommend our signature Wagyu burger...") + An Audio asset of the script being read.

### Test Case 2: The Floor Plan
*   **Type:** Layout Diagram
*   **Input (Text):** "A rectangular room. North wall has a long bar. Center of room has 6 round tables. South wall has 4 booths."
*   **Expected Output:** An HTML/Mermaid render showing a box labeled "North Wall Bar" and nodes representing tables and booths.

### Test Case 3: Wine Service Flow
*   **Type:** Service Sequence Cards
*   **Input (Audio Transcript - Type this if Mic unavailable):** "First, present the label to the host. Second, cut the foil under the lip. Third, wipe the top of the bottle. Fourth, uncork gently without a pop. Fifth, pour a taste for the host."
*   **Expected Output:** 5 distinct cards, each with a title, summary, and a generated Illustration (Nano Banana) showing the action.

### Test Case 4: Complaint Logic
*   **Type:** Problem Resolution Flowchart
*   **Input (Text):** "Start with Guest Complaint. Is it food quality? If yes, offer recook. Is it service speed? If yes, offer free appetizer. If guest is yelling, get Manager immediately."
*   **Expected Output:** A visual flowchart diagram (Mermaid) branching from "Guest Complaint" to the solutions.

### Test Case 5: The Latte Art (Slideshow)
*   **Type:** Visual Slideshow
*   **Input (Text):** "Step 1: Steam milk to 140 degrees. Step 2: Tilt cup 45 degrees. Step 3: Pour milk in center to raise base. Step 4: Lower pitcher and wiggle for rosette."
*   **Expected Output:** A player component cycling through 4 generated images depicting coffee making steps.

### Test Case 6: Sophie Brainstorming
*   **Type:** Sophie Chat
*   **Input (Chat):** "I need a fun name for a summer cocktail with gin and basil."
*   **Expected Output:** A list of creative names (e.g., "The Basil Smash," "Garden Gin Fizz") in the chat window.

### Test Case 7: Visual Interpreter (Multimodal)
*   **Type:** Layout Diagram
*   **Input (Upload):** *Upload any simple image.* Then Type: "Create a diagram representing the layout of this image."
*   **Expected Output:** The Orchestrator should analyze the image (using Gemini 3 Pro Vision) and generate a code-based diagram approximating the structure.
