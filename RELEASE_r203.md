# r203: Build comparison calculation restoration guard

- Compare the restored calculated skill totals, attack, affinity, maximum affinity, element, defense, and weapon kind with the state before comparison.
- Discard comparison output when the equipment snapshot matches but calculation results differ.
- Keep future charm library, export and share functionality deferred (see spec/NEXT_DEVELOPMENT_IDEAS.md).
- This is a consistency guard; no combat formula or motion value was changed.
