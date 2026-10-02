# Standard Programming Flowcharts & Architectural Diagrams
## CPE463 - Number System Converter & Unified Arithmetic Calculator

**File Reference:** [`script.js`](../script.js) | [`index.html`](../index.html) | [`PSEUDOCODE.md`](PSEUDOCODE.md)

---

## Standard Flowchart Symbols Legend (ANSI / ISO 5807)

These flowcharts strictly follow traditional Computer Science and Engineering flowchart conventions:

| Symbol Shape | Geometric Form | Mermaid Syntax | Standard Programming Function |
| :--- | :--- | :--- | :--- |
| **Terminal / Ellipse** | Oval / Stadium | `([Start / End])` | Indicates Start, End, Return, or Halt of a program or function. |
| **Manual Input** | Trapezoid | `[/User Action\]` | Represents manual human input (e.g., clicking buttons, typing in text fields). |
| **Input / Output (I/O)** | Parallelogram | `[/Read or Print/]` | Represents reading data (variables, DOM) or displaying outputs/results to the user. |
| **Process** | Rectangle | `[Operation]` | Represents computational operations, variable assignments, and arithmetic. |
| **Decision** | Diamond | `{Condition?}` | Represents conditional branching (`IF...THEN...ELSE` or `SWITCH`) with `Yes`/`No` paths. |
| **Preparation / Loop** | Hexagon | `{{For Loop Setup}}` | Represents iteration setup, loop counters, and index initialization. |
| **Predefined Process** | Double-Bar Rectangle | `[[Function Call]]` | Represents invocation of another modular function or subroutine. |

---

## 1. Master System Flowchart

Shows the overall execution lifecycle, user event traps, dynamic row rebuilds, preset injection, and central processing coordination.

```mermaid
flowchart TD
    %% Terminal
    Start(["Start Application"]) --> InitState["Initialize App State:<br/>Inputs = 3, currentOperation = '+'"]
    InitState --> SubRenderInit[["Call RenderInputs(3)"]]
    SubRenderInit --> WaitEvent{{"Wait for User Event Trap"}}

    %% Manual Inputs / User Events (Trapezoids)
    WaitEvent -->|"User Clicks Preset Button"| UserPreset[/Click Preset 1-5\]
    WaitEvent -->|"User Modifies Input Count"| UserCount[/Input Desired Field Count\]
    WaitEvent -->|"User Selects Operator"| UserOp[/Click +, -, *, / Button\]
    WaitEvent -->|"User Types or Changes Base"| UserEdit[/Type Value or Select Radix\]
    WaitEvent -->|"User Clicks Process"| UserCalc[/Click 'Calculate & Convert All'\]

    %% Preset Handling
    UserPreset --> ReadPresetData["Lookup Preset Data Array"]
    ReadPresetData --> SubRenderPreset[["Call RenderInputs(preset.length)"]]
    SubRenderPreset --> LoadPresetVals["Populate Base Selectors and Input Values"]
    LoadPresetVals --> AutoCalc[["Call ProcessCalculation()"]]

    %% Count Update Handling
    UserCount --> ReadCountInput[/Read Count from Field\]
    ReadCountInput --> CheckMinCount{"Count >= 3?"}
    CheckMinCount -->|"Yes"| ValidCount["targetCount = Count"]
    CheckMinCount -->|"No"| ClampMin["targetCount = 3"]
    ValidCount --> SubRenderRows[["Call RenderInputs(targetCount)"]]
    ClampMin --> SubRenderRows
    SubRenderRows --> WaitEvent

    %% Operator Selection
    UserOp --> SetOp["currentOperation = selectedOp"]
    SetOp --> UpdateOpUI["Update Operator Button Active Classes"]
    UpdateOpUI --> WaitEvent

    %% Live Validation
    UserEdit --> SubValidateRow[["Call ValidateRow(rowIndex)"]]
    SubValidateRow --> WaitEvent

    %% Calculation Execution
    UserCalc --> SubExecCalc[["Call ProcessCalculation()"]]
    AutoCalc --> SubExecCalc
    SubExecCalc --> WaitEvent
```

