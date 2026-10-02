# Number System Converter & Unified Arithmetic Calculator
## System Pseudocode & Algorithmic Documentation

**Course / Project:** CPE463 - Number System Converter  
**File Reference:** [`script.js`](../script.js) | [`index.html`](../index.html) | [`style.css`](../style.css)

---

## 1. System Overview & Architecture

The application accepts $N$ inputs ($N \ge 3$) where each input can belong to any of the four standard computer number systems:
- **Binary** (Base 2: symbols `0, 1`)
- **Octal** (Base 8: symbols `0-7`)
- **Decimal** (Base 10: symbols `0-9`)
- **Hexadecimal** (Base 16: symbols `0-9, A-F`)

The computation pipeline follows a 4-phase unified engine:
1. **Input Validation & Per-Input Conversion:** Each input is validated against its chosen base and converted into a standard decimal (base-10) integer, while simultaneously rendering an individual 4-base conversion matrix (`BIN`, `OCT`, `DEC`, `HEX`).
2. **Common Base Evaluation:** Arithmetic operations ($+$, $-$, $\times$, $\div$) are sequentially evaluated left-to-right on the common decimal values with division-by-zero detection.
3. **Expression Rendering:** Mathematical expressions are formatted displaying original inputs with base subscripts (e.g., $1010_2 + 12_8 + 5_{10}$) along with the decimal evaluation breakdown.
4. **Multi-Base Result Formatting:** The final computed decimal result is converted into all 4 number systems (with fractional precision up to 6 decimal places).

```
   [ Input 1 (Base A) ] ──> Validate ──> Convert to Dec ──> [ Per-Input Matrix (2, 8, 10, 16) ]
   [ Input 2 (Base B) ] ──> Validate ──> Convert to Dec ──> [ Per-Input Matrix (2, 8, 10, 16) ]
   [ Input N (Base C) ] ──> Validate ──> Convert to Dec ──> [ Per-Input Matrix (2, 8, 10, 16) ]
                                    │
                                    ▼
                 [ Sequential Arithmetic Chain in Base 10 ]
                            (+, -, *, / with Div/0 Guard)
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[ Formatted Expression ]                           [ Final Multi-Base Results ]
 e.g. 1010₂ + 12₈ + 5₁₀                             BIN (2), OCT (8), DEC (10), HEX (16)
```

---

## 2. High-Level Program Driver

```text
PROGRAM NumberSystemConverterAndCalculator

    INITIALIZE ApplicationState:
        currentOperation ← "+"
        numInputs ← 3
        subscriptMap ← { 2: "₂", 8: "₈", 10: "₁₀", 16: "₁₆" }
        opSymbols ← { "+": "+", "-": "−", "*": "×", "/": "÷" }

    ON ApplicationStart DO:
        CALL RenderInputs(3)
    END ON

    EVENT ON OperationButtonClicked(op) DO:
        currentOperation ← op
        UPDATE_ACTIVE_BUTTON_UI(op)
    END EVENT

    EVENT ON GenerateButtonClicked DO:
        newCount ← READ_INTEGER_FROM_UI("num-inputs")
        CALL RenderInputs(newCount)
    END EVENT

    EVENT ON ProcessButtonClicked DO:
        CALL ProcessCalculation()
    END EVENT

    EVENT ON PresetButtonClicked(presetKey) DO:
        CALL LoadPreset(presetKey)
    END EVENT

END PROGRAM
```

---

## 3. Modular Algorithmic Pseudocode

### Module 1: Input Validation (`IsValidNumber`)
Determines whether an input string contains only valid characters according to the radix / base.

```text
FUNCTION IsValidNumber(valueStr, base)
    INPUT: 
        valueStr (STRING): raw user input
        base (INTEGER): 2, 8, 10, or 16
    OUTPUT: 
        BOOLEAN: TRUE if valid, FALSE otherwise

    IF valueStr IS EMPTY OR NULL THEN
        RETURN FALSE
    END IF

    // Strip optional leading negative sign for sign-magnitude validation
    cleanStr ← valueStr
    IF cleanStr STARTS WITH "-" THEN
        cleanStr ← SUBSTRING(cleanStr, 1, LENGTH(cleanStr) - 1)
    END IF

    IF cleanStr IS EMPTY THEN
        RETURN FALSE
    END IF

    // Determine allowed symbol alphabet
    SWITCH base DO
        CASE 2:
            allowedAlphabet ← {'0', '1'}
        CASE 8:
            allowedAlphabet ← {'0'..'7'}
        CASE 10:
            allowedAlphabet ← {'0'..'9'}
        CASE 16:
            allowedAlphabet ← {'0'..'9', 'A'..'F', 'a'..'f'}
        DEFAULT:
            RETURN FALSE
    END SWITCH

    FOR EACH char IN cleanStr DO
        IF char NOT IN allowedAlphabet THEN
            RETURN FALSE
        END IF
    END FOR

    RETURN TRUE
END FUNCTION
```

---

### Module 2: Positional Base-N to Decimal Converter (`ParseToDecimal`)
Converts any signed integer string from an arbitrary base $B$ into a standard decimal (Base 10) integer using positional expansion:
$$\text{Value} = \pm \sum_{k=0}^{M-1} d_k \times B^k$$

