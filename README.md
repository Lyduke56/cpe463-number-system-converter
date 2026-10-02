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

### 2.7 Complement Computation Engine
- **Supports All 4 Number Systems:**
  - **Binary:** 1's complement (flip bits) and 2's complement (flip + 1)
  - **Octal:** 7's complement and 8's complement
  - **Decimal:** 9's complement and 10's complement
  - **Hexadecimal:** 15's complement and 16's complement
- **Configurable Digit Width:** Auto-detects from input length or allows manual specification (4-bit, 8-bit, custom $n$-digit)
- **Step-by-Step Breakdown:** Shows the digit-by-digit complement computation process
- **Multi-Base Conversion:** Displays complement values converted across all 4 bases simultaneously
- **Quick Presets:** Pre-configured examples for each base (BIN 4-bit, BIN 8-bit, OCT 3-digit, DEC 4-digit, HEX 3-digit)

### 2.8 Subtraction via Complements
- **Two Complement Methods Side-by-Side:**
  - **Method 1 — $(r-1)$'s Complement (End-Around Carry):** Computes complement of subtrahend, adds to minuend, handles end-around carry for positive results or re-complements for negative results
  - **Method 2 — $r$'s Complement (Discard Carry):** Computes radix complement of subtrahend, adds to minuend, discards carry for positive results or re-complements for negative results
- **Handles Both Positive and Negative Results:** Correctly detects carry/no-carry conditions and applies the appropriate sign determination
- **Detailed Step-by-Step Cards:** Each method displays numbered steps showing padding, complement computation, addition with carry tracking, and final result determination
- **Cross-Base Subtraction Support:** Minuend and subtrahend can be in different bases; automatic conversion to a common working base
- **Subtraction Presets:** Pre-configured examples including positive and negative result cases across Binary, Octal, Decimal, and Hexadecimal

### 2.9 BCD (Binary-Coded Decimal) Arithmetic Engine
- **8421 BCD Code Representation:** Enforces standard 8421 Binary-Coded Decimal encoding where each decimal digit ($0-9$) is mapped to a dedicated 4-bit nibble ($0000_2$ to $1001_2$).
- **Live Interactive Previews:** As the user enters operands, dynamic 4-bit nibble badges appear underneath each input field showing digit values and binary bit patterns.
- **BCD Addition with +6 Rule:**
  - Performs digit-by-digit parallel addition with carry propagation.
  - Automatically identifies invalid BCD intermediate sums ($> 9$ or binary adder overflow $\ge 16$).
  - Corrects invalid states by adding $+6$ ($0110_2$) using hardware-accurate modulo 16 arithmetic `(sum + 6) & 0x0F` to skip the six unassigned 4-bit states ($1010_2$ to $1111_2$).
  - Produces an aligned columnar BCD table and place value cards (Units, Tens, Hundreds, etc.).
