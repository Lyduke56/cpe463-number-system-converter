# Standard Programming Flowcharts & Architectural Diagrams
## CPE463 - Number System Converter & Unified Arithmetic Calculator

**File Reference:** [`script.js`](../script.js) | [`index.html`](../index.html) | [`PSEUDOCODE.md`](PSEUDOCODE.md)

---

## Unified Master System Flowchart

> [!NOTE]
> The diagram below represents the complete, unified architectural and algorithmic flowchart for the entire application across all three subsystems: **Tab 1 (Converter & Calculator Engine)**, **Tab 2 (Radix & Diminished Radix Complements and Subtraction)**, and **Tab 3 (BCD 8421 Arithmetic with +6 Rule & 9's/10's Complement Subtraction)**.
>
> You can copy this single code block directly into any Mermaid-compatible viewer, Markdown renderer, or Mermaid Live Editor.

```mermaid
flowchart TD
    %% =========================================================================
    %% CPE 463: NUMBER SYSTEM CONVERTER & ARITHMETIC ENGINE - UNIFIED FLOWCHART
    %% =========================================================================

    subgraph SEC1_LIFECYCLE ["1. System Initialization and 3-Tab Navigation Router"]
        Start(["Start Application"]) --> InitState["Initialize Application State:<br/>Inputs = 3, Active Tab = 'converter', BCD Mode = 'add'"]
        InitState --> RenderDefaultRows[["RenderInputs(3)"]]
        RenderDefaultRows --> MainEventLoop{{"Main User Event Trap Loop"}}

        %% Tab Navigation
        MainEventLoop -->|"Click Tab 1"| ClickTab1[/Select 'Converter and Calculator' Tab\]
        MainEventLoop -->|"Click Tab 2"| ClickTab2[/Select 'Complements and Subtraction' Tab\]
        MainEventLoop -->|"Click Tab 3"| ClickTab3[/Select 'BCD Arithmetic' Tab\]

        ClickTab1 --> ShowPanel1["Activate #tab-panel-converter<br/>Update ARIA selected and URL hash #converter"]
        ClickTab2 --> ShowPanel2["Activate #tab-panel-complements<br/>Update ARIA selected and URL hash #complements"]
        ClickTab3 --> ShowPanel3["Activate #tab-panel-bcd<br/>Update ARIA selected and URL hash #bcd"]

        ShowPanel1 --> MainEventLoop
        ShowPanel2 --> MainEventLoop
        ShowPanel3 --> MainEventLoop
    end

    subgraph SEC2_TAB1_CONVERTER ["2. Tab 1: Multi-Base Converter and Calculator Pipeline"]
        MainEventLoop -->|"Click Preset 1-5"| PresetClick[/Select Expression Preset\]
        MainEventLoop -->|"Change Field Count"| CountChange[/Enter Input Count N >= 3\]
        MainEventLoop -->|"Row Input Event"| RowInput[/Type Number or Change Radix\]
        MainEventLoop -->|"Click Calculate"| CalcClick[/Click 'Calculate and Convert All'\]

        PresetClick --> FetchPresetData["Lookup Preset Inputs and Formula"]
        FetchPresetData --> BuildPresetInputs[["RenderInputs(preset.length)"]]
        BuildPresetInputs --> PopulatePresetValues["Populate Selectors and Value Fields"]
        PopulatePresetValues --> StartCalculation

        CountChange --> CheckCountThreshold{"Count >= 3?"}
        CheckCountThreshold -->|Yes| RebuildInputRows[["RenderInputs(Count)"]]
        CheckCountThreshold -->|No| ClampMinCount["Display Warning: Minimum 3 Inputs Required"]
        RebuildInputRows --> MainEventLoop
        ClampMinCount --> MainEventLoop

        RowInput --> ValidateSingleRow[["Call IsValidNumber(value, base)"]]
        ValidateSingleRow --> IsRowValid{"Valid for Selected Radix?"}
        IsRowValid -->|Yes| ComputeRowMatrix[["Call ConvertToAllBases(decimalVal)"]]
        IsRowValid -->|No| HighlightRowError["Mark Field Red and Show Syntax Error"]
        ComputeRowMatrix --> RenderRowTiles["Render Per-Input 4-Base Conversion Matrix"]
        RenderRowTiles --> MainEventLoop
        HighlightRowError --> MainEventLoop

        CalcClick --> StartCalculation["Enter ProcessCalculation()"]
        StartCalculation --> ValidateAllInputs{"Are All Input Rows Valid?"}
        ValidateAllInputs -->|No| ShowGlobalError["Display Global Error Banner"]
        ValidateAllInputs -->|Yes| TokenizeFormula[["Call TokenizeExpression(formulaString)"]]

        TokenizeFormula --> ValidateTokens{"Tokenizer Error Free?"}
        ValidateTokens -->|No| ShowGlobalError
        ValidateTokens -->|Yes| ShuntingYardParser[["Call ShuntingYard(tokens) - Infix to RPN"]]

        ShuntingYardParser --> ConstructAST[["Call BuildAST(rpnQueue)"]]
        ConstructAST --> ValidateAST{"Valid Syntax Tree?"}
        ValidateAST -->|No| ShowGlobalError
        ValidateAST -->|Yes| BottomUpEvaluation[["Call ReduceASTStepByStep(astRoot)"]]

        BottomUpEvaluation --> CheckDivByZero{"Division by Zero Encountered?"}
        CheckDivByZero -->|Yes| ShowDivZeroAlert["Display Math Error: Division by Zero Forbidden"]
        CheckDivByZero -->|No| FormatOutputs[["Call FormatBase() for Bases 2, 8, 10, 16"]]

        FormatOutputs --> RenderCalcResults["Render Formatted Multi-Base Result Tiles<br/>and Expandable Step-by-Step Reduction Tree"]
        RenderCalcResults --> MainEventLoop
        ShowGlobalError --> MainEventLoop
        ShowDivZeroAlert --> MainEventLoop
    end

    subgraph SEC3_TAB2_COMPLEMENTS ["3. Tab 2: Radix and Diminished Radix Complements and Subtraction"]
        MainEventLoop -->|"Complement Value Input"| UserCompInput[/Input Base and Unsigned Value\]
        MainEventLoop -->|"Click Calc Complements"| UserCompCalc[/Click 'Calculate Complements'\]
        MainEventLoop -->|"Click Subtraction"| UserCompSub[/Click 'Subtract Using Complements'\]

        UserCompInput --> ValidateCompRadix[["Call ValidateBase(val, base)"]]
        ValidateCompRadix --> SetAlignWidth["Auto-Align Width N or Set Custom Width"]
        SetAlignWidth --> MainEventLoop

        UserCompCalc --> ComputeDimComp["Compute (r-1)'s Complement:<br/>Comp = (r^N - 1) - Value"]
        ComputeDimComp --> ComputeRadComp["Compute r's Complement:<br/>Comp = r^N - Value = (r-1)'s Comp + 1"]
        ComputeRadComp --> DisplayComplementsUI["Render Complements Breakdown Table<br/>Across Bases 2, 8, 10, and 16"]
        DisplayComplementsUI --> MainEventLoop

        UserCompSub --> PadSubOperands["Align Minuend A and Subtrahend B with Leading Zeros to N Digits"]
        PadSubOperands --> ForkSubMethods["Execute Both Complement Subtraction Methods"]

        ForkSubMethods --> MethodDimRadix["Method 1: (r-1)'s Complement Subtraction<br/>1. Find (r-1)'s Comp of Subtrahend B<br/>2. Add Minuend A + Comp9(B)"]
        ForkSubMethods --> MethodRadix["Method 2: r's Complement Subtraction<br/>1. Find r's Comp of Subtrahend B<br/>2. Add Minuend A + Comp10(B)"]

        MethodDimRadix --> EvalEndCarryDim{"End Carry = 1?"}
        EvalEndCarryDim -->|Yes: A >= B| EndAroundCarryRule["End-Around Carry Rule:<br/>Add 1 back to LSB<br/>Result is Positive (+)"]
        EvalEndCarryDim -->|No: A < B| RecompDimRule["Re-complementation Rule:<br/>Re-complement Sum: (r^N - 1) - Sum<br/>Result is Negative (−)"]

        MethodRadix --> EvalEndCarryRadix{"End Carry = 1?"}
        EvalEndCarryRadix -->|Yes: A >= B| DiscardCarryRule["Discard Carry Rule:<br/>Discard End Carry 1<br/>Remaining Digits = Positive (+)"]
        EvalEndCarryRadix -->|No: A < B| RecompRadixRule["Re-complementation Rule:<br/>Re-complement Sum: r^N - Sum<br/>Result is Negative (−)"]

        EndAroundCarryRule --> DisplaySubResults["Render Side-by-Side Verification Cards"]
        RecompDimRule --> DisplaySubResults
        DiscardCarryRule --> DisplaySubResults
        RecompRadixRule --> DisplaySubResults
        DisplaySubResults --> MainEventLoop
    end

    subgraph SEC4_TAB3_BCD_SYSTEM ["4. Tab 3: BCD Arithmetic Module and Mode Routing"]
        MainEventLoop -->|"Select BCD Preset"| UserBcdPreset[/Click BCD Preset 1-5\]
        MainEventLoop -->|"Switch BCD Mode"| UserBcdMode[/Toggle Addition / Subtraction\]
        MainEventLoop -->|"Type BCD Operands"| UserBcdType[/Input Decimal in A or B\]
        MainEventLoop -->|"Toggle Comp View"| UserBcdView[/Toggle Side-by-Side / 9s / 10s\]
        MainEventLoop -->|"Execute BCD Button"| UserBcdExec[/Click 'Execute BCD Operation'\]

        UserBcdPreset --> FillBcdFields["Populate Operands A and B"]
        FillBcdFields --> LaunchBcdExecution[["Call ProcessBCDOperation()"]]

        UserBcdMode --> UpdateBcdModeState["Switch currentBcdMode ('add' <-> 'sub')<br/>Update Operator (+ / −) and Preset Rows"]
        UpdateBcdModeState --> MainEventLoop

        UserBcdView --> SetSubViewFilter["Update Visibility of 9's vs 10's Columns"]
        SetSubViewFilter --> MainEventLoop

        UserBcdType --> VerifyBcdDigits{"Chars in 0-9 Only?"}
        VerifyBcdDigits -->|No| ShowBcdErrorMsg["Render Non-Decimal Error Notification"]
        VerifyBcdDigits -->|Yes| GenerateNibblePills[["Convert Each Digit to 4-bit 8421 Nibble"]]
        GenerateNibblePills --> UpdateAutoWidth["Auto-Align Width: N = max(lenA, lenB)"]
        UpdateAutoWidth --> MainEventLoop
        ShowBcdErrorMsg --> MainEventLoop

        UserBcdExec --> LaunchBcdExecution
        LaunchBcdExecution --> RouteBcdMode{"Active Mode?"}
    end

    subgraph SEC5_TAB3_BCD_ADDITION ["5. BCD Addition Engine (+6 Hardware-Accurate Rule)"]
        RouteBcdMode -->|"Mode = 'add'"| RunBcdAddition[["Call addBCD(A, B, width)"]]
        RunBcdAddition --> PadBcdAddOperands["Pad Operands A and B with Leading Zeros to N Digits"]
        PadBcdAddOperands --> InitBcdAddState["Set incoming carry cin = 0, index i = 0 (Units / LSB)"]

        InitBcdAddState --> LoopAddNibbles{"i < N? (More Digits?)"}
        LoopAddNibbles -->|Yes| FetchCurrentDigits["Fetch digitA[i], digitB[i]"]
        FetchCurrentDigits --> ComputeRawBinarySum["Compute rawSum = digitA + digitB + cin"]
        ComputeRawBinarySum --> CheckAdderOverflow{"rawSum >= 16?"}
        CheckAdderOverflow -->|Yes| FlagBinaryCarry["binaryCarry = 1"]
        CheckAdderOverflow -->|No| ClearBinaryCarry["binaryCarry = 0"]

        FlagBinaryCarry --> TestCorrectionCondition{"rawSum > 9 OR binaryCarry == 1?"}
        ClearBinaryCarry --> TestCorrectionCondition

        TestCorrectionCondition -->|Yes: Invalid BCD State| ApplySixCorrection["Apply Hardware +6 Correction:<br/>correctedDigit = (rawSum + 6) & 0x0F<br/>cout = 1 (Decimal Carry Generated)"]
        TestCorrectionCondition -->|No: Valid BCD State| PassValidDigit["No Correction Required:<br/>correctedDigit = rawSum<br/>cout = 0"]

        ApplySixCorrection --> RecordNibbleAudit["Store Step: Place Value, Binary Nibbles, Correction and Carry"]
        PassValidDigit --> RecordNibbleAudit
        RecordNibbleAudit --> AdvanceAddPointers["cin = cout, i = i + 1"]
        AdvanceAddPointers --> LoopAddNibbles

        LoopAddNibbles -->|No: All Positions Processed| CheckFinalEndCarry{"Final cin (End Carry) == 1?"}
        CheckFinalEndCarry -->|Yes| AddLeadingNibble["Prepend MSB Digit '1' (0001₂)<br/>Aligned Output Expanded to N+1 Digits"]
        CheckFinalEndCarry -->|No| KeepAlignedLength["Final Output Remains N Digits"]

        AddLeadingNibble --> RenderAdditionUI["Render BCD Addition Results Area"]
        KeepAlignedLength --> RenderAdditionUI
        RenderAdditionUI --> DrawAddHeroCard["Render Hero Card (8421 BCD Groups and Decimal Answer)"]
        DrawAddHeroCard --> DrawColumnarTable["Render Full Bitwise Columnar Addition Table:<br/>Augend + Addend + Raw Sum + (+6) Correction + Final BCD"]
        DrawColumnarTable --> DrawPlaceCards["Render Place Value Breakdown Cards (Units, Tens, Hundreds, etc.)"]
        DrawPlaceCards --> MainEventLoop
    end

    subgraph SEC6_TAB3_BCD_SUBTRACTION ["6. BCD Subtraction Engine (9's and 10's Complements)"]
        RouteBcdMode -->|"Mode = 'sub'"| RunBcdSubtraction["Execute Dual BCD Subtraction Pipeline"]
        RunBcdSubtraction --> PadBcdSubOperands["Align Minuend A and Subtrahend B with Leading Zeros to N Digits"]
        PadBcdSubOperands --> ExecuteComplementBranches["Execute 9's and 10's Branches in Parallel"]

        %% 9's Complement Branch
        ExecuteComplementBranches --> Branch9s["9's Complement Method Branch"]
        Branch9s --> Step1_Comp9["Step 1: Compute 9's Complement of Subtrahend B:<br/>Comp9[i] = 9 - digitB[i]"]
        Step1_Comp9 --> Step2_AddComp9[["Step 2: Add Minuend A + Comp9(B) via addBCD Engine"]]
        Step2_AddComp9 --> Step3_CheckCarry9{"Step 3: End Carry out of MSB == 1?"}
        Step3_CheckCarry9 -->|Yes: A >= B (Positive)| Step4A_EndAroundCarry[["Step 4A: End-Around Carry Rule<br/>Call addBCD(intermediateSum, '1')<br/>Add 1 back to LSB"]]
        Step3_CheckCarry9 -->|No: A < B (Negative)| Step4B_Recomp9["Step 4B: Re-complementation Rule<br/>Re-complement Intermediate Sum:<br/>mag[i] = 9 - sum[i]<br/>Attach Minus Sign (−)"]
        Step4A_EndAroundCarry --> Finalize9s["Produce Final 9's Complement Result"]
        Step4B_Recomp9 --> Finalize9s

        %% 10's Complement Branch
        ExecuteComplementBranches --> Branch10s["10's Complement Method Branch"]
        Branch10s --> Step1_Comp10["Step 1: Compute 10's Complement of Subtrahend B:<br/>Comp10 = Comp9 + 1"]
        Step1_Comp10 --> Step2_AddComp10[["Step 2: Add Minuend A + Comp10(B) via addBCD Engine"]]
        Step2_AddComp10 --> Step3_CheckCarry10{"Step 3: End Carry out of MSB == 1?"}
        Step3_CheckCarry10 -->|Yes: A >= B (Positive)| Step4A_DiscardCarry["Step 4A: Discard Carry Rule<br/>Discard End Carry 1<br/>Remaining N Digits = True Positive Result (+)"]
        Step3_CheckCarry10 -->|No: A < B (Negative)| Step4B_Recomp10["Step 4B: Re-complementation Rule<br/>Re-complement Intermediate Sum:<br/>mag = 10's Comp(sum) = (9's Comp + 1)<br/>Attach Minus Sign (−)"]
        Step4A_DiscardCarry --> Finalize10s["Produce Final 10's Complement Result"]
        Step4B_Recomp10 --> Finalize10s

        %% Subtraction UI Mounting
        Finalize9s --> MountSubResultsUI["Mount BCD Subtraction UI Containers"]
        Finalize10s --> MountSubResultsUI
        MountSubResultsUI --> DrawSubHeroCard["Render Hero Card with Signed Result and 8421 BCD Groups"]
        DrawSubHeroCard --> DrawSideBySideGrid["Render Side-by-Side Comparison Columns:<br/>9's Complement Card vs. 10's Complement Card"]
        DrawSideBySideGrid --> DrawVerdictBadges["Render Color-Coded Carry Verdict Badges:<br/>Green [Carry = 1] or Red [Carry = 0]"]
        DrawVerdictBadges --> DrawTakeawaysSummary["Render Comparative Method Analysis Summary Card"]
        DrawTakeawaysSummary --> MainEventLoop
    end
```