```text
FUNCTION ParseToDecimal(valueStr, base)
    INPUT: 
        valueStr (STRING): representation in base
        base (INTEGER): radix of the number
    OUTPUT: 
        decimalValue (INTEGER): base-10 equivalent

    isNegative ← FALSE
    cleanStr ← valueStr

    IF cleanStr STARTS WITH "-" THEN
        isNegative ← TRUE
        cleanStr ← SUBSTRING(cleanStr, 1, LENGTH(cleanStr) - 1)
    END IF

    decimalValue ← 0
    FOR EACH char IN cleanStr DO
        // Convert char to digit value: '0'-'9' -> 0-9, 'A'-'F'/'a'-'f' -> 10-15
        digit ← CharacterToValue(char)
        decimalValue ← (decimalValue * base) + digit
    END FOR

    IF isNegative THEN
        decimalValue ← -decimalValue
    END IF

    RETURN decimalValue
END FUNCTION
```

---

### Module 3: Decimal to Arbitrary Base Formatter (`FormatBase`)
Converts a real number (integer + fractional component) from Base 10 into an arbitrary target base string with precision truncation.

```text
FUNCTION FormatBase(num, targetBase, precision = 6)
    INPUT: 
        num (REAL): decimal number
        targetBase (INTEGER): destination radix (2, 8, 10, 16)
        precision (INTEGER): maximum fractional digits
    OUTPUT: 
        formattedStr (STRING): representation in targetBase

    IF num IS NaN THEN RETURN "NaN"
    IF num IS +INFINITY THEN RETURN "Infinity"
    IF num IS -INFINITY THEN RETURN "-Infinity"

    isNegative ← (num < 0)
    absNum ← ABS(num)
    intPart ← FLOOR(absNum)
    fracPart ← absNum - intPart

    // ----------------------------------------------------
    // Step 1: Integer Conversion via Successive Division
    // ----------------------------------------------------
    intStr ← ""
    IF intPart == 0 THEN
        intStr ← "0"
    ELSE
        temp ← intPart
        WHILE temp > 0 DO
            remainder ← temp MOD targetBase
            digitChar ← ValueToCharacter(remainder) // e.g. 10 -> 'A'
            intStr ← CONCAT(digitChar, intStr)     // prepend digit
            temp ← FLOOR(temp / targetBase)
        END WHILE
    END IF

    // Return early if no fractional part exists or precision is zero
    IF fracPart == 0 OR precision <= 0 THEN
        RETURN (isNegative ? "-" : "") + intStr
    END IF

    // ----------------------------------------------------
    // Step 2: Fractional Conversion via Successive Multiplication
    // ----------------------------------------------------
    fracStr ← ""
    count ← 0
    WHILE fracPart > 0 AND count < precision DO
        fracPart ← fracPart * targetBase
        digit ← FLOOR(fracPart)
        fracStr ← CONCAT(fracStr, ValueToCharacter(digit))
        fracPart ← fracPart - digit
        count ← count + 1
    END WHILE

    RETURN (isNegative ? "-" : "") + intStr + "." + fracStr
END FUNCTION
```

---

### Module 4: Central Processing Pipeline (`ProcessCalculation`)
The primary driver coordinating input validation, per-input conversion, sequential chained evaluation, division-by-zero handling, and output rendering.

```text
FUNCTION ProcessCalculation()
    rows ← DOM_QUERY_ALL(".input-row")
    count ← LENGTH(rows)
    allValid ← TRUE

    decimalValues ← EMPTY LIST
    originalTokens ← EMPTY LIST
    decimalTokens ← EMPTY LIST

    // =======================================================
    // PHASE 1: Validation & Per-Input Multi-Base Conversion
    // =======================================================
    FOR i FROM 1 TO count DO
        base ← GET_ROW_BASE(i)
        rawVal ← TRIM(GET_ROW_INPUT_VALUE(i))

        // Check for empty input
        IF rawVal IS EMPTY THEN
            SHOW_ROW_ERROR(i, "Input cannot be empty.")
            CLEAR_ROW_CONVERSION_MATRIX(i)
            allValid ← FALSE
            CONTINUE
        END IF

        // Validate character set against base
        IF NOT IsValidNumber(rawVal, base) THEN
            SHOW_ROW_ERROR(i, "Invalid character for Base " + base)
            CLEAR_ROW_CONVERSION_MATRIX(i)
            allValid ← FALSE
            CONTINUE
        END IF

        // Clear error indicator
        CLEAR_ROW_ERROR(i)

        // Convert to standard decimal
        decVal ← ParseToDecimal(rawVal, base)
        APPEND decVal TO decimalValues

        // Update individual 4-base conversion matrix for this input
        UPDATE_MATRIX_CELL(i, "BIN", FormatBase(decVal, 2, 0))
        UPDATE_MATRIX_CELL(i, "OCT", FormatBase(decVal, 8, 0))
        UPDATE_MATRIX_CELL(i, "DEC", FormatBase(decVal, 10, 0))
        UPDATE_MATRIX_CELL(i, "HEX", FormatBase(decVal, 16, 0))

        // Save formatted expression tokens
        subscript ← subscriptMap[base]
        APPEND CONCAT(TO_UPPER(rawVal), subscript) TO originalTokens
        APPEND (decVal >= 0 ? STRING(decVal) : CONCAT("(", STRING(decVal), ")")) TO decimalTokens
    END FOR

    // Abort calculation if any row failed validation
    IF NOT allValid OR LENGTH(decimalValues) < count THEN
        HIDE_ELEMENT("results-section")
        RETURN
    END IF

    // =======================================================
    // PHASE 2: Common Base Sequential Evaluation
    // =======================================================
    computedResult ← decimalValues[0]
    isDivByZero ← FALSE
    divZeroIndex ← NULL

    FOR i FROM 1 TO count - 1 DO
        nextVal ← decimalValues[i]

        SWITCH currentOperation DO
            CASE "+":
                computedResult ← computedResult + nextVal
            CASE "-":
                computedResult ← computedResult - nextVal
            CASE "*":
                computedResult ← computedResult * nextVal
            CASE "/":
                IF nextVal == 0 THEN
                    isDivByZero ← TRUE
                    divZeroIndex ← i + 1
                    BREAK
                END IF
                computedResult ← computedResult / nextVal
        END SWITCH

        IF isDivByZero THEN
            BREAK
        END IF
    END FOR

    // Flag offending division-by-zero field if detected
    IF isDivByZero AND divZeroIndex ≠ NULL THEN
        SHOW_ROW_ERROR(divZeroIndex, "Math Error: Division by zero is undefined.")
    END IF

    // =======================================================
    // PHASE 3: Mathematical Expression Rendering
    // =======================================================
    opSymbol ← opSymbols[currentOperation]
    expressionStr ← JOIN(originalTokens, " " + opSymbol + " ")
    SET_TEXT("expression-display", expressionStr)

    IF isDivByZero THEN
        formulaStr ← JOIN(decimalTokens, " " + opSymbol + " ") + 
                     " = Undefined (Division by Zero at Input " + STRING(divZeroIndex) + ")"
    ELSE
        formulaStr ← JOIN(decimalTokens, " " + opSymbol + " ") + " = " + STRING(computedResult)
    END IF
    SET_TEXT("decimal-formula", formulaStr)

    // =======================================================
    // PHASE 4: Final Multi-Base Output Display
    // =======================================================
    IF isDivByZero THEN
        SET_TEXT("final-bin", "Undefined (Div by 0)")
        SET_TEXT("final-oct", "Undefined (Div by 0)")
        SET_TEXT("final-dec", "Undefined (Div by 0)")
        SET_TEXT("final-hex", "Undefined (Div by 0)")
    ELSE
        SET_TEXT("final-bin", FormatBase(computedResult, 2, 6))
        SET_TEXT("final-oct", FormatBase(computedResult, 8, 6))
        SET_TEXT("final-dec", FormatBase(computedResult, 10, 6))
        SET_TEXT("final-hex", FormatBase(computedResult, 16, 6))
    END IF

    SHOW_ELEMENT("results-section")
    SCROLL_INTO_VIEW("results-section")
END FUNCTION
```

