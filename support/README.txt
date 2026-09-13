DownloadLens Support - Arkadiusz Pajda (Artllex)

DownloadLens Support 1.2.5: host, path synchronization and download actions.
Install the extension XPI separately. ZIP extraction and confirmed permanent
deletion are available in both the downloads panel and Library, in this order:
extract, delete, native folder action. Missing files have no extract/delete buttons.
No hidden-profile, global hotkey or unrelated menu features are installed.

Firefox Enhancements is NOT required. FE 0.1.16 and later can coexist through
cooperative AutoConfig v1. Each product loads the other once, only when its own
preference file is active. Disabled loaders are never reactivated. Old FE must
remain disabled until upgraded; unrelated AutoConfig remains blocked.
Close Firefox for install/uninstall. UAC applies only to the Firefox module.
Private downloads are not synchronized through the persistent queue. Without
captured original-name metadata, the current name is retained; no suffix guessing.
New downloads are supported. Old entries are not automatically repaired.

Existing TEMP configuration is imported from the legacy host on first install.
Without saved/imported settings, the Windows Downloads known folder is used. System TEMP is not changed.
The optional synchronization queue retains its legacy location for compatibility.
The old host is not removed. Reinstalling older support packages can reassign the
native-host registration. Rerun this installer if that happens.

Uninstall restores a previous existing host registration only if this install
still owns it. Settings and registration backups are retained for recovery.
No downloads, Firefox profile files or extension settings are removed.
The Firefox module is removed only when its files still match recorded hashes;
modified files are left untouched with an error. Previous module versions are
backed up in Firefox/download-router-backup-*. Full installer stages are not
transactional across UAC: an error after integration may require retry/uninstall.
