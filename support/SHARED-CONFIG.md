# Shared AutoConfig v2 (Support 1.2.6)

DownloadLens Support and Firefox Enhancements 0.1.18 can be installed alone or
in either order. One `artllex.cfg` dispatcher starts only active product modules.
Each product's preference file selects that same dispatcher and registers its
presence. Disabled preference files are never reactivated by the other installer.

Configuration changes are ownership-checked and backed up under
`artllex-backup-<id>` in the Firefox installation. Both module files and ownership
records are restored if a write fails. An unknown AutoConfig or modified managed
file blocks the operation before writes. Removing one product preserves the
other; removing the last active product removes the common dispatcher.

Both installers ship the same small Shared-AutoConfig.ps1 protocol implementation.
No download or Firefox Enhancements feature code is duplicated between products.
Neither installer downloads or requires the other product. This remains privileged
AutoConfig, with the same sandbox setting as previous Support versions.

Support 1.2.6 is distributed with DownloadLens 1.3.5. Interactive user-profile acceptance remains pending.
