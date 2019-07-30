# Filter Text Dfront extension for Visual Studio Code

This extension filters selected text through a literal library and replace the selected text with the correct key of that string.

## Usage

* Select text that you want to filter.
* Press `Ctrl+K Ctrl+F` (`⌘K ⌘F` on macOS).
    * Alternatively, press `F1` and run the command named `Filter Text Inplace`.
* It replaces the selected text with the correct key from the literal file of the app.

### NOTE



### Keybindings

It is possible to map specific commands to key bindings. Example usage in `keybindings.json`:

```json
{
    "key": "shift+alt+l",
    "command": "extension.filterTextInplace"
}
```

```
## Changes

* 30/07/2019: v0.0.1 - Initial release.
```

## License

[MIT](https://gitlab.com/dfront/innovation/vscode-filtertext-dfront/blob/master/LICENSE)
