# Filter Text Dfront extension for Visual Studio Code

This extension filters selected text through a literal library and replace the selected text with the correct key of that string.

## Installation

Locate the **filter-text-dfront-X.X.X.vsix** file on your sistem, then open a terminal on this path and type the following command:

```bash
code --install-extension filter-text-dfront-X.X.X.vsix
```

Open your VS Code and look the installed extensions. Our extension should appear in the list.

**This extension is distributed privately and you need the .vsix file to install it.** 

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

## Development

To contribute to the development of the extension you have to download the code from the repository.

Once our development is complete, we could create a package to share it with our team. To do this we will use the following command in the terminal:

```bash
vsce package
```

A .vsix file is created. This is the file that you have to share with your team.

In addition, we should push our code to the remote repository in your feature branch.

**You have to use gitflow to contribute**



```
## Changes

* 30/07/2019: v0.0.1 - Initial release.
```

## License

[MIT](https://gitlab.com/dfront/innovation/vscode-filtertext-dfront/blob/master/LICENSE)