---

## 2. Main Calculation Engine Flowchart (`ProcessCalculation`)

Details the entire 4-phase arithmetic pipeline featuring loop iteration, sub-function calls, sequential chain arithmetic, division-by-zero detection, and output generation.

```mermaid
flowchart TD
    StartCalc(["Start ProcessCalculation()"]) --> ReadDOMRows[/Read All Input Rows from DOM/]
    ReadDOMRows --> InitFlags["allValid = true<br/>decimalValues = [ ]<br/>originalTokens = [ ]<br/>decimalTokens = [ ]"]

    %% Phase 1: Input Harvesting & Per-Row Conversion
    InitFlags --> PrepLoop{{For i = 1 to TotalRows}}
    PrepLoop --> ReadRowIO[/Read base and rawVal for Row i/]
    ReadRowIO --> CheckEmpty{"rawVal is Empty?"}

    CheckEmpty -->|"Yes"| OutEmptyErr[/Display 'Input cannot be empty' Error/]
    OutEmptyErr --> ClearRowMatrix1[/Clear Row i Conversion Matrix/]
    ClearRowMatrix1 --> FlagInvalid1["allValid = false"]
    FlagInvalid1 --> NextRowStep

    CheckEmpty -->|"No"| CallValidate[["IsValidNumber(rawVal, base)"]]
    CallValidate --> CheckValidResult{"Is Valid?"}

    CheckValidResult -->|"No"| OutCharErr[/Display 'Invalid character' Error/]
    OutCharErr --> ClearRowMatrix2[/Clear Row i Conversion Matrix/]
    ClearRowMatrix2 --> FlagInvalid2["allValid = false"]
    FlagInvalid2 --> NextRowStep

    CheckValidResult -->|"Yes"| ClearErrUI["Remove Error Styling on Row i"]
    ClearErrUI --> CallParse[["decVal = ParseToDecimal(rawVal, base)"]]
    CallParse --> AppendDec["Append decVal to decimalValues"]

    AppendDec --> CallFormatBin[["binStr = FormatBase(decVal, 2, 0)"]]
    CallFormatBin --> CallFormatOct[["octStr = FormatBase(decVal, 8, 0)"]]
    CallFormatOct --> CallFormatHex[["hexStr = FormatBase(decVal, 16, 0)"]]
    CallFormatHex --> DisplayRowMatrix[/Output Row i Matrix: BIN, OCT, DEC, HEX/]

    DisplayRowMatrix --> BuildToken["Append (rawVal + Subscript) to originalTokens<br/>Append decVal to decimalTokens"]
    BuildToken --> NextRowStep["Increment i"]
    NextRowStep --> PrepLoop

    %% Validation Guard
    PrepLoop -->|"Loop Complete"| CheckAllValid{"allValid == true AND<br/>decimalValues.length == TotalRows?"}
    CheckAllValid -->|"No"| HideResults["Hide Results Section"]
    HideResults --> ExitCalc(["Halt / Return"])

    %% Phase 2: Sequential Decimal Arithmetic
    CheckAllValid -->|"Yes"| InitMath["computedResult = decimalValues[0]<br/>isDivByZero = false<br/>divZeroIndex = null"]
    InitMath --> MathLoop{{For k = 1 to TotalRows - 1}}

    MathLoop --> FetchNext["nextVal = decimalValues[k]"]
    FetchNext --> BranchOp{"currentOperation"}

    BranchOp -->|"+"| DoAdd["computedResult = computedResult + nextVal"] --> NextK["Increment k"]
    BranchOp -->|"-"| DoSub["computedResult = computedResult - nextVal"] --> NextK
    BranchOp -->|"*"| DoMul["computedResult = computedResult * nextVal"] --> NextK
    BranchOp -->|"/"| CheckZero{"nextVal == 0?"}

    CheckZero -->|"Yes"| SetDivZero["isDivByZero = true<br/>divZeroIndex = k + 1"]
    SetDivZero --> BreakLoop["Break Out of Math Loop"]
    CheckZero -->|"No"| DoDiv["computedResult = computedResult / nextVal"] --> NextK
    NextK --> MathLoop

    MathLoop -->|"Math Complete"| CheckDivFlag{"isDivByZero == true?"}
    BreakLoop --> CheckDivFlag

    %% Phase 3 & 4: Output Rendering
    CheckDivFlag -->|"Yes"| ShowDivZeroErr[/Output 'Division by Zero' Error on Input divZeroIndex/]
    ShowDivZeroErr --> FormatFormulaErr["formula = decimalTokens + ' = Undefined'"]
    FormatFormulaErr --> OutTilesErr[/Display 'Undefined (Div by 0)' on All 4 Final Tiles/]

    CheckDivFlag -->|"No"| FormatFormulaNormal["formula = decimalTokens + ' = ' + computedResult"]
    FormatFormulaNormal --> FinalBin[["finalBin = FormatBase(computedResult, 2, 6)"]]
    FinalBin --> FinalOct[["finalOct = FormatBase(computedResult, 8, 6)"]]
    FinalOct --> FinalDec[["finalDec = FormatBase(computedResult, 10, 6)"]]
    FinalDec --> FinalHex[["finalHex = FormatBase(computedResult, 16, 6)"]]
    FinalHex --> OutTilesNormal[/Display finalBin, finalOct, finalDec, finalHex on Result Tiles/]

    OutTilesErr --> DisplayExpr[/Output expressionString to expression-display<br/>Output formula to decimal-formula/]
    OutTilesNormal --> DisplayExpr
    DisplayExpr --> RevealUI["Reveal Results Section & Smooth Scroll"]
    RevealUI --> EndCalc(["End ProcessCalculation()"])
```