---

### Module 5: Dynamic Row Management & State Preservation (`RenderInputs`)
Dynamically regenerates input DOM rows while preserving user inputs and selected bases across count modifications.

```text
FUNCTION RenderInputs(count)
    INPUT: count (INTEGER: requested number of input rows)

    IF count IS NULL OR count < 3 THEN
        count ← 3
        SET_VALUE("num-inputs", 3)
    END IF

    // Step 1: Capture existing input data before DOM wipe
    existingData ← EMPTY LIST
    currentRows ← DOM_QUERY_ALL(".input-row")
    
    FOR i FROM 1 TO LENGTH(currentRows) DO
        baseVal ← GET_VALUE("base-" + STRING(i))
        inputVal ← GET_VALUE("val-" + STRING(i))
        APPEND { base: baseVal, val: inputVal } TO existingData
    END FOR

    // Step 2: Clear container and dynamically construct rows
    CLEAR_DOM("inputs-container")

    FOR i FROM 1 TO count DO
        newRowElement ← CreateInputRow(i)
        APPEND_CHILD("inputs-container", newRowElement)

        // Step 3: Restore previous state if available
        IF i <= LENGTH(existingData) THEN
            SET_VALUE("base-" + STRING(i), existingData[i - 1].base)
            SET_VALUE("val-" + STRING(i), existingData[i - 1].val)
            UPDATE_ROW_INDICATOR(i)
        END IF
    END FOR

    HIDE_ELEMENT("results-section")
END FUNCTION
```

---

### Module 6: Quick Test Presets Loader (`LoadPreset`)
Loads predefined multi-base test cases matching project evaluation requirements.

```text
FUNCTION LoadPreset(presetKey)
    INPUT: presetKey (STRING: '1' to '5')

    PRESETS ← {
        '1': [ { base: '2', val: '1010' }, { base: '8', val: '12' }, { base: '10', val: '5' } ],
        '2': [ { base: '2', val: '1111' }, { base: '10', val: '20' }, { base: '16', val: 'A' } ],
        '3': [ { base: '8', val: '30' },   { base: '10', val: '16' }, { base: '16', val: '4' } ],
        '4': [ { base: '2', val: '1100' }, { base: '8', val: '10' }, { base: '16', val: '2' } ],
        '5': [ { base: '2', val: '1010' }, { base: '8', val: '12' }, { base: '10', val: '25' }, { base: '16', val: '1F' } ]
    }

    testData ← PRESETS[presetKey]
    IF testData IS NULL THEN RETURN

    SET_VALUE("num-inputs", LENGTH(testData))
    CALL RenderInputs(LENGTH(testData))

    FOR index FROM 0 TO LENGTH(testData) - 1 DO
        rowNum ← index + 1
        SET_VALUE("base-" + STRING(rowNum), testData[index].base)
        SET_VALUE("val-" + STRING(rowNum), testData[index].val)
        UPDATE_ROW_INDICATOR(rowNum)
    END FOR

    // Auto-calculate on preset selection
    CALL ProcessCalculation()
END FUNCTION
```

---

## 4. Execution Trace Example

### Scenario: Preset 1 with Addition (`+`)
- **Inputs:**
  - Input 1: Base 2 (Binary) = `1010`
  - Input 2: Base 8 (Octal) = `12`
  - Input 3: Base 10 (Decimal) = `5`
- **Operation:** `+`

### Step-by-Step Trace:

| Step | Component | Process / Formula | Result / State |
| :--- | :--- | :--- | :--- |
| **1** | Input 1 Validation & Parse | `IsValidNumber("1010", 2)` $\rightarrow$ Valid<br>`ParseToDecimal("1010", 2)` $= 1\cdot 2^3 + 0\cdot 2^2 + 1\cdot 2^1 + 0\cdot 2^0$ | Decimal: `10`<br>Matrix: `BIN: 1010, OCT: 12, DEC: 10, HEX: A` |
| **2** | Input 2 Validation & Parse | `IsValidNumber("12", 8)` $\rightarrow$ Valid<br>`ParseToDecimal("12", 8)` $= 1\cdot 8^1 + 2\cdot 8^0$ | Decimal: `10`<br>Matrix: `BIN: 1010, OCT: 12, DEC: 10, HEX: A` |
| **3** | Input 3 Validation & Parse | `IsValidNumber("5", 10)` $\rightarrow$ Valid<br>`ParseToDecimal("5", 10)` $= 5\cdot 10^0$ | Decimal: `5`<br>Matrix: `BIN: 101, OCT: 5, DEC: 5, HEX: 5` |
| **4** | Arithmetic Chain | Accumulator $= 10$<br>$10 + 10 = 20$<br>$20 + 5 = 25$ | Decimal Result $= 25$ |
| **5** | Expression Formatting | `1010₂ + 12₈ + 5₁₀` | Formula: `10 + 10 + 5 = 25` |
| **6** | Final Multi-Base Output | `FormatBase(25, 2)` $= 11001_2$<br>`FormatBase(25, 8)` $= 31_8$<br>`FormatBase(25, 10)` $= 25_{10}$<br>`FormatBase(25, 16)` $= 19_{16}$ | **BIN:** `11001`<br>**OCT:** `31`<br>**DEC:** `25`<br>**HEX:** `19` |

---

## 5. Complement Computation Algorithms

### 5.1 Complement Names by Number System

For any base $r$ number system with an $n$-digit number $N$:

| System | Base ($r$) | $(r-1)$'s Complement | $r$'s Complement |
| :--- | :---: | :--- | :--- |
| Binary | 2 | **1's Complement** | **2's Complement** |
| Octal | 8 | **7's Complement** | **8's Complement** |
| Decimal | 10 | **9's Complement** | **10's Complement** |
| Hexadecimal | 16 | **15's Complement** | **16's Complement** |

### 5.2 Diminished Radix Complement — $(r-1)$'s Complement

```text
FUNCTION ComputeDiminishedRadixComplement(valueStr, base, numDigits)
    // Compute the (r-1)'s complement of a number string
    // For each digit d_i, compute (base - 1) - d_i

    INPUT:
        valueStr  ← string representation of the number
        base      ← radix of the number system (2, 8, 10, 16)
        numDigits ← total digit width for padding

    maxDigitValue ← base - 1
    paddedValue   ← PAD_LEFT(valueStr, numDigits, '0')
    complement    ← ""
    steps         ← []

    FOR i FROM 0 TO LENGTH(paddedValue) - 1 DO
        currentDigit    ← DIGIT_TO_INT(paddedValue[i])
        complementDigit ← maxDigitValue - currentDigit
        complement      ← complement + INT_TO_DIGIT(complementDigit)

        APPEND TO steps: {
            explanation: maxDigitChar + " − " + paddedValue[i] + " = " + complementDigit
        }
    END FOR

    RETURN { complement, steps, paddedValue }
END FUNCTION
```

### 5.3 Radix Complement — $r$'s Complement

```text
FUNCTION ComputeRadixComplement(valueStr, base, numDigits)
    // Compute the r's complement = (r-1)'s complement + 1

    INPUT:
        valueStr  ← string representation of the number
        base      ← radix of the number system
        numDigits ← total digit width for padding

    // Step 1: Compute diminished radix complement
    dimResult ← CALL ComputeDiminishedRadixComplement(valueStr, base, numDigits)

    // Step 2: Add 1 to the diminished radix complement
    addResult ← CALL AddOneInBase(dimResult.complement, base)

    RETURN {
        complement:           addResult.result,
        diminishedComplement: dimResult.complement,
        diminishedSteps:      dimResult.steps,
        addOneSteps:          addResult.steps
    }
END FUNCTION
```

### 5.4 Addition of One in Base $r$

```text
FUNCTION AddOneInBase(valueStr, base)
    // Add 1 to a number string in the given base

    digits ← SPLIT(valueStr, "")
    carry  ← 1

    FOR i FROM LENGTH(digits) - 1 DOWNTO 0 WHILE carry > 0 DO
        digitValue ← DIGIT_TO_INT(digits[i])
        sum        ← digitValue + carry
        newDigit   ← sum MOD base
        carry      ← FLOOR(sum / base)
        digits[i]  ← INT_TO_DIGIT(newDigit)
    END FOR

    RETURN { result: JOIN(digits), overflow: (carry > 0) }
END FUNCTION
```

### 5.5 Digit-by-Digit Addition in Base $r$

```text
FUNCTION AddInBase(aStr, bStr, base, numDigits)
    // Add two n-digit numbers in the given base

    a      ← PAD_LEFT(aStr, numDigits, '0')
    b      ← PAD_LEFT(bStr, numDigits, '0')
    carry  ← 0
    result ← ""

    FOR i FROM numDigits - 1 DOWNTO 0 DO
        aVal  ← DIGIT_TO_INT(a[i])
        bVal  ← DIGIT_TO_INT(b[i])
        sum   ← aVal + bVal + carry
        digit ← sum MOD base
        carry ← FLOOR(sum / base)
        result ← INT_TO_DIGIT(digit) + result
    END FOR

    RETURN { result, carry }
END FUNCTION
```