- **BCD Subtraction via 9's & 10's Complements Side-by-Side:**
  - **9's Complement Method (Diminished Radix):** Derives 9's complement of subtrahend, performs BCD addition. Applies **End-Around Carry** (+1 BCD add) if carry $= 1$ ($A \ge B$), or **Re-complements** sum if carry $= 0$ ($A < B$).
  - **10's Complement Method (Radix):** Derives 10's complement (9's comp + 1), performs BCD addition. **Discards End Carry** if carry $= 1$ ($A \ge B$), or **Re-complements** sum if carry $= 0$ ($A < B$).
  - Side-by-side comparison layout with color-coded verdict banners and comparative takeaway analysis.
- **Dedicated BCD Presets:** 5 pre-configured addition test cases and 5 subtraction test cases covering all edge cases (positive, negative, equal, cascading carries).

### 2.10 3-Tab Segmented Navigation System
- **Tab 1: Converter & Calculator:** Multi-base inputs, expression parser, virtual keypad, and reduction breakdown.
- **Tab 2: Complements & Subtraction:** Radix and diminished-radix complement display and subtraction across bases 2, 8, 10, and 16.
- **Tab 3: BCD Arithmetic:** Comprehensive 8421 BCD addition and complement subtraction environment.
- **Seamless State & URL Sync:** Tab switches animate smoothly and synchronize with URL hashes (`#converter`, `#complements`, `#bcd`).

---

## 3. Project File Structure

```text
cpe463-number-system-converter/
├── index.html              # Accessible HTML5 structure and layout
├── style.css               # Responsive styling, color tokens, and layout components
├── script.js               # Core conversion, parsing, AST evaluation, and UI logic
├── README.md               # Project documentation and user manual
├── .gitignore              # Git ignore rules
├── docs/                   # Documentation & specifications
│   ├── FLOWCHART.md        # ANSI/ISO 5807 flowchart diagrams & system flowcharts
│   ├── PSEUDOCODE.md       # Formal algorithmic pseudocode specifications
│   └── SYSTEM_REQUIREMENTS.md  # Software System Requirements Specification (SRS)
└── previous-builds/        # Previous submission PDFs (gitignored)
```

### Component Details
- **[`index.html`](index.html):**
  Defines semantic containers including the control panel, quick preset buttons, expression input bar, virtual keypad, dynamic input rows container, global error banner, step-by-step accordion breakdown, and final multi-base output tiles.
- **[`style.css`](style.css):**
  Provides a clean, modern design system built with CSS custom properties (variables), responsive flexbox and grid structures, dark/light contrast elements, state indicators (success, error), and subtle transitions.
- **[`script.js`](script.js):**
  Houses the complete client-side architecture:
  - Base conversion utilities (`parseToDecimal`, `formatBase`, `isValidNumber`)
  - Dynamic DOM rendering and event listeners
  - Tokenizer and lexer with implicit multiplication handling
  - Dijkstra's Shunting-yard algorithm implementation
  - Abstract Syntax Tree (AST) builder and recursive bottom-up step reducer
  - Preset loader and error banner dispatcher
- **[`docs/SYSTEM_REQUIREMENTS.md`](docs/SYSTEM_REQUIREMENTS.md):**
  Formal IEEE 830 / ISO/IEC/IEEE 29148 Software System Requirements Specification outlining functional, non-functional, interface, and hardware/software environment constraints.
- **[`docs/FLOWCHART.md`](docs/FLOWCHART.md):**
  Standard programming flowcharts using Mermaid syntax for easy copy-pasting into Mermaid-compatible renderers.
- **[`docs/PSEUDOCODE.md`](docs/PSEUDOCODE.md):**
  Formal algorithmic pseudocode for all system modules.

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
2. Open [index.html](index.html) directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### 7.2 Usage Instructions

#### Tab 1: Converter & Calculator
1. **Specify Input Count:** Enter the desired number of inputs (minimum 3) in the top control panel and click **Update Fields**, or select one of the **Quick Test Presets**.
2. **Provide Values and Radices:**
   - For each input row, select the numeral base (Binary, Octal, Decimal, or Hexadecimal) from the dropdown.
   - Enter a valid number in the text field. The individual conversion matrix will populate automatically.
3. **Formulate the Equation:**
   - Enter your arithmetic formula in the expression input field, select an expression preset chip, or use the on-screen keypad to insert variables and operators.
4. **Calculate:** Click **Calculate Expression**.
5. **Inspect the Output:**
   - Review the multi-base formula and decimal substitution.
   - Expand the **Step-by-Step Evaluation Breakdown** accordion to inspect intermediate AST reductions.
   - Read the final computed result formatted across Binary, Octal, Decimal, and Hexadecimal.

#### Tab 2: Complements & Subtraction
1. Switch to the **Complements & Subtraction** tab via the top navigation bar.
2. **Complement Display:** Select a base, input a value, choose digit width, and click **Calculate Complements** to see $(r-1)$'s and $r$'s complements.
3. **Subtraction via Complements:** Toggle to subtraction mode, enter Minuend $A$ and Subtrahend $B$, and click **Subtract Using Complements** to view both $(r-1)$'s (End-Around Carry) and $r$'s (Discard Carry) methods side-by-side.

#### Tab 3: BCD Arithmetic
1. Switch to the **BCD Arithmetic** tab via the top navigation bar.
2. **BCD Addition:**
   - Select the **BCD Addition (+6 Rule)** mode or choose a quick addition preset (e.g., `687 + 549`).
   - Enter decimal values for Operand A and Operand B. Observe real-time 4-bit 8421 nibble badges appearing under each field.
   - Click **Execute BCD Addition**. Inspect the Hero Result Card, digit-by-digit place value cards with $+6$ correction indicators, and the columnar arithmetic table.
3. **BCD Subtraction via Complements:**
   - Select the **BCD Subtraction (Complements)** mode or choose a quick subtraction preset (e.g., `85 − 32` or `32 − 85`).
   - Choose comparison view mode: **Side-by-Side (9's & 10's)**, **9's Complement Only**, or **10's Complement Only**.
   - Click **Execute BCD Subtraction**.
   - Compare the 9's complement column (End-Around Carry for positive results, re-complemented for negative results) against the 10's complement column (Discard Carry for positive results, re-complemented for negative results).
   - Use the **Copy BCD** and **Copy Decimal** buttons to copy outputs to the clipboard.

