# Number System Converter & Unified Arithmetic Calculator
## System Pseudocode & Algorithmic Documentation

**Course / Project:** CPE463 - Number System Converter  
**File Reference:** [`script.js`](../script.js) | [`index.html`](../index.html) | [`FLOWCHART.md`](FLOWCHART.md)

---

## Complete Unified Algorithmic Specification

> [!NOTE]
> The single unified block below contains the complete algorithmic pseudocode for all 16 modules across the application. All section headers, architectural overviews, functional specifications, parameter inputs/outputs, and algorithmic step-by-step descriptions are formatted as code comments (`//` and `/* ... */`).
>
> You can select and copy this entire block directly into Google Docs or academic project submissions without manual stitching.

```text
/* =============================================================================
 * CPE 463: NUMBER SYSTEM CONVERTER & UNIFIED ARITHMETIC ENGINE
 * COMPLETE UNIFIED ALGORITHMIC PSEUDOCODE SPECIFICATION
 * =============================================================================
 * TABLE OF MODULES:
 *   SECTION 1: High-Level Program Driver & 3-Tab Event Router
 *   SECTION 2: Input Validation Engine (IsValidNumber)
 *   SECTION 3: Positional Base Normalization (ParseToDecimal)
 *   SECTION 4: Multi-Base Output Formatter (FormatBase)
 *   SECTION 5: Individual 4-Base Matrix Dispatcher (ConvertToAllBases)
 *   SECTION 6: Dynamic Input Row Renderer (RenderInputs)
 *   SECTION 7: Infix Expression Lexer & Tokenizer (TokenizeExpression)
 *   SECTION 8: Dijkstra's Shunting-Yard Infix-to-RPN Parser (ShuntingYard)
 *   SECTION 9: Abstract Syntax Tree (AST) Builder (BuildAST)
 *   SECTION 10: Recursive Bottom-Up AST Reduction Engine (ReduceASTStepByStep)
 *   SECTION 11: Radix and Diminished Radix Complement Engine (ComputeComplements)
 *   SECTION 12: General Subtraction via Complements (SubtractViaComplements)
 *   SECTION 13: BCD 8421 Nibble Encoders & Decoders
 *   SECTION 14: BCD Addition Engine with Hardware-Accurate +6 Rule (AddBCD)
 *   SECTION 15: BCD Subtraction Engine via 9's Complement (BCDSubtract9sComplement)
 *   SECTION 16: BCD Subtraction Engine via 10's Complement (BCDSubtract10sComplement)
 *   SECTION 17: Master Calculation Handlers (ProcessCalculation & ProcessBCDOperation)
 * =============================================================================
 */


// =============================================================================
// SECTION 1: HIGH-LEVEL PROGRAM DRIVER & 3-TAB EVENT ROUTER
// =============================================================================
// WHAT IT DOES:
//   Initializes the global application state, binds UI events across the three
//   primary functional tabs, handles tab activation with deep-linking (URL hashes),
//   and listens for user interactions (preset clicks, field resizing, calculations).
// =============================================================================

PROGRAM NumberSystemConverterAndUnifiedEngine

    // Global application configuration and state variables
    INITIALIZE ApplicationState:
        activeTab           <-- "converter"     // "converter", "complements", or "bcd"
        currentBcdMode      <-- "add"           // "add" (+6 rule) or "sub" (complements)
        currentBcdSubView   <-- "both"          // "both", "9s", or "10s"
        numInputs           <-- 3               // Minimum 3 input rows
        subscriptMap        <-- { 2: "₂", 8: "₈", 10: "₁₀", 16: "₁₆" }
        operatorSymbols     <-- { "+": "+", "-": "−", "*": "×", "/": "÷" }

    // System Startup Lifecycle
    ON ApplicationStart DO:
        CALL RenderInputs(ApplicationState.numInputs)
        CALL ReadURLHashAndActivateTab()
        ATTACH_EVENT_LISTENERS()
    END ON

    // Tab Navigation Event Handlers
    EVENT ON TabButtonClicked(targetTab) DO:
        ApplicationState.activeTab <-- targetTab
        FOR EACH tabBtn IN DOM.QueryAll(".tab-btn") DO:
            tabBtn.classList.Toggle("active", tabBtn.dataset.tab == targetTab)
            tabBtn.SetAttribute("aria-selected", tabBtn.dataset.tab == targetTab)
        END FOR
        FOR EACH tabPanel IN DOM.QueryAll(".tab-panel") DO:
            tabPanel.classList.Toggle("active", tabPanel.id == "tab-panel-" + targetTab)
        END FOR
        UPDATE_WINDOW_HASH("#" + targetTab)
    END EVENT

    // Dynamic Row Generation Event Handler
    EVENT ON UpdateFieldsButtonClicked DO:
        newCount <-- READ_INTEGER_FROM_DOM("num-inputs")
        IF newCount >= 3 THEN
            ApplicationState.numInputs <-- newCount
            CALL RenderInputs(newCount)
        ELSE
            DISPLAY_ALERT("Minimum of 3 input rows required.")
        END IF
    END EVENT

    // Primary Execution Trigger Handlers
    EVENT ON CalculateExpressionClicked DO:
        CALL ProcessCalculation()
    END EVENT

    EVENT ON ExecuteBcdButtonClicked DO:
        CALL ProcessBCDOperation()
    END EVENT

END PROGRAM


// =============================================================================
// SECTION 2: INPUT VALIDATION ENGINE (IsValidNumber)
// =============================================================================
// WHAT IT DOES:
//   Determines whether an input string is syntactically valid for a given
//   numeral base (2, 8, 10, or 16). Validates characters, allows an optional
//   leading negative sign, and allows a single radix point for fractional values.
// INPUTS:
//   valueStr (STRING): The raw input entered by the user.
//   base (INTEGER): The radix (2, 8, 10, or 16).
// OUTPUT:
//   BOOLEAN: TRUE if the input contains only valid symbols, FALSE otherwise.
// =============================================================================

FUNCTION IsValidNumber(valueStr, base)
    IF valueStr IS EMPTY OR NULL THEN
        RETURN FALSE
    END IF

    trimmedStr <-- TRIM_WHITESPACE(valueStr)
    IF trimmedStr == "" OR trimmedStr == "-" OR trimmedStr == "." OR trimmedStr == "-." THEN
        RETURN FALSE
    END IF

    // Strip optional leading minus sign for sign-magnitude inspection
    cleanStr <-- trimmedStr
    IF cleanStr STARTS WITH "-" THEN
        cleanStr <-- SUBSTRING(cleanStr, 1, LENGTH(cleanStr) - 1)
    END IF

    // Define permitted character sets for each radix
    SWITCH base DO:
        CASE 2:
            allowedRegex <-- "^[01]+(\.[01]+)?$"
        CASE 8:
            allowedRegex <-- "^[0-7]+(\.[0-7]+)?$"
        CASE 10:
            allowedRegex <-- "^[0-9]+(\.[0-9]+)?$"
        CASE 16:
            allowedRegex <-- "^[0-9A-Fa-f]+(\.[0-9A-Fa-f]+)?$"
        DEFAULT:
            RETURN FALSE
    END SWITCH

    RETURN MATCH_REGEX(cleanStr, allowedRegex)
END FUNCTION


// =============================================================================
// SECTION 3: POSITIONAL BASE NORMALIZATION (ParseToDecimal)
// =============================================================================
// WHAT IT DOES:
//   Converts any valid number from a source radix (2, 8, 10, or 16) into an
//   IEEE-754 standard decimal (Base 10) floating-point number.
//   Computes positional place values:
//     Integer: Sum of (d_i * Base^i)
//     Fraction: Sum of (d_j * Base^(-j))
// INPUTS:
//   valueStr (STRING): Validated numeral string.
//   base (INTEGER): Radix of the input string.
// OUTPUT:
//   FLOAT: The equivalent Base-10 numerical value.
// =============================================================================

FUNCTION ParseToDecimal(valueStr, base)
    trimmedStr <-- TRIM_WHITESPACE(valueStr)
    isNegative <-- FALSE
    IF trimmedStr STARTS WITH "-" THEN
        isNegative <-- TRUE
        trimmedStr <-- SUBSTRING(trimmedStr, 1, LENGTH(trimmedStr) - 1)
    END IF

    // Split integer and optional fractional portions
    parts <-- SPLIT_STRING(trimmedStr, ".")
    intPartStr <-- parts[0]
    fracPartStr <-- (LENGTH(parts) > 1) ? parts[1] : ""

    decimalVal <-- 0.0

    // Evaluate integer portion: powers base^(n-1-i)
    intLength <-- LENGTH(intPartStr)
    FOR i FROM 0 TO intLength - 1 DO
        char <-- TO_UPPERCASE(intPartStr[i])
        digitVal <-- DIGIT_TO_INTEGER(char)   // '0'-'9' -> 0-9, 'A'-'F' -> 10-15
        power <-- intLength - 1 - i
        decimalVal <-- decimalVal + (digitVal * (base ^ power))
    END FOR

    // Evaluate fractional portion: powers base^(-j)
    FOR j FROM 0 TO LENGTH(fracPartStr) - 1 DO
        char <-- TO_UPPERCASE(fracPartStr[j])
        digitVal <-- DIGIT_TO_INTEGER(char)
        decimalVal <-- decimalVal + (digitVal * (base ^ (-(j + 1))))
    END FOR

    IF isNegative THEN
        RETURN -decimalVal
    ELSE
        RETURN decimalVal
    END IF
END FUNCTION


// =============================================================================
// SECTION 4: MULTI-BASE OUTPUT FORMATTER (FormatBase)
// =============================================================================
// WHAT IT DOES:
//   Converts a Base-10 decimal number into a formatted representation in any
//   target base (2, 8, 10, 16). Performs repeated integer division/modulo
//   for whole numbers and repeated radix multiplication for fractions
//   (capped at 6 significant places with trailing zero truncation).
// INPUTS:
//   decimalVal (FLOAT): The numerical value in base 10.
//   targetBase (INTEGER): The output radix (2, 8, 10, or 16).
//   maxFracDigits (INTEGER): Maximum fractional precision (default = 6).
// OUTPUT:
//   STRING: Formatted representation in the target base.
// =============================================================================

FUNCTION FormatBase(decimalVal, targetBase, maxFracDigits = 6)
    IF IS_NAN(decimalVal) THEN
        RETURN "NaN"
    END IF
    IF decimalVal == 0 THEN
        RETURN "0"
    END IF

    isNegative <-- (decimalVal < 0)
    absVal <-- ABSOLUTE_VALUE(decimalVal)

    intPart <-- FLOOR(absVal)
    fracPart <-- absVal - intPart

    // 1. Convert integer part using successive modulo
    IF intPart == 0 THEN
        intStr <-- "0"
    ELSE
        intStr <-- ""
        currentInt <-- intPart
        WHILE currentInt > 0 DO
            rem <-- currentInt MOD targetBase
            intStr <-- INTEGER_TO_HEX_CHAR(rem) + intStr
            currentInt <-- FLOOR(currentInt / targetBase)
        END WHILE
    END IF

    // 2. Convert fractional part using successive multiplication
    fracStr <-- ""
    currentFrac <-- fracPart
    digitCount <-- 0

    WHILE currentFrac > 0 AND digitCount < maxFracDigits DO
        currentFrac <-- currentFrac * targetBase
        digit <-- FLOOR(currentFrac)
        fracStr <-- fracStr + INTEGER_TO_HEX_CHAR(digit)
        currentFrac <-- currentFrac - digit
        digitCount <-- digitCount + 1
    END WHILE

    // Remove trailing zeros in fractional part
    WHILE fracStr ENDS WITH "0" DO
        fracStr <-- SUBSTRING(fracStr, 0, LENGTH(fracStr) - 1)
    END WHILE

    result <-- (fracStr != "") ? (intStr + "." + fracStr) : intStr
    IF isNegative THEN
        result <-- "−" + result
    END IF

    RETURN result
END FUNCTION


// =============================================================================
// SECTION 5: INDIVIDUAL 4-BASE MATRIX DISPATCHER (ConvertToAllBases)
// =============================================================================
// WHAT IT DOES:
//   Takes a raw value from an input row along with its current base,
//   validates it, converts it to decimal, and generates the simultaneous
//   conversion matrix displaying its value in BIN, OCT, DEC, and HEX.
// INPUTS:
//   valueStr (STRING): Value entered in the row.
//   currentBase (INTEGER): Selected base of the row.
// OUTPUT:
//   OBJECT: Contains validation status, decimal float, and 4-base string representations.
// =============================================================================

FUNCTION ConvertToAllBases(valueStr, currentBase)
    IF NOT IsValidNumber(valueStr, currentBase) THEN
        RETURN { isValid: FALSE, decimal: NULL, bin: "", oct: "", dec: "", hex: "" }
    END IF

    decValue <-- ParseToDecimal(valueStr, currentBase)

    RETURN {
        isValid: TRUE,
        decimal: decValue,
        bin: FormatBase(decValue, 2),
        oct: FormatBase(decValue, 8),
        dec: FormatBase(decValue, 10),
        hex: FormatBase(decValue, 16)
    }
END FUNCTION


// =============================================================================
// SECTION 6: DYNAMIC INPUT ROW RENDERER (RenderInputs)
// =============================================================================
// WHAT IT DOES:
//   Dynamically constructs N input rows in the DOM. Preserves existing values
//   and base selections, attaches input event listeners for live conversions,
//   and synchronizes variable names (A, B, C, D, ...).
// INPUTS:
//   count (INTEGER): Number of input rows to render (N >= 3).
// =============================================================================

FUNCTION RenderInputs(count)
    container <-- DOM.GetElementById("inputs-container")
    existingValues <-- SAVE_CURRENT_INPUT_STATE()
    container.CLEAR_HTML()

    FOR i FROM 0 TO count - 1 DO
        varName <-- GET_VARIABLE_LETTER(i)  // 0 -> 'A', 1 -> 'B', etc.
        savedBase <-- existingValues[i]?.base OR (i == 0 ? 2 : (i == 1 ? 8 : (i == 2 ? 10 : 16)))
        savedVal  <-- existingValues[i]?.value OR ""

        rowElement <-- CREATE_DOM_ROW(varName, savedBase, savedVal)
        container.APPEND(rowElement)

        // Attach live keystroke listener for instant 4-base matrix rendering
        ATTACH_LISTENER(rowElement.inputField, "input", FUNCTION()
            CALL UpdateSingleRowLivePreview(i)
        END FUNCTION)
    END FOR

    UPDATE_KEYPAD_ACTIVE_VARIABLES(count)
END FUNCTION


// =============================================================================
// SECTION 7: INFIX EXPRESSION LEXER & TOKENIZER (TokenizeExpression)
// =============================================================================
// WHAT IT DOES:
//   Scans an arithmetic formula string character by character. Categorizes
//   characters into tokens: NUMBER, VARIABLE, OPERATOR, LPAREN, RPAREN.
//   Intelligently injects implicit multiplication operators between adjacent
//   tokens (e.g., "A(B)" -> "A * (B)", "2A" -> "2 * A", "(A+B)(C+D)" -> "(A+B) * (C+D)").
// INPUTS:
//   exprStr (STRING): The formula string entered by the user.
// OUTPUT:
//   ARRAY: List of normalized token objects.
// =============================================================================

FUNCTION TokenizeExpression(exprStr)
    tokens <-- []
    pos <-- 0
    len <-- LENGTH(exprStr)

    WHILE pos < len DO
        char <-- exprStr[pos]

        IF IS_WHITESPACE(char) THEN
            pos <-- pos + 1
            CONTINUE
        END IF

        // Detect numeric literals
        IF IS_DIGIT(char) OR char == "." THEN
            numBuffer <-- ""
            WHILE pos < len AND (IS_DIGIT(exprStr[pos]) OR exprStr[pos] == ".") DO
                numBuffer <-- numBuffer + exprStr[pos]
                pos <-- pos + 1
            END WHILE
            tokens.APPEND({ type: "NUMBER", value: numBuffer })
            CONTINUE
        END IF

        // Detect symbolic variables (A, B, C, ...)
        IF IS_ALPHA(char) THEN
            varBuffer <-- ""
            WHILE pos < len AND IS_ALPHA(exprStr[pos]) DO
                varBuffer <-- varBuffer + exprStr[pos]
                pos <-- pos + 1
            END WHILE
            tokens.APPEND({ type: "VARIABLE", value: TO_UPPERCASE(varBuffer) })
            CONTINUE
        END IF

        // Detect operators (+, -, *, /, neg)
        IF char IN ["+", "-", "*", "/", "×", "÷", "−"] THEN
            normOp <-- MAP_OPERATOR_GLYPH(char)  // '×' -> '*', '÷' -> '/', '−' -> '-'
            // Detect unary negation: if first token or preceded by an operator / LPAREN
            prevToken <-- (LENGTH(tokens) > 0) ? tokens[LAST] : NULL
            IF normOp == "-" AND (prevToken == NULL OR prevToken.type == "OPERATOR" OR prevToken.type == "LPAREN") THEN
                tokens.APPEND({ type: "OPERATOR", value: "NEG", precedence: 3, associativity: "RIGHT" })
            ELSE
                prec <-- (normOp IN ["*", "/"]) ? 2 : 1
                tokens.APPEND({ type: "OPERATOR", value: normOp, precedence: prec, associativity: "LEFT" })
            END IF
            pos <-- pos + 1
            CONTINUE
        END IF

        // Detect grouping parentheses
        IF char == "(" THEN
            tokens.APPEND({ type: "LPAREN", value: "(" })
            pos <-- pos + 1
            CONTINUE
        ELSE IF char == ")" THEN
            tokens.APPEND({ type: "RPAREN", value: ")" })
            pos <-- pos + 1
            CONTINUE
        END IF

        pos <-- pos + 1
    END WHILE

    // Second Pass: Inject implicit multiplication tokens
    expandedTokens <-- []
    FOR i FROM 0 TO LENGTH(tokens) - 1 DO
        curr <-- tokens[i]
        expandedTokens.APPEND(curr)
        IF i < LENGTH(tokens) - 1 THEN
            next <-- tokens[i + 1]
            needsMul <-- (curr.type IN ["NUMBER", "VARIABLE", "RPAREN"] AND
                          next.type IN ["VARIABLE", "LPAREN"]) OR
                         (curr.type == "NUMBER" AND next.type == "VARIABLE")
            IF needsMul THEN
                expandedTokens.APPEND({ type: "OPERATOR", value: "*", precedence: 2, associativity: "LEFT" })
            END IF
        END IF
    END FOR

    RETURN expandedTokens
END FUNCTION


// =============================================================================
// SECTION 8: DIJKSTRA'S SHUNTING-YARD ALGORITHM (ShuntingYard)
// =============================================================================
// WHAT IT DOES:
//   Parses an array of infix tokens and converts it into a Reverse Polish
//   Notation (RPN / Postfix) queue using an operator stack. Enforces standard
//   PEMDAS precedence and associativity rules.
// INPUTS:
//   tokens (ARRAY): Ordered array of token objects.
// OUTPUT:
//   QUEUE: Tokens ordered in Reverse Polish Notation.
// =============================================================================

FUNCTION ShuntingYard(tokens)
    outputQueue <-- NEW_QUEUE()
    operatorStack <-- NEW_STACK()

    FOR EACH token IN tokens DO
        SWITCH token.type DO
            CASE "NUMBER":
            CASE "VARIABLE":
                outputQueue.ENQUEUE(token)

            CASE "OPERATOR":
                WHILE NOT operatorStack.IS_EMPTY() AND operatorStack.PEEK().type == "OPERATOR" DO
                    topOp <-- operatorStack.PEEK()
                    shouldPop <-- (token.associativity == "LEFT" AND token.precedence <= topOp.precedence) OR
                                 (token.associativity == "RIGHT" AND token.precedence < topOp.precedence)
                    IF shouldPop THEN
                        outputQueue.ENQUEUE(operatorStack.POP())
                    ELSE
                        BREAK
                    END IF
                END WHILE
                operatorStack.PUSH(token)

            CASE "LPAREN":
                operatorStack.PUSH(token)

            CASE "RPAREN":
                hasMatchingParen <-- FALSE
                WHILE NOT operatorStack.IS_EMPTY() DO
                    top <-- operatorStack.POP()
                    IF top.type == "LPAREN" THEN
                        hasMatchingParen <-- TRUE
                        BREAK
                    ELSE
                        outputQueue.ENQUEUE(top)
                    END IF
                END WHILE
                IF NOT hasMatchingParen THEN
                    THROW_SYNTAX_ERROR("Mismatched parentheses in expression.")
                END IF
        END SWITCH
    END FOR

    WHILE NOT operatorStack.IS_EMPTY() DO
        top <-- operatorStack.POP()
        IF top.type == "LPAREN" OR top.type == "RPAREN" THEN
            THROW_SYNTAX_ERROR("Unbalanced grouping parentheses.")
        END IF
        outputQueue.ENQUEUE(top)
    END WHILE

    RETURN outputQueue
END FUNCTION


// =============================================================================
// SECTION 9: ABSTRACT SYNTAX TREE (AST) BUILDER (BuildAST)
// =============================================================================
// WHAT IT DOES:
//   Builds an Abstract Syntax Tree (AST) from a Reverse Polish Notation queue.
//   Leaves represent operands (numeric values or bound variable names),
//   and internal nodes represent binary or unary operators.
// INPUTS:
//   postfixQueue (QUEUE): Tokens ordered in RPN.
// OUTPUT:
//   ASTNode: The root node of the constructed syntax tree.
// =============================================================================

FUNCTION BuildAST(postfixQueue)
    nodeStack <-- NEW_STACK()

    WHILE NOT postfixQueue.IS_EMPTY() DO
        token <-- postfixQueue.DEQUEUE()

        IF token.type IN ["NUMBER", "VARIABLE"] THEN
            nodeStack.PUSH({
                type: token.type,
                value: token.value,
                left: NULL,
                right: NULL
            })
        ELSE IF token.type == "OPERATOR" THEN
            IF token.value == "NEG" THEN
                // Unary negation operator has single right child
                IF nodeStack.IS_EMPTY() THEN
                    THROW_SYNTAX_ERROR("Missing operand for negation operator.")
                END IF
                operandNode <-- nodeStack.POP()
                nodeStack.PUSH({
                    type: "UNARY_OP",
                    value: "NEG",
                    right: operandNode,
                    left: NULL
                })
            ELSE
                // Binary operator requires two operands
                IF nodeStack.COUNT() < 2 THEN
                    THROW_SYNTAX_ERROR("Insufficient operands for operator: " + token.value)
                END IF
                rightNode <-- nodeStack.POP()
                leftNode <-- nodeStack.POP()
                nodeStack.PUSH({
                    type: "BINARY_OP",
                    value: token.value,
                    left: leftNode,
                    right: rightNode
                })
            END IF
        END IF
    END WHILE

    IF nodeStack.COUNT() != 1 THEN
        THROW_SYNTAX_ERROR("Malformed expression syntax.")
    END IF

    RETURN nodeStack.POP()
END FUNCTION


// =============================================================================
// SECTION 10: BOTTOM-UP RECURSIVE AST STEP REDUCER (ReduceASTStepByStep)
// =============================================================================
// WHAT IT DOES:
//   Recursively traverses the syntax tree, resolves variable values to their
//   decimal representations, checks for mathematical violations (division by zero),
//   and records a step-by-step audit of each intermediate evaluation.
// INPUTS:
//   node (ASTNode): Root or sub-root node of the AST.
//   variableValues (MAP): Mapping of variable names ('A', 'B') to decimal numbers.
//   stepHistory (ARRAY): Accumulator for intermediate evaluation steps.
// OUTPUT:
//   FLOAT: The final evaluated numeric decimal result.
// =============================================================================

FUNCTION ReduceASTStepByStep(node, variableValues, stepHistory)
    IF node.type == "NUMBER" THEN
        RETURN PARSE_FLOAT(node.value)
    END IF

    IF node.type == "VARIABLE" THEN
        IF NOT variableValues.CONTAINS_KEY(node.value) THEN
            THROW_RUNTIME_ERROR("Variable " + node.value + " has not been initialized.")
        END IF
        RETURN variableValues[node.value]
    END IF

    IF node.type == "UNARY_OP" AND node.value == "NEG" THEN
        innerVal <-- ReduceASTStepByStep(node.right, variableValues, stepHistory)
        result <-- -innerVal
        stepHistory.APPEND({
            operation: "Negation",
            detail: "−(" + innerVal + ") = " + result,
            intermediate: result
        })
        RETURN result
    END IF

    IF node.type == "BINARY_OP" THEN
        leftVal <-- ReduceASTStepByStep(node.left, variableValues, stepHistory)
        rightVal <-- ReduceASTStepByStep(node.right, variableValues, stepHistory)

        SWITCH node.value DO
            CASE "+":
                result <-- leftVal + rightVal
            CASE "-":
                result <-- leftVal - rightVal
            CASE "*":
                result <-- leftVal * rightVal
            CASE "/":
                IF rightVal == 0 THEN
                    THROW_DIV_ZERO_ERROR("Division by zero encountered: " + leftVal + " ÷ 0")
                END IF
                result <-- leftVal / rightVal
        END SWITCH

        stepHistory.APPEND({
            operation: node.value,
            detail: leftVal + " " + node.value + " " + rightVal + " = " + result,
            intermediate: result
        })

        RETURN result
    END IF
END FUNCTION


// =============================================================================
// SECTION 11: RADIX & DIMINISHED RADIX COMPLEMENT ENGINE (ComputeComplements)
// =============================================================================
// WHAT IT DOES:
//   Computes both the diminished radix complement (r-1)'s and radix complement
//   (r)'s for an input in any base (2, 8, 10, 16) across an aligned digit width N.
//   Formula:
//     (r-1)'s Complement: (r^N - 1) - Value
//     r's Complement: r^N - Value = (r-1)'s Complement + 1
// INPUTS:
//   valueStr (STRING): Input value.
//   base (INTEGER): Radix (2, 8, 10, 16).
//   digitWidth (INTEGER): Number of digits N.
// OUTPUT:
//   OBJECT: Diminished and radix complement representations and step breakdown.
// =============================================================================

FUNCTION ComputeComplements(valueStr, base, digitWidth)
    decVal <-- ParseToDecimal(valueStr, base)
    paddedStr <-- PAD_LEFT(TO_UPPERCASE(valueStr), digitWidth, "0")
    N <-- digitWidth

    maxSymbolVal <-- base - 1
    diminishedCompChars <-- ""

    // Compute (r-1)'s complement digit-by-digit
    FOR i FROM 0 TO N - 1 DO
        digit <-- DIGIT_TO_INTEGER(paddedStr[i])
        compDigit <-- maxSymbolVal - digit
        diminishedCompChars <-- diminishedCompChars + INTEGER_TO_HEX_CHAR(compDigit)
    END FOR

    diminishedDec <-- ParseToDecimal(diminishedCompChars, base)
    radixDec <-- diminishedDec + 1
    radixCompChars <-- FormatBase(radixDec, base)
    radixCompChars <-- PAD_LEFT(radixCompChars, N, "0")

    RETURN {
        inputAligned: paddedStr,
        base: base,
        width: N,
        diminishedName: (base - 1) + "'s Complement",
        diminishedValue: diminishedCompChars,
        radixName: base + "'s Complement",
        radixValue: radixCompChars
    }
END FUNCTION


// =============================================================================
// SECTION 12: GENERAL SUBTRACTION VIA COMPLEMENTS (SubtractViaComplements)
// =============================================================================
// WHAT IT DOES:
//   Executes subtraction A - B using both (r-1)'s and r's complement methods
//   side-by-side. Handles end carry evaluation (End-Around Carry vs. Discard)
//   and re-complements negative results.
// INPUTS:
//   minuendStr (STRING): Operand A.
//   subtrahendStr (STRING): Operand B.
//   base (INTEGER): Common base.
//   digitWidth (INTEGER): Aligned width.
// OUTPUT:
//   OBJECT: Detailed side-by-side execution trace for both complement methods.
// =============================================================================

FUNCTION SubtractViaComplements(minuendStr, subtrahendStr, base, digitWidth)
    N <-- digitWidth
    alignedA <-- PAD_LEFT(minuendStr, N, "0")
    alignedB <-- PAD_LEFT(subtrahendStr, N, "0")

    decA <-- ParseToDecimal(alignedA, base)
    decB <-- ParseToDecimal(alignedB, base)
    trueDiff <-- decA - decB
    isPositive <-- (trueDiff >= 0)

    // Method 1: (r-1)'s Complement Subtraction
    compDimB <-- ComputeComplements(alignedB, base, N).diminishedValue
    sumDim <-- ParseToDecimal(alignedA, base) + ParseToDecimal(compDimB, base)
    endCarryDim <-- FLOOR(sumDim / (base ^ N))
    rawSumDimStr <-- FormatBase(sumDim, base)

    IF endCarryDim == 1 THEN
        // Positive result: Apply End-Around Carry
        magDimDec <-- (sumDim MOD (base ^ N)) + 1
        finalDimStr <-- "+" + PAD_LEFT(FormatBase(magDimDec, base), N, "0")
    ELSE
        // Negative result: Re-complement
        recompDec <-- ((base ^ N) - 1) - sumDim
        finalDimStr <-- "−" + PAD_LEFT(FormatBase(recompDec, base), N, "0")
    END IF

    // Method 2: r's Complement Subtraction
    compRadB <-- ComputeComplements(alignedB, base, N).radixValue
    sumRad <-- ParseToDecimal(alignedA, base) + ParseToDecimal(compRadB, base)
    endCarryRad <-- FLOOR(sumRad / (base ^ N))

    IF endCarryRad == 1 THEN
        // Positive result: Discard End Carry
        magRadDec <-- sumRad MOD (base ^ N)
        finalRadStr <-- "+" + PAD_LEFT(FormatBase(magRadDec, base), N, "0")
    ELSE
        // Negative result: Re-complement
        recompRadDec <-- (base ^ N) - sumRad
        finalRadStr <-- "−" + PAD_LEFT(FormatBase(recompRadDec, base), N, "0")
    END IF

    RETURN {
        minuend: alignedA,
        subtrahend: alignedB,
        methodDiminished: {
            subtrahendComp: compDimB,
            sum: rawSumDimStr,
            endCarry: endCarryDim,
            finalResult: finalDimStr
        },
        methodRadix: {
            subtrahendComp: compRadB,
            sum: FormatBase(sumRad, base),
            endCarry: endCarryRad,
            finalResult: finalRadStr
        },
        decimalVerification: trueDiff
    }
END FUNCTION


// =============================================================================
// SECTION 13: BCD 8421 NIBBLE ENCODERS & DECODERS
// =============================================================================
// WHAT IT DOES:
//   Converts single decimal digits (0-9) to 4-bit standard 8421 binary strings
//   and decodes 4-bit nibbles back into decimal digits.
// =============================================================================

FUNCTION DecimalDigitToBCD(digit)
    intVal <-- PARSE_INT(digit)
    binaryStr <-- ""
    FOR bitIndex FROM 3 DOWNTO 0 DO
        bit <-- (intVal BITWISE_SHR bitIndex) BITWISE_AND 1
        binaryStr <-- binaryStr + STRING(bit)
    END FOR
    RETURN binaryStr   // e.g. 5 -> "0101"
END FUNCTION

FUNCTION BCDNibbleToDecimal(nibbleStr)
    RETURN PARSE_INT(nibbleStr, 2)
END FUNCTION


// =============================================================================
// SECTION 14: BCD ADDITION ENGINE WITH HARDWARE-ACCURATE +6 RULE (AddBCD)
// =============================================================================
// WHAT IT DOES:
//   Performs digit-by-digit parallel BCD addition across aligned operands.
//   Identifies invalid states (rawSum > 9 OR binary carry out >= 16).
//   Applies the hardware-accurate correction:
//     correctedDigit = (rawSum + 6) & 0x0F
//   Propagates carries and prepends an MSB leading digit '1' on end carry.
// INPUTS:
//   valAStr (STRING): Operand A decimal string.
//   valBStr (STRING): Operand B decimal string.
//   minWidth (INTEGER): Minimum aligned digit width.
// OUTPUT:
//   OBJECT: Contains aligned operands, step breakdown, and final BCD bit groups.
// =============================================================================

FUNCTION AddBCD(valAStr, valBStr, minWidth = 0)
    rawA <-- TRIM_WHITESPACE(valAStr)
    rawB <-- TRIM_WHITESPACE(valBStr)

    N <-- MAX(LENGTH(rawA), LENGTH(rawB), minWidth)
    alignedA <-- PAD_LEFT(rawA, N, "0")
    alignedB <-- PAD_LEFT(rawB, N, "0")

    cin <-- 0
    nibbleSteps <-- []
    sumDigitsOnly <-- ""

    // Iterate LSB (Units) to MSB
    FOR idx FROM 0 TO N - 1 DO
        pos <-- N - 1 - idx
        dA <-- PARSE_INT(alignedA[pos])
        dB <-- PARSE_INT(alignedB[pos])

        rawSum <-- dA + dB + cin
        binCarry <-- (rawSum >= 16) ? 1 : 0
        needsCorrection <-- (rawSum > 9) OR (binCarry == 1)

        IF needsCorrection THEN
            correctedDigit <-- (rawSum + 6) BITWISE_AND 15  // Modulo 16 hardware logic
            cout <-- 1
        ELSE
            correctedDigit <-- rawSum
            cout <-- 0
        END IF

        nibbleSteps.APPEND({
            digitIndex: idx,
            placeValue: 10 ^ idx,
            digitA: dA,
            bcdA: DecimalDigitToBCD(dA),
            digitB: dB,
            bcdB: DecimalDigitToBCD(dB),
            cin: cin,
            rawSum: rawSum,
            needsCorrection: needsCorrection,
            correctedDigit: correctedDigit,
            finalBcd: DecimalDigitToBCD(correctedDigit),
            cout: cout
        })

        sumDigitsOnly <-- STRING(correctedDigit) + sumDigitsOnly
        cin <-- cout
    END FOR

    endCarry <-- cin
    finalDigits <-- (endCarry == 1) ? ("1" + sumDigitsOnly) : sumDigitsOnly

    resultBCD <-- []
    FOR EACH char IN finalDigits DO
        resultBCD.APPEND(DecimalDigitToBCD(char))
    END FOR

    RETURN {
        alignedA: alignedA,
        alignedB: alignedB,
        alignedLength: N,
        nibbleSteps: nibbleSteps,
        endCarry: endCarry,
        sumDigitsOnly: sumDigitsOnly,
        finalDigits: finalDigits,
        resultBCD: resultBCD,
        decimalValue: PARSE_INT(finalDigits)
    }
END FUNCTION


// =============================================================================
// SECTION 15: BCD SUBTRACTION VIA 9'S COMPLEMENT (BCDSubtract9sComplement)
// =============================================================================
// WHAT IT DOES:
//   Executes BCD subtraction A - B using the 9's complement method:
//     1. Compute 9's complement of subtrahend: Comp9(d_i) = 9 - d_i
//     2. Perform BCD addition: A + Comp9(B) via AddBCD
//     3. Check End Carry:
//        - If 1: Result is positive. Apply End-Around Carry (AddBCD(sum, '1')).
//        - If 0: Result is negative. Re-complement sum (9 - d_i) and attach minus sign.
// =============================================================================

FUNCTION BCDSubtract9sComplement(valAStr, valBStr, minWidth = 0)
    rawA <-- TRIM_WHITESPACE(valAStr)
    rawB <-- TRIM_WHITESPACE(valBStr)

    N <-- MAX(LENGTH(rawA), LENGTH(rawB), minWidth)
    alignedA <-- PAD_LEFT(rawA, N, "0")
    alignedB <-- PAD_LEFT(rawB, N, "0")

    // Step 1: Compute 9's complement of subtrahend
    comp9Str <-- ""
    FOR i FROM 0 TO N - 1 DO
        digit <-- PARSE_INT(alignedB[i])
        comp9Str <-- comp9Str + STRING(9 - digit)
    END FOR

    // Step 2: Add Minuend A + 9's Complement of B
    additionResult <-- AddBCD(alignedA, comp9Str, N)
    endCarry <-- additionResult.endCarry

    decA <-- PARSE_INT(alignedA)
    decB <-- PARSE_INT(alignedB)
    trueDiff <-- decA - decB
    isPositive <-- (trueDiff >= 0)

    IF endCarry == 1 THEN
        // Step 3A: End-Around Carry Rule
        eacResult <-- AddBCD(additionResult.sumDigitsOnly, "1", N)
        finalDigits <-- eacResult.finalDigits
        resultSign <-- "+"
    ELSE
        // Step 3B: Re-complementation Rule
        recompDigits <-- ""
        FOR i FROM 0 TO N - 1 DO
            d <-- PARSE_INT(additionResult.sumDigitsOnly[i])
            recompDigits <-- recompDigits + STRING(9 - d)
        END FOR
        finalDigits <-- recompDigits
        resultSign <-- "−"
    END IF

    finalNibbles <-- []
    FOR EACH char IN finalDigits DO
        finalNibbles.APPEND(DecimalDigitToBCD(char))
    END FOR

    RETURN {
        alignedA: alignedA,
        alignedB: alignedB,
        comp9Str: comp9Str,
        additionResult: additionResult,
        endCarry: endCarry,
        isPositive: isPositive,
        finalDigits: finalDigits,
        finalNibbles: finalNibbles,
        decimalValue: PARSE_INT(resultSign + finalDigits),
        sign: resultSign
    }
END FUNCTION


// =============================================================================
// SECTION 16: BCD SUBTRACTION VIA 10'S COMPLEMENT (BCDSubtract10sComplement)
// =============================================================================
// WHAT IT DOES:
//   Executes BCD subtraction A - B using the 10's complement method:
//     1. Compute 10's complement of subtrahend: Comp10(B) = Comp9(B) + 1
//     2. Perform BCD addition: A + Comp10(B) via AddBCD
//     3. Check End Carry:
//        - If 1: Result is positive. Discard the end carry.
//        - If 0: Result is negative. Re-complement sum (10's comp) and attach minus sign.
// =============================================================================

FUNCTION BCDSubtract10sComplement(valAStr, valBStr, minWidth = 0)
    rawA <-- TRIM_WHITESPACE(valAStr)
    rawB <-- TRIM_WHITESPACE(valBStr)

    N <-- MAX(LENGTH(rawA), LENGTH(rawB), minWidth)
    alignedA <-- PAD_LEFT(rawA, N, "0")
    alignedB <-- PAD_LEFT(rawB, N, "0")

    // Step 1: Compute 10's complement: 9's complement + 1
    comp9Str <-- ""
    FOR i FROM 0 TO N - 1 DO
        digit <-- PARSE_INT(alignedB[i])
        comp9Str <-- comp9Str + STRING(9 - digit)
    END FOR
    comp10Result <-- AddBCD(comp9Str, "1", N)
    comp10Str <-- comp10Result.sumDigitsOnly

    // Step 2: Add Minuend A + 10's Complement of B
    additionResult <-- AddBCD(alignedA, comp10Str, N)
    endCarry <-- additionResult.endCarry

    decA <-- PARSE_INT(alignedA)
    decB <-- PARSE_INT(alignedB)
    trueDiff <-- decA - decB
    isPositive <-- (trueDiff >= 0)

    IF endCarry == 1 THEN
        // Step 3A: Discard Carry Rule
        finalDigits <-- additionResult.sumDigitsOnly
        resultSign <-- "+"
    ELSE
        // Step 3B: Re-complementation Rule
        recomp9Str <-- ""
        FOR i FROM 0 TO N - 1 DO
            d <-- PARSE_INT(additionResult.sumDigitsOnly[i])
            recomp9Str <-- recomp9Str + STRING(9 - d)
        END FOR
        recomp10Result <-- AddBCD(recomp9Str, "1", N)
        finalDigits <-- recomp10Result.sumDigitsOnly
        resultSign <-- "−"
    END IF

    finalNibbles <-- []
    FOR EACH char IN finalDigits DO
        finalNibbles.APPEND(DecimalDigitToBCD(char))
    END FOR

    RETURN {
        alignedA: alignedA,
        alignedB: alignedB,
        comp10Str: comp10Str,
        additionResult: additionResult,
        endCarry: endCarry,
        isPositive: isPositive,
        finalDigits: finalDigits,
        finalNibbles: finalNibbles,
        decimalValue: PARSE_INT(resultSign + finalDigits),
        sign: resultSign
    }
END FUNCTION


// =============================================================================
// SECTION 17: MASTER CALCULATION HANDLERS
// =============================================================================
// WHAT IT DOES:
//   Coordinates UI inputs, validates operands, triggers calculation engines,
//   and renders the dynamic results areas (reduction trees, hero cards,
//   columnar addition tables, side-by-side complement cards).
// =============================================================================

FUNCTION ProcessCalculation()
    formula <-- READ_STRING_FROM_DOM("expression-input")
    variableMap <-- NEW_MAP()

    FOR i FROM 0 TO ApplicationState.numInputs - 1 DO
        valStr <-- READ_STRING_FROM_DOM("input-" + i)
        base   <-- READ_INTEGER_FROM_DOM("base-" + i)
        IF NOT IsValidNumber(valStr, base) THEN
            SHOW_GLOBAL_ERROR("Input Row " + (i + 1) + " contains invalid digits for Base " + base)
            RETURN
        END IF
        variableMap[GET_VARIABLE_LETTER(i)] <-- ParseToDecimal(valStr, base)
    END FOR

    TRY
        tokens <-- TokenizeExpression(formula)
        rpnQueue <-- ShuntingYard(tokens)
        astRoot <-- BuildAST(rpnQueue)
        stepHistory <-- []
        finalResult <-- ReduceASTStepByStep(astRoot, variableMap, stepHistory)

        RENDER_EXPRESSION_CARD(formula, variableMap, stepHistory)
        RENDER_MULTI_BASE_OUTPUT_TILES(finalResult)
    CATCH error
        SHOW_GLOBAL_ERROR(error.message)
    END TRY
END FUNCTION

FUNCTION ProcessBCDOperation()
    valA <-- READ_STRING_FROM_DOM("bcd-val-a")
    valB <-- READ_STRING_FROM_DOM("bcd-val-b")
    autoWidth <-- READ_BOOLEAN_FROM_DOM("bcd-auto-digits")
    userWidth <-- READ_INTEGER_FROM_DOM("bcd-digits")

    IF NOT validateBCDInput(valA) OR NOT validateBCDInput(valB) THEN
        SHOW_BCD_ERROR("Invalid decimal input. Characters must be 0-9.")
        RETURN
    END IF

    width <-- autoWidth ? MAX(LENGTH(valA), LENGTH(valB)) : userWidth

    IF ApplicationState.currentBcdMode == "add" THEN
        addResult <-- AddBCD(valA, valB, width)
        CALL RenderBCDAdditionResult(addResult, valA, valB)
    ELSE
        sub9Result  <-- BCDSubtract9sComplement(valA, valB, width)
        sub10Result <-- BCDSubtract10sComplement(valA, valB, width)
        CALL RenderBCDSubtractionResult(sub9Result, sub10Result, valA, valB)
    END IF
END FUNCTION
```

---

## Verification & Documentation Guide

- **Section 1–6 (Base Converters):** Validates and maps numbers between Binary, Octal, Decimal, and Hexadecimal.
- **Section 7–10 (Expression Parser):** Implements lexical analysis, Dijkstra's Shunting-yard algorithm, and Abstract Syntax Tree (AST) reduction with division-by-zero guards.
- **Section 11–12 (Complements & Subtraction):** Derives $(r-1)$'s and $r$'s complements and verifies End-Around Carry vs. Discard Carry.
- **Section 13–16 (BCD Arithmetic):** Implements standard 8421 Binary-Coded Decimal addition with hardware-accurate `(rawSum + 6) & 0x0F` correction and BCD subtraction using 9's and 10's complement algorithms.
- **Section 17 (Orchestration):** Coordinates UI inputs, calculations, and visual breakdowns.