---

## 6. Subtraction Using Complement Methods

### 6.1 Subtraction Using $(r-1)$'s Complement (End-Around Carry)

```text
FUNCTION SubtractUsingDiminishedComplement(minuend, subtrahend, base, numDigits)
    // Compute A - B using the (r-1)'s complement method

    INPUT:
        minuend    ← string representation of A
        subtrahend ← string representation of B
        base       ← working radix
        numDigits  ← digit width

    // Step 1: Pad both numbers to n digits
    paddedA ← PAD_LEFT(minuend, numDigits, '0')
    paddedB ← PAD_LEFT(subtrahend, numDigits, '0')

    // Step 2: Compute (r-1)'s complement of B
    compB ← CALL ComputeDiminishedRadixComplement(subtrahend, base, numDigits)

    // Step 3: Add A + complement(B)
    addResult ← CALL AddInBase(paddedA, compB.complement, base, numDigits)

    // Step 4: Check for carry
    IF addResult.carry > 0 THEN
        // End-Around Carry: discard carry and add 1 to result
        endAroundResult ← CALL AddOneInBase(addResult.result, base)
        finalResult ← endAroundResult.result
        isNegative  ← FALSE
        // Result is POSITIVE
    ELSE
        // No carry: take (r-1)'s complement of sum, result is negative
        reComp ← CALL ComputeDiminishedRadixComplement(addResult.result, base, numDigits)
        finalResult ← reComp.complement
        isNegative  ← TRUE
        // Result is NEGATIVE: prepend "−"
    END IF

    RETURN { finalResult, isNegative }
END FUNCTION
```

### 6.2 Subtraction Using $r$'s Complement (Discard Carry)

```text
FUNCTION SubtractUsingRadixComplement(minuend, subtrahend, base, numDigits)
    // Compute A - B using the r's complement method

    INPUT:
        minuend    ← string representation of A
        subtrahend ← string representation of B
        base       ← working radix
        numDigits  ← digit width

    // Step 1: Pad both numbers to n digits
    paddedA ← PAD_LEFT(minuend, numDigits, '0')
    paddedB ← PAD_LEFT(subtrahend, numDigits, '0')

    // Step 2: Compute r's complement of B
    compB ← CALL ComputeRadixComplement(subtrahend, base, numDigits)

    // Step 3: Add A + complement(B)
    addResult ← CALL AddInBase(paddedA, compB.complement, base, numDigits)

    // Step 4: Check for carry
    IF addResult.carry > 0 THEN
        // Discard carry: result is the sum without carry
        finalResult ← addResult.result
        isNegative  ← FALSE
        // Result is POSITIVE
    ELSE
        // No carry: take r's complement of sum, result is negative
        reComp ← CALL ComputeRadixComplement(addResult.result, base, numDigits)
        finalResult ← reComp.complement
        isNegative  ← TRUE
        // Result is NEGATIVE: prepend "−"
    END IF

    RETURN { finalResult, isNegative }
END FUNCTION
```

---

## 7. Complement Execution Trace Examples

### Example 1: Binary 1's and 2's Complement of `1010` (4-bit)

| Step | Operation | Detail | Result |
| :--- | :--- | :--- | :--- |
| **1** | Pad to 4 digits | `1010` → `1010` | `1010` |
| **2** | 1's Complement | `1−1=0`, `1−0=1`, `1−1=0`, `1−0=1` | `0101` |
| **3** | 2's Complement | `0101 + 1` | `0110` |

### Example 2: Binary Subtraction `1010 − 0111` using 1's Complement

| Step | Operation | Detail | Result |
| :--- | :--- | :--- | :--- |
| **1** | Pad A, B | A = `1010`, B = `0111` (4-bit) | — |
| **2** | 1's comp of B | `1−0=1`, `1−1=0`, `1−1=0`, `1−0=1` → `1000` | `1000` |
| **3** | Add A + comp(B) | `1010 + 1000 = 10010` | carry = 1, sum = `0010` |
| **4** | End-Around Carry | Carry exists → `0010 + 1 = 0011` | **+0011₂** (3₁₀) |

### Example 3: Decimal Subtraction `305 − 148` using 9's Complement

| Step | Operation | Detail | Result |
| :--- | :--- | :--- | :--- |
| **1** | Pad A, B | A = `305`, B = `148` (3-digit) | — |
| **2** | 9's comp of B | `9−1=8`, `9−4=5`, `9−8=1` → `851` | `851` |
| **3** | Add A + comp(B) | `305 + 851 = 1156` | carry = 1, sum = `156` |
| **4** | End-Around Carry | Carry exists → `156 + 1 = 157` | **+157₁₀** (157₁₀) |

---

## 8. BCD (Binary-Coded Decimal) Arithmetic Engine Algorithms

### 8.1 BCD Encoding & Validation

```text
FUNCTION DecimalDigitToBCD(digit)
    // Encodes a single decimal digit (0-9) into standard 4-bit 8421 BCD representation
    INPUT: digit (integer 0 to 9)
    OUTPUT: 4-character binary string

    num ← TO_INTEGER(digit)
    IF num < 0 OR num > 9 THEN
        RETURN "0000"
    END IF

    // Extract 4-bit binary representation padded with leading zeros
    binaryString ← TO_BINARY_STRING(num)
    RETURN PAD_LEFT(binaryString, 4, '0')
END FUNCTION

FUNCTION ValidateBCDInput(inputString)
    // Ensures input string consists strictly of non-empty unsigned decimal digits [0-9]
    INPUT: inputString (string)
    OUTPUT: boolean

    trimmed ← TRIM(inputString)
    IF LENGTH(trimmed) == 0 THEN
        RETURN FALSE
    END IF

    FOR EACH character c IN trimmed DO
        IF c < '0' OR c > '9' THEN
            RETURN FALSE
        END IF
    END FOR

    RETURN TRUE
END FUNCTION
```

