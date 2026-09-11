# Number System Converter & Unified Algebraic Arithmetic Engine
**Course / Subject:** CPE 463 — Activity 1  
**Project Repository:** `Lyduke56/cpe463-number-system-converter`

---

## 1. Project Overview

The **Number System Converter & Unified Algebraic Arithmetic Engine** is an interactive web-based mathematical utility designed to perform multi-base conversions and algebraic evaluations simultaneously. The application allows users to define arbitrary numbers in differing positional numeral systems (Binary, Octal, Decimal, Hexadecimal), assign each value to symbolic algebraic variables ($A, B, C, D, \dots$), and evaluate complex arithmetic expressions using standard operator precedence (PEMDAS / BODMAS) and grouping.

Unlike basic calculators that evaluate operations sequentially from left to right, this engine incorporates a custom lexical tokenizer, Dijkstra's Shunting-yard algorithm (parsing infix expressions to Reverse Polish Notation), an Abstract Syntax Tree (AST) generator, and a step-by-step bottom-up reduction engine.

---

## 2. Key Features

### 2.1 Multi-Base Support & Live Individual Conversion
- **Supported Bases:**
  - **Binary (Base 2):** Digits `0`, `1`
  - **Octal (Base 8):** Digits `0` through `7`
  - **Decimal (Base 10):** Digits `0` through `9`
  - **Hexadecimal (Base 16):** Digits `0`–`9` and case-insensitive letters `A`–`F`
- **Real-Time Row Validation:** Digits are validated against the active base immediately as the user types, highlighting mistakes and providing clear inline notifications.
- **Individual 4-Base Conversion Matrix:** Each input row instantly renders its value converted across all four numeral systems simultaneously.

### 2.2 Dynamic Input Fields
- Accommodates any variable count of 3 or more (defaulting to letters $A, B, C, D, \dots$).
- Adjusting the input count dynamically preserves existing user inputs and automatically scales the virtual keypad and variable labels.

### 2.3 Unified Algebraic Arithmetic Engine
- **Custom Expression Parser:** Users can formulate custom equations combining inputs such as `(A + B - C) * D`, `(A + B) / (C - D)`, or `(A * B) / C`.
- **Precedence & Associativity:** Strictly adheres to algebraic precedence rules:
  1. Parentheses `(...)`
  2. Unary negation `−`
  3. Multiplication `×` and Division `÷` (Left-to-Right associative)
  4. Addition `+` and Subtraction `−` (Left-to-Right associative)
- **Implicit Multiplication:** Intelligently recognizes expressions such as `(A+B)(C+D)` or `2A` and inserts the multiplication operator automatically.
- **Floating-Point & Negative Results:** Computes with high numeric fidelity and converts fractional and negative outcomes into clean representations across all four bases (up to 6 fractional digits).

### 2.4 Interactive Virtual Keypad & Presets
- **On-Screen Keypad:** Provides tactile buttons for active variables ($A, B, C, \dots$), operators ($+$, $-$, $\times$, $\div$), parentheses, and backspace with cursor-aware insertion.
- **Quick Test Presets:** Pre-configured test configurations covering combinations of bases and equations for rapid verification.
- **Expression Chips:** One-click formula presets that populate the expression input bar.

### 2.5 Detailed Step-by-Step Breakdown
- Displays the symbolic formula with variable names.
- Renders the multi-base substituted formula with mathematical subscripts (e.g., $1010_2 + 12_8 - 25_{10}$).
- Shows the decimal equivalent equation.
- Generates an expandable bottom-up reduction history showing every intermediate evaluation step.

### 2.6 Comprehensive Error Handling
- **Input Syntax Errors:** Flags invalid characters according to the radix (e.g., entering `9` in octal or `G` in hexadecimal).
- **Expression Syntax Errors:** Identifies mismatched parentheses, missing operands, unclosed groupings, consecutive invalid operators, or empty parentheses.
- **Undefined Variables:** Catches references to variables that do not correspond to any rendered input row.
- **Arithmetic Safety:** Detects mathematical errors such as division by zero ($X \div 0$), safely halting execution and rendering descriptive warnings without crashing the interface.

---

## 3. Project File Structure

```text
cpe463_act1/
├── index.html      # Accessible HTML5 structure and layout
├── style.css       # Responsive styling, color tokens, and layout components
├── script.js       # Core conversion, parsing, AST evaluation, and UI logic
└── README.md       # Project documentation and user manual
```