---

## Flowchart Components & Verification Guide

1. **System Initialization & Routing (Section 1):** Covers startup defaults (`inputs = 3`, active tab = `converter`) and event listeners for tab switching.
2. **Tab 1: Converter & Calculator (Section 2):** Covers dynamic input rows, live 4-base conversion matrix, tokenization, Dijkstra's Shunting-yard algorithm, Abstract Syntax Tree (AST) reduction, and division-by-zero detection.
3. **Tab 2: Complements & Subtraction (Section 3):** Covers diminished-radix $(r-1)$'s and radix $r$'s complement calculation, and side-by-side subtraction highlighting End-Around Carry vs. Discard Carry.
4. **Tab 3: BCD Arithmetic System (Section 4):** Covers operation mode switching (`+` vs. `−`), preset injection, real-time 4-bit nibble previewing, and auto digit alignment.
5. **BCD Addition Engine with +6 Rule (Section 5):** Covers bitwise nibble iteration, raw binary sum calculation, modulo 16 binary adder overflow detection ($\ge 16$), correction triggering ($> 9$ or carry), hardware-accurate `(rawSum + 6) & 0x0F` correction, and leading MSB digit prepending on end carry.
6. **BCD Subtraction Engine (Section 6):** Covers concurrent 9's and 10's complement subtraction pipelines, carry inspection, End-Around Carry addition, Discard Carry, and re-complementation of negative differences.