### 8.2 BCD Addition Algorithm with +6 Rule (`AddBCD`)

```text
FUNCTION AddBCD(numAStr, numBStr, minWidth)
    // Performs digit-by-digit BCD (8421) addition with automatic +6 (0110₂) correction
    INPUT:
        numAStr  ← decimal string for Operand A (Augend)
        numBStr  ← decimal string for Operand B (Addend)
        minWidth ← minimum digit alignment width (default: 0)
    OUTPUT:
        Structured object containing final digits, BCD nibbles, carry states, and step breakdowns

    rawA ← TRIM(numAStr)
    rawB ← TRIM(numBStr)
    N ← MAX(LENGTH(rawA), LENGTH(rawB), minWidth, 1)

    // Left-pad operands with '0' to align place values
    alignedA ← PAD_LEFT(rawA, N, '0')
    alignedB ← PAD_LEFT(rawB, N, '0')

    carry ← 0
    resultDigits ← EMPTY_ARRAY
    nibbleSteps ← EMPTY_ARRAY

    // Process each decade position from least significant (right) to most significant (left)
    FOR i FROM (N - 1) DOWNTO 0 DO
        digitA ← PARSE_INT(alignedA[i])
        digitB ← PARSE_INT(alignedB[i])
        carryIn ← carry
        power ← (N - 1 - i)

        nibbleA ← DecimalDigitToBCD(digitA)
        nibbleB ← DecimalDigitToBCD(digitB)

        // Raw 4-bit binary addition with incoming carry
        rawSum ← digitA + digitB + carryIn
        rawBits ← PAD_LEFT(TO_BINARY_STRING(rawSum), 4, '0')

        // 8421 BCD Correction Condition:
        // When raw binary sum exceeds 9 (1001₂), or produces an adder carry (>= 16),
        // add +6 (0110₂) to skip the 6 invalid 4-bit states (1010₂ through 1111₂)
        IF rawSum > 9 THEN
            correctionNeeded ← TRUE
            correctedSum ← rawSum + 6
            resDigit ← BITWISE_AND(rawSum + 6, 0x0F) // Equivalent to (rawSum + 6) MOD 16
            carryOut ← 1
        ELSE
            correctionNeeded ← FALSE
            correctedSum ← rawSum
            resDigit ← rawSum
            carryOut ← 0
        END IF

        resNibble ← DecimalDigitToBCD(resDigit)
        PREPEND(resultDigits, STRING(resDigit))

        RECORD_STEP(nibbleSteps, {
            positionIndex: i,
            power: power,
            digitA: digitA,
            digitB: digitB,
            nibbleA: nibbleA,
            nibbleB: nibbleB,
            carryIn: carryIn,
            rawSum: rawSum,
            rawBits: rawBits,
            correctionNeeded: correctionNeeded,
            correctedSum: correctedSum,
            resDigit: resDigit,
            resNibble: resNibble,
            carryOut: carryOut
        })

        carry ← carryOut
    END FOR

    endCarry ← carry
    sumDigitsOnly ← JOIN(resultDigits, "")

    // Prepend '1' if final MSB carry generated an overflow decade
    IF endCarry == 1 THEN
        finalDigits ← "1" + sumDigitsOnly
    ELSE
        finalDigits ← sumDigitsOnly
    END IF

    resultBCD ← MAP_TO_BCD(finalDigits)
    decimalValue ← PARSE_INT(finalDigits)

    RETURN {
        alignedA, alignedB, alignedLength: N,
        nibbleSteps, endCarry, sumDigitsOnly,
        finalDigits, resultBCD, decimalValue
    }
END FUNCTION
```

### 8.3 BCD Subtraction via 9's Complement (`BCDSubtract9sComplement`)

```text
FUNCTION BCDSubtract9sComplement(numAStr, numBStr, minWidth)
    // Computes A - B in BCD using the 9's complement (diminished radix) method
    INPUT:
        numAStr  ← decimal string for Minuend (A)
        numBStr  ← decimal string for Subtrahend (B)
        minWidth ← minimum digit alignment width
    OUTPUT:
        Structured object containing complement steps, end carry analysis, and signed result

    rawA ← TRIM(numAStr)
    rawB ← TRIM(numBStr)
    N ← MAX(LENGTH(rawA), LENGTH(rawB), minWidth, 1)

    alignedA ← PAD_LEFT(rawA, N, '0')
    alignedB ← PAD_LEFT(rawB, N, '0')

    // Step 1: Compute 9's complement of Subtrahend B: (10^N - 1) - B
    comp9Str ← ""
    FOR i FROM 0 TO (N - 1) DO
        d ← PARSE_INT(alignedB[i])
        compD ← 9 - d
        comp9Str ← comp9Str + STRING(compD)
    END FOR

    // Step 2: Perform BCD addition: A + Comp9(B)
    additionResult ← AddBCD(alignedA, comp9Str, N)

    // Step 3: Analyze End Carry Out
    endCarry ← additionResult.endCarry
    isZero ← (PARSE_INT(additionResult.sumDigitsOnly) == 0)

    IF endCarry == 1 THEN
        // Result is POSITIVE (A >= B): Apply End-Around Carry
        // Add 1 to the least significant digit of the BCD sum
        endAroundCarryResult ← AddBCD(additionResult.sumDigitsOnly, "1", N)
        finalDigits ← endAroundCarryResult.sumDigitsOnly
        sign ← "+"
        isPositive ← TRUE
    ELSE
        // Result is NEGATIVE (A < B): Sum is in 9's complement form
        // Re-complement the intermediate BCD sum using 9's complement
        recompDigits ← ""
        FOR i FROM 0 TO (N - 1) DO
            d ← PARSE_INT(additionResult.sumDigitsOnly[i])
            recompDigits ← recompDigits + STRING(9 - d)
        END FOR
        finalDigits ← recompDigits
        IF isZero THEN
            sign ← "+"
            isPositive ← TRUE
        ELSE
            sign ← "−"
            isPositive ← FALSE
        END IF
    END IF

    finalNibbles ← MAP_TO_BCD(finalDigits)
    decimalValue ← (isPositive ? 1 : -1) * PARSE_INT(finalDigits)

    RETURN {
        alignedA, alignedB, alignedLength: N,
        comp9Str, additionResult, endCarry,
        isPositive, isZero, finalDigits, finalNibbles,
        decimalValue, sign
    }
END FUNCTION
```

