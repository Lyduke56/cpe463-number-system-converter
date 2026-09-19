// ==========================================================================
// Number System Converter & Unified Algebraic Arithmetic Engine
// Supports Base 2 (BIN), Base 8 (OCT), Base 10 (DEC), Base 16 (HEX)
// Advanced features: Operator Precedence, Associativity, Parentheses,
// Step-by-Step Reduction Breakdown, and Comprehensive Arithmetic Error Handling
// ==========================================================================

// DOM Elements
const numInputsEl = document.getElementById('num-inputs');
const generateBtn = document.getElementById('generate-btn');
const inputsContainer = document.getElementById('inputs-container');
const processBtn = document.getElementById('process-btn');
const presetButtons = document.querySelectorAll('.preset-btn');

// Expression DOM Elements
const exprInput = document.getElementById('expr-input');
const clearExprBtn = document.getElementById('clear-expr-btn');
const varKeysContainer = document.getElementById('var-keys');
const backspaceBtn = document.getElementById('backspace-btn');
const exprPresetChips = document.querySelectorAll('.expr-chip');

// Error Banner Elements
const globalErrorBanner = document.getElementById('global-error-banner');
const errorBannerTitle = document.getElementById('error-banner-title');
const errorBannerDesc = document.getElementById('error-banner-desc');
const errorBannerClose = document.getElementById('error-banner-close');

// Results DOM Elements
const resultsSection = document.getElementById('results-section');
const expressionCard = document.getElementById('expression-card');
const evalStatusPill = document.getElementById('eval-status-pill');
const expressionDisplay = document.getElementById('expression-display');
const multiBaseFormula = document.getElementById('multi-base-formula');
const decimalFormula = document.getElementById('decimal-formula');
const finalBinEl = document.getElementById('final-bin');
const finalOctEl = document.getElementById('final-oct');
const finalDecEl = document.getElementById('final-dec');
const finalHexEl = document.getElementById('final-hex');
const resultTiles = document.querySelectorAll('.result-tile');

// Steps Breakdown Elements
const stepsSection = document.getElementById('steps-section');
const stepsToggle = document.getElementById('steps-toggle');
const stepsChevron = document.getElementById('steps-chevron');
const stepsCount = document.getElementById('steps-count');
const stepsContent = document.getElementById('steps-content');
const stepsList = document.getElementById('steps-list');

// Mathematical Subscripts for Base Notation
const BASE_SUBSCRIPTS = {
    '2': '₂',
    '8': '₈',
    '10': '₁₀',
    '16': '₁₆'
};

// Operator Symbols Map for Standardized Math Display
const OP_DISPLAY = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
    'NEG': '−'
};

// ==========================================================================
// Variable & Index Conversion Helpers
// Index 1 -> 'A', 2 -> 'B', ..., 26 -> 'Z', 27 -> 'AA'
// ==========================================================================
function getVarLetter(index) {
    let letter = '';
    let temp = index;
    while (temp > 0) {
        temp--;
        letter = String.fromCharCode(65 + (temp % 26)) + letter;
        temp = Math.floor(temp / 26);
    }
    return letter;
}

function getIndexFromVar(name) {
    if (!name) return -1;
    const clean = name.trim().toUpperCase();
    let idx = 0;
    for (let i = 0; i < clean.length; i++) {
        const code = clean.charCodeAt(i);
        if (code < 65 || code > 90) return -1;
        idx = idx * 26 + (code - 65 + 1);
    }
    return idx;
}

// ==========================================================================
// Base Conversion & Numeric Formatting Helpers
// ==========================================================================

// Validate input characters against the selected base
function isValidNumber(value, base) {
    if (!value) return false;
    const cleanVal = value.startsWith('-') ? value.slice(1) : value;
    if (!cleanVal) return false;

    const regexMap = {
        '2': /^[01]+$/,
        '8': /^[0-7]+$/,
        '10': /^[0-9]+$/,
        '16': /^[0-9A-Fa-f]+$/
    };

    return regexMap[base] ? regexMap[base].test(cleanVal) : false;
}

// Convert integer string from a given base into standard decimal integer
function parseToDecimal(valueStr, base) {
    const isNeg = valueStr.startsWith('-');
    const cleanStr = isNeg ? valueStr.slice(1) : valueStr;
    const decimal = parseInt(cleanStr, parseInt(base, 10));
    return isNeg ? -decimal : decimal;
}

// Format a decimal number into target base string with fractional precision
function formatBase(num, base, precision = 6) {
    if (isNaN(num)) return 'NaN';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const intPart = Math.floor(absNum);
    let fracPart = absNum - intPart;

    let intStr = intPart.toString(base).toUpperCase();
    if (fracPart === 0 || precision <= 0) {
        return (isNegative ? '-' : '') + intStr;
    }

    let fracStr = '';
    let count = 0;
    while (fracPart > 0 && count < precision) {
        fracPart *= base;
        const digit = Math.floor(fracPart);
        fracStr += digit.toString(base).toUpperCase();
        fracPart -= digit;
        count++;
    }

    // Trim trailing zeroes if fractional part ended cleanly
    fracStr = fracStr.replace(/0+$/, '');
    if (!fracStr) {
        return (isNegative ? '-' : '') + intStr;
    }

    return (isNegative ? '-' : '') + intStr + '.' + fracStr;
}

// Return human-readable allowed characters for validation error message
function getAllowedChars(base) {
    switch (base) {
        case '2': return '0, 1';
        case '8': return '0 through 7';
        case '10': return '0 through 9';
        case '16': return '0-9, A-F (case-insensitive)';
        default: return '';
    }
}

// ==========================================================================
// DOM Generation for Input Rows & Virtual Keypad
// ==========================================================================

// Create DOM structure for a single input row
function createInputRow(index) {
    const varName = getVarLetter(index);
    const row = document.createElement('div');
    row.className = 'input-row';
    row.id = `row-${index}`;

    row.innerHTML = `
        <div class="row-header">
            <div class="row-header-title">
                <span class="var-badge" id="vbadge-${index}">Variable ${varName}</span>
                <h3>Input Number ${index}</h3>
            </div>
            <div class="row-indicators-group">
                <span class="row-indicator" id="ind-${index}">Base 10</span>
            </div>
        </div>

        <div class="form-group">
            <div class="select-wrapper">
                <label for="base-${index}" class="sr-only">Base for Variable ${varName}</label>
                <select class="base-selector" id="base-${index}" data-row="${index}">
                    <option value="2">Binary (Base 2)</option>
                    <option value="8">Octal (Base 8)</option>
                    <option value="10" selected>Decimal (Base 10)</option>
                    <option value="16">Hexadecimal (Base 16)</option>
                </select>
            </div>

            <div class="input-wrapper flex-grow">
                <label for="val-${index}" class="sr-only">Value for Variable ${varName}</label>
                <input type="text" class="value-input" id="val-${index}" placeholder="Enter valid digits for selected base..." spellcheck="false" autocomplete="off">
            </div>
        </div>

        <div class="error-message" id="err-${index}">Invalid digits for the selected base.</div>

        <!-- Per-Input 4-Base Conversion Result Grid -->
        <div class="conversion-matrix">
            <div class="matrix-title">Individual Conversion (All Bases)</div>
            <div class="matrix-grid">
                <div class="matrix-cell">
                    <span class="matrix-base">BIN (2)</span>
                    <span class="matrix-value" id="conv-bin-${index}">-</span>
                </div>
                <div class="matrix-cell">
                    <span class="matrix-base">OCT (8)</span>
                    <span class="matrix-value" id="conv-oct-${index}">-</span>
                </div>
                <div class="matrix-cell">
                    <span class="matrix-base">DEC (10)</span>
                    <span class="matrix-value" id="conv-dec-${index}">-</span>
                </div>
                <div class="matrix-cell">
                    <span class="matrix-base">HEX (16)</span>
                    <span class="matrix-value" id="conv-hex-${index}">-</span>
                </div>
            </div>
        </div>
    `;

    // Listen to base selector changes
    const selectEl = row.querySelector(`#base-${index}`);
    const indEl = row.querySelector(`#ind-${index}`);
    selectEl.addEventListener('change', (e) => {
        const baseName = e.target.options[e.target.selectedIndex].text.split(' ')[0];
        indEl.innerText = `${baseName} (Base ${e.target.value})`;
        validateRow(index);
    });

    // Listen to value input changes for live validation and individual conversion
    const inputEl = row.querySelector(`#val-${index}`);
    inputEl.addEventListener('input', () => {
        validateRow(index);
    });

    return row;
}

// Update the dynamic variable buttons in the virtual keypad
function updateVarKeypad(count) {
    if (!varKeysContainer) return;
    varKeysContainer.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const v = getVarLetter(i);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'key-btn var-key';
        btn.setAttribute('data-insert', v);
        btn.innerText = v;
        btn.title = `Insert Variable ${v} (Input ${i})`;
        btn.addEventListener('click', () => {
            insertAtCursor(exprInput, v);
        });
        varKeysContainer.appendChild(btn);
    }
}

