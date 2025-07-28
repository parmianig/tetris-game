# Changelog

## release/v2.0.2
* patch: patch attempt to fix deploy error to vercel (primo)
* patch: patch attempt to fix deploy error to vercel (primo)
* major: fix(srs,rotation): bulletproof SRS rotation with type-safe I-piece center - Refactored I-piece rotation logic for true SRS-compliant center-of-gravity pivot (always 4 blocks, never lost). - All rotations now respect backend-provided pivot/origin (including T/J/L/S/Z). - TS2532-safe: all array accesses fully guarded for type-safety. - Updated backend to send correct I/O piece origins. - Cleaned up matrix manipulation for clarity and SRS compliance. - Minor UI/TS tweaks and settings sync. (primo)