### 8.4 BCD Subtraction via 10's Complement (`BCDSubtract10sComplement`)

```text
FUNCTION BCDSubtract10sComplement(numAStr, numBStr, minWidth)
    // Computes A - B in BCD using the 10's complement (radix complement) method
    INPUT:
        numAStr  ← decimal string for Minuend (A)
        numBStr  ← decimal string for Subtrahend (B)
        minWidth ← minimum digit alignment width
    OUTPUT:
        Structured object containing complement steps, end carry analysis, and signed result

    rawA ← TRIM(numAStr)
    rawB ← TRIM(numBStr)
    N ← MAX(LENGTH(rawA), LENGTH(rawB), minWidth, 1)

    alignedA ← PAD_LEFT(rawA, N, '0')
    alignedB ← PAD_LEFT(rawB, N, '0')

    // Step 1: Compute 10's complement of Subtrahend B: 9's complement + 1
    comp9Str ← ""
    FOR i FROM 0 TO (N - 1) DO
        comp9Str ← comp9Str + STRING(9 - PARSE_INT(alignedB[i]))
    END FOR
    comp10Result ← AddBCD(comp9Str, "1", N)
    comp10Str ← comp10Result.sumDigitsOnly

    // Step 2: Perform BCD addition: A + Comp10(B)
    additionResult ← AddBCD(alignedA, comp10Str, N)

    // Step 3: Analyze End Carry Out
    endCarry ← additionResult.endCarry
    isZero ← (PARSE_INT(additionResult.sumDigitsOnly) == 0)

    IF endCarry == 1 THEN
        // Result is POSITIVE (A >= B): Discard End Carry
        // The N-digit intermediate sum is the true positive magnitude
        finalDigits ← additionResult.sumDigitsOnly
        sign ← "+"
        isPositive ← TRUE
    ELSE
        // Result is NEGATIVE (A < B): Sum is in 10's complement form
        // Re-complement the intermediate BCD sum using 10's complement: 9's comp + 1
        interComp9 ← ""
        FOR i FROM 0 TO (N - 1) DO
            interComp9 ← interComp9 + STRING(9 - PARSE_INT(additionResult.sumDigitsOnly[i]))
        END FOR
        recompAdd1 ← AddBCD(interComp9, "1", N)
        finalDigits ← recompAdd1.sumDigitsOnly

        IF isZero THEN
            sign ← "+"
            isPositive ← TRUE
        ELSE
            sign ← "−"
            isPositive ← FALSE
        END IF
    END IF

    finalNibbles ← MAP_TO_BCD(finalDigits)
    decimalValue ← (isPositive ? 1 : -1) * PARSE_INT(finalDigits)

    RETURN {
        alignedA, alignedB, alignedLength: N,
        comp9Str, comp10Str, additionResult, endCarry,
        isPositive, isZero, finalDigits, finalNibbles,
        decimalValue, sign
    }
END FUNCTION
```

---

## 9. BCD Arithmetic Execution Trace Examples

### Example 1: BCD Addition with +6 Correction `687 + 549 = 1236`

Operands: $A = 687$, $B = 549$, Aligned Width $N = 3$.

| Position | $A_i$ | $B_i$ | $C_{in}$ | Raw Binary Sum | $> 9$ or Carry? | +6 Correction | Result Nibble | $C_{out}$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Units ($10^0$)** | `0111` (7) | `1001` (9) | 0 | `10000` (16) | Yes ($\ge 16$) | `10000 + 0110 = 10110` | `0010` (2) | **1** |
| **Tens ($10^1$)** | `1000` (8) | `0100` (4) | 1 | `01101` (13) | Yes ($13 > 9$) | `01101 + 0110 = 10011` | `0011` (3) | **1** |
| **Hundreds ($10^2$)** | `0110` (6) | `0101` (5) | 1 | `01100` (12) | Yes ($12 > 9$) | `01100 + 0110 = 10010` | `0010` (2) | **1** |

* Final Carry Out from MSB $= 1$ $\rightarrow$ Prepend BCD digit `0001` (1).
* **Final BCD Output:** `[0001] [0010] [0011] [0010]`
* **Final Decimal Output:** **`1236₁₀`**

---

### Example 2: BCD Addition without Correction `5 + 3 = 8`

Operands: $A = 5$, $B = 3$, Aligned Width $N = 1$.

| Position | $A_i$ | $B_i$ | $C_{in}$ | Raw Binary Sum | $> 9$ or Carry? | +6 Correction | Result Nibble | $C_{out}$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Units ($10^0$)** | `0101` (5) | `0011` (3) | 0 | `1000` (8) | No ($8 \le 9$) | None (+0000) | `1000` (8) | **0** |

