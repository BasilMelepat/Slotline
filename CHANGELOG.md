# Changelog

Versions follow major.minor.patch:

- **major**: a change that breaks something that worked before (for example, a new data format that old saved lists cannot use)
- **minor**: a new feature that keeps everything else working
- **patch**: a bug fix or small tweak

## 1.1.1 - 2026-11-08

- Removed: the filter dropdown on the Mails tab. Sorting by Active, Start time or Mail id stays.

## 1.1.0 - 2026-11-08

- Added: loading animation. The icon draws itself on a splash screen once per visit, the hands run like time-lapse and the green dot pops. A shimmering skeleton shows while your cloud list loads.
- Fixed: the filter dropdown now has one consistent arrow, full width, and long project names are cut off with an ellipsis instead of breaking the layout.
- Changed: smaller text across the app. Form fields stay at 16px on iPhone so Safari does not zoom in when you tap them.

## 1.0.1 - 2026-11-08

- Fixed: an inactive project chip on a solid green "Active" card was white on white and could not be read.
- Added: version numbers (major.minor.patch) with a bump script. The version shows on the Account tab and at `/api/health`.

## 1.0.0 - 2026-11-08

- First release: mobile layout with bottom menu, sign in for cloud saving or skip for device storage, installable offline PWA, app name and icons.
