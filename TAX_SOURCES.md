# 2025–26 HMRC sources and tax-engine verification sheet

This is a **source-control checklist for implementing a limited personal tax estimator**, not a legal opinion.

| Area | Official reference | Checked fact / task |
| --- | --- | --- |
| Income tax | https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past | 2025–26 PA £12,570; taper above £100,000 ANI; basic 20%, higher 40%, additional 45% for E/W/NI ordinary taxable income; Scotland distinct |
| NIC | https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions | 2025–26 Class 4 lower £12,570 upper £50,270 at 6%/2%; Class 2 small profits £6,845, voluntary £3.50/week |
| Employment form | https://www.gov.uk/government/publications/self-assessment-employment-sa102 | 2025–26 SA102: box 1 employment pay from P60/P45, box 2 UK income tax deducted, separate page per employment |
| Self-employment form | https://www.gov.uk/government/publications/self-assessment-self-employment-short-sa103s | 2025–26 SA103S: box 9 turnover, 10 other business income, 10.1 trading allowance, 20 total expenses, 21 net profit, 28 adjusted, 31 taxable profit; verify eligibility |
| Calculation | https://www.gov.uk/government/publications/self-assessment-tax-calculation-summary-sa110 | Use **2025–26 notes and working sheet** for exact Income Tax, Class 4, credits, PA taper, payment calculation and rounding; do not infer from prior year's spreadsheet |
| SA100 | https://www.gov.uk/guidance/how-to-complete-your-self-assessment-tax-return-for-last-tax-year | Check required supplementary forms, screens and filing questions |
| Trading allowance | https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income | Eligibility restrictions; gross receipt threshold; cannot combine allowance and expenses; no loss from allowance |
| Cash basis | https://www.gov.uk/self-employed-records/overview | From 2024–25 cash basis default for many self-employed; date receipts/payments when received/paid |
| Travel | https://www.gov.uk/expenses-if-youre-self-employed/travel | Qualifying travel vs ordinary commuting; meals on overnight business trips |
| Mileage | https://www.gov.uk/simpler-income-tax-simplified-expenses/vehicles | **2025–26** car/van 45p first 10k, 25p after; motorcycles 24p; do not use 2026–27's 55p |
| Payments on account | https://www.gov.uk/understand-self-assessment-bill/payments-on-account | 31 January and 31 July, usually 50% each, exceptions < £1,000 or >80% already collected outside SA; verify exact amounts under the HMRC calculation |
| Filing deadlines | https://www.gov.uk/self-assessment-tax-returns/deadlines | 2025–26 online and usual payment due 31 January 2027; normal registration notification 5 October 2026 |
| MTD | https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax | Over £30,000 qualifying gross income 2025–26 → MTD from 6 April 2027 if applicable; not covered by this software |

## Source review rules for Claude Code

1. Attach each implemented `ruleId` to an official URL, tax year, date verified and independently calculated test.
2. Read the **2025–26 form**. Publication labels often say **2026**, not 2025, because the tax year ends in 2026.
3. In the SA103S short pages, the presence of a box number does not mean the user can use it in every circumstance; follow HMRC notes.
4. Do not use the approved **employee** mileage allowance as proof of allowable **self-employed** business travel; actual journey eligibility differs.
5. Do not invent treatment of P11D, tax-code changes, gift aid, pension relief, loans or losses. Implement separately and test or flag provisional.
6. Ensure HMRC box entry rounding and tax computation rounding match the 2025–26 notes.
7. Compare full computation with a separate, manually worked HMRC example before releasing.
8. Document caveats; an app-generated estimate does not replace the user's HMRC online calculation or accountant review.