// Render dynamic rows according to input count (Min 3), preserving existing values
function renderInputs(count = null) {
    if (count === null) {
        count = parseInt(numInputsEl.value, 10);
    }

    if (count < 3 || isNaN(count)) {
        count = 3;
        numInputsEl.value = 3;
    }

    // Capture existing input data so user work isn't lost on count adjustment
    const existingData = [];
    const currentRows = inputsContainer.querySelectorAll('.input-row');
    currentRows.forEach((row, i) => {
        const idx = i + 1;
        const baseEl = document.getElementById(`base-${idx}`);
        const valEl = document.getElementById(`val-${idx}`);
        if (baseEl && valEl) {
            existingData.push({ base: baseEl.value, val: valEl.value });
        }
    });

    inputsContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        inputsContainer.appendChild(createInputRow(i));

        // Restore previous data if available
        if (existingData[i - 1]) {
            const selectEl = document.getElementById(`base-${i}`);
            const inputEl = document.getElementById(`val-${i}`);
            const indEl = document.getElementById(`ind-${i}`);
            selectEl.value = existingData[i - 1].base;
            inputEl.value = existingData[i - 1].val;
            const baseName = selectEl.options[selectEl.selectedIndex].text.split(' ')[0];
            indEl.innerText = `${baseName} (Base ${existingData[i - 1].base})`;
            validateRow(i);
        }
    }

    // Update the keypad with active variable keys
    updateVarKeypad(count);

    // If expression input is empty, generate an appropriate default
    if (!exprInput.value.trim()) {
        setDefaultExpressionForCount(count);
    }

    // Hide previous results and errors when regenerating
    resultsSection.style.display = 'none';
    hideErrorBanner();
}

// Generate sensible default expression based on count
function setDefaultExpressionForCount(count) {
    if (count === 3) {
        exprInput.value = '(A + B) * C';
    } else if (count >= 4) {
        exprInput.value = '(A + B - C) * D';
    } else {
        exprInput.value = 'A + B';
    }
}

// Validate a single row and clear/show error styles
function validateRow(index) {
    const baseEl = document.getElementById(`base-${index}`);
    const inputField = document.getElementById(`val-${index}`);
    const errorMsg = document.getElementById(`err-${index}`);
    if (!baseEl || !inputField || !errorMsg) return false;

    const base = baseEl.value;
    const val = inputField.value.trim();

    if (!val) {
        inputField.classList.remove('error');
        errorMsg.style.display = 'none';
        clearRowConversions(index);
        return false;
    }

    if (!isValidNumber(val, base)) {
        inputField.classList.add('error');
        errorMsg.innerText = `Invalid character for Base ${base}. Allowed: ${getAllowedChars(base)}`;
        errorMsg.style.display = 'block';
        clearRowConversions(index);
        return false;
    }

    inputField.classList.remove('error');
    errorMsg.style.display = 'none';

    // Valid: calculate and display individual row multi-base matrix
    const decVal = parseToDecimal(val, base);
    displayRowConversions(index, decVal);
    return true;
}

// Clear individual conversion row values
function clearRowConversions(index) {
    const binEl = document.getElementById(`conv-bin-${index}`);
    const octEl = document.getElementById(`conv-oct-${index}`);
    const decEl = document.getElementById(`conv-dec-${index}`);
    const hexEl = document.getElementById(`conv-hex-${index}`);
    if (binEl) binEl.innerText = '-';
    if (octEl) octEl.innerText = '-';
    if (decEl) decEl.innerText = '-';
    if (hexEl) hexEl.innerText = '-';
}

// Display converted values for a single row
function displayRowConversions(index, decVal) {
    const binEl = document.getElementById(`conv-bin-${index}`);
    const octEl = document.getElementById(`conv-oct-${index}`);
    const decEl = document.getElementById(`conv-dec-${index}`);
    const hexEl = document.getElementById(`conv-hex-${index}`);
    if (binEl) binEl.innerText = formatBase(decVal, 2, 0);
    if (octEl) octEl.innerText = formatBase(decVal, 8, 0);
    if (decEl) decEl.innerText = decVal.toString(10);
    if (hexEl) hexEl.innerText = formatBase(decVal, 16, 0);
}

// ==========================================================================
// Expression Input Helpers & Keypad Handlers
// ==========================================================================

function insertAtCursor(inputEl, text) {
    const start = inputEl.selectionStart || inputEl.value.length;
    const end = inputEl.selectionEnd || inputEl.value.length;
    const before = inputEl.value.substring(0, start);
    const after = inputEl.value.substring(end);

    inputEl.value = before + text + after;
    const newPos = start + text.length;
    inputEl.focus();
    inputEl.setSelectionRange(newPos, newPos);

    inputEl.classList.remove('error');
    hideErrorBanner();
}

function handleBackspace(inputEl) {
    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;

    if (start === end) {
        if (start === 0) return;
        inputEl.value = inputEl.value.substring(0, start - 1) + inputEl.value.substring(end);
        inputEl.focus();
        inputEl.setSelectionRange(start - 1, start - 1);
    } else {
        inputEl.value = inputEl.value.substring(0, start) + inputEl.value.substring(end);
        inputEl.focus();
        inputEl.setSelectionRange(start, start);
    }
}

// Clear expression button
if (clearExprBtn) {
    clearExprBtn.addEventListener('click', () => {
        exprInput.value = '';
        exprInput.focus();
        hideErrorBanner();
    });
}

// Backspace button
if (backspaceBtn) {
    backspaceBtn.addEventListener('click', () => {
        handleBackspace(exprInput);
    });
}

// Operator and grouping buttons
document.querySelectorAll('.key-btn[data-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-insert');
        if (text) {
            insertAtCursor(exprInput, text);
        }
    });
});

// Preset expression chips
exprPresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const expr = chip.getAttribute('data-expr');
        if (expr) {
            exprInput.value = expr;
            exprInput.classList.remove('error');
            hideErrorBanner();

            exprPresetChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            processCalculation();
        }
    });
});

// Step-by-Step accordion toggle
if (stepsToggle && stepsContent) {
    stepsToggle.addEventListener('click', () => {
        const isHidden = stepsContent.style.display === 'none';
        stepsContent.style.display = isHidden ? 'block' : 'none';
        if (stepsChevron) {
            stepsChevron.innerText = isHidden ? '▼' : '▶';
        }
    });
}

// Global Error Banner Helpers
function showErrorBanner(title, message) {
    if (!globalErrorBanner) return;
    errorBannerTitle.innerText = title;
    errorBannerDesc.innerText = message;
    globalErrorBanner.style.display = 'flex';
    globalErrorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideErrorBanner() {
    if (globalErrorBanner) {
        globalErrorBanner.style.display = 'none';
    }
}

if (errorBannerClose) {
    errorBannerClose.addEventListener('click', () => {
        hideErrorBanner();
    });
}

// ==========================================================================
// Advanced Mathematical Expression Parser & Evaluator Engine
// Dijkstra Shunting-yard Algorithm, RPN, Precedence, Associativity, AST & Steps
// ==========================================================================

const PRECEDENCE = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'NEG': 3 // Unary minus
};

const ASSOCIATIVITY = {
    '+': 'L',
    '-': 'L',
    '*': 'L',
    '/': 'L',
    'NEG': 'R'
};

// Custom Error Classes
class SyntaxErrorMsg extends Error {
    constructor(message) {
        super(message);
        this.name = 'SyntaxError';
    }
}

class MathErrorMsg extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'MathError';
        this.details = details;
    }
}