---

## 3. Input Validation Subroutine Flowchart (`IsValidNumber`)

Enforces radix syntax compliance using standard decision branching and symbol verification.

```mermaid
flowchart TD
    StartVal(["Start IsValidNumber(value, base)"]) --> CheckEmpty{"value is Empty or Null?"}
    CheckEmpty -->|"Yes"| RetFalse1(["Return False"])

    CheckEmpty -->|"No"| CheckSign{"First Char == '-'?"}
    CheckSign -->|"Yes"| StripSign["cleanVal = value without '-'"]
    CheckSign -->|"No"| KeepVal["cleanVal = value"]

    StripSign --> CheckCleanEmpty{"cleanVal is Empty?"}
    CheckCleanEmpty -->|"Yes"| RetFalse2(["Return False"])
    CheckCleanEmpty -->|"No"| SwitchBase{"base Radix"}
    KeepVal --> SwitchBase

    SwitchBase -->|"Base 2"| SetBinPattern["Allowed: '0', '1'"]
    SwitchBase -->|"Base 8"| SetOctPattern["Allowed: '0' through '7'"]
    SwitchBase -->|"Base 10"| SetDecPattern["Allowed: '0' through '9'"]
    SwitchBase -->|"Base 16"| SetHexPattern["Allowed: '0'-'9', 'A'-'F', 'a'-'f'"]

    SetBinPattern --> TestChars{{For each char in cleanVal}}
    SetOctPattern --> TestChars
    SetDecPattern --> TestChars
    SetHexPattern --> TestChars

    TestChars --> MatchCheck{"char matches Allowed Pattern?"}
    MatchCheck -->|"No"| RetFalse3(["Return False"])
    MatchCheck -->|"Yes"| NextChar["Next Character"]
    NextChar --> TestChars

    TestChars -->|"All Characters Validated"| RetTrue(["Return True"])
```

---

## 4. Base Conversion Subroutine Flowcharts

### A. Base-N to Decimal Subroutine (`ParseToDecimal`)
Converts positional string representations into standard integers using Horner's polynomial expansion: $\text{decimal} = (\text{decimal} \times \text{base}) + \text{digit}$.

