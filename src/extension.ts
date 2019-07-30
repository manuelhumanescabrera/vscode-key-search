import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as os from 'os';
import * as glob from 'glob';
import * as which from 'which';
import * as shell_quote from 'shell-quote';
import { dirname } from 'path';
const loadJsonFile = require('load-json-file');
const JSONFile = 'es.json';
var range;

export function activate(context: vscode.ExtensionContext) {
    let inplace = vscode.commands.registerCommand('extension.filterTextInplace', (args?: {}) => filterText());
    
    context.subscriptions.push(inplace);
}


async function filterText() {

    const cwd = getCurrentWorkingDirectory();
    var literalKey;

    range = getSelectionRange();
    let text = getTextFromRange(range);

    let path = cwd + '\\' + JSONFile;
    await loadFile(path, text);

    

    
    
}

function getSelectionRange(): vscode.Selection {
    let config = (vscode.workspace.getConfiguration('filterText') as any);
    let useDocument = config.useDocumentIfEmptySelection;

    let editor = vscode.window.activeTextEditor;

    let range = undefined;
    if (!editor.selection.isEmpty) {
        range = editor.selection;
    }

    if (range === undefined) {
        if (useDocument === false) {
            let position = editor.selection.anchor;
            range = new vscode.Range(position.line, position.character, position.line, position.character);
        } else if (editor.document.lineCount > 0) {
            let lineCount = editor.document.lineCount;
            range = new vscode.Range(0, 0, lineCount, editor.document.lineAt(lineCount - 1).text.length);
        }
    }

    return range;
}

function getTextFromRange(range: vscode.Selection): string {
    if (range !== undefined) {
        let editor = vscode.window.activeTextEditor;
        return editor.document.getText(range);
    }
    return '';
}

function setTextToSelectionRange(range: vscode.Selection, text: string): void {
    let target = Promise.resolve(vscode.window.activeTextEditor);
    target.then((editor) => {
        editor.edit((editBuilder) => {
            
                editBuilder.replace(range, text);
            
        });
        editor.revealRange(range);
    }, (reason: Error) => {
        vscode.window.showErrorMessage(reason.message);
    });
}


function getCurrentWorkingDirectory(): string {
    const uri = vscode.window.activeTextEditor.document.uri;

    const isFileOrUntitledDocument = uri && (uri.scheme === 'file' || uri.scheme === 'untitled');
    if (isFileOrUntitledDocument) {
        const useDocumentDirAsWorkDir = vscode.workspace.getConfiguration('filterText').useDocumentDirAsWorkDir;

        if (useDocumentDirAsWorkDir && uri.scheme === 'file') {
            return dirname(uri.fsPath);
        }

        const folder = vscode.workspace.getWorkspaceFolder(uri);
        if (folder) {
            return folder.uri.fsPath;
        }

        const folders = vscode.workspace.workspaceFolders;
        if (folders != undefined && folders.length > 0) {
            return folders[0].uri.fsPath;
        }
        // Github #9: if no workspace folders, and uri.scheme !== 'untitled' (i.e. existing file), use folder of that file. Otherwise, use user home directory.
        if (uri.scheme !== 'untitled') {
            return dirname(uri.fsPath);
        }
    }

    return os.homedir();
}

async function loadFile(path: string, text: string) {
    const fileObject = await loadJsonFile(path);
    searchKey(text, fileObject);
    //console.log('fileObject',fileObject);
}

function searchKey(text: string, fileObject) {
    for (let key in fileObject) {
        if (text === fileObject[key]) {
            let newText = '{{' + key + '|translate}}';
            setTextToSelectionRange(range, newText);
        }
    }
}