// Tokenizer: converts raw expression string into an array of typed tokens
function tokenize(exprStr) {
    if (!exprStr || !exprStr.trim()) {
        throw new SyntaxErrorMsg('Expression is empty. Please enter an expression to calculate.');
    }

    // Normalize Unicode math characters to standard ASCII operators
    let clean = exprStr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

    const tokens = [];
    let i = 0;
    const len = clean.length;

    while (i < len) {
        const ch = clean[i];

        // Skip whitespace
        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        // Numeric Literals (e.g. 42, 3.14)
        if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < len && /[0-9]/.test(clean[i + 1]))) {
            let numStr = '';
            let dotCount = 0;
            while (i < len && (/[0-9]/.test(clean[i]) || clean[i] === '.')) {
                if (clean[i] === '.') {
                    dotCount++;
                    if (dotCount > 1) {
                        throw new SyntaxErrorMsg(`Malformed number with multiple decimal points at position ${i + 1}.`);
                    }
                }
                numStr += clean[i];
                i++;
            }

            // Check for implicit multiplication with previous token
            checkImplicitMultiplication(tokens, 'NUMBER');
            tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
            continue;
        }

        // Variables (e.g. A, B, C, a, b, c)
        if (/[a-zA-Z]/.test(ch)) {
            let varStr = '';
            while (i < len && /[a-zA-Z0-9]/.test(clean[i])) {
                varStr += clean[i];
                i++;
            }
            const upperVar = varStr.toUpperCase();

            // Check for implicit multiplication with previous token
            checkImplicitMultiplication(tokens, 'VARIABLE');
            tokens.push({ type: 'VARIABLE', value: upperVar });
            continue;
        }

        // Parentheses
        if (ch === '(') {
            checkImplicitMultiplication(tokens, 'LPAREN');
            tokens.push({ type: 'LPAREN', value: '(' });
            i++;
            continue;
        }

        if (ch === ')') {
            tokens.push({ type: 'RPAREN', value: ')' });
            i++;
            continue;
        }

        // Operators (+, -, *, /)
        if (['+', '-', '*', '/'].includes(ch)) {
            const prevToken = tokens[tokens.length - 1];
            const isUnary = !prevToken || prevToken.type === 'OPERATOR' || prevToken.type === 'LPAREN';

            if (ch === '-') {
                if (isUnary) {
                    tokens.push({ type: 'OPERATOR', value: 'NEG' });
                } else {
                    tokens.push({ type: 'OPERATOR', value: '-' });
                }
            } else if (ch === '+') {
                if (!isUnary) {
                    tokens.push({ type: 'OPERATOR', value: '+' });
                }
                // Unary '+' is a no-op, ignore
            } else {
                if (isUnary) {
                    throw new SyntaxErrorMsg(`Unexpected operator '${OP_DISPLAY[ch] || ch}' at position ${i + 1}. Operator is missing a left operand.`);
                }
                tokens.push({ type: 'OPERATOR', value: ch });
            }
            i++;
            continue;
        }

        // Unrecognized character
        throw new SyntaxErrorMsg(`Unrecognized character '${ch}' at position ${i + 1}. Allowed: letters (A-Z), digits (0-9), operators (+, −, ×, ÷), and parentheses ( ).`);
    }

    // Trailing operator check
    const last = tokens[tokens.length - 1];
    if (last && (last.type === 'OPERATOR')) {
        throw new SyntaxErrorMsg(`Expression cannot end with an operator '${OP_DISPLAY[last.value] || last.value}'. Missing right operand.`);
    }

    return tokens;
}

// Automatically insert multiplication operator for implicit multiplication e.g. (A+B)(C+D) or 2A or (A+B)D
function checkImplicitMultiplication(tokens, currentType) {
    if (tokens.length === 0) return;
    const prev = tokens[tokens.length - 1];

    if (
        (prev.type === 'NUMBER' || prev.type === 'VARIABLE' || prev.type === 'RPAREN') &&
        (currentType === 'VARIABLE' || currentType === 'LPAREN')
    ) {
        tokens.push({ type: 'OPERATOR', value: '*' });
    }
}

// Parser: Dijkstra Shunting-yard Algorithm (Infix to Reverse Polish Notation / Postfix)
function parseToRPN(tokens) {
    const outputQueue = [];
    const opStack = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'NUMBER' || token.type === 'VARIABLE') {
            outputQueue.push(token);
        } else if (token.type === 'OPERATOR') {
            const op1 = token.value;
            const p1 = PRECEDENCE[op1];
            const assoc1 = ASSOCIATIVITY[op1];

            while (opStack.length > 0) {
                const top = opStack[opStack.length - 1];
                if (top.type === 'LPAREN') break;

                const p2 = PRECEDENCE[top.value];
                if ((assoc1 === 'L' && p1 <= p2) || (assoc1 === 'R' && p1 < p2)) {
                    outputQueue.push(opStack.pop());
                } else {
                    break;
                }
            }
            opStack.push(token);
        } else if (token.type === 'LPAREN') {
            // Check for empty parentheses ()
            if (i + 1 < tokens.length && tokens[i + 1].type === 'RPAREN') {
                throw new SyntaxErrorMsg('Empty parentheses "()" found in expression. Please provide an operand inside.');
            }
            opStack.push(token);
        } else if (token.type === 'RPAREN') {
            let foundMatch = false;
            while (opStack.length > 0) {
                const top = opStack.pop();
                if (top.type === 'LPAREN') {
                    foundMatch = true;
                    break;
                }
                outputQueue.push(top);
            }
            if (!foundMatch) {
                throw new SyntaxErrorMsg('Mismatched parentheses: Found closing ")" without a corresponding opening "(".');
            }
        }
    }

    while (opStack.length > 0) {
        const top = opStack.pop();
        if (top.type === 'LPAREN') {
            throw new SyntaxErrorMsg('Mismatched parentheses: Unclosed "(" detected. Missing closing ")".');
        }
        outputQueue.push(top);
    }

    return outputQueue;
}

// Construct an Abstract Syntax Tree (AST) from RPN Tokens
function buildAST(rpnTokens, variableMap) {
    const stack = [];

    for (const token of rpnTokens) {
        if (token.type === 'NUMBER') {
            stack.push({
                type: 'NUM',
                value: token.value,
                displayDec: `${token.value}`
            });
        } else if (token.type === 'VARIABLE') {
            const varInfo = variableMap[token.value];
            if (!varInfo) {
                throw new SyntaxErrorMsg(`Variable '${token.value}' is referenced in expression, but no input is assigned to it.`);
            }
            stack.push({
                type: 'VAR',
                name: token.value,
                value: varInfo.decVal,
                base: varInfo.base,
                rawVal: varInfo.rawVal,
                subscript: BASE_SUBSCRIPTS[varInfo.base] || `(${varInfo.base})`
            });
        } else if (token.type === 'OPERATOR') {
            if (token.value === 'NEG') {
                if (stack.length < 1) {
                    throw new SyntaxErrorMsg('Malformed expression: Unary negation missing operand.');
                }
                const child = stack.pop();
                stack.push({
                    type: 'UNARY',
                    op: 'NEG',
                    child
                });
            } else {
                if (stack.length < 2) {
                    throw new SyntaxErrorMsg(`Malformed expression: Operator '${OP_DISPLAY[token.value] || token.value}' missing operands.`);
                }
                const right = stack.pop();
                const left = stack.pop();
                stack.push({
                    type: 'BINARY',
                    op: token.value,
                    left,
                    right
                });
            }
        }
    }

    if (stack.length !== 1) {
        throw new SyntaxErrorMsg('Malformed expression: Incomplete calculation or extra operands provided.');
    }

    return stack[0];
}

// Convert an AST node to a formatted string based on display mode:
// mode: 'VAR' (variable letters), 'BASE' (subscripted base numbers), 'DEC' (decimal numbers)
function nodeToString(node, mode = 'VAR', parentPrecedence = 0) {
    if (!node) return '';

    if (node.type === 'NUM') {
        const rounded = Math.round(node.value * 1000000) / 1000000;
        return rounded < 0 ? `(${rounded})` : `${rounded}`;
    }

    if (node.type === 'VAR') {
        if (mode === 'VAR') return node.name;
        if (mode === 'BASE') return `${node.rawVal.toUpperCase()}${node.subscript}`;
        return node.value < 0 ? `(${node.value})` : `${node.value}`;
    }

    if (node.type === 'UNARY') {
        const childStr = nodeToString(node.child, mode, PRECEDENCE['NEG']);
        return `−${childStr}`;
    }

    if (node.type === 'BINARY') {
        const myPrecedence = PRECEDENCE[node.op] || 0;
        const opSymbol = OP_DISPLAY[node.op] || node.op;

        const leftStr = nodeToString(node.left, mode, myPrecedence);
        // If right child has equal precedence and left-associative, parenthesize right child (e.g. A - (B - C))
        const rightPrecThreshold = ASSOCIATIVITY[node.op] === 'L' ? myPrecedence + 0.1 : myPrecedence;
        const rightStr = nodeToString(node.right, mode, rightPrecThreshold);

        const result = `${leftStr} ${opSymbol} ${rightStr}`;
        if (myPrecedence < parentPrecedence) {
            return `(${result})`;
        }
        return result;
    }

    return '';
}

// Clone AST node deeply
function cloneNode(node) {
    if (!node) return null;
    if (node.type === 'NUM' || node.type === 'VAR') {
        return { ...node };
    }
    if (node.type === 'UNARY') {
        return {
            type: 'UNARY',
            op: node.op,
            child: cloneNode(node.child)
        };
    }
    if (node.type === 'BINARY') {
        return {
            type: 'BINARY',
            op: node.op,
            left: cloneNode(node.left),
            right: cloneNode(node.right)
        };
    }
    return null;
}

// Check if a node is fully evaluated to a constant number
function isResolved(node) {
    return node && (node.type === 'NUM' || node.type === 'VAR');
}

function getNodeValue(node) {
    return node.value;
}