```mermaid
flowchart TD
    StartParse(["Start ParseToDecimal(valueStr, base)"]) --> CheckNeg{"First Char == '-'?"}
    CheckNeg -->|"Yes"| SetNegFlag["isNeg = true<br/>cleanStr = valueStr without '-'"]
    CheckNeg -->|"No"| SetPosFlag["isNeg = false<br/>cleanStr = valueStr"]

    SetNegFlag --> InitAccum["decimal = 0"]
    SetPosFlag --> InitAccum

    InitAccum --> LoopChars{{For each char in cleanStr}}
    LoopChars --> CharToVal["digit = CharacterToInteger(char)"]
    CharToVal --> MultiplyAdd["decimal = (decimal * base) + digit"]
    MultiplyAdd --> NextC["Next Character"]
    NextC --> LoopChars

    LoopChars -->|"Finished String"| CheckSignApply{"isNeg == true?"}
    CheckSignApply -->|"Yes"| NegateResult["decimal = -decimal"]
    CheckSignApply -->|"No"| ReturnDec(["Return decimal"])
    NegateResult --> ReturnDec
```

---

### B. Decimal to Target Base Subroutine (`FormatBase`)
Processes both integer and fractional components using repeated division (modulo) and repeated multiplication.

```mermaid
flowchart TD
    StartFmt(["Start FormatBase(num, base, precision = 6)"]) --> CheckNaN{"Is NaN or Infinite?"}
    CheckNaN -->|"NaN"| RetNaN(["Return 'NaN'"])
    CheckNaN -->|"Infinity"| RetInf(["Return Signed 'Infinity'"])
    CheckNaN -->|"Finite"| Decompose["isNegative = (num < 0)<br/>absNum = ABS(num)<br/>intPart = FLOOR(absNum)<br/>fracPart = absNum - intPart"]

    %% Integer Conversion Step
    Decompose --> CheckIntZero{"intPart == 0?"}
    CheckIntZero -->|"Yes"| SetIntZero["intStr = '0'"]
    CheckIntZero -->|"No"| DivModuloLoop["intStr = ConvertIntegerByRepeatedDivision(intPart, base)"]
    SetIntZero --> CheckFracExists
    DivModuloLoop --> CheckFracExists

    %% Fractional Decision
    CheckFracExists{"fracPart == 0 OR precision <= 0?"}
    CheckFracExists -->|"Yes (Integer Only)"| BuildIntOnly["result = (isNegative ? '-' : '') + intStr"]
    BuildIntOnly --> RetIntOnly(["Return result"])

    %% Fractional Multiplication Step
    CheckFracExists -->|"No (Has Fraction)"| InitFracVars["fracStr = ''<br/>count = 0"]
    InitFracVars --> FracLoop{{While fracPart > 0 AND count < precision}}

    FracLoop --> ScaleFrac["fracPart = fracPart * base<br/>digit = FLOOR(fracPart)"]
    ScaleFrac --> AppendFracChar["fracStr = fracStr + DigitToChar(digit)<br/>fracPart = fracPart - digit<br/>count = count + 1"]
    AppendFracChar --> FracLoop

    FracLoop -->|"Loop Finished"| BuildFull["result = (isNegative ? '-' : '') + intStr + '.' + fracStr"]
    BuildFull --> RetFull(["Return result"])
```

---

## 5. Dynamic Row Management Flowchart (`RenderInputs`)

Illustrates state preservation during dynamic DOM restructuring.

```mermaid
flowchart TD
    StartRender(["Start RenderInputs(count)"]) --> CheckCount{"count < 3 OR isNaN(count)?"}
    CheckCount -->|"Yes"| ResetCount["count = 3<br/>Update UI field to 3"]
    CheckCount -->|"No"| AcceptCount["Use count"]

    ResetCount --> HarvestState
    AcceptCount --> HarvestState

    HarvestState[/Read existing rows from DOM: save base and val in existingData array/]
    HarvestState --> ClearDOM["Clear inputsContainer.innerHTML"]
    ClearDOM --> LoopGenerate{{For i = 1 to count}}

    LoopGenerate --> CreateDOM["Create row container, base dropdown, input field, and 4-cell matrix"]
    CreateDOM --> CheckHasSaved{"existingData[i - 1] exists?"}

    CheckHasSaved -->|"Yes"| RestoreData["Restore base value<br/>Restore input text<br/>Update base indicator badge"]
    CheckHasSaved -->|"No"| ApplyDefault["Set default Base 10<br/>Leave input empty"]

    RestoreData --> AppendRow["Append row to inputsContainer"]
    ApplyDefault --> AppendRow
    AppendRow --> NextRowIdx["Increment i"]
    NextRowIdx --> LoopGenerate

    LoopGenerate -->|"All Rows Created"| HideOldCard["Hide resultsSection"]
    HideOldCard --> EndRender(["End RenderInputs()"])
```