### Component Details
- **[index.html](file:///c:/Users/L64X17W17/cpe463_act1/index.html):**
  Defines semantic containers including the control panel, quick preset buttons, expression input bar, virtual keypad, dynamic input rows container, global error banner, step-by-step accordion breakdown, and final multi-base output tiles.
- **[style.css](file:///c:/Users/L64X17W17/cpe463_act1/style.css):**
  Provides a clean, modern design system built with CSS custom properties (variables), responsive flexbox and grid structures, dark/light contrast elements, state indicators (success, error), and subtle transitions.
- **[script.js](file:///c:/Users/L64X17W17/cpe463_act1/script.js):**
  Houses the complete client-side architecture:
  - Base conversion utilities (`parseToDecimal`, `formatBase`, `isValidNumber`)
  - Dynamic DOM rendering and event listeners
  - Tokenizer and lexer with implicit multiplication handling
  - Dijkstra's Shunting-yard algorithm implementation
  - Abstract Syntax Tree (AST) builder and recursive bottom-up step reducer
  - Preset loader and error banner dispatcher

---

## 4. Number System Conversion Specifications

The application handles transformations between four positional numeral systems:

| System | Base (Radix) | Allowed Digits / Characters | Example Representation |
| :--- | :---: | :--- | :---: |
| **Binary** | 2 | `0`, `1` | $1010_2$ |
| **Octal** | 8 | `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7` | $12_8$ |
| **Decimal** | 10 | `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9` | $10_{10}$ |
| **Hexadecimal** | 16 | `0`–`9`, `A`, `B`, `C`, `D`, `E`, `F` (case-insensitive) | $1F_{16}$ |

### Conversion Strategy
1. **Input Normalization to Base 10:**  
   Every raw input string is parsed into a standard IEEE-754 decimal number according to its specified radix using positional weighting:
   $$\text{Value}_{10} = \sum_{i=0}^{n-1} d_i \times \text{Base}^i$$
2. **Evaluation in Base 10:**  
   All arithmetic operations (addition, subtraction, multiplication, division) are computed with full standard precision in the decimal domain.
3. **Multi-Base Formatting from Base 10:**  
   The final result (including fractional components) is converted to each base:
   - **Integer portion:** Converted via successive division / modulo operations.
   - **Fractional portion:** Converted via successive multiplication by the target radix up to a maximum precision of 6 significant fractional places, with trailing zero suppression.

---

## 5. Arithmetic Engine Specifications

### Operator Precedence and Associativity Table

| Precedence Level | Operator | Operation | Associativity |
| :---: | :---: | :--- | :---: |
| **3 (Highest)** | `NEG` (`−`) | Unary Negation | Right-to-Left |
| **2** | `*` (`×`), `/` (`÷`) | Multiplication, Division | Left-to-Right |
| **1 (Lowest)** | `+`, `-` (`−`) | Addition, Subtraction | Left-to-Right |

### Execution Pipeline
1. **Tokenization:** Converts the raw input string into structured tokens (`NUMBER`, `VARIABLE`, `OPERATOR`, `LPAREN`, `RPAREN`), mapping Unicode math glyphs (`×`, `÷`, `−`) to their standard representations.
2. **Validation & Implicit Multiplication:** Ensures operators have appropriate operands and inserts missing multiplication tokens where juxtaposition occurs (e.g., `A(B)` becomes `A * (B)`).
3. **Shunting-yard Algorithm:** Converts the infix token array into a postfix (Reverse Polish Notation) queue using an operator stack that respects precedence and associativity.
4. **AST Generation:** Constructs a tree structure where internal nodes represent binary or unary operations and leaves represent numeric values or bound variables.
5. **Bottom-Up Reduction:** Recursively traverses the deepest reducible nodes first, computes each step, records the intermediate expression state, and produces the final calculated value.

---

## 6. Built-In Test Presets

The application includes 5 preset configurations:

1. **Preset 1 (BIN + OCT + DEC):**
   - Inputs: $A = 1010_2$ (10), $B = 12_8$ (10), $C = 5_{10}$ (5)
   - Expression: `(A + B) * C`
   - Computed Result: $(10 + 10) \times 5 = 100$

2. **Preset 2 (BIN + DEC + HEX):**
   - Inputs: $A = 1111_2$ (15), $B = 20_{10}$ (20), $C = A_{16}$ (10)
   - Expression: `(A + B) - C`
   - Computed Result: $(15 + 20) - 10 = 25$

3. **Preset 3 (OCT + DEC + HEX):**
   - Inputs: $A = 30_8$ (24), $B = 16_{10}$ (16), $C = 4_{16}$ (4)
   - Expression: `(A - B) / C`
   - Computed Result: $(24 - 16) \div 4 = 2$

4. **Preset 4 (BIN + OCT + HEX):**
   - Inputs: $A = 1100_2$ (12), $B = 10_8$ (8), $C = 2_{16}$ (2)
   - Expression: `(A * B) / C`
   - Computed Result: $(12 \times 8) \div 2 = 48$

5. **Preset 5 (BIN + OCT + DEC + HEX) — Default:**
   - Inputs: $A = 1010_2$ (10), $B = 12_8$ (10), $C = 25_{10}$ (25), $D = 1F_{16}$ (31)
   - Expression: `(A + B - C) * D`
   - Computed Result: $(10 + 10 - 25) \times 31 = -155$

---

## 7. How to Run and Use

### 7.1 Running Locally
The project is a standalone, client-side web application requiring no external compilers, package managers, or server runtimes.

1. Clone or download the project repository.
2. Open [index.html](file:///c:/Users/L64X17W17/cpe463_act1/index.html) directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### 7.2 Usage Instructions
1. **Specify Input Count:** Enter the desired number of inputs (minimum 3) in the top control panel and click **Update Fields**, or select one of the **Quick Test Presets**.
2. **Provide Values and Radices:**
   - For each input row, select the numeral base (Binary, Octal, Decimal, or Hexadecimal) from the dropdown.
   - Enter a valid number in the text field. The individual conversion matrix will populate automatically.
3. **Formulate the Equation:**
   - Enter your arithmetic formula in the expression input field, select an expression preset chip, or use the on-screen keypad to insert variables and operators.
4. **Calculate:**
   - Click **Calculate & Convert All**.
5. **Inspect the Output:**
   - Review the multi-base formula and decimal substitution.
   - Expand the **Step-by-Step Evaluation Breakdown** accordion to see each intermediate operation.
   - Read the final computed result formatted in Binary, Octal, Decimal, and Hexadecimal.