// Step-by-Step Evaluator: performs bottom-up reduction recording every intermediate step
function evaluateWithSteps(rootNode) {
    const steps = [];
    let activeTree = cloneNode(rootNode);

    // Initial formula display
    const varFormula = nodeToString(rootNode, 'VAR');
    const baseFormula = nodeToString(rootNode, 'BASE');
    const decFormulaInitial = nodeToString(rootNode, 'DEC');

    steps.push({
        stepNum: 1,
        expr: decFormulaInitial,
        action: 'Initial Decimal Substitution'
    });

    let currentStep = 1;
    const maxSteps = 50; // Safeguard against infinite loops

    while (!isResolved(activeTree) && currentStep < maxSteps) {
        let reduced = false;
        let stepAction = '';

        // Helper recursive function to find and compute the deepest reducible operation
        function reduceStep(node) {
            if (!node || isResolved(node) || reduced) return node;

            // Check unary node
            if (node.type === 'UNARY') {
                if (!isResolved(node.child)) {
                    node.child = reduceStep(node.child);
                    if (reduced) return node;
                }

                if (isResolved(node.child)) {
                    const val = -getNodeValue(node.child);
                    reduced = true;
                    currentStep++;
                    stepAction = `Evaluate negation: −(${getNodeValue(node.child)}) = ${val}`;
                    return { type: 'NUM', value: val };
                }
                return node;
            }

            // Check binary node
            if (node.type === 'BINARY') {
                // If left is not resolved, try to reduce left first
                if (!isResolved(node.left)) {
                    node.left = reduceStep(node.left);
                    if (reduced) return node;
                }

                // If right is not resolved, try to reduce right
                if (!isResolved(node.right)) {
                    node.right = reduceStep(node.right);
                    if (reduced) return node;
                }

                // If both left and right are resolved, evaluate this binary operation
                if (isResolved(node.left) && isResolved(node.right)) {
                    const lVal = getNodeValue(node.left);
                    const rVal = getNodeValue(node.right);
                    let res = 0;
                    const opSym = OP_DISPLAY[node.op] || node.op;

                    switch (node.op) {
                        case '+':
                            res = lVal + rVal;
                            break;
                        case '-':
                            res = lVal - rVal;
                            break;
                        case '*':
                            res = lVal * rVal;
                            break;
                        case '/':
                            if (Math.abs(rVal) === 0) {
                                throw new MathErrorMsg(`Division by zero is undefined (${lVal} ÷ 0).`, {
                                    op: '/',
                                    left: lVal,
                                    right: rVal
                                });
                            }
                            res = lVal / rVal;
                            break;
                        default:
                            throw new MathErrorMsg(`Unsupported operator '${node.op}'.`);
                    }

                    if (isNaN(res) || !isFinite(res)) {
                        throw new MathErrorMsg(`Numerical error: Operation ${lVal} ${opSym} ${rVal} resulted in undefined or infinite value.`);
                    }

                    reduced = true;
                    currentStep++;
                    const roundedRes = Math.round(res * 1000000) / 1000000;
                    stepAction = `Evaluate ${lVal} ${opSym} ${rVal} = ${roundedRes}`;
                    return { type: 'NUM', value: res };
                }
            }

            return node;
        }

        activeTree = reduceStep(activeTree);

        if (reduced) {
            steps.push({
                stepNum: currentStep,
                expr: nodeToString(activeTree, 'DEC'),
                action: stepAction
            });
        } else {
            break;
        }
    }

    const finalResult = getNodeValue(activeTree);

    return {
        result: finalResult,
        varFormula,
        baseFormula,
        decFormula: decFormulaInitial,
        steps
    };
}

// ==========================================================================
// Main Calculation & Error Handling Orchestrator
// ==========================================================================

function processCalculation() {
    hideErrorBanner();
    exprInput.classList.remove('error');

    // Remove previous error styles on tiles
    resultTiles.forEach(tile => tile.classList.remove('error'));

    const rows = inputsContainer.querySelectorAll('.input-row');
    const count = rows.length;
    let allValid = true;
    const variableMap = {};

    // ----------------------------------------------------------------------
    // Phase 1: Validate individual inputs and build variable dictionary
    // ----------------------------------------------------------------------
    for (let i = 1; i <= count; i++) {
        const varLetter = getVarLetter(i);
        const baseEl = document.getElementById(`base-${i}`);
        const inputField = document.getElementById(`val-${i}`);
        const errorMsg = document.getElementById(`err-${i}`);
        const rawVal = inputField.value.trim();

        if (!rawVal) {
            inputField.classList.add('error');
            errorMsg.innerText = `Input for Variable ${varLetter} cannot be empty.`;
            errorMsg.style.display = 'block';
            clearRowConversions(i);
            allValid = false;
            continue;
        }

        const base = baseEl.value;
        if (!isValidNumber(rawVal, base)) {
            inputField.classList.add('error');
            errorMsg.innerText = `Invalid character for Base ${base}. Allowed: ${getAllowedChars(base)}`;
            errorMsg.style.display = 'block';
            clearRowConversions(i);
            allValid = false;
            continue;
        }

        inputField.classList.remove('error');
        errorMsg.style.display = 'none';

        const decVal = parseToDecimal(rawVal, base);
        displayRowConversions(i, decVal);

        variableMap[varLetter] = {
            index: i,
            base,
            rawVal,
            decVal
        };
    }

    // ----------------------------------------------------------------------
    // Phase 2: Parse and Tokenize Expression
    // ----------------------------------------------------------------------
    const expressionString = exprInput.value.trim();
    if (!expressionString) {
        exprInput.classList.add('error');
        showErrorBanner('Missing Expression', 'Please enter an algebraic expression to evaluate.');
        resultsSection.style.display = 'none';
        return;
    }

    let tokens = [];
    let rpn = [];
    let ast = null;

    try {
        tokens = tokenize(expressionString);

        // Verify that all variables referenced in the expression are defined
        for (const token of tokens) {
            if (token.type === 'VARIABLE') {
                const varIndex = getIndexFromVar(token.value);
                if (varIndex < 1 || varIndex > count) {
                    const maxVar = getVarLetter(count);
                    throw new SyntaxErrorMsg(`Variable '${token.value}' is not defined. Currently only variables A through ${maxVar} are available (Total inputs: ${count}). Please update the expression or add more input fields.`);
                }
                if (!variableMap[token.value]) {
                    throw new SyntaxErrorMsg(`Input value for Variable ${token.value} has not been provided.`);
                }
            }
        }

        if (!allValid) {
            showErrorBanner('Invalid Input Digits', 'Please correct the invalid or empty input fields highlighted above.');
            resultsSection.style.display = 'none';
            return;
        }

        // Convert tokens to Reverse Polish Notation (Shunting-yard algorithm)
        rpn = parseToRPN(tokens);

        // Build AST
        ast = buildAST(rpn, variableMap);

    } catch (err) {
        exprInput.classList.add('error');
        showErrorBanner('Syntax Error in Expression', err.message);
        resultsSection.style.display = 'none';
        return;
    }

    // ----------------------------------------------------------------------
    // Phase 3: Evaluate Expression with Precedence, Associativity & Steps
    // ----------------------------------------------------------------------
    let evalOutput = null;
    let arithmeticError = null;

    try {
        evalOutput = evaluateWithSteps(ast);
    } catch (err) {
        if (err.name === 'MathError') {
            arithmeticError = err;
        } else {
            exprInput.classList.add('error');
            showErrorBanner('Evaluation Error', err.message);
            resultsSection.style.display = 'none';
            return;
        }
    }

    // ----------------------------------------------------------------------
    // Phase 4: Render Expression Results & Multi-Base Outputs
    // ----------------------------------------------------------------------
    resultsSection.style.display = 'block';

    const varFormulaStr = nodeToString(ast, 'VAR');
    const baseFormulaStr = nodeToString(ast, 'BASE');
    const decFormulaStr = nodeToString(ast, 'DEC');

    expressionDisplay.innerText = varFormulaStr;
    multiBaseFormula.innerText = baseFormulaStr;

    if (arithmeticError) {
        // Render Arithmetic Error State (e.g. Division by Zero)
        evalStatusPill.className = 'status-pill error';
        evalStatusPill.innerText = 'Arithmetic Error';

        decimalFormula.innerText = `${decFormulaStr} = Undefined (${arithmeticError.message})`;
        showErrorBanner('Arithmetic Error: Undefined Calculation', arithmeticError.message);

        // Step list
        stepsCount.innerText = 'Evaluation Halted';
        stepsList.innerHTML = `
            <li class="step-item" style="border-left-color: var(--error);">
                <span class="step-num">Step 1</span>
                <span class="step-expr">${decFormulaStr}</span>
                <span class="step-badge" style="color: var(--error); background: var(--error-bg);">Halted at ${arithmeticError.message}</span>
            </li>
        `;
        stepsContent.style.display = 'block';
        if (stepsChevron) stepsChevron.innerText = '▼';

        // Result Tiles
        resultTiles.forEach(tile => tile.classList.add('error'));
        finalBinEl.innerText = 'Undefined (Div by 0)';
        finalOctEl.innerText = 'Undefined (Div by 0)';
        finalDecEl.innerText = 'Undefined (Div by 0)';
        finalHexEl.innerText = 'Undefined (Div by 0)';

    } else {
        // Render Successful Calculation
        evalStatusPill.className = 'status-pill success';
        evalStatusPill.innerText = 'Evaluation Complete';

        const computedValue = evalOutput.result;
        decimalFormula.innerText = `${decFormulaStr} = ${computedValue}`;

        // Populate Step-by-Step Breakdown
        stepsCount.innerText = `${evalOutput.steps.length} Steps`;
        stepsList.innerHTML = '';
        evalOutput.steps.forEach((step, idx) => {
            const li = document.createElement('li');
            li.className = 'step-item';
            li.innerHTML = `
                <span class="step-num">Step ${idx + 1}</span>
                <span class="step-expr">${step.expr}</span>
                <span class="step-badge">${step.action}</span>
            `;
            stepsList.appendChild(li);
        });

        stepsContent.style.display = 'block';
        if (stepsChevron) stepsChevron.innerText = '▼';

        // Final Multi-Base Conversions
        finalBinEl.innerText = formatBase(computedValue, 2, 6);
        finalOctEl.innerText = formatBase(computedValue, 8, 6);
        finalDecEl.innerText = formatBase(computedValue, 10, 6);
        finalHexEl.innerText = formatBase(computedValue, 16, 6);
    }

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==========================================================================
// Preset Test Cases (Matching Specifications & User Prompt)
// ==========================================================================
const PRESETS = {
    '1': {
        name: 'BIN + OCT + DEC',
        expr: '(A + B) * C',
        data: [
            { base: '2', val: '1010' }, // A = 10
            { base: '8', val: '12' },   // B = 10
            { base: '10', val: '5' }    // C = 5
        ]
    },
    '2': {
        name: 'BIN + DEC + HEX',
        expr: '(A + B) - C',
        data: [
            { base: '2', val: '1111' }, // A = 15
            { base: '10', val: '20' },  // B = 20
            { base: '16', val: 'A' }    // C = 10
        ]
    },
    '3': {
        name: 'OCT + DEC + HEX',
        expr: '(A - B) / C',
        data: [
            { base: '8', val: '30' },   // A = 24
            { base: '10', val: '16' },  // B = 16
            { base: '16', val: '4' }    // C = 4
        ]
    },
    '4': {
        name: 'BIN + OCT + HEX',
        expr: '(A * B) / C',
        data: [
            { base: '2', val: '1100' }, // A = 12
            { base: '8', val: '10' },   // B = 8
            { base: '16', val: '2' }    // C = 2
        ]
    },
    '5': {
        // Preset 5: All 4 Bases with expression (A + B - C) * D directly matching prompt!
        name: 'BIN + OCT + DEC + HEX',
        expr: '(A + B - C) * D',
        data: [
            { base: '2', val: '1010' }, // A = 10
            { base: '8', val: '12' },   // B = 10
            { base: '10', val: '25' },  // C = 25
            { base: '16', val: '1F' }   // D = 31
        ]
    }
};

function loadPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    numInputsEl.value = preset.data.length;
    renderInputs(preset.data.length);

    preset.data.forEach((item, index) => {
        const rowNum = index + 1;
        const selectEl = document.getElementById(`base-${rowNum}`);
        const inputEl = document.getElementById(`val-${rowNum}`);
        const indEl = document.getElementById(`ind-${rowNum}`);

        if (selectEl && inputEl) {
            selectEl.value = item.base;
            inputEl.value = item.val;
            const baseName = selectEl.options[selectEl.selectedIndex].text.split(' ')[0];
            indEl.innerText = `${baseName} (Base ${item.base})`;
            validateRow(rowNum);
        }
    });

    exprInput.value = preset.expr;

    // Highlight corresponding expression preset chip if match exists
    exprPresetChips.forEach(chip => {
        if (chip.getAttribute('data-expr') === preset.expr) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    processCalculation();
}

presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const presetId = btn.dataset.preset;
        loadPreset(presetId);
    });
});

