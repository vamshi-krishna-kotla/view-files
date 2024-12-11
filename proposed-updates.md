## Proposed Updates

- Remove file extension field as the filename already has it
- use dynamic routes (this increase the speed of accessing and computing only selected targets)
    - DO NOT precompute the directory tree when the server is started
    - when a directory is opened then based on the path, fetch its children
    - when a file is clicked then retrieve its attributes

### Optional
- Additional functionality of viewing the contents of a file
    - scope to edit and save the contents
- UI enhancements
    - display the directory and its children on the leftside of the page