* Final Carry Out $= 0$.
* **Final BCD Output:** `[1000]`
* **Final Decimal Output:** **`8₁₀`**

---

### Example 3: BCD Subtraction with 9's Complement ($A > B$) `85 − 32`

Operands: $A = 85$, $B = 32$, Aligned Width $N = 2$.

| Step | Operation | Formula / Calculation | Intermediate Value |
| :--- | :--- | :--- | :--- |
| **1** | Compute 9's Complement of $B$ | $(9 - 3) = 6$, $(9 - 2) = 7$ | $B'_{9s} = 67$ (BCD: `0110 0111`) |
| **2** | BCD Addition: $A + B'_{9s}$ | AddBCD(`85`, `67`):<br/>• Units: $5+7=12 > 9 \rightarrow +6 \rightarrow 2$, carry 1<br/>• Tens: $8+6+1=15 > 9 \rightarrow +6 \rightarrow 5$, carry 1 | Sum = `52`, End Carry = **1** |
| **3** | End-Around Carry Resolution | End Carry $= 1$ (Positive, $A \ge B$):<br/>Add 1 to intermediate sum via BCD Adder:<br/>`52 + 1 = 53` | **`+53₁₀`** |
| **4** | Final BCD Output | Map `53` to BCD nibbles | `[0101] [0011]` |

---

### Example 4: BCD Subtraction with 9's Complement ($A < B$) `32 − 85`

Operands: $A = 32$, $B = 85$, Aligned Width $N = 2$.

| Step | Operation | Formula / Calculation | Intermediate Value |
| :--- | :--- | :--- | :--- |
| **1** | Compute 9's Complement of $B$ | $(9 - 8) = 1$, $(9 - 5) = 4$ | $B'_{9s} = 14$ (BCD: `0001 0100`) |
| **2** | BCD Addition: $A + B'_{9s}$ | AddBCD(`32`, `14`):<br/>• Units: $2+4=6 \le 9 \rightarrow 6$, carry 0<br/>• Tens: $3+1=4 \le 9 \rightarrow 4$, carry 0 | Sum = `46`, End Carry = **0** |
| **3** | Re-complementing Resolution | End Carry $= 0$ (Negative, $A < B$):<br/>Sum is in 9's complement. Re-complement:<br/>$(9 - 4) = 5$, $(9 - 6) = 3 \rightarrow 53$ | **`−53₁₀`** |
| **4** | Final BCD Output | Map `53` to BCD nibbles with negative sign | `− [0101] [0011]` |

---

### Example 5: BCD Subtraction with 10's Complement ($A > B$) `85 − 32`

Operands: $A = 85$, $B = 32$, Aligned Width $N = 2$.

| Step | Operation | Formula / Calculation | Intermediate Value |
| :--- | :--- | :--- | :--- |
| **1** | Compute 10's Complement of $B$ | 9's complement of $32 = 67$<br/>$67 + 1 = 68$ | $B'_{10s} = 68$ (BCD: `0110 1000`) |
| **2** | BCD Addition: $A + B'_{10s}$ | AddBCD(`85`, `68`):<br/>• Units: $5+8=13 > 9 \rightarrow +6 \rightarrow 3$, carry 1<br/>• Tens: $8+6+1=15 > 9 \rightarrow +6 \rightarrow 5$, carry 1 | Sum = `53`, End Carry = **1** |
| **3** | End Carry Resolution | End Carry $= 1$ (Positive, $A \ge B$):<br/>Discard End Carry! Remaining digits = `53` | **`+53₁₀`** |
| **4** | Final BCD Output | Map `53` to BCD nibbles | `[0101] [0011]` |

---

### Example 6: BCD Subtraction with 10's Complement ($A < B$) `32 − 85`

Operands: $A = 32$, $B = 85$, Aligned Width $N = 2$.

| Step | Operation | Formula / Calculation | Intermediate Value |
| :--- | :--- | :--- | :--- |
| **1** | Compute 10's Complement of $B$ | 9's complement of $85 = 14$<br/>$14 + 1 = 15$ | $B'_{10s} = 15$ (BCD: `0001 0101`) |
| **2** | BCD Addition: $A + B'_{10s}$ | AddBCD(`32`, `15`):<br/>• Units: $2+5=7 \le 9 \rightarrow 7$, carry 0<br/>• Tens: $3+1=4 \le 9 \rightarrow 4$, carry 0 | Sum = `47`, End Carry = **0** |
| **3** | Re-complementing Resolution | End Carry $= 0$ (Negative, $A < B$):<br/>Sum is in 10's complement. Re-complement:<br/>9's comp of $47 = 52$; $52 + 1 = 53$ | **`−53₁₀`** |
| **4** | Final BCD Output | Map `53` to BCD nibbles with negative sign | `− [0101] [0011]` |

---

### Example 7: BCD Subtraction with Equal Operands ($A = B$) `77 − 77`

Operands: $A = 77$, $B = 77$, Aligned Width $N = 2$.

| Method | Complement of $B$ | BCD Addition ($A + \text{Comp}$) | End Carry | Resolution | Final Output |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **9's Complement** | 9's Comp = `22` | `77 + 22 = 99` | **0** | No carry $\rightarrow$ 9's comp of `99` = `00` | **`+00₁₀` (`0`)** |
| **10's Complement** | 10's Comp = `23` | `77 + 23 = 100` | **1** | Carry $= 1$ $\rightarrow$ Discard carry $\rightarrow$ `00` | **`+00₁₀` (`0`)** |