// Primary Button Event Listeners
if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        renderInputs();
    });
}

if (processBtn) {
    processBtn.addEventListener('click', () => {
        processCalculation();
    });
}

// Initialize on Page Load if calculator DOM is present
if (document.getElementById('num-inputs')) {
    renderInputs(3);
    loadPreset('5'); // Default to Preset 5 which directly demonstrates (a+b-c)*d
}

// ==========================================================================
// COMPLEMENT COMPUTATION ENGINE
// Supports (r-1)'s (Diminished Radix) and r's (Radix) Complements
// for Binary (base 2), Octal (base 8), Decimal (base 10), Hex (base 16)
// ==========================================================================

// Human-readable complement names
const COMPLEMENT_NAMES = {
    '2':  { diminished: "1's Complement", radix: "2's Complement" },
    '8':  { diminished: "7's Complement", radix: "8's Complement" },
    '10': { diminished: "9's Complement", radix: "10's Complement" },
    '16': { diminished: "15's Complement", radix: "16's Complement" }
};

// Digit character to integer value
function digitToInt(ch) {
    const code = ch.toUpperCase().charCodeAt(0);
    if (code >= 48 && code <= 57) return code - 48;       // '0'-'9'
    if (code >= 65 && code <= 70) return code - 65 + 10;   // 'A'-'F'
    return -1;
}

// Integer value (0-15) to digit character
function intToDigit(val) {
    if (val < 0 || val > 15) return '?';
    return val.toString(16).toUpperCase();
}

// Pad a number string with leading zeros to reach numDigits
function padToWidth(str, numDigits) {
    while (str.length < numDigits) {
        str = '0' + str;
    }
    return str;
}

/**
 * Compute the (r-1)'s complement (Diminished Radix Complement)
 * For each digit d_i, compute (base - 1) - d_i
 * @returns {{ complement: string, steps: Array<{digit: string, maxDigit: string, result: string}> }}
 */
function computeDiminishedRadixComplement(valueStr, base, numDigits) {
    const baseInt = parseInt(base, 10);
    const maxDigitVal = baseInt - 1;
    const maxDigitChar = intToDigit(maxDigitVal);
    const padded = padToWidth(valueStr.toUpperCase(), numDigits);
    const steps = [];
    let complement = '';

    for (let i = 0; i < padded.length; i++) {
        const d = padded[i];
        const dVal = digitToInt(d);
        const compVal = maxDigitVal - dVal;
        const compChar = intToDigit(compVal);
        complement += compChar;
        steps.push({
            position: i,
            digit: d,
            maxDigit: maxDigitChar,
            result: compChar,
            explanation: `${maxDigitChar} − ${d} = ${compChar}`
        });
    }

    return { complement, steps, padded };
}

/**
 * Compute the r's complement (Radix Complement)
 * = (r-1)'s complement + 1
 * @returns {{ complement: string, diminishedComplement: string, diminishedSteps: Array, addOneSteps: Array }}
 */
function computeRadixComplement(valueStr, base, numDigits) {
    const baseInt = parseInt(base, 10);
    const dimResult = computeDiminishedRadixComplement(valueStr, base, numDigits);

    // Add 1 to the diminished radix complement in the given base
    const addResult = addOneInBase(dimResult.complement, baseInt);

    return {
        complement: addResult.result,
        diminishedComplement: dimResult.complement,
        diminishedSteps: dimResult.steps,
        addOneSteps: addResult.steps,
        padded: dimResult.padded,
        overflow: addResult.overflow
    };
}

/**
 * Add 1 to a number string in a given base
 * @returns {{ result: string, steps: Array, overflow: boolean }}
 */
function addOneInBase(valueStr, base) {
    const digits = valueStr.split('');
    const steps = [];
    let carry = 1;

    for (let i = digits.length - 1; i >= 0 && carry > 0; i--) {
        const dVal = digitToInt(digits[i]);
        const sum = dVal + carry;
        const newDigit = sum % base;
        carry = Math.floor(sum / base);
        steps.push({
            position: i,
            originalDigit: digits[i],
            addedValue: (i === digits.length - 1) ? '1' : 'carry',
            sum: sum,
            newDigit: intToDigit(newDigit),
            carry: carry
        });
        digits[i] = intToDigit(newDigit);
    }

    return {
        result: digits.join(''),
        steps,
        overflow: carry > 0
    };
}

/**
 * Add two number strings in a given base, digit by digit
 * Both must be padded to the same width
 * @returns {{ result: string, carry: number, steps: Array }}
 */
function addInBase(aStr, bStr, base, numDigits) {
    const baseInt = parseInt(base, 10);
    const a = padToWidth(aStr.toUpperCase(), numDigits);
    const b = padToWidth(bStr.toUpperCase(), numDigits);
    const steps = [];
    let carry = 0;
    let result = '';

    for (let i = numDigits - 1; i >= 0; i--) {
        const aVal = digitToInt(a[i]);
        const bVal = digitToInt(b[i]);
        const sum = aVal + bVal + carry;
        const digit = sum % baseInt;
        carry = Math.floor(sum / baseInt);
        result = intToDigit(digit) + result;
        steps.unshift({
            position: i,
            digitA: a[i],
            digitB: b[i],
            carryIn: (sum - aVal - bVal) > 0 ? 1 : ((aVal + bVal + (sum - aVal - bVal)) !== sum ? carry : (carry > 0 && i > 0 ? 0 : 0)),
            sum: sum,
            resultDigit: intToDigit(digit),
            carryOut: carry
        });
    }

    // Re-compute steps properly for carry tracking
    const properSteps = [];
    let properCarry = 0;
    for (let i = numDigits - 1; i >= 0; i--) {
        const aVal = digitToInt(a[i]);
        const bVal = digitToInt(b[i]);
        const sum = aVal + bVal + properCarry;
        const digit = sum % baseInt;
        const newCarry = Math.floor(sum / baseInt);
        properSteps.unshift({
            position: i,
            digitA: a[i],
            digitB: b[i],
            carryIn: properCarry,
            sum: sum,
            resultDigit: intToDigit(digit),
            carryOut: newCarry
        });
        properCarry = newCarry;
    }

    return { result, carry: properCarry, steps: properSteps, paddedA: a, paddedB: b };
}

