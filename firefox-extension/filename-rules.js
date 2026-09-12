"use strict";
// Simple whole-filename glob, not a regular expression. Linear-space matching.
function filenameMatches(pattern, filename) {
  pattern = String(pattern || "").toLowerCase();
  filename = String(filename || "").toLowerCase();
  if (!pattern || pattern.length > 255 || /[\\/:]/.test(pattern)) return false;
  let p = 0, n = 0, star = -1, checkpoint = 0;
  while (n < filename.length) {
    if (pattern[p] === "?" || pattern[p] === filename[n]) { p++; n++; }
    else if (pattern[p] === "*") { star = p++; checkpoint = n; }
    else if (star !== -1) { p = star + 1; n = ++checkpoint; }
    else return false;
  }
  while (pattern[p] === "*") p++;
  return p === pattern.length;
}
function matchingFilenameRule(filename, rules) {
  return (rules || []).find(rule => rule.enabled !== false && rule.folder && filenameMatches(rule.pattern, filename));
}