---

## 6. Complement Computation Flowchart

Shows the process for computing both the $(r-1)$'s and $r$'s complements of a number in any base.

```mermaid
flowchart TD
    StartComp(["Start ComputeComplements(value, base, numDigits)"]) --> PadInput["Pad value to numDigits width with leading zeros"]
    PadInput --> CalcMax["maxDigit = base - 1"]

    CalcMax --> DimLoop{{"For each digit i in padded value"}}
    DimLoop --> SubDigit["complementDigit = maxDigit - digit[i]"]
    SubDigit --> AppendDim["Append complementDigit to diminishedResult"]
    AppendDim --> RecordStep["Record step: maxDigit − digit = complementDigit"]
    RecordStep --> NextDim["Increment i"]
    NextDim --> DimLoop

    DimLoop -->|"All digits processed"| DimDone[/"Output: (r-1)'s Complement = diminishedResult"/]

    DimDone --> AddOne["radixResult = diminishedResult + 1 (in base r)"]
    AddOne --> CarryCheck{{"Process carry propagation"}}
    CarryCheck --> RadDone[/"Output: r's Complement = radixResult"/]

    RadDone --> EndComp(["End ComputeComplements()"])
```

---

## 7. Subtraction via (r-1)'s Complement Flowchart

Shows the end-around carry method for subtraction using diminished radix complement.

```mermaid
flowchart TD
    StartSub(["Start SubtractDiminished(A, B, base, n)"]) --> PadAB["Pad A and B to n digits"]
    PadAB --> CompB[["Call ComputeDiminishedRadixComplement(B, base, n)"]]
    CompB --> AddAComp["sum = A + complement(B) in base r"]
    AddAComp --> CheckCarry{"Carry generated?"}

    CheckCarry -->|"Yes (Carry = 1)"| EAC["End-Around Carry:<br/>Remove carry, add 1 to sum"]
    EAC --> PosResult[/"Result = sum + 1 (Positive)"/]

    CheckCarry -->|"No (Carry = 0)"| ReComp[["Take (r-1)'s complement of sum"]]
    ReComp --> NegResult[/"Result = −complement(sum) (Negative)"/]

    PosResult --> ConvertAll["Convert result to all 4 bases"]
    NegResult --> ConvertAll
    ConvertAll --> EndSub(["End SubtractDiminished()"])
```

---

## 8. Subtraction via r's Complement Flowchart

Shows the discard-carry method for subtraction using radix complement.

```mermaid
flowchart TD
    StartSubR(["Start SubtractRadix(A, B, base, n)"]) --> PadABR["Pad A and B to n digits"]
    PadABR --> CompBR[["Call ComputeRadixComplement(B, base, n)"]]
    CompBR --> AddACompR["sum = A + complement(B) in base r"]
    AddACompR --> CheckCarryR{"Carry generated?"}

    CheckCarryR -->|"Yes (Carry = 1)"| DiscardCarry["Discard carry bit"]
    DiscardCarry --> PosResultR[/"Result = sum (Positive)"/]

    CheckCarryR -->|"No (Carry = 0)"| ReCompR[["Take r's complement of sum"]]
    ReCompR --> NegResultR[/"Result = −complement(sum) (Negative)"/]

    PosResultR --> ConvertAllR["Convert result to all 4 bases"]
    NegResultR --> ConvertAllR
    ConvertAllR --> EndSubR(["End SubtractRadix()"])
```