/**
 * Subtraction using (r-1)'s complement (Diminished Radix Complement)
 * A - B using (r-1)'s complement method:
 * 1. Compute (r-1)'s complement of B
 * 2. Add A + complement(B)
 * 3. If carry → end-around carry (add 1 to result), result is positive
 * 4. If no carry → take (r-1)'s complement of sum, result is negative
 */
function subtractUsingDiminishedComplement(minuendStr, subtrahendStr, base, numDigits) {
    const baseInt = parseInt(base, 10);
    const compName = COMPLEMENT_NAMES[base] || { diminished: `${baseInt-1}'s Complement` };
    const steps = [];

    // Step 1: Pad both numbers
    const paddedA = padToWidth(minuendStr.toUpperCase(), numDigits);
    const paddedB = padToWidth(subtrahendStr.toUpperCase(), numDigits);
    steps.push({
        title: 'Pad Numbers',
        detail: `Minuend A = ${paddedA}, Subtrahend B = ${paddedB} (${numDigits}-digit width in Base ${base})`
    });

    // Step 2: Compute (r-1)'s complement of B
    const compB = computeDiminishedRadixComplement(subtrahendStr, base, numDigits);
    steps.push({
        title: `Compute ${compName.diminished} of B`,
        detail: `${compName.diminished} of ${paddedB} = ${compB.complement}`,
        substeps: compB.steps.map(s => s.explanation)
    });

    // Step 3: Add A + complement(B)
    const addResult = addInBase(paddedA, compB.complement, base, numDigits);
    steps.push({
        title: `Add A + ${compName.diminished}(B)`,
        detail: `${paddedA} + ${compB.complement} = ${addResult.carry ? '1' : ''}${addResult.result}`,
        substeps: addResult.steps.map(s =>
            `Position ${s.position}: ${s.digitA} + ${s.digitB}${s.carryIn ? ' + carry(' + s.carryIn + ')' : ''} = ${s.sum} → digit ${s.resultDigit}${s.carryOut ? ', carry ' + s.carryOut : ''}`)
    });

    let finalResult;
    let isNegative;

    if (addResult.carry > 0) {
        // Step 4a: End-around carry — discard carry and add 1
        const endAroundResult = addOneInBase(addResult.result, baseInt);
        finalResult = endAroundResult.result;
        isNegative = false;
        steps.push({
            title: 'End-Around Carry (Carry Detected)',
            detail: `Carry exists → Remove carry and add 1 to result: ${addResult.result} + 1 = ${finalResult}`,
            highlight: 'positive'
        });
    } else {
        // Step 4b: No carry — take complement of sum, result is negative
        const reComp = computeDiminishedRadixComplement(addResult.result, base, numDigits);
        finalResult = reComp.complement;
        isNegative = true;
        steps.push({
            title: 'No Carry (Result is Negative)',
            detail: `No carry → Take ${compName.diminished} of sum: ${compName.diminished}(${addResult.result}) = ${finalResult}, prepend negative sign`,
            highlight: 'negative'
        });
    }

    steps.push({
        title: 'Final Result',
        detail: `${paddedA} − ${paddedB} = ${isNegative ? '−' : ''}${finalResult} (Base ${base})`,
        highlight: isNegative ? 'negative' : 'positive'
    });

    // Convert final to decimal for cross-base display
    const decVal = parseToDecimal(finalResult, base) * (isNegative ? -1 : 1);

    return {
        result: finalResult,
        isNegative,
        steps,
        decimalValue: decVal,
        method: compName.diminished
    };
}

/**
 * Subtraction using r's complement (Radix Complement)
 * A - B using r's complement method:
 * 1. Compute r's complement of B
 * 2. Add A + complement(B)
 * 3. If carry → discard carry, result is positive
 * 4. If no carry → take r's complement of sum, result is negative
 */
function subtractUsingRadixComplement(minuendStr, subtrahendStr, base, numDigits) {
    const baseInt = parseInt(base, 10);
    const compName = COMPLEMENT_NAMES[base] || { radix: `${baseInt}'s Complement` };
    const steps = [];

    // Step 1: Pad both numbers
    const paddedA = padToWidth(minuendStr.toUpperCase(), numDigits);
    const paddedB = padToWidth(subtrahendStr.toUpperCase(), numDigits);
    steps.push({
        title: 'Pad Numbers',
        detail: `Minuend A = ${paddedA}, Subtrahend B = ${paddedB} (${numDigits}-digit width in Base ${base})`
    });

    // Step 2: Compute r's complement of B
    const compB = computeRadixComplement(subtrahendStr, base, numDigits);
    steps.push({
        title: `Compute ${compName.radix} of B`,
        detail: `${compName.diminished || (baseInt-1) + "'s comp"} of ${paddedB} = ${compB.diminishedComplement}, then +1 = ${compB.complement}`,
        substeps: [
            ...compB.diminishedSteps.map(s => s.explanation),
            `${compB.diminishedComplement} + 1 = ${compB.complement}`
        ]
    });

    // Step 3: Add A + complement(B)
    const addResult = addInBase(paddedA, compB.complement, base, numDigits);
    steps.push({
        title: `Add A + ${compName.radix}(B)`,
        detail: `${paddedA} + ${compB.complement} = ${addResult.carry ? '1' : ''}${addResult.result}`,
        substeps: addResult.steps.map(s =>
            `Position ${s.position}: ${s.digitA} + ${s.digitB}${s.carryIn ? ' + carry(' + s.carryIn + ')' : ''} = ${s.sum} → digit ${s.resultDigit}${s.carryOut ? ', carry ' + s.carryOut : ''}`)
    });

    let finalResult;
    let isNegative;

    if (addResult.carry > 0) {
        // Step 4a: Discard carry, result is positive
        finalResult = addResult.result;
        isNegative = false;
        steps.push({
            title: 'Discard Carry (Result is Positive)',
            detail: `Carry exists → Discard carry. Result = ${finalResult}`,
            highlight: 'positive'
        });
    } else {
        // Step 4b: No carry — take r's complement of sum, result is negative
        const reComp = computeRadixComplement(addResult.result, base, numDigits);
        finalResult = reComp.complement;
        isNegative = true;
        steps.push({
            title: 'No Carry (Result is Negative)',
            detail: `No carry → Take ${compName.radix} of sum: ${compName.radix}(${addResult.result}) = ${finalResult}, prepend negative sign`,
            highlight: 'negative'
        });
    }

    steps.push({
        title: 'Final Result',
        detail: `${paddedA} − ${paddedB} = ${isNegative ? '−' : ''}${finalResult} (Base ${base})`,
        highlight: isNegative ? 'negative' : 'positive'
    });

    const decVal = parseToDecimal(finalResult, base) * (isNegative ? -1 : 1);

    return {
        result: finalResult,
        isNegative,
        steps,
        decimalValue: decVal,
        method: compName.radix
    };
}


// ==========================================================================
// COMPLEMENT PANEL DOM & RENDERING
// ==========================================================================

// Complement Panel DOM References
const compModeToggle = document.getElementById('comp-mode-toggle');
const compDisplayPanel = document.getElementById('comp-display-panel');
const compSubPanel = document.getElementById('comp-sub-panel');
const compModeDisplayBtn = document.getElementById('comp-mode-display');
const compModeSubBtn = document.getElementById('comp-mode-subtract');

// Complement Display Mode Elements
const compBase = document.getElementById('comp-base');
const compValue = document.getElementById('comp-value');
const compDigits = document.getElementById('comp-digits');
const compAutoDigits = document.getElementById('comp-auto-digits');
const compCalcBtn = document.getElementById('comp-calc-btn');
const compResultsArea = document.getElementById('comp-results-area');
const compError = document.getElementById('comp-error');

// Subtraction Mode Elements
const subBaseA = document.getElementById('sub-base-a');
const subValA = document.getElementById('sub-val-a');
const subBaseB = document.getElementById('sub-base-b');
const subValB = document.getElementById('sub-val-b');
const subDigits = document.getElementById('sub-digits');
const subAutoDigits = document.getElementById('sub-auto-digits');
const subCalcBtn = document.getElementById('sub-calc-btn');
const subResultsArea = document.getElementById('sub-results-area');
const subError = document.getElementById('sub-error');

// Complement Preset Buttons
const compPresetBtns = document.querySelectorAll('.comp-preset-btn');

// ---- Mode Toggle ----
function switchCompMode(mode) {
    if (mode === 'display') {
        if (compDisplayPanel) compDisplayPanel.style.display = 'block';
        if (compSubPanel) compSubPanel.style.display = 'none';
        if (compModeDisplayBtn) compModeDisplayBtn.classList.add('active');
        if (compModeSubBtn) compModeSubBtn.classList.remove('active');
    } else {
        if (compDisplayPanel) compDisplayPanel.style.display = 'none';
        if (compSubPanel) compSubPanel.style.display = 'block';
        if (compModeDisplayBtn) compModeDisplayBtn.classList.remove('active');
        if (compModeSubBtn) compModeSubBtn.classList.add('active');
    }
}

