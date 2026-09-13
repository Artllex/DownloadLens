# Signing candidate 1.3.3

GitHub publication and Mozilla signing/public listing are separate. Do not describe the unsigned build as Mozilla-approved.

## Files
- `dist/DownloadLens-1.3.3.xpi` — upload as the extension.
- `dist/DownloadLens-1.3.3-review-source.zip` — source and companion implementation for review.
- `PRIVACY.md` — privacy text to supply in the submission.
- `AMO_REVIEWER_NOTES.md` — paste into reviewer notes; disclose AutoConfig explicitly.

## Developer Hub
1. Sign in at https://addons.mozilla.org/developers/ and personally review/accept the developer agreement if requested.
2. Update the existing add-on (same ID) to DownloadLens and submit to On this site (public AMO listing). Do not select Android or other operating systems; support is Windows only.
3. Upload the candidate XPI. Inspect validator output before continuing.
4. JavaScript is readable and not generated. The source ZIP is provided for transparency about the native companion and its installer; attach it where source/reviewer attachments are accepted. Never claim the companion is only a native messaging host.
5. Supply privacy and reviewer notes where available. If the wizard does not offer reviewer notes, add them through the submitted version's review information before review; do not hide the required companion dependency.
6. Await signing/reviewer response. Do not interpret automated validation as policy approval.
7. Download Mozilla's returned signed XPI; do not rebuild or modify it. Test ordinary installation and install/update consent in release Firefox before replacing the GitHub attachment.

## Local validation
web-ext 10.6.0: zero errors, two compatibility warnings because the minimum Firefox version remains 109 while built-in data declarations appeared in desktop 140 / Android 142. The explicit custom consent page blocks transfer on older desktop Firefox too. Android is not a supported submission platform. Retain these warnings for reviewer inspection rather than concealing them.

Automated extension and consent tests pass with mocked APIs; PL/EN consent UI also passes in Edge at desktop and narrow widths. Built-in Firefox installation prompts and live AMO review are not yet verified.

## Important unresolved approval question
Support AutoConfig runs independently and records public-download metadata even when the extension is paused. This is prominently disclosed, but disclosure alone is not a guarantee Mozilla will accept the architecture. Review may require changes to the companion, metadata retention, consent boundary or AutoConfig features. Record the actual submission status after completing the Developer Hub workflow.
