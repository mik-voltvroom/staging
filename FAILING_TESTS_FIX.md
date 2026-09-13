# Fix for Failing Tests (Job 97619187145)

## Problem Summary

Two tests in `tests/public-site.test.ts` are failing:

1. **Line 29-35**: `maakt aanbod, bewijs en primaire vervolgstap direct duidelijk`
   - Expected to find: `"Zorgvuldig geselecteerde occasions met aantoonbare historie"`
   - Actual content: Module imports (showing file was not read correctly)

2. **Line 48-57**: `formuleert de selectienorm controleerbaar en zonder onnodige absolute claims`
   - Expected to find: `"Kilometerstand beoordeeld"`
   - Actual content: Module imports (showing file was not read correctly)

## Root Cause

The tests are reading `app/page.tsx` and checking for specific text content. The errors show that instead of the **rendered page content**, the test is getting the **source code imports** from the file:

```javascript
import Image from "next/image";
import { listPublicVehicles } from "@/lib/repositories/public-vehicle-repository";
```

This indicates the file exists but is missing the required text strings.

## Solution

### Check `app/page.tsx` for Missing Content

The homepage (`app/page.tsx`) needs to include these exact strings in the rendered output:

**For test 1 (lines 29-35):** Add these to the hero/features section:
```tsx
<h2>Zorgvuldig geselecteerde occasions met aantoonbare historie</h2>
```

**For test 2 (lines 48-57):** Add these assurance/proof strings to the page:
```tsx
"Kilometerstand beoordeeld"
"Aantoonbare historie"
"Technisch geselecteerd"
"Onderhoud en herkomst inzichtelijk"
"Accu-inzicht waar relevant"
```

And ensure these strings are **NOT** present:
```tsx
// Remove or avoid:
"Eén eigenaar"
"Dealeronderhouden"
```

### Fix Steps

1. **Open `app/page.tsx`**
   ```bash
   code app/page.tsx
   ```

2. **Verify the assurance section exists**
   
   The page should have a section that displays these quality proofs/assurances. If using an `assurances` array or component structure, ensure the title/text fields contain the exact strings the tests expect:

   ```typescript
   const assurances = [
     { icon: "/brand/icons/histoire.svg", title: "Aantoonbare historie", text: "..." },
     { icon: "/brand/icons/speedometer.svg", title: "Kilometerstand beoordeeld", text: "..." },
     { icon: "/brand/icons/check.svg", title: "Technisch geselecteerd", text: "..." },
     { icon: "/brand/icons/history.svg", title: "Onderhoud en herkomst inzichtelijk", text: "..." },
     { icon: "/brand/icons/battery.svg", title: "Accu-inzicht waar relevant", text: "..." },
   ];
   ```

3. **Ensure hero/tagline contains the value proposition**

   The page heading or value proposition should include:
   ```typescript
   "Zorgvuldig geselecteerde occasions met aantoonbare historie"
   ```

4. **Run tests locally to verify**
   ```bash
   npm test -- tests/public-site.test.ts
   ```

5. **Commit the fix**
   ```bash
   git add app/page.tsx
   git commit -m "fix: add missing quality assurance content to homepage

   - Add assurance proofs to demonstrate selection criteria
   - Ensure value proposition is clearly stated
   - Fixes tests: 'maakt aanbod, bewijs...' and 'formuleert selectienorm...'"
   git push
   ```

## Test Expectations Reference

From `tests/public-site.test.ts`:

```typescript
// Test 1 (line 29-35): Value proposition + ordering
expect(homepage).toContain("Slim rijden.");
expect(homepage).toContain("Meer genieten.");
expect(homepage).toContain("Zorgvuldig geselecteerde occasions met aantoonbare historie");
expect(homepage.indexOf('href="#uitgelicht"')).toBeLessThan(homepage.indexOf('href="/keuzehulp"'));

// Test 2 (line 48-57): Selection criteria/proof points
expect(homepage).toContain("Kilometerstand beoordeeld");
expect(homepage).toContain("Aantoonbare historie");
expect(homepage).toContain("Technisch geselecteerd");
expect(homepage).toContain("Onderhoud en herkomst inzichtelijk");
expect(homepage).toContain("Accu-inzicht waar relevant");
expect(homepage).not.toContain("Eén eigenaar");
expect(homepage).not.toContain("Dealeronderhouden");
```

## Verification

After making changes:
- ✅ Run `npm test -- tests/public-site.test.ts` locally
- ✅ Verify both tests pass
- ✅ CI workflow should pass on next push