if (compModeDisplayBtn) {
    compModeDisplayBtn.addEventListener('click', () => switchCompMode('display'));
}
if (compModeSubBtn) {
    compModeSubBtn.addEventListener('click', () => switchCompMode('subtract'));
}

// ---- Auto Digit Width Toggle ----
function updateDigitWidthState(autoCheckbox, digitInput) {
    if (!autoCheckbox || !digitInput) return;
    digitInput.disabled = autoCheckbox.checked;
    if (autoCheckbox.checked) {
        digitInput.style.opacity = '0.4';
    } else {
        digitInput.style.opacity = '1';
    }
}

if (compAutoDigits) {
    compAutoDigits.addEventListener('change', () => updateDigitWidthState(compAutoDigits, compDigits));
    updateDigitWidthState(compAutoDigits, compDigits);
}

if (subAutoDigits) {
    subAutoDigits.addEventListener('change', () => updateDigitWidthState(subAutoDigits, subDigits));
    updateDigitWidthState(subAutoDigits, subDigits);
}

// ---- Determine Digit Width ----
function getDigitWidth(valueStr, autoCheckbox, digitInput, base) {
    if (autoCheckbox && autoCheckbox.checked) {
        // Auto: use the length of the input, minimum 1
        const cleanVal = valueStr.replace(/^-/, '');
        return Math.max(cleanVal.length, 1);
    }
    const manual = parseInt(digitInput.value, 10);
    return isNaN(manual) || manual < 1 ? 1 : manual;
}

