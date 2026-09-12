Download Router Support - Arkadiusz Pajda (Artllex)

Download Router Support 1.2.0: host, path synchronization and download actions.
Install the extension XPI separately. ZIP extraction and confirmed permanent
deletion are available in both the downloads panel and Library, in this order:
extract, delete, native folder action. Missing files have no extract/delete buttons.
No hidden-profile, global hotkey or unrelated menu features are installed.

Firefox Enhancements is NOT required. Keep its old loader .disabled. Another
active AutoConfig is rejected without overwriting it. Do not enable two loaders.
Close Firefox for install/uninstall. UAC applies only to the Firefox module.
Private downloads are not synchronized through the persistent queue. Without
captured original-name metadata, the current name is retained; no suffix guessing.
New downloads are supported. Old entries are not automatically repaired.

Existing TEMP configuration is imported from the legacy host on first install.
Otherwise TEMP is LOCALAPPDATA\DownloadRouter\temp. System TEMP is not changed.
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