// ---- Complement Display Calculation ----
function processComplementDisplay() {
    if (!compBase || !compValue || !compResultsArea) return;

    // Clear previous
    compResultsArea.innerHTML = '';
    if (compError) compError.style.display = 'none';
    compValue.classList.remove('error');

    const base = compBase.value;
    const val = compValue.value.trim().replace(/^-/, ''); // Strip negative sign

    if (!val) {
        compValue.classList.add('error');
        if (compError) {
            compError.innerText = 'Please enter a value.';
            compError.style.display = 'block';
        }
        return;
    }

    if (!isValidNumber(val, base)) {
        compValue.classList.add('error');
        if (compError) {
            compError.innerText = `Invalid digits for Base ${base}. Allowed: ${getAllowedChars(base)}`;
            compError.style.display = 'block';
        }
        return;
    }

    const numDigits = getDigitWidth(val, compAutoDigits, compDigits, base);
    if (val.length > numDigits) {
        compValue.classList.add('error');
        if (compError) {
            compError.innerText = `Input has ${val.length} digits but digit width is set to ${numDigits}. Increase digit width or shorten input.`;
            compError.style.display = 'block';
        }
        return;
    }

    const baseInt = parseInt(base, 10);
    const names = COMPLEMENT_NAMES[base];
    const padded = padToWidth(val.toUpperCase(), numDigits);

    // Compute both complements
    const dimComp = computeDiminishedRadixComplement(val, base, numDigits);
    const radComp = computeRadixComplement(val, base, numDigits);

    // Decimal values
    const originalDec = parseToDecimal(val, base);
    const dimCompDec = parseToDecimal(dimComp.complement, base);
    const radCompDec = parseToDecimal(radComp.complement, base);

    compResultsArea.innerHTML = `
        <div class="comp-result-header">
            <div class="comp-original-display">
                <span class="comp-orig-label">Original Number:</span>
                <span class="comp-orig-value">${padded}<sub>${base}</sub></span>
                <span class="comp-orig-dec">= ${originalDec}<sub>10</sub></span>
            </div>
            <div class="comp-info-badges">
                <span class="comp-info-badge">${numDigits}-digit</span>
                <span class="comp-info-badge">Base ${base}</span>
            </div>
        </div>

        <div class="comp-results-grid">
            <!-- (r-1)'s Complement Card -->
            <div class="comp-card diminished">
                <div class="comp-card-header">
                    <span class="comp-card-title">${names.diminished}</span>
                    <span class="comp-card-subtitle">Diminished Radix (r−1)'s</span>
                </div>
                <div class="comp-card-value">${dimComp.complement}</div>
                <div class="comp-card-dec">= ${dimCompDec}<sub>10</sub></div>
                <div class="comp-card-method">
                    <div class="comp-method-title">Method: Subtract each digit from ${intToDigit(baseInt - 1)}</div>
                    <div class="comp-digit-steps">
                        ${dimComp.steps.map(s => `
                            <span class="comp-digit-step">${s.explanation}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="comp-card-conversions">
                    <div class="comp-conv-title">All Base Conversions</div>
                    <div class="comp-conv-grid">
                        <div class="comp-conv-cell"><span class="comp-conv-base">BIN</span><span class="comp-conv-val">${formatBase(dimCompDec, 2, 0)}</span></div>
                        <div class="comp-conv-cell"><span class="comp-conv-base">OCT</span><span class="comp-conv-val">${formatBase(dimCompDec, 8, 0)}</span></div>
                        <div class="comp-conv-cell"><span class="comp-conv-base">DEC</span><span class="comp-conv-val">${dimCompDec}</span></div>
                        <div class="comp-conv-cell"><span class="comp-conv-base">HEX</span><span class="comp-conv-val">${formatBase(dimCompDec, 16, 0)}</span></div>
                    </div>
                </div>
            </div>

            <!-- r's Complement Card -->
            <div class="comp-card radix">
                <div class="comp-card-header">
                    <span class="comp-card-title">${names.radix}</span>
                    <span class="comp-card-subtitle">Radix (r)'s</span>
                </div>
                <div class="comp-card-value">${radComp.complement}</div>
                <div class="comp-card-dec">= ${radCompDec}<sub>10</sub></div>
                <div class="comp-card-method">
                    <div class="comp-method-title">Method: ${names.diminished} + 1</div>
                    <div class="comp-digit-steps">
                        ${radComp.diminishedSteps.map(s => `
                            <span class="comp-digit-step">${s.explanation}</span>
                        `).join('')}
                        <span class="comp-digit-step add-one">${radComp.diminishedComplement} + 1 = ${radComp.complement}</span>
                    </div>
                </div>
                <div class="comp-card-conversions">
                    <div class="comp-conv-title">All Base Conversions</div>
                    <div class="comp-conv-grid">
                        <div class="comp-conv-cell"><span class="comp-conv-base">BIN</span><span class="comp-conv-val">${formatBase(radCompDec, 2, 0)}</span></div>
                        <div class="comp-conv-cell"><span class="comp-conv-base">OCT</span><span class="comp-conv-val">${formatBase(radCompDec, 8, 0)}</span></div>
                        <div class="comp-conv-cell"><span class="comp-conv-base">DEC</span><span class="comp-conv-val">${radCompDec}</span></div>
                        <div class="comp-conv-cell"><span class="comp-conv-base">HEX</span><span class="comp-conv-val">${formatBase(radCompDec, 16, 0)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    compResultsArea.style.display = 'block';
}

if (compCalcBtn) {
    compCalcBtn.addEventListener('click', processComplementDisplay);
}

// ---- Subtraction via Complements Calculation ----
function processSubtraction() {
    if (!subBaseA || !subValA || !subBaseB || !subValB || !subResultsArea) return;

    // Clear
    subResultsArea.innerHTML = '';
    if (subError) subError.style.display = 'none';
    subValA.classList.remove('error');
    subValB.classList.remove('error');

    const baseA = subBaseA.value;
    const baseB = subBaseB.value;
    const valA = subValA.value.trim().replace(/^-/, '');
    const valB = subValB.value.trim().replace(/^-/, '');

    // Validate A
    if (!valA) {
        subValA.classList.add('error');
        if (subError) { subError.innerText = 'Minuend (A) cannot be empty.'; subError.style.display = 'block'; }
        return;
    }
    if (!isValidNumber(valA, baseA)) {
        subValA.classList.add('error');
        if (subError) { subError.innerText = `Minuend: Invalid digits for Base ${baseA}. Allowed: ${getAllowedChars(baseA)}`; subError.style.display = 'block'; }
        return;
    }

    // Validate B
    if (!valB) {
        subValB.classList.add('error');
        if (subError) { subError.innerText = 'Subtrahend (B) cannot be empty.'; subError.style.display = 'block'; }
        return;
    }
    if (!isValidNumber(valB, baseB)) {
        subValB.classList.add('error');
        if (subError) { subError.innerText = `Subtrahend: Invalid digits for Base ${baseB}. Allowed: ${getAllowedChars(baseB)}`; subError.style.display = 'block'; }
        return;
    }

    // Convert both to the same base for complement subtraction
    // We'll use the base of the Minuend (A) as the working base
    const workingBase = baseA;
    const workingBaseInt = parseInt(workingBase, 10);

    // Convert B to working base if different
    let workingValA = valA.toUpperCase();
    let workingValB;
    if (baseB !== workingBase) {
        const decB = parseToDecimal(valB, baseB);
        workingValB = formatBase(decB, workingBaseInt, 0).toUpperCase();
    } else {
        workingValB = valB.toUpperCase();
    }

    // Determine digit width
    const numDigits = getDigitWidth(
        workingValA.length >= workingValB.length ? workingValA : workingValB,
        subAutoDigits, subDigits, workingBase
    );

    // Ensure both fit in digit width
    const maxLen = Math.max(workingValA.length, workingValB.length);
    const effectiveDigits = Math.max(numDigits, maxLen);

    if (subAutoDigits && !subAutoDigits.checked && maxLen > numDigits) {
        if (subError) {
            subError.innerText = `Input exceeds specified ${numDigits}-digit width. Increase digit width or shorten inputs.`;
            subError.style.display = 'block';
        }
        return;
    }

    const names = COMPLEMENT_NAMES[workingBase];

    // Compute both methods
    const dimResult = subtractUsingDiminishedComplement(workingValA, workingValB, workingBase, effectiveDigits);
    const radResult = subtractUsingRadixComplement(workingValA, workingValB, workingBase, effectiveDigits);

    // Actual decimal answer for verification
    const decA = parseToDecimal(workingValA, workingBase);
    const decB = parseToDecimal(workingValB, workingBase);
    const actualDec = decA - decB;

    // Build results HTML
    subResultsArea.innerHTML = `
        <div class="sub-result-header">
            <div class="sub-expression">
                <span class="sub-operand">${padToWidth(workingValA, effectiveDigits)}<sub>${workingBase}</sub></span>
                <span class="sub-operator">−</span>
                <span class="sub-operand">${padToWidth(workingValB, effectiveDigits)}<sub>${workingBase}</sub></span>
                <span class="sub-equals">=</span>
                <span class="sub-answer ${actualDec < 0 ? 'negative' : 'positive'}">${actualDec < 0 ? '−' : ''}${formatBase(Math.abs(actualDec), workingBaseInt, 0)}<sub>${workingBase}</sub></span>
                <span class="sub-dec-answer">(${actualDec}<sub>10</sub>)</span>
            </div>
            ${baseB !== workingBase ? `<div class="sub-base-note">Note: Subtrahend B converted from Base ${baseB} to Base ${workingBase}: ${valB}<sub>${baseB}</sub> → ${workingValB}<sub>${workingBase}</sub></div>` : ''}
        </div>

        <div class="sub-methods-grid">
            <!-- (r-1)'s Complement Method -->
            <div class="sub-method-card diminished">
                <div class="sub-method-header">
                    <span class="sub-method-title">${names.diminished} Subtraction</span>
                    <span class="sub-method-tag">Method 1: End-Around Carry</span>
                </div>
                <div class="sub-steps-list">
                    ${dimResult.steps.map((step, idx) => `
                        <div class="sub-step ${step.highlight || ''}">
                            <div class="sub-step-header">
                                <span class="sub-step-num">Step ${idx + 1}</span>
                                <span class="sub-step-title">${step.title}</span>
                            </div>
                            <div class="sub-step-detail">${step.detail}</div>
                            ${step.substeps ? `
                                <div class="sub-substeps">
                                    ${step.substeps.map(ss => `<div class="sub-substep">${ss}</div>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="sub-method-result ${dimResult.isNegative ? 'negative' : 'positive'}">
                    <span class="sub-result-label">Result:</span>
                    <span class="sub-result-value">${dimResult.isNegative ? '−' : ''}${dimResult.result}<sub>${workingBase}</sub></span>
                    <span class="sub-result-dec">(${dimResult.decimalValue}<sub>10</sub>)</span>
                </div>
            </div>

            <!-- r's Complement Method -->
            <div class="sub-method-card radix">
                <div class="sub-method-header">
                    <span class="sub-method-title">${names.radix} Subtraction</span>
                    <span class="sub-method-tag">Method 2: Discard Carry</span>
                </div>
                <div class="sub-steps-list">
                    ${radResult.steps.map((step, idx) => `
                        <div class="sub-step ${step.highlight || ''}">
                            <div class="sub-step-header">
                                <span class="sub-step-num">Step ${idx + 1}</span>
                                <span class="sub-step-title">${step.title}</span>
                            </div>
                            <div class="sub-step-detail">${step.detail}</div>
                            ${step.substeps ? `
                                <div class="sub-substeps">
                                    ${step.substeps.map(ss => `<div class="sub-substep">${ss}</div>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="sub-method-result ${radResult.isNegative ? 'negative' : 'positive'}">
                    <span class="sub-result-label">Result:</span>
                    <span class="sub-result-value">${radResult.isNegative ? '−' : ''}${radResult.result}<sub>${workingBase}</sub></span>
                    <span class="sub-result-dec">(${radResult.decimalValue}<sub>10</sub>)</span>
                </div>
            </div>
        </div>

        <!-- Cross-base final results -->
        <div class="sub-final-conversions">
            <div class="card-badge">Final Result — All Base Conversions</div>
            <div class="final-results-grid">
                <div class="result-tile">
                    <div class="tile-header">
                        <span class="tile-base">Binary</span>
                        <span class="tile-tag">Base 2</span>
                    </div>
                    <div class="tile-value">${actualDec < 0 ? '−' : ''}${formatBase(Math.abs(actualDec), 2, 0)}</div>
                </div>
                <div class="result-tile">
                    <div class="tile-header">
                        <span class="tile-base">Octal</span>
                        <span class="tile-tag">Base 8</span>
                    </div>
                    <div class="tile-value">${actualDec < 0 ? '−' : ''}${formatBase(Math.abs(actualDec), 8, 0)}</div>
                </div>
                <div class="result-tile">
                    <div class="tile-header">
                        <span class="tile-base">Decimal</span>
                        <span class="tile-tag">Base 10</span>
                    </div>
                    <div class="tile-value">${actualDec}</div>
                </div>
                <div class="result-tile">
                    <div class="tile-header">
                        <span class="tile-base">Hexadecimal</span>
                        <span class="tile-tag">Base 16</span>
                    </div>
                    <div class="tile-value">${actualDec < 0 ? '−' : ''}${formatBase(Math.abs(actualDec), 16, 0)}</div>
                </div>
            </div>
        </div>
    `;

    subResultsArea.style.display = 'block';
    subResultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

if (subCalcBtn) {
    subCalcBtn.addEventListener('click', processSubtraction);
}

// ---- Complement Presets ----
const COMP_PRESETS = {
    'bin4': {
        mode: 'display',
        base: '2', value: '1010', digits: 4, auto: false
    },
    'bin8': {
        mode: 'display',
        base: '2', value: '11001010', digits: 8, auto: false
    },
    'oct3': {
        mode: 'display',
        base: '8', value: '325', digits: 3, auto: true
    },
    'dec4': {
        mode: 'display',
        base: '10', value: '4867', digits: 4, auto: true
    },
    'hex3': {
        mode: 'display',
        base: '16', value: 'A3F', digits: 3, auto: true
    },
    'sub-bin': {
        mode: 'subtract',
        baseA: '2', valA: '1010', baseB: '2', valB: '0111', digits: 4, auto: false
    },
    'sub-oct': {
        mode: 'subtract',
        baseA: '8', valA: '52', baseB: '8', valB: '37', digits: 2, auto: true
    },
    'sub-dec': {
        mode: 'subtract',
        baseA: '10', valA: '305', baseB: '10', valB: '148', digits: 3, auto: true
    },
    'sub-hex': {
        mode: 'subtract',
        baseA: '16', valA: 'C5', baseB: '16', valB: '3A', digits: 2, auto: true
    },
    'sub-neg': {
        mode: 'subtract',
        baseA: '2', valA: '0100', baseB: '2', valB: '1010', digits: 4, auto: false
    }
};

function loadCompPreset(presetKey) {
    const preset = COMP_PRESETS[presetKey];
    if (!preset) return;

    if (preset.mode === 'display') {
        switchCompMode('display');
        if (compBase) compBase.value = preset.base;
        if (compValue) compValue.value = preset.value;
        if (compAutoDigits) {
            compAutoDigits.checked = preset.auto;
            updateDigitWidthState(compAutoDigits, compDigits);
        }
        if (!preset.auto && compDigits) compDigits.value = preset.digits;
        processComplementDisplay();
    } else {
        switchCompMode('subtract');
        if (subBaseA) subBaseA.value = preset.baseA;
        if (subValA) subValA.value = preset.valA;
        if (subBaseB) subBaseB.value = preset.baseB;
        if (subValB) subValB.value = preset.valB;
        if (subAutoDigits) {
            subAutoDigits.checked = preset.auto;
            updateDigitWidthState(subAutoDigits, subDigits);
        }
        if (!preset.auto && subDigits) subDigits.value = preset.digits;
        processSubtraction();
    }
}

compPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const presetId = btn.dataset.compPreset;
        if (presetId) loadCompPreset(presetId);
    });
});

// Initialize complement panel (default to display mode)
if (compDisplayPanel) {
    switchCompMode('display');
}